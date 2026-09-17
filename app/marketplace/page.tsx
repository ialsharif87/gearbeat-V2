import Link from "next/link";
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
            gap: 14px;
          }
          .marketplace-trust-row {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            margin-top: 6px;
            margin-bottom: 6px;
          }
          .marketplace-trust-badge {
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.7);
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .filter-panel {
            padding: 14px !important;
            margin-top: 4px !important;
            margin-bottom: 16px !important;
            border-radius: 12px !important;
          }
          .filter-panel label {
            margin-bottom: 4px !important;
            font-size: 0.72rem !important;
            letter-spacing: 0.5px !important;
          }
          .filter-panel .input {
            height: 38px !important;
            padding: 6px 12px !important;
            font-size: 0.85rem !important;
            border-radius: 8px !important;
          }
          .filter-panel .grid {
            gap: 12px !important;
          }
          .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 18px;
            margin-top: 20px;
          }
          select.input {
            padding-inline-end: 32px !important;
          }
          [dir="rtl"] .marketplace-header,
          [dir="rtl"] .filter-panel {
            direction: rtl;
            text-align: start;
          }
          @media (max-width: 600px) {
            .marketplace-page { padding: 0 16px; }
            .marketplace-trust-row { gap: 12px !important; }
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

            <p style={{ color: "var(--muted)", lineHeight: 1.6, maxWidth: 780, fontSize: "1.05rem", marginTop: 8 }}>
              {lang === "en" 
                ? "Discover curated audio gear. Browse selected gear categories as GearBeat prepares trusted marketplace partners."
                : "اكتشف معدات صوت مختارة. تصفح فئات معدات مختارة بينما نجهز شركاء المتجر الموثوقين."}
            </p>

            {/* MARKETPLACE TRUST LAYER */}
            <div className="marketplace-trust-row">
              {[
                { icon: "🛡️", en: "Listings Preview", ar: "معاينة القوائم" },
                { icon: "💳", en: "Payment Sandbox", ar: "دفع تجريبي" },
                { icon: "🤝", en: "Partner Prep", ar: "تجهيز الشركاء" },
                { icon: "⚡", en: "Fulfillment Testing", ar: "اختبار التوريد" },
              ].map(item => (
                <div key={item.en} className="marketplace-trust-badge">
                  <span>{item.icon}</span>
                  <span>{lang === "en" ? item.en : item.ar}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CONSOLIDATED PILOT & SECURITY BANNER */}
          <div className="card-premium" style={{ 
            padding: '12px 16px', 
            background: 'rgba(212,175,55,0.01)', 
            border: '1px solid rgba(212,175,55,0.1)', 
            borderRadius: '12px',
            fontSize: '0.78rem',
            lineHeight: 1.5,
            color: 'rgba(255, 255, 255, 0.65)',
            marginTop: 4,
            marginBottom: 4
          }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1rem', marginTop: 2 }}>🛡️</span>
              <div>
                <strong><T en="Pilot Marketplace Experience:" ar="تجربة متجر تجريبية:" /></strong>{" "}
                <T 
                  en="Payment and fulfillment flows are being validated before live commercial rollout. Live Tap payments are deferred (Patch 104B) and manual status modifications are disabled (Patch 104A) for safety."
                  ar="يتم التحقق من مسارات الدفع والتوريد قبل الإطلاق التجاري المباشر. المدفوعات الحية مؤجلة (Patch 104B) والتعديلات اليدوية معطلة (Patch 104A) للأمان."
                />
              </div>
            </div>
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
                  gap: 8,
                  background: 'rgba(212, 175, 55, 0.05)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--gb-border)',
                  cursor: 'pointer',
                  margin: 0,
                  width: 'fit-content',
                  height: 38
                }}
              >
                <input
                  type="checkbox"
                  name="in_stock"
                  value="1"
                  defaultChecked={inStock}
                  style={{ width: 16, height: 16, accentColor: 'var(--gb-gold)' }}
                />
                <span style={{ color: '#fff', fontSize: '0.82rem', textTransform: 'none' }}>
                  {lang === "en" ? "In stock only" : "المتوفر فقط"}
                </span>
              </label>

              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, height: 38, padding: '0 16px', borderRadius: 8, fontSize: '0.85rem' }}>
                  {lang === "en" ? "Apply filters" : "تطبيق الفلتر"}
                </button>

                <Link href="/marketplace" className="btn btn-outline" style={{ flex: 1, height: 38, padding: '0 16px', borderRadius: 8, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
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
                padding: "48px 24px",
                textAlign: "center",
                background: "linear-gradient(180deg, rgba(212,175,55,0.03), rgba(0,0,0,0))",
                border: "1px dashed rgba(212,175,55,0.15)",
                borderRadius: "16px",
                gridColumn: "1 / -1"
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>🛡️</div>
              <h2 style={{ fontSize: "1.6rem", marginBottom: "0.75rem", color: "var(--gb-gold)" }}>
                {lang === "en" ? "Marketplace Under Preparation" : "المتجر قيد التجهيز"}
              </h2>

              <p style={{ color: "var(--gb-text-muted)", marginBottom: "1.5rem", maxWidth: 500, marginInline: 'auto', fontSize: "0.95rem", lineHeight: 1.55 }}>
                {lang === "en" 
                  ? "We are actively working to add curated audio gear from trusted partners. The pilot catalog is expanding daily."
                  : "نعمل على إضافة معدات صوت مختارة من شركاء موثوقين. كتالوجنا يتوسع يومياً."}
              </p>

              <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                <Link href="/join/seller" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem', borderRadius: 8 }}>
                  {lang === "en" ? "Become a Partner" : "انضم كشريك"}
                </Link>
                <Link href="/support" className="btn btn-outline" style={{ padding: '10px 20px', fontSize: '0.85rem', borderRadius: 8 }}>
                  {lang === "en" ? "Contact Support" : "اتصل بالدعم"}
                </Link>
                <Link href="/marketplace" className="btn btn-outline" style={{ padding: '10px 20px', fontSize: '0.85rem', borderRadius: 8 }}>
                  {lang === "en" ? "Shop Gear" : "تسوق معدات"}
                </Link>
              </div>

              <p style={{ color: "rgba(255,255,255,0.4)", fontWeight: 500, fontSize: "0.8rem", margin: 0 }}>
                {lang === "en" 
                  ? "Pilot Ready — listings are provisional and no live payments are processed."
                  : "في مرحلة التجريب — القوائم تجريبية ولا يتم معالجة المدفوعات الحية."}
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

        {/* SECONDARY AI DISCOVERY AREA */}
        <section style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 30 }}>
          <div style={{ maxWidth: 720, margin: '0 auto', opacity: 0.85 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>
                <T en="AI Assistant Preview" ar="معاينة مساعد الذكاء الاصطناعي" />
              </span>
              <h3 style={{ fontSize: '1.2rem', marginTop: 10, marginBottom: 6, color: '#fff' }}>
                <T en="Looking for a custom setup?" ar="تبحث عن تجهيز مخصص؟" />
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--gb-text-muted)', margin: 0 }}>
                <T 
                  en="Describe your requirements and let our experimental AI guide your studio discovery." 
                  ar="صف احتياجاتك ودع ذكاءنا الاصطناعي التجريبي يوجه استكشاف الاستوديو الخاص بك."
                />
              </p>
            </div>
            <SmartDiscoveryPreview vertical="marketplace" />
          </div>
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
            انضم كشريك
          </Link>
        </div>
      </main>
    );
  }
}
