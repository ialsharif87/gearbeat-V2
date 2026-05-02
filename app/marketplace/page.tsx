import Link from "next/link";
import T from "@/components/t";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function cleanNumber(value: unknown) {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  return numberValue;
}

function formatMoney(value: unknown, currency = "SAR") {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return `0.00 ${currency}`;
  }

  return `${numberValue.toFixed(2)} ${currency}`;
}

function getProductName(product: any) {
  return product?.name_en || product?.name_ar || product?.name || product?.sku || "Product";
}

function getProductDescription(product: any) {
  return product?.description_en || product?.description_ar || "";
}

function getProductImage(product: any) {
  const images = product?.images;

  if (Array.isArray(images) && images.length > 0) {
    return String(images[0] || "");
  }

  if (typeof images === "string" && images) {
    return images;
  }

  return "";
}

function getCategoryName(category: any) {
  const row = Array.isArray(category) ? category[0] : category;

  if (!row) {
    return "—";
  }

  return row.name_en || row.name_ar || row.slug || "—";
}

function getBrandName(brand: any) {
  const row = Array.isArray(brand) ? brand[0] : brand;

  if (!row) {
    return "—";
  }

  return row.name_en || row.name_ar || row.slug || "—";
}

function getVendorName(vendor: any) {
  const row = Array.isArray(vendor) ? vendor[0] : vendor;

  if (!row) {
    return "GearBeat Vendor";
  }

  return (
    row.business_name_en ||
    row.business_name_ar ||
    row.store_name ||
    "GearBeat Vendor"
  );
}

function getProductUrl(product: any) {
  return `/marketplace/products/${product.slug || product.id}`;
}

