import { redirect } from "next/navigation";
import Link from "next/link";
import T from "@/components/t";
import { requireVendorLayoutAccess } from "@/lib/route-guards";

function getText(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "product";
}

async function generateUniqueProductSlug(
  supabaseAdmin: any,
  baseName: string
) {
  const baseSlug = slugify(baseName);

  for (let index = 0; index < 10; index += 1) {
    const suffix =
      index === 0
        ? Math.random().toString(36).slice(2, 7)
        : `${index + 1}-${Math.random().toString(36).slice(2, 6)}`;

    const candidate = `${baseSlug}-${suffix}`;

    const { data: existingProduct, error } = await supabaseAdmin
      .from("marketplace_products")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!existingProduct) {
      return candidate;
    }
  }

  return `${baseSlug}-${Date.now()}`;
}

export default async function NewVendorProductPage() {
  const { supabaseAdmin } = await requireVendorLayoutAccess();

  const [categoriesResult, brandsResult] = await Promise.all([
    supabaseAdmin
      .from("marketplace_categories")
      .select("id, name_en, name_ar")
      .eq("status", "active")
      .order("name_en", { ascending: true }),

    supabaseAdmin
      .from("marketplace_brands")
      .select("id, name_en, name_ar")
      .eq("status", "active")
      .order("name_en", { ascending: true }),
  ]);

  if (categoriesResult.error) {
    throw new Error(categoriesResult.error.message);
  }

  if (brandsResult.error) {
    throw new Error(brandsResult.error.message);
  }

  const categories = categoriesResult.data || [];
  const brands = brandsResult.data || [];

  async function createProduct(formData: FormData) {
    "use server";

    const { supabaseAdmin, user, vendorProfile } =
      await requireVendorLayoutAccess();

    if (!vendorProfile || vendorProfile.status !== "approved") {
      throw new Error("Only approved vendors can create products.");
    }

    const nameEn = getText(formData, "name_en");
    const nameAr = getText(formData, "name_ar");
    const categoryId = getText(formData, "category_id");
    const brandId = getText(formData, "brand_id");
    const descriptionEn = getText(formData, "description_en");
    const descriptionAr = getText(formData, "description_ar");
    const skuInput = getText(formData, "sku");

    const basePrice = Number(formData.get("base_price"));
    const quantity = Number(formData.get("quantity"));

    if (!nameEn || !nameAr) {
      throw new Error("Product English and Arabic names are required.");
    }

    if (!categoryId) {
      throw new Error("Product category is required.");
    }

    if (!Number.isFinite(basePrice) || basePrice <= 0) {
      throw new Error("Product price must be greater than zero.");
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new Error("Inventory quantity must be zero or greater.");
    }

    const slug = await generateUniqueProductSlug(supabaseAdmin, nameEn);
    const sku =
      skuInput || `SKU-${slug.slice(0, 12).replace(/-/g, "").toUpperCase()}`;

    const { data: createdProduct, error: productInsertError } =
      await supabaseAdmin
        .from("marketplace_products")
        .insert({
          vendor_id: user.id,
          category_id: categoryId,
          brand_id: brandId || null,
          name_en: nameEn,
          name_ar: nameAr,
          slug,
          description_en: descriptionEn || null,
          description_ar: descriptionAr || null,
          base_price: basePrice,
          status: "pending_approval",
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single();

    if (productInsertError) {
      throw new Error(productInsertError.message);
    }

    const { data: createdVariant, error: variantInsertError } =
      await supabaseAdmin
        .from("marketplace_product_variants")
        .insert({
          product_id: createdProduct.id,
          sku,
          price_adjustment: 0,
          status: quantity > 0 ? "active" : "out_of_stock",
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single();

    if (variantInsertError) {
      await supabaseAdmin
        .from("marketplace_products")
        .delete()
        .eq("id", createdProduct.id)
        .eq("vendor_id", user.id);

      throw new Error(variantInsertError.message);
    }

    const { error: inventoryInsertError } = await supabaseAdmin
      .from("marketplace_inventory")
      .insert({
        variant_id: createdVariant.id,
        quantity,
        low_stock_threshold: 5,
        updated_at: new Date().toISOString(),
      });

    if (inventoryInsertError) {
      await supabaseAdmin
        .from("marketplace_product_variants")
        .delete()
        .eq("id", createdVariant.id)
        .eq("product_id", createdProduct.id);

      await supabaseAdmin
        .from("marketplace_products")
        .delete()
        .eq("id", createdProduct.id)
        .eq("vendor_id", user.id);

      throw new Error(inventoryInsertError.message);
    }

    redirect("/vendor/products");
  }

  return (
    <div className="dashboard-page">
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <span className="badge">
            <T en="New Product" ar="منتج جديد" />
          </span>
          <h1>
            <T en="Add Marketplace Product" ar="إضافة منتج للمتجر" />
          </h1>
          <p>
            <T
              en="Create a new listing. Products will be submitted for admin approval before going live."
              ar="أنشئ منتجًا جديدًا. سيتم إرسال المنتجات لموافقة الإدارة قبل ظهورها."
            />
          </p>
        </div>

        <Link href="/vendor/products" className="btn">
          <T en="Back to Products" ar="الرجوع للمنتجات" />
        </Link>
      </div>

      <form action={createProduct} className="card" style={{ marginTop: 30 }}>
        <div className="grid grid-2">
          <div>
            <label>
              <T en="Product Name (English)" ar="اسم المنتج (إنجليزي)" />
            </label>
            <input name="name_en" className="input" required />
          </div>

          <div>
            <label>
              <T en="Product Name (Arabic)" ar="اسم المنتج (عربي)" />
            </label>
            <input name="name_ar" className="input" required />
          </div>
        </div>

        <div className="grid grid-3" style={{ marginTop: 20 }}>
          <div>
            <label>
              <T en="Category" ar="التصنيف" />
            </label>
            <select name="category_id" className="input" required>
              <option value="">
                <T en="Select Category" ar="اختر التصنيف" />
              </option>
              {categories.map((category: any) => (
                <option key={category.id} value={category.id}>
                  {category.name_en} / {category.name_ar}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>
              <T en="Brand" ar="العلامة التجارية" />
            </label>
            <select name="brand_id" className="input">
              <option value="">
                <T en="Select Brand" ar="اختر العلامة" />
              </option>
              {brands.map((brand: any) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name_en} / {brand.name_ar}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>
              <T en="Base Price (SAR)" ar="السعر الأساسي (ريال)" />
            </label>
            <input
              name="base_price"
              type="number"
              min="0.01"
              step="0.01"
              className="input"
              required
            />
          </div>
        </div>

        <div className="grid grid-2" style={{ marginTop: 20 }}>
          <div>
            <label>
              <T en="SKU" ar="رمز المنتج SKU" />
            </label>
            <input
              name="sku"
              className="input"
              placeholder="Optional. Auto-generated if empty."
            />
          </div>

          <div>
            <label>
              <T en="Initial Stock Quantity" ar="كمية المخزون الأولية" />
            </label>
            <input
              name="quantity"
              type="number"
              min="0"
              step="1"
              className="input"
              required
              defaultValue={0}
            />
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <label>
            <T en="Description (English)" ar="الوصف (إنجليزي)" />
          </label>
          <textarea name="description_en" className="input" rows={5} />
        </div>

        <div style={{ marginTop: 20 }}>
          <label>
            <T en="Description (Arabic)" ar="الوصف (عربي)" />
          </label>
          <textarea name="description_ar" className="input" rows={5} />
        </div>

        <div
          style={{
            marginTop: 30,
            display: "flex",
            gap: 12,
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <Link href="/vendor/products" className="btn">
            <T en="Cancel" ar="إلغاء" />
          </Link>

          <button type="submit" className="btn btn-primary">
            <T en="Submit for Approval" ar="إرسال للموافقة" />
          </button>
        </div>
      </form>
    </div>
  );
}
