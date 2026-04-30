import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import T from "@/components/t";
import { requireVendorLayoutAccess } from "@/lib/route-guards";

function getText(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function getFirstVariant(product: any) {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  return variants[0] || null;
}

function getInventoryFromVariant(variant: any) {
  if (!variant) {
    return null;
  }

  if (Array.isArray(variant.inventory)) {
    return variant.inventory[0] || null;
  }

  return variant.inventory || null;
}

export default async function EditVendorProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: productId } = await params;
  const { supabaseAdmin, user } = await requireVendorLayoutAccess();

  const [productResult, categoriesResult, brandsResult] = await Promise.all([
    supabaseAdmin
      .from("marketplace_products")
      .select(`
        id,
        vendor_id,
        category_id,
        brand_id,
        name_en,
        name_ar,
        description_en,
        description_ar,
        base_price,
        status,
        variants:marketplace_product_variants(
          id,
          sku,
          inventory:marketplace_inventory(
            id,
            quantity,
            low_stock_threshold
          )
        )
      `)
      .eq("id", productId)
      .eq("vendor_id", user.id)
      .maybeSingle(),

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

  if (productResult.error) {
    throw new Error(productResult.error.message);
  }

  if (!productResult.data) {
    notFound();
  }

  const product = productResult.data;
  const categories = categoriesResult.data || [];
  const brands = brandsResult.data || [];
  const firstVariant = getFirstVariant(product);
  const inventory = getInventoryFromVariant(firstVariant);

  async function updateProduct(formData: FormData) {
    "use server";

    const { supabaseAdmin, user } = await requireVendorLayoutAccess();

    const nameEn = getText(formData, "name_en");
    const nameAr = getText(formData, "name_ar");
    const categoryId = getText(formData, "category_id");
    const brandId = getText(formData, "brand_id");
    const descriptionEn = getText(formData, "description_en");
    const descriptionAr = getText(formData, "description_ar");
    const sku = getText(formData, "sku");
    const variantId = getText(formData, "variant_id");

    const basePrice = Number(formData.get("base_price"));
    const quantity = Number(formData.get("quantity"));

    if (!nameEn || !nameAr) {
      throw new Error("Product name is required.");
    }

    if (!Number.isFinite(basePrice) || basePrice <= 0) {
      throw new Error("Product price must be greater than zero.");
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new Error("Inventory quantity must be zero or greater.");
    }

    const { error: productUpdateError } = await supabaseAdmin
      .from("marketplace_products")
      .update({
        name_en: nameEn,
        name_ar: nameAr,
        category_id: categoryId || null,
        brand_id: brandId || null,
        base_price: basePrice,
        description_en: descriptionEn || null,
        description_ar: descriptionAr || null,
        status: "pending_approval",
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .eq("vendor_id", user.id);

    if (productUpdateError) {
      throw new Error(productUpdateError.message);
    }

    let finalVariantId = variantId;

    if (finalVariantId) {
      const { error: variantUpdateError } = await supabaseAdmin
        .from("marketplace_product_variants")
        .update({
          sku: sku || `SKU-${productId.slice(0, 8).toUpperCase()}`,
          status: quantity > 0 ? "active" : "out_of_stock",
          updated_at: new Date().toISOString(),
        })
        .eq("id", finalVariantId)
        .eq("product_id", productId);

      if (variantUpdateError) {
        throw new Error(variantUpdateError.message);
      }
    } else {
      const { data: newVariant, error: variantInsertError } = await supabaseAdmin
        .from("marketplace_product_variants")
        .insert({
          product_id: productId,
          sku: sku || `SKU-${productId.slice(0, 8).toUpperCase()}`,
          status: quantity > 0 ? "active" : "out_of_stock",
        })
        .select("id")
        .single();

      if (variantInsertError) {
        throw new Error(variantInsertError.message);
      }

      finalVariantId = newVariant.id;
    }

    const { error: inventoryUpsertError } = await supabaseAdmin
      .from("marketplace_inventory")
      .upsert(
        {
          variant_id: finalVariantId,
          quantity,
          low_stock_threshold: 5,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "variant_id",
        }
      );

    if (inventoryUpsertError) {
      throw new Error(inventoryUpsertError.message);
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
            <T en="Edit Product" ar="تعديل المنتج" />
          </span>
          <h1>
            <T en="Edit Marketplace Product" ar="تعديل منتج المتجر" />
          </h1>
          <p>
            <T
              en="Update product information. Changes will return the product to pending approval."
              ar="حدّث معلومات المنتج. التعديلات ستعيد المنتج إلى انتظار الموافقة."
            />
          </p>
        </div>

        <Link href="/vendor/products" className="btn">
          <T en="Back to Products" ar="الرجوع للمنتجات" />
        </Link>
      </div>

      <form action={updateProduct} className="card" style={{ marginTop: 30 }}>
        <input type="hidden" name="variant_id" value={firstVariant?.id || ""} />

        <div className="grid grid-2">
          <div>
            <label>
              <T en="Product Name (English)" ar="اسم المنتج (إنجليزي)" />
            </label>
            <input
              name="name_en"
              className="input"
              required
              defaultValue={product.name_en || ""}
            />
          </div>

          <div>
            <label>
              <T en="Product Name (Arabic)" ar="اسم المنتج (عربي)" />
            </label>
            <input
              name="name_ar"
              className="input"
              required
              defaultValue={product.name_ar || ""}
            />
          </div>
        </div>

        <div className="grid grid-3" style={{ marginTop: 20 }}>
          <div>
            <label>
              <T en="Category" ar="التصنيف" />
            </label>
            <select
              name="category_id"
              className="input"
              defaultValue={product.category_id || ""}
            >
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
            <select
              name="brand_id"
              className="input"
              defaultValue={product.brand_id || ""}
            >
              <option value="">
                <T en="Select Brand" ar="اختر العلامة" />
              </option>
              {brands.map((brand: any) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name_en}
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
              defaultValue={Number(product.base_price || 0)}
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
              defaultValue={firstVariant?.sku || ""}
              placeholder={`SKU-${product.id.slice(0, 8).toUpperCase()}`}
            />
          </div>

          <div>
            <label>
              <T en="Stock Quantity" ar="كمية المخزون" />
            </label>
            <input
              name="quantity"
              type="number"
              min="0"
              step="1"
              className="input"
              required
              defaultValue={Number(inventory?.quantity || 0)}
            />
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <label>
            <T en="Description (English)" ar="الوصف (إنجليزي)" />
          </label>
          <textarea
            name="description_en"
            className="input"
            rows={5}
            defaultValue={product.description_en || ""}
          />
        </div>

        <div style={{ marginTop: 20 }}>
          <label>
            <T en="Description (Arabic)" ar="الوصف (عربي)" />
          </label>
          <textarea
            name="description_ar"
            className="input"
            rows={5}
            defaultValue={product.description_ar || ""}
          />
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
            <T en="Save Changes" ar="حفظ التعديلات" />
          </button>
        </div>
      </form>
    </div>
  );
}