function getSortConfig(sort: string) {
  if (sort === "price_low") {
    return { column: "base_price", ascending: true };
  }

  if (sort === "price_high") {
    return { column: "base_price", ascending: false };
  }

  if (sort === "name") {
    return { column: "name_en", ascending: true };
  }

  return { column: "created_at", ascending: false };
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    brand?: string;
    min_price?: string;
    max_price?: string;
    in_stock?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams || {};

  const q = cleanText(params.q);
  const category = cleanText(params.category);
  const brand = cleanText(params.brand);
  const minPrice = cleanNumber(params.min_price);
  const maxPrice = cleanNumber(params.max_price);
  const inStock = cleanText(params.in_stock) === "1";
  const sort = cleanText(params.sort) || "newest";

  const supabaseAdmin = createAdminClient();

  const [categoriesResult, brandsResult] = await Promise.all([
    supabaseAdmin
      .from("marketplace_categories")
      .select("id, slug, name_en, name_ar, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name_en", { ascending: true }),

    supabaseAdmin
      .from("marketplace_brands")
      .select("id, slug, name_en, name_ar, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
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

  const sortConfig = getSortConfig(sort);

  let productsQuery = supabaseAdmin
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
      created_at,
      category:marketplace_categories(
        id,
        slug,
        name_en,
        name_ar
      ),
      brand:marketplace_brands(
        id,
        slug,
        name_en,
        name_ar
      ),
      vendor:vendor_profiles(
        id,
        business_name_en,
        business_name_ar,
        store_name,
        business_verification_status
      )
    `)
    .in("status", ["approved", "active", "published"])
    .eq("is_active", true)
    .order(sortConfig.column, { ascending: sortConfig.ascending })
    .limit(120);

  if (q) {
    const safeQ = q.replace(/[%_]/g, "");
    productsQuery = productsQuery.or(
      `name_en.ilike.%${safeQ}%,name_ar.ilike.%${safeQ}%,sku.ilike.%${safeQ}%`
    );
  }

  if (category) {
    productsQuery = productsQuery.eq("category_id", category);
  }

  if (brand) {
    productsQuery = productsQuery.eq("brand_id", brand);
  }

  if (minPrice > 0) {
    productsQuery = productsQuery.gte("base_price", minPrice);
  }

  if (maxPrice > 0) {
    productsQuery = productsQuery.lte("base_price", maxPrice);
  }

  if (inStock) {
    productsQuery = productsQuery.gt("stock_quantity", 0);
  }

  const productsResult = await productsQuery;

  if (productsResult.error) {
    throw new Error(productsResult.error.message);
  }

  const products = productsResult.data || [];

  const activeFilterCount = [
    q,
    category,
    brand,
    minPrice > 0 ? "min" : "",
    maxPrice > 0 ? "max" : "",
    inStock ? "stock" : "",
  ].filter(Boolean).length;

  return (
    <main className="dashboard-page" style={{ maxWidth: 1240, margin: "0 auto" }}>
      <section
        style={{
          marginTop: 24,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          gap: 18,
        }}
      >
        <div>
          <span className="badge badge-gold">
            <T en="Marketplace" ar="المتجر" />
          </span>

          <h1 style={{ marginTop: 10 }}>
            <T en="Studio gear marketplace" ar="متجر معدات الاستوديو" />
          </h1>

          <p style={{ color: "var(--muted)", lineHeight: 1.8, maxWidth: 780 }}>
            <T
              en="Browse approved products from trusted GearBeat vendors. Search by product, category, brand, price, and stock availability."
              ar="تصفح المنتجات المعتمدة من تجار GearBeat. ابحث حسب المنتج، التصنيف، العلامة، السعر، والتوفر."
            />
          </p>
        </div>

        <form
          action="/marketplace"
          style={{
            display: "grid",
            gap: 14,
            padding: 18,
            borderRadius: 22,
            background: "rgba(255,255,255,0.035)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="grid grid-4">
            <div>
              <label>
                <T en="Search" ar="بحث" />
              </label>
              <input
                name="q"
                className="input"
                placeholder="Microphone, mixer, SKU..."
                defaultValue={q}
              />
            </div>

            <div>
              <label>
                <T en="Category" ar="التصنيف" />
              </label>
              <select name="category" className="input" defaultValue={category}>
                <option value="">All categories</option>
                {categories.map((item: any) => (
                  <option key={item.id} value={item.id}>
                    {item.name_en} / {item.name_ar}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>
                <T en="Brand" ar="العلامة" />
              </label>
              <select name="brand" className="input" defaultValue={brand}>
                <option value="">All brands</option>
                {brands.map((item: any) => (
                  <option key={item.id} value={item.id}>
                    {item.name_en} / {item.name_ar}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>
                <T en="Sort" ar="الترتيب" />
              </label>
              <select name="sort" className="input" defaultValue={sort}>
                <option value="newest">Newest</option>
                <option value="price_low">Price: low to high</option>
                <option value="price_high">Price: high to low</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          <div className="grid grid-4">
            <div>
              <label>
                <T en="Min price" ar="أقل سعر" />
              </label>
              <input
                name="min_price"
                className="input"
                type="number"
                min="0"
                step="0.01"
                defaultValue={minPrice > 0 ? minPrice : ""}
              />
            </div>

            <div>
              <label>
                <T en="Max price" ar="أعلى سعر" />
              </label>
              <input
                name="max_price"
                className="input"
                type="number"
                min="0"
                step="0.01"
                defaultValue={maxPrice > 0 ? maxPrice : ""}
              />
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 28,
              }}
            >
              <input
                type="checkbox"
                name="in_stock"
                value="1"
                defaultChecked={inStock}
              />
              <T en="In stock only" ar="المتوفر فقط" />
            </label>

            <div style={{ display: "flex", gap: 10, alignItems: "end" }}>
              <button type="submit" className="btn btn-primary">
                <T en="Apply filters" ar="تطبيق الفلتر" />
              </button>

              <Link href="/marketplace" className="btn">
                <T en="Reset" ar="إعادة ضبط" />
              </Link>
            </div>
          </div>
        </form>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <p style={{ color: "var(--muted)", margin: 0 }}>
            <strong>{products.length}</strong>{" "}
            <T en="approved products found" ar="منتج معتمد" />
          </p>

          {activeFilterCount > 0 ? (
            <span className="badge badge-gold">
              {activeFilterCount} active filters
            </span>
          ) : null}
        </div>
      </section>

      <section style={{ marginTop: 26 }}>
        {products.length === 0 ? (
          <div
            className="card"
            style={{
              padding: 34,
              textAlign: "center",
              background: "rgba(255,255,255,0.035)",
            }}
          >
            <h2>
              <T en="No products found" ar="لا توجد منتجات" />
            </h2>

            <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
              <T
                en="Try changing filters or check again after vendors publish approved products."
                ar="جرّب تغيير الفلاتر أو ارجع لاحقًا بعد اعتماد منتجات التجار."
              />
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 18,
            }}
          >
            {products.map((product: any) => {
              const image = getProductImage(product);
              const price = product.sale_price || product.base_price;
              const hasSalePrice =
                product.sale_price &&
                Number(product.sale_price) > 0 &&
                Number(product.sale_price) < Number(product.base_price || 0);

              return (
                <article
                  key={product.id}
                  className="card"
                  style={{
                    overflow: "hidden",
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100%",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025))",
                  }}
                >
                  <Link
                    href={getProductUrl(product)}
                    style={{
                      display: "block",
                      color: "inherit",
                      textDecoration: "none",
                    }}
                  >
                    <div
                      style={{
                        height: 190,
                        background:
                          "radial-gradient(circle at center, rgba(207,167,98,0.18), rgba(255,255,255,0.035))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={getProductName(product)}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 86,
                            height: 86,
                            borderRadius: 22,
                            display: "grid",
                            placeItems: "center",
                            background: "rgba(207,167,98,0.16)",
                            fontSize: "2rem",
                          }}
                        >
                          🎛️
                        </div>
                      )}
                    </div>

                    <div style={{ padding: 16, display: "grid", gap: 10 }}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span className="badge">
                          {getCategoryName(product.category)}
                        </span>
                        <span className="badge">
                          {getBrandName(product.brand)}
                        </span>
                      </div>

                      <h3 style={{ margin: 0, lineHeight: 1.35 }}>
                        {getProductName(product)}
                      </h3>

                      {getProductDescription(product) ? (
                        <p
                          style={{
                            color: "var(--muted)",
                            lineHeight: 1.6,
                            margin: 0,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {getProductDescription(product)}
                        </p>
                      ) : null}

                      <div>
                        <strong style={{ fontSize: "1.15rem" }}>
                          {formatMoney(price, product.currency_code || "SAR")}
                        </strong>

                        {hasSalePrice ? (
                          <span
                            style={{
                              marginInlineStart: 8,
                              color: "var(--muted)",
                              textDecoration: "line-through",
                              fontSize: "0.9rem",
                            }}
                          >
                            {formatMoney(
                              product.base_price,
                              product.currency_code || "SAR"
                            )}
                          </span>
                        ) : null}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                          alignItems: "center",
                        }}
                      >
                        <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                          {getVendorName(product.vendor)}
                        </span>

                        {Number(product.stock_quantity || 0) > 0 ? (
                          <span className="badge badge-success">
                            <T en="In stock" ar="متوفر" />
                          </span>
                        ) : (
                          <span className="badge badge-danger">
                            <T en="Out of stock" ar="غير متوفر" />
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
