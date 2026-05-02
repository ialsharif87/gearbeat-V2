import { revalidatePath } from "next/cache";
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

export default async function NewVendorProductPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; saved?: string }> | { error?: string; saved?: string };
}) {
  const resolvedSearchParams = await searchParams;
  const errorMessage = resolvedSearchParams?.error
    ? decodeURIComponent(String(resolvedSearchParams.error))
    : "";

  const { supabaseAdmin } = await requireVendorLayoutAccess();

  const [categoriesResult, brandsResult] = await Promise.all([
    supabaseAdmin
      .from("marketplace_categories")
      .select("id, name_en, name_ar, slug, status, sort_order")
      .eq("status", "active")
      .order("sort_order", { ascending: true })
      .order("name_en", { ascending: true }),

    supabaseAdmin
      .from("marketplace_brands")
      .select("id, name_en, name_ar, slug, status")
      .eq("status", "active")
      .order("name_en", { ascending: true }),
  ]);

  const categories = categoriesResult.data || [];
  const brands = brandsResult.data || [];

  if (categoriesResult.error) {
    console.warn("Failed to load marketplace categories:", categoriesResult.error.message);
  }

  if (brandsResult.error) {
    console.warn("Failed to load marketplace brands:", brandsResult.error.message);
  }

  async function createProduct(formData: FormData) {
    "use server";

    let nextError = "";

    try {
      const { supabaseAdmin, user, vendorProfile } =
        await requireVendorLayoutAccess();

      if (!vendorProfile || vendorProfile.status !== "approved") {
        throw new Error("Only approved vendors can create products.");
      }

      const nameEn = String(formData.get("name_en") || "").trim();
      const nameAr = String(formData.get("name_ar") || "").trim();
      const descriptionEn = String(formData.get("description_en") || "").trim();
      const descriptionAr = String(formData.get("description_ar") || "").trim();
      const categoryId = String(formData.get("category_id") || "").trim();
      const brandId = String(formData.get("brand_id") || "").trim();
      const sku = String(formData.get("sku") || "").trim();

      const basePrice = Number(
        formData.get("base_price") || formData.get("price") || 0
      );

      const stockQuantity = Number(
        formData.get("stock_quantity") || formData.get("quantity") || 0
      );

      if (!nameEn && !nameAr) {
        throw new Error("Product name is required.");
      }

      if (!categoryId) {
        throw new Error("Product category is required.");
      }

      if (!brandId) {
        throw new Error("Product brand is required.");
      }

      if (!sku) {
        throw new Error("Product SKU is required.");
      }

      if (!Number.isFinite(basePrice) || basePrice <= 0) {
        throw new Error("Product price must be greater than zero.");
      }

      if (!Number.isFinite(stockQuantity) || stockQuantity < 0) {
        throw new Error("Stock quantity cannot be negative.");
      }

      if (!user?.id) {
        throw new Error("Vendor profile was not found.");
      }

      const productSlugBase = (nameEn || nameAr || sku)
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/gi, "-")
        .replace(/^-+|-+$/g, "");

      const productSlug = `${productSlugBase || "product"}-${Date.now()}`;

      const productPayload = {
        vendor_id: user.id,
        category_id: categoryId,
        brand_id: brandId,
        name_en: nameEn || nameAr,
        name_ar: nameAr || nameEn,
        description_en: descriptionEn || null,
        description_ar: descriptionAr || null,
        sku,
        slug: productSlug,
        base_price: basePrice,
        stock_quantity: Math.floor(stockQuantity),
        currency_code: "SAR",
        status: "pending_review",
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      console.log("Create marketplace product payload:", productPayload);

      const { data: createdProduct, error: productInsertError } =
        await supabaseAdmin
          .from("marketplace_products")
          .insert(productPayload)
          .select("id")
          .single();

      if (productInsertError) {
        console.error("Create marketplace product failed:", productInsertError);
        throw new Error(productInsertError.message || "Could not create product.");
      }

      const { data: createdVariant, error: variantInsertError } =
        await supabaseAdmin
          .from("marketplace_product_variants")
          .insert({
            product_id: createdProduct.id,
            sku,
            price_adjustment: 0,
            status: stockQuantity > 0 ? "active" : "out_of_stock",
            updated_at: new Date().toISOString(),
          })
          .select("id")
          .single();

      if (variantInsertError) {
        console.error("Create product variant failed:", variantInsertError);
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
          quantity: Math.floor(stockQuantity),
          low_stock_threshold: 5,
          updated_at: new Date().toISOString(),
        });

      if (inventoryInsertError) {
        console.error("Create product inventory failed:", inventoryInsertError);
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
    } catch (error) {
      console.error("Create marketplace product action failed:", error);
      nextError = error instanceof Error ? error.message : "Could not create product.";
    }

    if (nextError) {
      redirect(`/portal/store/products/new?error=${encodeURIComponent(nextError)}`);
    }

    revalidatePath("/portal/store/products");
    redirect("/portal/store/products?created=1");
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

        <Link href="/portal/store/products" className="btn">
          <T en="Back to Products" ar="الرجوع للمنتجات" />
        </Link>
      </div>

      {errorMessage ? (
        <div
          className="card"
          style={{
            marginTop: 30,
            borderColor: "rgba(255,77,77,0.35)",
            background: "rgba(255,77,77,0.08)",
          }}
        >
          <strong style={{ color: "#ffb0b0", display: "block", marginBottom: 4 }}>
            <T en="Product save failed" ar="فشل حفظ المنتج" />
          </strong>
          <p style={{ color: "#ffb0b0", fontSize: "0.95rem", lineHeight: 1.7 }}>
            {errorMessage}
          </p>
        </div>
      ) : null}

      {categories.length === 0 || brands.length === 0 ? (
        <div
          className="card"
          style={{
            marginTop: 30,
            borderColor: "rgba(255,176,32,0.35)",
            background: "rgba(255,176,32,0.05)",
          }}
        >
          <strong style={{ color: "#ffb020", display: "block", marginBottom: 4 }}>
            <T en="Catalog setup required" ar="إعداد الكتالوج مطلوب" />
          </strong>
          <p style={{ color: "var(--muted)", fontSize: "0.95rem" }}>
            <T
              en="Product categories or brands are missing. Please ask admin to add categories and brands before creating products."
              ar="التصنيفات أو العلامات التجارية غير مكتملة. يرجى من الإدارة إضافتها قبل إنشاء المنتجات."
            />
          </p>
        </div>
      ) : null}

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
                  {category.name_ar || category.name_en || category.slug}
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
                  {brand.name_ar || brand.name_en || brand.slug}
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
              required
              placeholder="SKU-..."
            />
          </div>

          <div>
            <label>
              <T en="Initial Stock Quantity" ar="كمية المخزون الأولية" />
            </label>
            <input
              name="stock_quantity"
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
          <Link href="/portal/store/products" className="btn">
            <T en="Cancel" ar="إلغاء" />
          </Link>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={categories.length === 0 || brands.length === 0}
          >
            <T en="Submit for Approval" ar="إرسال للموافقة" />
          </button>
        </div>
      </form>
    </div>
  );
}
