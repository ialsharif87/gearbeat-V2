import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const PRODUCT_HEADERS = [
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

function setHeaderStyle(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1F1B12" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin", color: { argb: "FFBFA15A" } },
      bottom: { style: "thin", color: { argb: "FFBFA15A" } },
      left: { style: "thin", color: { argb: "FFBFA15A" } },
      right: { style: "thin", color: { argb: "FFBFA15A" } },
    };
  });
}

function setColumnWidths(sheet: ExcelJS.Worksheet) {
  sheet.columns = [
    { width: 24 },
    { width: 30 },
    { width: 30 },
    { width: 42 },
    { width: 42 },
    { width: 28 },
    { width: 28 },
    { width: 16 },
    { width: 18 },
    { width: 16 },
    { width: 60 },
    { width: 22 },
    { width: 26 },
    { width: 24 },
    { width: 24 },
    { width: 50 },
  ];
}

function addDropdown({
  sheet,
  columnLetter,
  startRow,
  endRow,
  formula,
  errorTitle,
  error,
}: {
  sheet: ExcelJS.Worksheet;
  columnLetter: string;
  startRow: number;
  endRow: number;
  formula: string;
  errorTitle: string;
  error: string;
}) {
  for (let rowNumber = startRow; rowNumber <= endRow; rowNumber += 1) {
    sheet.getCell(`${columnLetter}${rowNumber}`).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: [formula],
      showErrorMessage: true,
      errorStyle: "error",
      errorTitle,
      error,
    };
  }
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

  const workbook = new ExcelJS.Workbook();

  workbook.creator = "GearBeat";
  workbook.created = new Date();
  workbook.modified = new Date();

  const uploadSheet = workbook.addWorksheet("PRODUCT_UPLOAD", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  uploadSheet.addRow(PRODUCT_HEADERS);
  setHeaderStyle(uploadSheet.getRow(1));
  setColumnWidths(uploadSheet);

  uploadSheet.addRow([
    "MIC-SHURE-SM58-001",
    "Shure SM58 Microphone",
    "ميكروفون شور SM58",
    "Dynamic vocal microphone for studio and live use.",
    "ميكروفون ديناميكي للصوت والاستوديو والاستخدام المباشر.",
    "microphones",
    "shure",
    450,
    10,
    "SAR",
    "https://example.com/image1.jpg | https://example.com/image2.jpg",
    "",
    "",
    0,
    "",
    "Color: Black | Condition: New | Warranty: 1 year",
  ]);

  uploadSheet.addRow([
    "MIX-YAMAHA-001",
    "Yamaha Audio Mixer",
    "مكسر صوت ياماها",
    "Professional audio mixer.",
    "مكسر صوت احترافي.",
    "mixers",
    "yamaha",
    1200,
    3,
    "SAR",
    "https://example.com/mixer.jpg",
    "Standard",
    "MIX-YAMAHA-001-STD",
    0,
    3,
    "Channels: 12 | Condition: New",
  ]);

  for (let rowNumber = 2; rowNumber <= 501; rowNumber += 1) {
    uploadSheet.getCell(`H${rowNumber}`).numFmt = "0.00";
    uploadSheet.getCell(`I${rowNumber}`).numFmt = "0";
    uploadSheet.getCell(`N${rowNumber}`).numFmt = "0.00";
    uploadSheet.getCell(`O${rowNumber}`).numFmt = "0";
  }

  const categoriesSheet = workbook.addWorksheet("VALID_CATEGORIES");
  categoriesSheet.addRow(["category_slug", "name_en", "name_ar", "category_id"]);
  setHeaderStyle(categoriesSheet.getRow(1));
  categoriesSheet.columns = [
    { width: 30 },
    { width: 35 },
    { width: 35 },
    { width: 42 },
  ];

  for (const category of categoryRows) {
    categoriesSheet.addRow([
      category.slug,
      category.name_en,
      category.name_ar,
      category.id,
    ]);
  }

  const brandsSheet = workbook.addWorksheet("VALID_BRANDS");
  brandsSheet.addRow(["brand_slug", "name_en", "name_ar", "brand_id"]);
  setHeaderStyle(brandsSheet.getRow(1));
  brandsSheet.columns = [
    { width: 30 },
    { width: 35 },
    { width: 35 },
    { width: 42 },
  ];

  for (const brand of brandRows) {
    brandsSheet.addRow([
      brand.slug,
      brand.name_en,
      brand.name_ar,
      brand.id,
    ]);
  }

  const instructionsSheet = workbook.addWorksheet("INSTRUCTIONS");
  instructionsSheet.columns = [{ width: 36 }, { width: 100 }];

  instructionsSheet.addRow(["Field", "Instruction"]);
  setHeaderStyle(instructionsSheet.getRow(1));

  instructionsSheet.addRows([
    [
      "sku",
      "Required. Unique product SKU. Example: MIC-SHURE-SM58-001",
    ],
    [
      "category_slug_or_name",
      "Required. Use the dropdown from VALID_CATEGORIES. Recommended: use category_slug.",
    ],
    [
      "brand_slug_or_name",
      "Required. Use the dropdown from VALID_BRANDS. Recommended: use brand_slug.",
    ],
    [
      "base_price",
      "Required. Number greater than zero.",
    ],
    [
      "stock_quantity",
      "Required. Number zero or above.",
    ],
    [
      "image_urls",
      "Optional. Use image URLs separated by |",
    ],
    [
      "specifications",
      "Optional. Use Key: Value pairs separated by |. Example: Color: Black | Condition: New",
    ],
    [
      "status",
      "Imported products will be saved as pending_review automatically.",
    ],
  ]);

  const categoryEndRow = Math.max(categoryRows.length + 1, 2);
  const brandEndRow = Math.max(brandRows.length + 1, 2);

  addDropdown({
    sheet: uploadSheet,
    columnLetter: "F",
    startRow: 2,
    endRow: 501,
    formula: `'VALID_CATEGORIES'!$A$2:$A$${categoryEndRow}`,
    errorTitle: "Invalid category",
    error: "Please choose a valid category from the dropdown list.",
  });

  addDropdown({
    sheet: uploadSheet,
    columnLetter: "G",
    startRow: 2,
    endRow: 501,
    formula: `'VALID_BRANDS'!$A$2:$A$${brandEndRow}`,
    errorTitle: "Invalid brand",
    error: "Please choose a valid brand from the dropdown list.",
  });

  uploadSheet.autoFilter = {
    from: "A1",
    to: "P1",
  };

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="gearbeat-product-upload-template.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
