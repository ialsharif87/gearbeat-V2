import { NextResponse } from "next/server";

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET() {
  const headers = [
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

  const exampleRows = [
    [
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
    ],
    [
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
    ],
  ];

  const rows = [
    headers.map(csvEscape).join(","),
    ...exampleRows.map((row) => row.map(csvEscape).join(",")),
  ];

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
