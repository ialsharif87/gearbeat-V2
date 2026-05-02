import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_ROWS = 200;

type CsvRow = Record<string, string>;

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function normalizeMatch(value: unknown) {
  return cleanText(value).toLowerCase();
}

function parseNumber(value: unknown) {
  const numberValue = Number(String(value || "0").replace(/,/g, ""));

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  return numberValue;
}

function parseInteger(value: unknown) {
  const numberValue = parseNumber(value);

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  return Math.max(Math.floor(numberValue), 0);
}

function safeSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseDelimitedList(value: unknown) {
  return cleanText(value)
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseSpecifications(value: unknown) {
  const result: Record<string, string> = {};

  for (const pair of parseDelimitedList(value)) {
    const [key, ...rest] = pair.split(":");
    const cleanKey = cleanText(key);
    const cleanValue = cleanText(rest.join(":"));

    if (cleanKey && cleanValue) {
      result[cleanKey] = cleanValue;
    }
  }

  return result;
}

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);

  return values.map((value) => value.trim());
}

function parseCsv(text: string) {
  const cleanTextValue = text.replace(/^\uFEFF/, "");
  const allLines = cleanTextValue
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0);

  if (allLines.length < 2) {
    return [];
  }

  const productUploadIndex = allLines.findIndex((line) =>
    line.toLowerCase().includes("product_upload")
  );

  const lines =
    productUploadIndex >= 0
      ? allLines.slice(productUploadIndex + 1)
      : allLines;

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]).map((header) =>
    header.trim().toLowerCase()
  );

  const requiredHeaders = [
    "sku",
    "name_en",
    "name_ar",
    "category_slug_or_name",
    "brand_slug_or_name",
    "base_price",
    "stock_quantity",
  ];

  const hasRequiredHeaders = requiredHeaders.every((header) =>
    headers.includes(header)
  );

  if (!hasRequiredHeaders) {
    throw new Error(
      "Invalid template. Please download the latest GearBeat product upload template."
    );
  }

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: CsvRow = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    return row;
  });
}

function findMatchingId(rows: any[], value: string) {
  const target = normalizeMatch(value);

  if (!target) {
    return "";
  }

  const match = rows.find((row) => {
    const values = [
      row.id,
      row.slug,
      row.name_en,
      row.name_ar,
    ]
      .filter(Boolean)
      .map(normalizeMatch);

    return values.includes(target);
  });

  if (!match) {
    return "";
  }

  return match.id;
}

async function createImportBatch({
  supabaseAdmin,
  vendorId,
  authUserId,
  fileName,
  totalRows,
}: {
  supabaseAdmin: ReturnType<typeof createAdminClient>;
  vendorId: string;
  authUserId: string;
  fileName: string;
  totalRows: number;
}) {
  const { data, error } = await supabaseAdmin
    .from("marketplace_product_import_batches")
    .insert({
      vendor_id: vendorId,
      auth_user_id: authUserId,
      file_name: fileName,
      total_rows: totalRows,
      status: "processing",
      created_at: new Date().toISOString(),
    })
    .select("id")
    .maybeSingle();

  if (error) {
    console.warn("Import batch logging skipped:", error.message);
    return null;
  }

  return data?.id || null;
}

