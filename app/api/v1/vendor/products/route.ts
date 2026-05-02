import { NextResponse } from "next/server";
import {
  authenticateVendorApiRequest,
  logVendorApiRequest,
} from "@/lib/vendor-api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function normalizeMatch(value: unknown) {
  return cleanText(value).toLowerCase();
}

function parseNumber(value: unknown) {
  const valueNumber = Number(value || 0);
  return Number.isFinite(valueNumber) ? valueNumber : 0;
}

function parseInteger(value: unknown) {
  return Math.max(Math.floor(parseNumber(value)), 0);
}

function safeSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function findMatchingId(rows: any[], value: string) {
  const target = normalizeMatch(value);

  if (!target) {
    return "";
  }

  const match = rows.find((row) => {
    const values = [row.id, row.slug, row.name_en, row.name_ar]
      .filter(Boolean)
      .map(normalizeMatch);

    return values.includes(target);
  });

  return match?.id || "";
}

export async function GET(request: Request) {
  const auth = await authenticateVendorApiRequest(request, "products:read");

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabaseAdmin
    .from("marketplace_products")
    .select(`
      id,
      sku,
      name_en,
      name_ar,
      base_price,
      stock_quantity,
      currency_code,
      status,
      created_at,
      updated_at
    `)
    .eq("vendor_id", auth.vendorId)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    await logVendorApiRequest({
      apiKeyId: auth.apiKeyId,
      authUserId: auth.authUserId,
      vendorId: auth.vendorId,
      endpoint: "/api/v1/vendor/products",
      method: "GET",
      statusCode: 500,
      responseSummary: { error: error.message },
    });

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logVendorApiRequest({
    apiKeyId: auth.apiKeyId,
    authUserId: auth.authUserId,
    vendorId: auth.vendorId,
    endpoint: "/api/v1/vendor/products",
    method: "GET",
    statusCode: 200,
    responseSummary: { count: data?.length || 0 },
  });

  return NextResponse.json({
    ok: true,
    products: data || [],
  });
}

export async function POST(request: Request) {
  const auth = await authenticateVendorApiRequest(request, "products:write");

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const sku = cleanText(body.sku);
    const nameEn = cleanText(body.name_en || body.name);
    const nameAr = cleanText(body.name_ar || body.name);
    const descriptionEn = cleanText(body.description_en);
    const descriptionAr = cleanText(body.description_ar);
    const categoryValue = cleanText(body.category || body.category_slug_or_name || body.category_id);
    const brandValue = cleanText(body.brand || body.brand_slug_or_name || body.brand_id);
    const basePrice = parseNumber(body.base_price || body.price);
    const stockQuantity = parseInteger(body.stock_quantity || body.stock);
    const currencyCode = cleanText(body.currency_code) || "SAR";
    const imageUrls = Array.isArray(body.image_urls)
      ? body.image_urls.map(cleanText).filter(Boolean)
      : [];

    if (!sku) {
      return NextResponse.json({ error: "SKU is required." }, { status: 400 });
    }

    if (!nameEn && !nameAr) {
      return NextResponse.json(
        { error: "Product name is required." },
        { status: 400 }
      );
    }

    if (basePrice <= 0) {
      return NextResponse.json(
        { error: "base_price must be greater than zero." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    const [{ data: categories }, { data: brands }] = await Promise.all([
      supabaseAdmin
        .from("marketplace_categories")
        .select("id, slug, name_en, name_ar")
        .eq("is_active", true),
      supabaseAdmin
        .from("marketplace_brands")
        .select("id, slug, name_en, name_ar")
        .eq("is_active", true),
    ]);

    const categoryId = findMatchingId(categories || [], categoryValue);
    const brandId = findMatchingId(brands || [], brandValue);

    if (!categoryId) {
      return NextResponse.json(
        { error: `Category not found: ${categoryValue}` },
        { status: 400 }
      );
    }

    if (!brandId) {
      return NextResponse.json(
        { error: `Brand not found: ${brandValue}` },
        { status: 400 }
      );
    }

    const productSlug = `${safeSlug(nameEn || nameAr || sku) || "product"}-${Date.now()}`;

    const productPayload = {
      vendor_id: auth.vendorId,
      category_id: categoryId,
      brand_id: brandId,
      sku,
      slug: productSlug,
      name_en: nameEn || nameAr,
      name_ar: nameAr || nameEn,
      description_en: descriptionEn || null,
      description_ar: descriptionAr || null,
      base_price: basePrice,
      stock_quantity: stockQuantity,
      currency_code: currencyCode,
      images: imageUrls,
      specifications:
        body.specifications && typeof body.specifications === "object"
          ? body.specifications
          : {},
      status: "pending_review",
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    const { data: existingProduct } = await supabaseAdmin
      .from("marketplace_products")
      .select("id")
      .eq("vendor_id", auth.vendorId)
      .eq("sku", sku)
      .maybeSingle();

    let productId = "";

    if (existingProduct?.id) {
      const { data: updated, error: updateError } = await supabaseAdmin
        .from("marketplace_products")
        .update(productPayload)
        .eq("id", existingProduct.id)
        .eq("vendor_id", auth.vendorId)
        .select("id")
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      productId = updated.id;
    } else {
      const { data: created, error: createError } = await supabaseAdmin
        .from("marketplace_products")
        .insert(productPayload)
        .select("id")
        .single();

      if (createError) {
        throw new Error(createError.message);
      }

      productId = created.id;
    }

    await supabaseAdmin.from("vendor_product_sync_logs").insert({
      auth_user_id: auth.authUserId,
      vendor_id: auth.vendorId,
      external_product_id: cleanText(body.external_product_id) || null,
      sku,
      product_id: productId,
      sync_type: "api",
      status: "success",
      message: "Product synced through Vendor API.",
      raw_payload: body,
    });

    await logVendorApiRequest({
      apiKeyId: auth.apiKeyId,
      authUserId: auth.authUserId,
      vendorId: auth.vendorId,
      endpoint: "/api/v1/vendor/products",
      method: "POST",
      statusCode: 200,
      requestSummary: { sku },
      responseSummary: { productId },
    });

    return NextResponse.json({
      ok: true,
      productId,
      status: "pending_review",
      message: "Product synced successfully and sent for admin review.",
    });
  } catch (error) {
    await logVendorApiRequest({
      apiKeyId: auth.apiKeyId,
      authUserId: auth.authUserId,
      vendorId: auth.vendorId,
      endpoint: "/api/v1/vendor/products",
      method: "POST",
      statusCode: 500,
      responseSummary: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not sync product.",
      },
      { status: 500 }
    );
  }
}
