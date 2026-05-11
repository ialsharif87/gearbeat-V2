import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import T from "@/components/t";

export const metadata: Metadata = {
  title: "المعدات | GearBeat",
};
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

  // If it's SAR, show bilingual or Arabic
  const displayCurrency = currency === "SAR" ? "ر.س / SAR" : currency;
  return `${numberValue.toFixed(2)} ${displayCurrency}`;
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

  // FIX 0A: Loading timeout logic (8 seconds)
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("TIMEOUT")), 8000)
  );

  try {
    const [categoriesResult, brandsResult] = (await Promise.race([
      Promise.all([
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
      ]),
      timeoutPromise,
    ])) as any[];

    if (categoriesResult.error) throw categoriesResult.error;
    if (brandsResult.error) throw brandsResult.error;

    const categories = categoriesResult.data || [];
    const brands = brandsResult.data || [];

    const sortConfig = getSortConfig(sort);

    let productsQuery = supabaseAdmin
      .from("marketplace_products")
      .select(
        `
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
    `
      )
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

    const productsResult = (await Promise.race([
      productsQuery,
      timeoutPromise,
    ])) as any;

    if (productsResult.error) throw productsResult.error;

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
      <main
        className="dashboard-page"
        style={{ maxWidth: 1240, margin: "0 auto" }}
      >
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

          {/* MARKETPLACE TRUST LAYER */}
          <div className="marketplace-trust-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: 16,
            marginBottom: 8 
          }}>
            {[
              { icon: '🛡️', en: 'Authentic Gear', ar: 'معدات أصلية' },
              { icon: '💳', en: 'Secure Payment', ar: 'دفع آمن' },
              { icon: '🤝', en: 'Trusted Seller', ar: 'بائع موثوق' },
              { icon: '⚡', en: 'Fast Shipping', ar: 'شحن سريع' },
            ].map(item => (
              <div key={item.en} style={{ 
                padding: '16px 20px', 
                background: 'rgba(212, 175, 55, 0.04)', 
                border: '1px solid rgba(212, 175, 55, 0.12)', 
                borderRadius: 'var(--gb-radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>
                  <T en={item.en} ar={item.ar} />
                </span>
              </div>
            ))}
          </div>

          {/* ADVANCED FILTERS READINESS */}
          <div style={{ marginTop: 24, marginBottom: 24 }}>
            <div className="card-premium" style={{ padding: 16, background: 'rgba(212,175,55,0.05)', border: '1px dashed rgba(212,175,55,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>🎛️</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem' }}><T en="Advanced Filtering & Mobile Drawer" ar="تصفية متقدمة ودرج الهاتف المحمول" /></h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 }}>
                    <T en="Unified category, brand, and condition filters are being prepared for Phase 59+." ar="يتم إعداد فلاتر موحدة للتصنيف والعلامة التجارية والحالة للمرحلة 59+." />
                  </p>
                </div>
              </div>
              <span className="badge badge-warning" style={{ fontSize: '0.6rem' }}>PLANNING PHASE</span>
            </div>
          </div>

          <form
            action="/marketplace"
            className="filter-panel animate-up"
          >
            <div className="grid grid-4" style={{ alignItems: 'end' }}>
              <div>
                <label>
                  <T en="Search" ar="بحث" />
                </label>
                <input
                  name="q"
                  className="input"
                  placeholder="..."
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
                      {item.name_ar || item.name_en}
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
                      {item.name_ar || item.name_en}
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
                </select>
              </div>
            </div>

            <div className="grid grid-4" style={{ marginTop: 20, alignItems: 'end' }}>
              <div className="grid grid-2" style={{ gap: 10 }}>
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
                    placeholder="0"
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
                    placeholder="1000"
                    defaultValue={maxPrice > 0 ? maxPrice : ""}
                  />
                </div>
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: 'rgba(212, 175, 55, 0.05)',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--gb-border)',
                  cursor: 'pointer',
                  margin: 0,
                  width: 'fit-content'
                }}
              >
                <input
                  type="checkbox"
                  name="in_stock"
                  value="1"
                  defaultChecked={inStock}
                  style={{ width: 18, height: 18, accentColor: 'var(--gb-gold)' }}
                />
                <span style={{ color: '#fff', fontSize: '0.9rem', textTransform: 'none' }}>
                  <T en="In stock only" ar="المتوفر فقط" />
                </span>
              </label>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  <T en="Apply filters" ar="تطبيق الفلتر" />
                </button>

                <Link href="/marketplace" className="btn btn-outline" style={{ flex: 1 }}>
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
                padding: "60px 20px",
                textAlign: "center",
                background: "rgba(255,255,255,0.035)",
              }}
            >
              <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                <T en="No products available" ar="لا توجد منتجات" />
              </h2>

              <p style={{ color: "var(--gb-steel)", marginBottom: "2rem" }}>
                <T
                  en="Be the first to list your gear on GearBeat!"
                  ar="كن أول من يعرض معداته على GearBeat!"
                />
              </p>

              <Link href="/join/seller" className="btn btn-primary">
                <T en="Join as Seller" ar="انضم كتاجر" />
              </Link>
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
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
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
                        position: "relative"
                      }}
                    >
                      {image ? (
                        <div style={{ position: "relative", width: "100%", height: "100%" }}>
                          <Image
                            src={image}
                            alt={getProductName(product)}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            style={{ objectFit: "cover" }}
                          />
                          <div style={{ 
                            position: 'absolute', 
                            top: 10, 
                            right: 10, 
                            background: 'rgba(212, 175, 55, 0.95)', 
                            color: '#000', 
                            padding: '4px 8px', 
                            borderRadius: '6px', 
                            fontSize: '0.6rem', 
                            fontWeight: 800,
                            letterSpacing: 0.5,
                            backdropFilter: 'blur(4px)',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                            zIndex: 2
                          }}>
                            <T en="CERTIFIED VENDOR" ar="تاجر معتمد" />
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            width: 86,
                            height: 86,
                            borderRadius: 22,
                            display: "grid",
                            placeItems: "center",
                            background: "rgba(207,167,98,0.16)",
                          }}
                        >
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gb-gold)' }}>
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="12" y1="3" x2="12" y2="21"></line>
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <circle cx="7.5" cy="7.5" r="1.5"></circle>
                            <circle cx="16.5" cy="7.5" r="1.5"></circle>
                            <circle cx="7.5" cy="16.5" r="1.5"></circle>
                            <circle cx="16.5" cy="16.5" r="1.5"></circle>
                          </svg>
                        </div>
                      )}
                    </div>

                    <div style={{ padding: 16, display: "grid", gap: 10, flex: 1, flexDirection: 'column' }}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span className="badge">
                          {getCategoryName(product.category)}
                        </span>
                        <span className="badge">
                          {getBrandName(product.brand)}
                        </span>
                      </div>

                      <h3 style={{ margin: 0, lineHeight: 1.35, fontSize: '1rem' }}>
                        {getProductName(product)}
                      </h3>

                      {getProductDescription(product) ? (
                        <p
                          style={{
                            color: "var(--muted)",
                            lineHeight: 1.6,
                            margin: 0,
                            fontSize: '0.85rem',
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
                          marginTop: 'auto',
                          paddingTop: 10,
                          borderTop: '1px solid rgba(255,255,255,0.05)'
                        }}
                      >
                        <div style={{ display: 'grid' }}>
                          <span style={{ color: "var(--muted)", fontSize: "0.75rem", fontWeight: 600 }}>
                            {getVendorName(product.vendor)}
                          </span>
                          {Number(product.stock_quantity || 0) > 0 ? (
                            <span style={{ color: "var(--gb-success)", fontSize: "0.65rem", fontWeight: 700 }}>
                              <T en="In Stock" ar="متوفر" />
                            </span>
                          ) : (
                            <span style={{ color: "var(--gb-danger)", fontSize: "0.65rem", fontWeight: 700 }}>
                              <T en="Out of Stock" ar="غير متوفر" />
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 6 }}>
                          <span title="Authentic Gear">🛡️</span>
                          <span title="Studio Tested">🎙️</span>
                          <span title="Secure Payment">💳</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* MARKETPLACE MOBILE READINESS */}
      <section style={{ marginTop: 60, marginBottom: 40 }}>
        <div className="card-premium" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.5), rgba(212,175,55,0.03))', border: '1px dashed rgba(212,175,55,0.3)' }}>
          <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontSize: "3rem" }}>🛍️</div>
            <div>
              <h3 style={{ fontSize: "1.3rem", marginBottom: 8 }}><T en="Mobile Shopping Experience" ar="تجربة التسوق عبر الجوال" /> <span className="badge badge-warning" style={{ fontSize: '0.6rem', verticalAlign: 'middle', marginLeft: 8 }}>PLANNING PHASE</span></h3>
              <p style={{ color: 'var(--muted)', maxWidth: 700, lineHeight: 1.6 }}>
                <T 
                  en="We are optimizing the GearBeat Marketplace for native mobile access. Soon, you will be able to browse gear, securely checkout with Apple Pay / Google Pay, and receive real-time push notifications for order updates and outbid alerts." 
                  ar="نحن نعمل على تحسين متجر جيربيت للوصول الأصلي عبر الجوال. قريباً، ستتمكن من تصفح المعدات، والدفع الآمن باستخدام Apple Pay / Google Pay، وتلقي إشعارات فورية لتحديثات الطلبات وتنبيهات المزايدة." 
                />
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} catch (err: any) {
  const isTimeout = err.message === "TIMEOUT";

  return (
    <main
      className="dashboard-page"
      style={{ maxWidth: 1240, margin: "0 auto", padding: "60px 20px" }}
    >
      <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
        <h2 style={{ color: "var(--gb-gold)", marginBottom: "1rem" }}>
          {isTimeout ? (
            <T en="Connection Timeout" ar="انتهت مهلة الاتصال" />
          ) : (
            <T en="Unexpected Error" ar="حدث خطأ غير متوقع" />
          )}
        </h2>
        <p style={{ color: "var(--gb-steel)", marginBottom: "2rem" }}>
          {isTimeout ? (
            <T
              en="The server is taking too long to respond. Please try again."
              ar="استغرق الخادم وقتاً طويلاً للرد. يرجى المحاولة مرة أخرى."
            />
          ) : (
            <T
              en="Something went wrong while fetching marketplace items. Please try again later."
              ar="حدث خطأ ما أثناء جلب منتجات المتجر. يرجى المحاولة مرة أخرى لاحقاً."
            />
          )}
        </p>

        <Link href="/marketplace" className="btn btn-primary">
          <T en="Try Again" ar="حاول مرة أخرى" />
        </Link>
      </div>
    </main>
  );
}
}
