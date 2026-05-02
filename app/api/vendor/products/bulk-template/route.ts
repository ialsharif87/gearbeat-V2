import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsvRow(values: unknown[]) {
  return values.map(csvEscape).join(",");
}

export async function GET() {
  const supabaseAdmin = createAdminClient();

  const [{ data: categories }, { data: brands }] = await Promise.all([
    supabaseAdmin
      .from("marketplace_categories")
      .select("id, slug, name_en, name_ar, is_active, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("slug", { ascending: true }),

    supabaseAdmin
      .from("marketplace_brands")
      .select("id, slug, name_en, name_ar, is_active, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("slug", { ascending: true }),
  ]);

  const categoryRows = categories || [];
  const brandRows = brands || [];

  const uploadHeaders = [
    "sku",
    "name_en",
    "name_ar",
    "description_en",
    "description_ar",
    "category_slug_or_name",
    "brand_slug_or_name",
    "base_price",
    "stock_quantity",
    "currency_code",
    "image_urls",
    "variant_name",
    "variant_sku",
    "variant_price_adjustment",
    "variant_stock_quantity",
    "specifications",
  ];

  const rows: string[] = [];

  rows.push(
    toCsvRow([
      "IMPORTANT",
      "Fill product rows only under the PRODUCT_UPLOAD section. Use exact category slug and brand slug from the lists below.",
    ])
  );

  rows.push(toCsvRow([]));

  rows.push(toCsvRow(["VALID_CATEGORIES"]));
  rows.push(toCsvRow(["category_slug", "name_en", "name_ar", "category_id"]));

  for (const category of categoryRows) {
    rows.push(
      toCsvRow([
        category.slug,
        category.name_en,
        category.name_ar,
        category.id,
      ])
    );
  }

  rows.push(toCsvRow([]));

  rows.push(toCsvRow(["VALID_BRANDS"]));
  rows.push(toCsvRow(["brand_slug", "name_en", "name_ar", "brand_id"]));

  for (const brand of brandRows) {
    rows.push(
      toCsvRow([
        brand.slug,
        brand.name_en,
        brand.name_ar,
        brand.id,
      ])
    );
  }

  rows.push(toCsvRow([]));
  rows.push(toCsvRow(["PRODUCT_UPLOAD"]));
  rows.push(uploadHeaders.map(csvEscape).join(","));

  rows.push(
    toCsvRow([
      "MIC-SHURE-SM58-001",
      "Shure SM58 Microphone",
      "ميكروفون شور SM58",
      "Dynamic vocal microphone for studio and live use.",
      "ميكروفون ديناميكي للصوت والاستوديو والاستخدام المباشر.",
      "microphones",
      "shure",
      "450",
      "10",
      "SAR",
      "https://example.com/image1.jpg | https://example.com/image2.jpg",
      "",
      "",
      "0",
      "",
      "Color: Black | Condition: New | Warranty: 1 year",
    ])
  );

  rows.push(
    toCsvRow([
      "MIX-YAMAHA-001",
      "Yamaha Audio Mixer",
      "مكسر صوت ياماها",
      "Professional audio mixer.",
      "مكسر صوت احترافي.",
      "mixers",
      "yamaha",
      "1200",
      "3",
      "SAR",
      "https://example.com/mixer.jpg",
      "Standard",
      "MIX-YAMAHA-001-STD",
      "0",
      "3",
      "Channels: 12 | Condition: New",
    ])
  );

  const csv = `\uFEFF${rows.join("\n")}`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="gearbeat-product-upload-template.csv"',
      "Cache-Control": "no-store",
    },
  });
}
