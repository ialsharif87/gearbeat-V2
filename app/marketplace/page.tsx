import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import MarketplaceProductCard from "@/components/marketplace-product-card";
import SmartDiscoveryPreview from "@/components/smart-discovery-preview";
import T from "@/components/t";

export const metadata: Metadata = {
  title: "Shop Elite Audio Gear",
  description: "Discover verified music production equipment, analog outboard gear, and professional studio monitors from trusted vendors on the GearBeat Marketplace.",
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
    lang?: string;
  }>;
}) {
  try {
    const params = await searchParams || {};
    const lang = params.lang === "en" ? "en" : "ar";

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

    if (categoriesResult.error) console.warn("Marketplace Categories Error:", categoriesResult.error);
    if (brandsResult.error) console.warn("Marketplace Brands Error:", brandsResult.error);

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

    if (productsResult.error) console.warn("Marketplace Products Error:", productsResult.error);

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
      <main className="marketplace-page">
        <style dangerouslySetInnerHTML={{ __html: `
          .marketplace-page {
            max-width: 1240px;
            margin: 0 auto;
            padding: 0 20px;
          }
          .marketplace-header {
            margin-top: 24px;
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: 18px;
          }
          .trust-badge-item {
            padding: 16px 20px;
            background: rgba(212, 175, 55, 0.04);
            border: 1px solid rgba(212, 175, 55, 0.12);
            borderRadius: var(--gb-radius-md);
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .trust-badge-icon {
            font-size: 1.4rem;
          }
          .trust-badge-text {
            font-size: 0.85rem;
            font-weight: 700;
            color: #fff;
            letter-spacing: 0.5px;
          }
          .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 18px;
            margin-top: 26px;
          }
          @media (max-width: 600px) {
            .marketplace-page { padding: 0 16px; }
            .marketplace-trust-grid { grid-template-columns: 1fr 1fr !important; }
          }
        `}} />
        <section className="marketplace-header">
          <div>
            <span className="badge badge-gold">
              {lang === "en" ? "Marketplace" : "المتجر"}
            </span>

            <h1 style={{ marginTop: 10 }}>
              {lang === "en" ? "Gear Marketplace Preview" : "معاينة متجر المعدات"}
            </h1>

            <p style={{ color: "var(--muted)", lineHeight: 1.8, maxWidth: 780 }}>
              {lang === "en" 
                ? "Browse approved products from trusted GearBeat vendors. Search by product, category, brand, price, and stock availability."
                : "تصفح المنتجات المعتمدة من تجار GearBeat. ابحث حسب المنتج، التصنيف، العلامة، السعر، والتوفر."}
            </p>

            <div 
              style={{ 
                marginTop: 16,
                background: 'rgba(0, 255, 136, 0.05)', 
                border: '1px solid rgba(0, 255, 136, 0.2)',
                padding: '10px 14px',
                borderRadius: 10,
                fontSize: '0.8rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: '#baffd7'
              }}
            >
              <span>🛡️</span>
              <T 
                en="Secure Checkout: All payments are verified by GearBeat backend systems. Manual or customer-initiated status overrides are disabled for production safety."
                ar="دفع آمن: يتم التحقق من جميع المدفوعات بواسطة أنظمة جيربيت الخلفية. تم تعطيل تجاوزات الحالة يدوياً أو من قبل العميل لسلامة الإنتاج."
              />
            </div>
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
              <div key={item.en} className="trust-badge-item">
                <span className="trust-badge-icon">{item.icon}</span>
                <span className="trust-badge-text">
                  {lang === "en" ? item.en : item.ar}
                </span>
              </div>
            ))}
          </div>

          {/* ADVANCED FILTERS READINESS */}
          <div className="hide-app" style={{ marginTop: 24, marginBottom: 24 }}>
            <div className="card-premium" style={{ padding: 16, background: 'rgba(212,175,55,0.05)', border: '1px dashed rgba(212,175,55,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>🎛️</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem' }}>
                    {lang === "en" ? "Advanced Filtering & Mobile Drawer" : "تصفية متقدمة ودرج الهاتف المحمول"}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 }}>
                    {lang === "en" ? "Enhanced search and filtering capabilities are being optimized to improve your shopping experience." : "يتم تحسين قدرات البحث والتصفية المتقدمة لتحسين تجربة التسوق الخاصة بك."}
                  </p>
                </div>
              </div>
              <span className="badge badge-gold" style={{ fontSize: '0.6rem' }}>ENHANCED SEARCH</span>
            </div>
          </div>

          <SmartDiscoveryPreview vertical="marketplace" />

          <div style={{ marginTop: 40, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.05)' }}></span>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--gb-gold)', textTransform: 'uppercase', letterSpacing: 1 }}>
              {lang === "en" ? "Manual Advanced Filters" : "فلاتر يدوية متقدمة"}
            </span>
            <span style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.05)' }}></span>
          </div>

          <form
            action="/marketplace"
            className="filter-panel animate-up"
          >
            <div className="grid grid-4" style={{ alignItems: 'end' }}>
              <div>
                <label>
                  {lang === "en" ? "Search" : "بحث"}
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
                  {lang === "en" ? "Category" : "التصنيف"}
                </label>
                <select name="category" className="input" defaultValue={category}>
                  <option value="">{lang === "en" ? "All categories" : "جميع الفئات"}</option>
                  {categories.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.name_ar || item.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>
                  {lang === "en" ? "Brand" : "العلامة"}
                </label>
                <select name="brand" className="input" defaultValue={brand}>
                  <option value="">{lang === "en" ? "All brands" : "جميع العلامات"}</option>
                  {brands.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.name_ar || item.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>
                  {lang === "en" ? "Sort" : "الترتيب"}
                </label>
                <select name="sort" className="input" defaultValue={sort}>
                  <option value="newest">{lang === "en" ? "Newest" : "الأحدث"}</option>
                  <option value="price_low">{lang === "en" ? "Price: low to high" : "السعر: من الأقل للأعلى"}</option>
                  <option value="price_high">{lang === "en" ? "Price: high to low" : "السعر: من الأعلى للأقل"}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-4" style={{ marginTop: 20, alignItems: 'end' }}>
              <div className="grid grid-2" style={{ gap: 10 }}>
                <div>
                  <label>
                    {lang === "en" ? "Min price" : "أقل سعر"}
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
                    {lang === "en" ? "Max price" : "أعلى سعر"}
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
                  {lang === "en" ? "In stock only" : "المتوفر فقط"}
                </span>
              </label>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  {lang === "en" ? "Apply filters" : "تطبيق الفلتر"}
                </button>

                <Link href="/marketplace" className="btn btn-outline" style={{ flex: 1 }}>
                  {lang === "en" ? "Reset" : "إعادة ضبط"}
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
              {lang === "en" ? "approved products found" : "منتج معتمد"}
            </p>

            {activeFilterCount > 0 ? (
              <span className="badge badge-gold">
                {activeFilterCount} active filters
              </span>
            ) : null}
          </div>
        </section>

        <section className="products-grid">
          {products.length === 0 ? (
            <div
              className="card-premium animate-up"
              style={{
                padding: "80px 40px",
                textAlign: "center",
                background: "linear-gradient(180deg, rgba(212,175,55,0.05), rgba(0,0,0,0))",
                border: "1px dashed rgba(212,175,55,0.2)",
                gridColumn: "1 / -1"
              }}
            >
              <div style={{ fontSize: "4rem", marginBottom: 24 }}>🛡️</div>
              <h2 style={{ fontSize: "2.2rem", marginBottom: "1rem", color: "var(--gb-gold)" }}>
                {lang === "en" ? "Marketplace Discovery" : "اكتشاف المتجر"}
              </h2>

              <p style={{ color: "var(--gb-text-muted)", marginBottom: "2.5rem", maxWidth: 600, marginInline: 'auto', fontSize: '1.1rem', lineHeight: 1.6 }}>
                {lang === "en" 
                  ? "No exact matches found. We are currently in a pilot phase with a curated selection of elite gear. Our catalog is expanding daily."
                  : "لم يتم العثور على نتائج تطابق طلبك. نحن حالياً في مرحلة تجريبية مع مجموعة مختارة من المعدات النخبة. كتالوجنا يتوسع يومياً."}
              </p>

              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/join/seller" className="btn btn-primary">
                  {lang === "en" ? "Apply as Vendor" : "قدم كتاجر"}
                </Link>
                <Link href="/support" className="btn btn-outline">
                  {lang === "en" ? "Contact Support" : "اتصل بالدعم"}
                </Link>
                <Link href="/marketplace" className="btn btn-outline">
                  {lang === "en" ? "Browse All Gear" : "تصفح جميع المعدات"}
                </Link>
              </div>

              <p style={{ marginTop: "2rem", color: "var(--gb-gold)", fontWeight: 600, fontSize: "0.9rem" }}>
                {lang === "en" 
                  ? "Pilot‑Ready – listings are provisional and no live payments are processed."
                  : "في مرحلة التجريب – القوائم تجريبية ولا يتم معالجة المدفوعات الحية."}
              </p>
            </div>
          ) : (
            <>
            {products.map((product: any, index: number) => (
              <MarketplaceProductCard 
                key={product.id} 
                product={product} 
                lang={lang} 
                priority={index < 4}
              />
            ))}
            </>
        )}
      </section>

      {/* MARKETPLACE MOBILE READINESS */}
      <section style={{ marginTop: 60, marginBottom: 40 }}>
        <div className="card-premium" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.5), rgba(212,175,55,0.03))', border: '1px dashed rgba(212,175,55,0.3)' }}>
          <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontSize: "3rem" }}>📲</div>
            <div>
              <h3 style={{ fontSize: "1.3rem", marginBottom: 8 }}>
                {lang === "en" ? "Mobile-First Shopping Experience" : "تجربة تسوق تعتمد على الجوال أولاً"} 
                <span className="badge badge-gold" style={{ fontSize: '0.6rem', verticalAlign: 'middle', marginLeft: 8 }}>PILOT READY</span>
              </h3>
              <p style={{ color: 'var(--muted)', maxWidth: 700, lineHeight: 1.6 }}>
                {lang === "en" 
                  ? "We are currently optimizing the GearBeat Marketplace for seamless mobile and WebView access. Our secure checkout and vendor dashboards are built to perform anywhere."
                  : "نحن نعمل حالياً على تحسين متجر جيربيت للوصول السلس عبر الجوال وWebView. تم بناء عمليات الدفع الآمنة ولوحات تحكم التجار لتعمل في أي مكان."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
  } catch (err: any) {
    return (
      <main
        className="dashboard-page"
        style={{ maxWidth: 1240, margin: "0 auto", padding: "60px 20px" }}
      >
        <div
          className="card"
          style={{
            padding: "80px 20px",
            textAlign: "center",
            background: "linear-gradient(180deg, rgba(212,175,55,0.05), rgba(0,0,0,0))",
            border: "1px dashed rgba(212,175,55,0.2)",
            borderRadius: 24
          }}
        >
          <div style={{ fontSize: "3.5rem", marginBottom: 24 }}>🛡️</div>
          <h2 style={{ fontSize: "2rem", marginBottom: "1rem", color: "var(--gb-gold)" }}>
            المتجر قيد التجهيز للمرحلة التجريبية
          </h2>

          <p style={{ color: "var(--gb-steel)", marginBottom: "2.5rem", maxWidth: 600, marginInline: 'auto', lineHeight: 1.6 }}>
            نعمل على تجهيز منتجات وتجربة GearBeat Marketplace بشكل منظم وآمن. يرجى العودة قريبًا.
          </p>

          <Link href="/join/seller" className="btn btn-primary">
            انضم كتاجر
          </Link>
        </div>
      </main>
    );
  }
}
