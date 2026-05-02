import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import T from "@/components/t";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import VendorProductImageUploadBox from "@/components/vendor-product-image-upload-box";

export const dynamic = "force-dynamic";

type SafeResult<T> = {
  data: T | null;
  error: any;
};

async function safeQuery<T>(
  queryPromise: PromiseLike<SafeResult<T>>
): Promise<T | null> {
  const { data, error } = await queryPromise;

  if (error) {
    console.warn("Vendor product edit optional query failed:", error.message);
    return null;
  }

  return data;
}

function getText(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function getNullableText(formData: FormData, key: string) {
  const value = getText(formData, key);
  return value || null;
}

function getNumber(formData: FormData, key: string) {
  const rawValue = String(formData.get(key) || "").replace(/,/g, "");
  const value = Number(rawValue || 0);

  if (!Number.isFinite(value)) {
    return 0;
  }

  return value;
}

function getNullableNumber(formData: FormData, key: string) {
  const rawValue = String(formData.get(key) || "").replace(/,/g, "").trim();

  if (!rawValue) {
    return null;
  }

  const value = Number(rawValue);

  if (!Number.isFinite(value)) {
    return null;
  }

  return value;
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function parseImageUrls(value: string) {
  return value
    .split(/\n|\|/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function stringifyImages(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join("\n");
  }

  if (typeof value === "string") {
    return value;
  }

  return "";
}

function parseSpecifications(value: string) {
  const result: Record<string, string> = {};

  value
    .split(/\n|\|/)
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((pair) => {
      const [key, ...rest] = pair.split(":");
      const cleanKey = String(key || "").trim();
      const cleanValue = String(rest.join(":") || "").trim();

      if (cleanKey && cleanValue) {
        result[cleanKey] = cleanValue;
      }
    });

  return result;
}

function stringifySpecifications(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "";
  }

  return Object.entries(value as Record<string, unknown>)
    .filter(([key]) => key !== "admin_review")
    .map(([key, itemValue]) => `${key}: ${String(itemValue || "")}`)
    .join("\n");
}

function getProductName(product: any) {
  return product?.name_en || product?.name_ar || product?.sku || "Product";
}

function getBadgeClass(status: string | null | undefined) {
  if (status === "approved" || status === "active" || status === "published") {
    return "badge badge-success";
  }

  if (status === "pending" || status === "pending_review" || status === "under_review") {
    return "badge badge-warning";
  }

  if (status === "rejected" || status === "archived" || status === "inactive") {
    return "badge badge-danger";
  }

  return "badge";
}

export default async function VendorProductEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }> | { id: string };
  searchParams?: Promise<{ error?: string; saved?: string }> | { error?: string; saved?: string };
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const productId = resolvedParams.id;
  const errorMessage = resolvedSearchParams?.error
    ? decodeURIComponent(String(resolvedSearchParams.error))
    : "";
  const savedMessage = resolvedSearchParams?.saved ? "Product updated successfully." : "";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login");
  }

  const supabaseAdmin = createAdminClient();

  const profile = await safeQuery<any>(
    supabaseAdmin
      .from("profiles")
      .select("auth_user_id, full_name, email, role, preferred_currency")
      .eq("auth_user_id", user.id)
      .maybeSingle()
  );

  if (!profile) {
    redirect("/portal/login");
  }

  if (!["vendor", "admin"].includes(profile.role)) {
    redirect("/forbidden");
  }

  const vendorProfile = await safeQuery<any>(
    supabaseAdmin
      .from("vendor_profiles")
      .select("id, auth_user_id, business_name_en, business_name_ar, store_name")
      .eq("auth_user_id", user.id)
      .maybeSingle()
  );

  const vendorIdCandidates = [
    user.id,
    vendorProfile?.id,
    vendorProfile?.auth_user_id,
  ].filter(Boolean);

  const productQuery = supabaseAdmin
    .from("marketplace_products")
    .select(`
      id,
      vendor_id,
      category_id,
      brand_id,
      sku,
      slug,
      name_en,
      name_ar,
      description_en,
      description_ar,
      base_price,
      sale_price,
      stock_quantity,
      currency_code,
      status,
      is_active,
      images,
      specifications,
      created_at,
      updated_at
    `)
    .eq("id", productId);

  const product = await safeQuery<any>(
    profile.role === "admin"
      ? productQuery.maybeSingle()
      : productQuery.in("vendor_id", vendorIdCandidates).maybeSingle()
  );

  if (!product) {
    redirect("/portal/store/products");
  }

  const [categories, brands, variants] = await Promise.all([
    safeQuery<any[]>(
      supabaseAdmin
        .from("marketplace_categories")
        .select("id, name_en, name_ar, slug, is_active, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name_en", { ascending: true })
    ),

    safeQuery<any[]>(
      supabaseAdmin
        .from("marketplace_brands")
        .select("id, name_en, name_ar, slug, is_active, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name_en", { ascending: true })
    ),

    safeQuery<any[]>(
      supabaseAdmin
        .from("marketplace_product_variants")
        .select(`
          id,
          product_id,
          variant_name,
          name_en,
          name_ar,
          sku,
          price_adjustment,
          stock_quantity,
          attributes,
          is_active,
          sort_order,
          created_at
        `)
        .eq("product_id", productId)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true })
    ),
  ]);

  const categoryRows = categories || [];
  const brandRows = brands || [];
  const variantRows = variants || [];
  const firstVariant = variantRows[0] || null;

  async function updateProduct(formData: FormData) {
    "use server";

    let nextError = "";

    try {
      const { id } = await params;
      const supabase = await createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Authentication required.");
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
        throw new Error("Vendor access required.");
      }

      const { data: vendorProfile } = await supabaseAdmin
        .from("vendor_profiles")
        .select("id, auth_user_id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      const vendorIdCandidates = [
        user.id,
        vendorProfile?.id,
        vendorProfile?.auth_user_id,
      ].filter(Boolean);

      const existingQuery = supabaseAdmin
        .from("marketplace_products")
        .select("id, vendor_id, slug, status, specifications")
        .eq("id", id);

      const { data: existingProduct, error: existingError } =
        profile.role === "admin"
          ? await existingQuery.maybeSingle()
          : await existingQuery.in("vendor_id", vendorIdCandidates).maybeSingle();

      if (existingError) {
        throw new Error(existingError.message);
      }

      if (!existingProduct) {
        throw new Error("Product not found or access denied.");
      }

      const nameEn = getText(formData, "name_en");
      const nameAr = getText(formData, "name_ar");
      const descriptionEn = getText(formData, "description_en");
      const descriptionAr = getText(formData, "description_ar");
      const categoryId = getText(formData, "category_id");
      const brandId = getText(formData, "brand_id");
      const sku = getText(formData, "sku");
      const basePrice = getNumber(formData, "base_price");
      const salePrice = getNullableNumber(formData, "sale_price");
      const stockQuantity = getNumber(formData, "stock_quantity");
      const currencyCode = getText(formData, "currency_code") || "SAR";
      const imagesText = getText(formData, "images_text");
      const specificationsText = getText(formData, "specifications_text");

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
        throw new Error("Base price must be greater than zero.");
      }

      if (!Number.isFinite(stockQuantity) || stockQuantity < 0) {
        throw new Error("Stock quantity cannot be negative.");
      }

      const existingSpecifications =
        existingProduct.specifications &&
        typeof existingProduct.specifications === "object" &&
        !Array.isArray(existingProduct.specifications)
          ? existingProduct.specifications
          : {};

      const nextSpecifications = {
        ...parseSpecifications(specificationsText),
        admin_review: existingSpecifications.admin_review || null,
      };

      const nextStatus =
        profile.role === "admin"
          ? existingProduct.status || "approved"
          : "pending_review";

      const nextIsActive =
        profile.role === "admin"
          ? ["approved", "active", "published"].includes(nextStatus)
          : true;

      const productSlugBase = normalizeSlug(nameEn || nameAr || sku);
      const nextSlug =
        existingProduct.slug || `${productSlugBase || "product"}-${Date.now()}`;

      const productPayload = {
        category_id: categoryId,
        brand_id: brandId,
        sku,
        slug: nextSlug,
        name_en: nameEn || nameAr,
        name_ar: nameAr || nameEn,
        description_en: descriptionEn || null,
        description_ar: descriptionAr || null,
        base_price: basePrice,
        sale_price: salePrice,
        stock_quantity: Math.floor(stockQuantity),
        currency_code: currencyCode,
        images: parseImageUrls(imagesText),
        specifications: nextSpecifications,
        status: nextStatus,
        is_active: nextIsActive,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabaseAdmin
        .from("marketplace_products")
        .update(productPayload)
        .eq("id", id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      const variantId = getText(formData, "variant_id");
      const variantName = getText(formData, "variant_name");
      const variantSku = getText(formData, "variant_sku");
      const variantPriceAdjustment = getNumber(formData, "variant_price_adjustment");
      const variantStockQuantity = getNumber(formData, "variant_stock_quantity");

      if (variantName || variantSku) {
        const variantPayload = {
          product_id: id,
          variant_name: variantName || "Default",
          name_en: variantName || "Default",
          name_ar: variantName || "افتراضي",
          sku: variantSku || `${sku}-VAR`,
          price_adjustment: variantPriceAdjustment,
          stock_quantity: Math.floor(variantStockQuantity || stockQuantity),
          attributes: {},
          is_active: true,
          updated_at: new Date().toISOString(),
        };

        if (variantId) {
          const { error: variantUpdateError } = await supabaseAdmin
            .from("marketplace_product_variants")
            .update(variantPayload)
            .eq("id", variantId)
            .eq("product_id", id);

          if (variantUpdateError) {
            throw new Error(variantUpdateError.message);
          }
        } else {
          const { error: variantInsertError } = await supabaseAdmin
            .from("marketplace_product_variants")
            .insert({
              ...variantPayload,
              created_at: new Date().toISOString(),
            });

          if (variantInsertError) {
            throw new Error(variantInsertError.message);
          }
        }
      }
    } catch (error) {
      console.error("Vendor product update failed:", error);

      nextError =
        error instanceof Error ? error.message : "Could not update product.";
    }

    if (nextError) {
      redirect(
        `/portal/store/products/${productId}/edit?error=${encodeURIComponent(nextError)}`
      );
    }

    revalidatePath("/portal/store/products");
    revalidatePath(`/portal/store/products/${productId}/edit`);
    revalidatePath("/admin/products");
    revalidatePath("/marketplace");

    redirect(`/portal/store/products/${productId}/edit?saved=1`);
  }

  return (
    <main className="dashboard-page" style={{ maxWidth: 1120, margin: "0 auto" }}>
      <section
        style={{
          marginTop: 24,
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <div>
          <span className="badge badge-gold">
            <T en="Edit Product" ar="تعديل المنتج" />
          </span>

          <h1 style={{ marginTop: 10 }}>{getProductName(product)}</h1>

          <p style={{ color: "var(--muted)", lineHeight: 1.8, maxWidth: 760 }}>
            <T
              en="Update product details. Vendor edits will be sent back for admin review."
              ar="عدّل تفاصيل المنتج. تعديلات التاجر سترجع إلى مراجعة الإدارة."
            />
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/portal/store/products" className="btn">
            <T en="Back to products" ar="الرجوع للمنتجات" />
          </Link>

          <span className={getBadgeClass(product.status)}>
            {product.status}
          </span>
        </div>
      </section>

      {errorMessage ? (
        <section
          className="card"
          style={{
            marginTop: 24,
            borderColor: "rgba(255,77,77,0.35)",
            background: "rgba(255,77,77,0.08)",
          }}
        >
          <strong style={{ color: "#ffb0b0" }}>
            <T en="Product update failed" ar="فشل تحديث المنتج" />
          </strong>
          <p style={{ color: "#ffb0b0", marginTop: 8, lineHeight: 1.7 }}>
            {errorMessage}
          </p>
        </section>
      ) : null}

      {savedMessage ? (
        <section
          className="card"
          style={{
            marginTop: 24,
            borderColor: "rgba(0,255,136,0.25)",
            background: "rgba(0,255,136,0.06)",
          }}
        >
          <strong style={{ color: "#baffd7" }}>{savedMessage}</strong>
        </section>
      ) : null}

      {categoryRows.length === 0 || brandRows.length === 0 ? (
        <section
          className="card"
          style={{
            marginTop: 24,
            borderColor: "rgba(255,176,32,0.35)",
          }}
        >
          <strong>
            <T en="Catalog setup required" ar="إعداد الكتالوج مطلوب" />
          </strong>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            <T
              en="Categories or brands are missing. Admin must add active categories and brands before product editing."
              ar="التصنيفات أو العلامات غير مكتملة. يجب على الإدارة إضافة تصنيفات وعلامات فعالة قبل تعديل المنتج."
            />
          </p>
        </section>
      ) : null}

      <form action={updateProduct} className="card" style={{ marginTop: 24, display: "grid", gap: 18 }}>
        <div className="grid grid-2">
          <div>
            <label>
              <T en="Product name English" ar="اسم المنتج بالإنجليزية" />
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
              <T en="Product name Arabic" ar="اسم المنتج بالعربية" />
            </label>
            <input
              name="name_ar"
              className="input"
              required
              defaultValue={product.name_ar || ""}
            />
          </div>
        </div>

        <div className="grid grid-2">
          <div>
            <label>
              <T en="Description English" ar="الوصف بالإنجليزية" />
            </label>
            <textarea
              name="description_en"
              className="input"
              rows={5}
              defaultValue={product.description_en || ""}
            />
          </div>

          <div>
            <label>
              <T en="Description Arabic" ar="الوصف بالعربية" />
            </label>
            <textarea
              name="description_ar"
              className="input"
              rows={5}
              defaultValue={product.description_ar || ""}
            />
          </div>
        </div>

        <div className="grid grid-4">
          <div>
            <label>
              <T en="Category" ar="التصنيف" />
            </label>
            <select
              name="category_id"
              className="input"
              required
              defaultValue={product.category_id || ""}
            >
              <option value="">Select category</option>
              {categoryRows.map((category: any) => (
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
            <select
              name="brand_id"
              className="input"
              required
              defaultValue={product.brand_id || ""}
            >
              <option value="">Select brand</option>
              {brandRows.map((brand: any) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name_ar || brand.name_en || brand.slug}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>SKU</label>
            <input
              name="sku"
              className="input"
              required
              defaultValue={product.sku || ""}
            />
          </div>

          <div>
            <label>
              <T en="Currency" ar="العملة" />
            </label>
            <input
              name="currency_code"
              className="input"
              defaultValue={product.currency_code || "SAR"}
            />
          </div>
        </div>

        <div className="grid grid-3">
          <div>
            <label>
              <T en="Base price" ar="السعر الأساسي" />
            </label>
            <input
              name="base_price"
              className="input"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={product.base_price || 0}
            />
          </div>

          <div>
            <label>
              <T en="Sale price" ar="سعر الخصم" />
            </label>
            <input
              name="sale_price"
              className="input"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product.sale_price || ""}
            />
          </div>

          <div>
            <label>
              <T en="Stock quantity" ar="كمية المخزون" />
            </label>
            <input
              name="stock_quantity"
              className="input"
              type="number"
              min="0"
              required
              defaultValue={product.stock_quantity || 0}
            />
          </div>
        </div>

        <VendorProductImageUploadBox productId={product.id} />

        <div>
          <label>
            <T en="Image URLs" ar="روابط الصور" />
          </label>
          <textarea
            name="images_text"
            className="input"
            rows={4}
            defaultValue={stringifyImages(product.images)}
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
          />
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: 6 }}>
            <T
              en="One image URL per line, or separate links using |."
              ar="ضع كل رابط صورة في سطر، أو افصل الروابط بعلامة |."
            />
          </p>
        </div>

        <div>
          <label>
            <T en="Specifications" ar="المواصفات" />
          </label>
          <textarea
            name="specifications_text"
            className="input"
            rows={4}
            defaultValue={stringifySpecifications(product.specifications)}
            placeholder="Color: Black&#10;Condition: New&#10;Warranty: 1 year"
          />
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: 6 }}>
            <T
              en="Use Key: Value format, one specification per line."
              ar="استخدم صيغة المفتاح: القيمة، كل مواصفة في سطر."
            />
          </p>
        </div>

        <section
          className="card"
          style={{
            background: "rgba(255,255,255,0.035)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h2>
            <T en="Variants" ar="الأنواع" />
          </h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            <T
              en="Quickly add or update the first variant of this product. For complex variant setups, contact GearBeat support."
              ar="أضف أو حدّث النوع الأول لهذا المنتج بسرعة. لإعدادات الأنواع المعقدة، تواصل مع دعم جيربيت."
            />
          </p>

          <div style={{ marginTop: 20 }}>
            <input type="hidden" name="variant_id" defaultValue={firstVariant?.id || ""} />

            <div className="grid grid-3">
              <div>
                <label>
                  <T en="Variant name" ar="اسم النوع" />
                </label>
                <input
                  name="variant_name"
                  className="input"
                  defaultValue={firstVariant?.variant_name || ""}
                  placeholder="e.g. Standard, Pro, 128GB"
                />
              </div>

              <div>
                <label>
                  <T en="Variant SKU" ar="رمز SKU للنوع" />
                </label>
                <input
                  name="variant_sku"
                  className="input"
                  defaultValue={firstVariant?.sku || ""}
                  placeholder="e.g. SKU-123-VAR"
                />
              </div>

              <div>
                <label>
                  <T en="Price adjustment" ar="تعديل السعر" />
                </label>
                <input
                  name="variant_price_adjustment"
                  className="input"
                  type="number"
                  step="0.01"
                  defaultValue={firstVariant?.price_adjustment || 0}
                />
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <label>
                <T en="Variant stock" ar="مخزون النوع" />
              </label>
              <input
                name="variant_stock_quantity"
                className="input"
                type="number"
                min="0"
                defaultValue={firstVariant?.stock_quantity || 0}
              />
            </div>
          </div>
        </section>

        <div
          style={{
            marginTop: 20,
            paddingTop: 20,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button type="submit" className="btn btn-primary btn-large">
            <T en="Save changes" ar="حفظ التعديلات" />
          </button>
        </div>
      </form>
    </main>
  );
}