async function logImportRow({
  supabaseAdmin,
  batchId,
  rowNumber,
  row,
  sku,
  productId,
  status,
  errorMessage,
}: {
  supabaseAdmin: ReturnType<typeof createAdminClient>;
  batchId: string | null;
  rowNumber: number;
  row: CsvRow;
  sku: string;
  productId?: string | null;
  status: "success" | "error";
  errorMessage?: string | null;
}) {
  if (!batchId) {
    return;
  }

  const { error } = await supabaseAdmin
    .from("marketplace_product_import_rows")
    .insert({
      batch_id: batchId,
      row_number: rowNumber,
      sku,
      product_id: productId || null,
      status,
      error_message: errorMessage || null,
      raw_data: row,
    });

  if (error) {
    console.warn("Import row logging skipped:", error.message);
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const supabaseAdmin = createAdminClient();

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("auth_user_id, role")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error(profileError.message);
    }

    if (!profile || !["vendor", "admin"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Vendor access required." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "CSV file is required." },
        { status: 400 }
      );
    }

    const fileName = file.name || "bulk-products.csv";
    const text = await file.text();
    const rows = parseCsv(text);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "File has no product rows." },
        { status: 400 }
      );
    }

    if (rows.length > MAX_ROWS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_ROWS} rows are allowed per upload.` },
        { status: 400 }
      );
    }

    const { data: vendorProfile } = await supabaseAdmin
      .from("vendor_profiles")
      .select("id, auth_user_id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    const vendorId = vendorProfile?.id || user.id;

    const [{ data: categories }, { data: brands }] = await Promise.all([
      supabaseAdmin
        .from("marketplace_categories")
        .select("id, slug, name_en, name_ar, is_active")
        .eq("is_active", true),
      supabaseAdmin
        .from("marketplace_brands")
        .select("id, slug, name_en, name_ar, is_active")
        .eq("is_active", true),
    ]);

    const categoryRows = categories || [];
    const brandRows = brands || [];

    const batchId = await createImportBatch({
      supabaseAdmin,
      vendorId,
      authUserId: user.id,
      fileName,
      totalRows: rows.length,
    });

    const results: any[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const rowNumber = index + 2;

      try {
        const sku = cleanText(row.sku);
        const nameEn = cleanText(row.name_en);
        const nameAr = cleanText(row.name_ar);
        const descriptionEn = cleanText(row.description_en);
        const descriptionAr = cleanText(row.description_ar);
        const categoryValue = cleanText(row.category_slug_or_name);
        const brandValue = cleanText(row.brand_slug_or_name);
        const basePrice = parseNumber(row.base_price);
        const stockQuantity = parseInteger(row.stock_quantity);
        const currencyCode = cleanText(row.currency_code) || "SAR";
        const imageUrls = parseDelimitedList(row.image_urls);
        const specifications = parseSpecifications(row.specifications);

        if (!sku) {
          throw new Error("SKU is required.");
        }

        if (!nameEn && !nameAr) {
          throw new Error("Product name is required.");
        }

        const categoryId = findMatchingId(categoryRows, categoryValue);

        if (!categoryId) {
          throw new Error(
            `Category not found: ${categoryValue}. Use exact category_slug from the template list.`
          );
        }

        const brandId = findMatchingId(brandRows, brandValue);

        if (!brandId) {
          throw new Error(
            `Brand not found: ${brandValue}. Use exact brand_slug from the template list.`
          );
        }

        if (!Number.isFinite(basePrice) || basePrice <= 0) {
          throw new Error("Base price must be greater than zero.");
        }

        const productSlugBase = safeSlug(nameEn || nameAr || sku);
        const productSlug = `${productSlugBase || "product"}-${Date.now()}-${index}`;

        const productPayload = {
          vendor_id: vendorId,
          category_id: categoryId,
          brand_id: brandId,
          name_en: nameEn || nameAr,
          name_ar: nameAr || nameEn,
          description_en: descriptionEn || null,
          description_ar: descriptionAr || null,
          sku,
          slug: productSlug,
          base_price: basePrice,
          stock_quantity: stockQuantity,
          currency_code: currencyCode,
          status: "pending_review",
          is_active: true,
          images: imageUrls,
          specifications,
          updated_at: new Date().toISOString(),
        };

        const { data: product, error: productError } = await supabaseAdmin
          .from("marketplace_products")
          .insert(productPayload)
          .select("id")
          .single();

        if (productError) {
          throw new Error(productError.message);
        }

        const variantName = cleanText(row.variant_name);
        const variantSku = cleanText(row.variant_sku);
        const variantPriceAdjustment = parseNumber(row.variant_price_adjustment);
        const variantStockQuantity = parseInteger(row.variant_stock_quantity);

        if (variantName || variantSku) {
          const { error: variantError } = await supabaseAdmin
            .from("marketplace_product_variants")
            .insert({
              product_id: product.id,
              variant_name: variantName || "Default",
              name_en: variantName || "Default",
              name_ar: variantName || "افتراضي",
              sku: variantSku || `${sku}-VAR`,
              price_adjustment: variantPriceAdjustment,
              stock_quantity: variantStockQuantity || stockQuantity,
              attributes: {},
              is_active: true,
              updated_at: new Date().toISOString(),
            });

          if (variantError) {
            throw new Error(`Product saved but variant failed: ${variantError.message}`);
          }
        }

        successCount += 1;

        results.push({
          rowNumber,
          sku,
          status: "success",
          productId: product.id,
          message: "Product created.",
        });

        await logImportRow({
          supabaseAdmin,
          batchId,
          rowNumber,
          row,
          sku,
          productId: product.id,
          status: "success",
        });
      } catch (error) {
        errorCount += 1;

        const sku = cleanText(row.sku);
        const message =
          error instanceof Error ? error.message : "Could not import row.";

        results.push({
          rowNumber,
          sku,
          status: "error",
          message,
        });

        await logImportRow({
          supabaseAdmin,
          batchId,
          rowNumber,
          row,
          sku,
          status: "error",
          errorMessage: message,
        });
      }
    }

    if (batchId) {
      await supabaseAdmin
        .from("marketplace_product_import_batches")
        .update({
          success_count: successCount,
          error_count: errorCount,
          status: "completed",
          metadata: {
            file_name: fileName,
          },
        })
        .eq("id", batchId);
    }

    return NextResponse.json({
      ok: true,
      batchId,
      totalRows: rows.length,
      successCount,
      errorCount,
      categoryCount: categoryRows.length,
      brandCount: brandRows.length,
      results,
      message: `${successCount} products imported, ${errorCount} rows failed.`,
    });
  } catch (error) {
    console.error("Vendor bulk product upload failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not upload products.",
      },
      { status: 500 }
    );
  }
}
