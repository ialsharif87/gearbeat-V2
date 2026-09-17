import Link from "next/link";
import type { Metadata } from "next";
import MarketplaceProductCard from "@/components/marketplace-product-card";
import T from "@/components/t";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Audio Gear Catalog",
  description:
    "Browse selected audio gear in the GearBeat catalog. Checkout, shipping, returns, and warranty services are not enabled in the MVP.",
};

export const dynamic = "force-dynamic";

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function cleanNumber(value: unknown) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getSortConfig(sort: string) {
  if (sort === "price_low") return { column: "base_price", ascending: true };
  if (sort === "price_high") return { column: "base_price", ascending: false };
  if (sort === "name") return { column: "name_en", ascending: true };
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
    sort?: string;
    lang?: string;
  }>;
}) {
  const params = (await searchParams) || {};
  const lang = params.lang === "en" ? "en" : "ar";
  const q = cleanText(params.q);
  const category = cleanText(params.category);
  const brand = cleanText(params.brand);
  const minPrice = cleanNumber(params.min_price);
  const maxPrice = cleanNumber(params.max_price);
  const sort = cleanText(params.sort) || "newest";

  try {
    const supabaseAdmin = createAdminClient();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), 8000)
    );

    const [categoriesResult, brandsResult] = (await Promise.race([      Promise.all([
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

    const categories = categoriesResult?.data || [];
    const brands = brandsResult?.data || [];
    const sortConfig = getSortConfig(sort);

    let productsQuery = supabaseAdmin
      .from("marketplace_products")
      .select(`
        id,
        vendor_id,
        category_id,
        brand_id,
        sku,
        slug,        name_en,
        name_ar,
        description_en,
        description_ar,
        base_price,
        sale_price,
        currency_code,
        status,
        is_active,
        images,
        created_at,
        category:marketplace_categories(id, slug, name_en, name_ar),
        brand:marketplace_brands(id, slug, name_en, name_ar),
        vendor:vendor_profiles(id, business_name_en, business_name_ar, store_name)
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

    if (category) productsQuery = productsQuery.eq("category_id", category);
    if (brand) productsQuery = productsQuery.eq("brand_id", brand);    if (minPrice > 0) productsQuery = productsQuery.gte("base_price", minPrice);
    if (maxPrice > 0) productsQuery = productsQuery.lte("base_price", maxPrice);

    const productsResult = (await Promise.race([
      productsQuery,
      timeoutPromise,
    ])) as any;

    if (productsResult?.error) throw productsResult.error;

    const products = productsResult?.data || [];
    const activeFilterCount = [
      q,
      category,
      brand,
      minPrice > 0 ? "min" : "",
      maxPrice > 0 ? "max" : "",
      sort !== "newest" ? sort : "",
    ].filter(Boolean).length;

    return (
      <main className="marketplace-page">
        <section className="marketplace-header">
          <span className="badge badge-gold">
            <T en="Gear Catalog" ar="كتالوج المعدات" />
          </span>
          <h1>
            <T en="Audio gear for reference and enquiries" ar="معدات صوت للمرجعية والاستفسار" />
          </h1>          <p className="marketplace-intro">
            <T
              en="Browse selected products. Checkout, shipping, returns, and warranty services are not enabled in this MVP."
              ar="تصفح منتجات مختارة. الدفع والشحن والإرجاع والضمان غير مفعلة في هذه النسخة الأولية."
            />
          </p>
          <div className="catalog-notice">
            <strong><T en="Catalog only" ar="كتالوج فقط" /></strong>
            <span>
              <T
                en="Use product pages for reference or enquiries. No online purchase is available yet."
                ar="استخدم صفحات المنتجات للمرجعية أو الاستفسار. لا يوجد شراء إلكتروني متاح حاليًا."
              />
            </span>
          </div>
        </section>

        <form action="/marketplace" className="filter-panel marketplace-filter">
          <div className="marketplace-filter-grid">
            <div>
              <label><T en="Search" ar="بحث" /></label>
              <input className="input" name="q" defaultValue={q} placeholder={lang === "en" ? "Product name" : "اسم المنتج"} />
            </div>
            <div>
              <label><T en="Category" ar="التصنيف" /></label>
              <select className="input" name="category" defaultValue={category}>
                <option value="">{lang === "en" ? "All categories" : "كل التصنيفات"}</option>
                {categories.map((item: any) => (
                  <option key={item.id} value={item.id}>{lang === "en" ? item.name_en : item.name_ar}</option>
                ))}
              </select>
            </div>
            <div>
              <label><T en="Brand" ar="العلامة" /></label>
              <select className="input" name="brand" defaultValue={brand}>
                <option value="">{lang === "en" ? "All brands" : "كل العلامات"}</option>
                {brands.map((item: any) => (
                  <option key={item.id} value={item.id}>{lang === "en" ? item.name_en : item.name_ar}</option>
                ))}
              </select>
            </div>
            <div>
              <label><T en="Sort" ar="الترتيب" /></label>
              <select className="input" name="sort" defaultValue={sort}>
                <option value="newest"><T en="Newest" ar="الأحدث" /></option>
                <option value="price_low"><T en="Price: low to high" ar="السعر: من الأقل" /></option>
                <option value="price_high"><T en="Price: high to low" ar="السعر: من الأعلى" /></option>
              </select>
            </div>
            <div>
              <label><T en="Minimum price" ar="أقل سعر" /></label>
              <input className="input" name="min_price" type="number" min="0" step="1" defaultValue={minPrice || ""} placeholder="SAR" />
            </div>
            <div>
              <label><T en="Maximum price" ar="أعلى سعر" /></label>
              <input className="input" name="max_price" type="number" min="0" step="1" defaultValue={maxPrice || ""} placeholder="SAR" />
            </div>
            <div className="marketplace-filter-actions">
              <button type="submit" className="btn btn-primary"><T en="Apply" ar="تطبيق" /></button>
              <Link href="/marketplace" className="btn btn-outline"><T en="Reset" ar="إعادة ضبط" /></Link>
            </div>
          </div>
        </form>

        <div className="marketplace-results-bar">
          <span><strong>{products.length}</strong> <T en="catalog items" ar="منتج في الكتالوج" /></span>
          {activeFilterCount > 0 ? <span className="badge badge-gold">{activeFilterCount} <T en="filters" ar="فلاتر" /></span> : null}
        </div>

        <section className="products-grid">
          {products.length > 0 ? (
            products.map((product: any, index: number) => (
              <MarketplaceProductCard
                key={product.id}
                product={product}
                lang={lang}
                priority={index < 4}
              />
            ))
          ) : (
            <div className="card-premium marketplace-empty">
              <div className="marketplace-empty-icon">🎚️</div>
              <h2><T en="No catalog items found" ar="لا توجد منتجات في الكتالوج" /></h2>
              <p>
                <T
                  en="Try changing your search or filters. Additional catalog items can be added later without implying live commerce."
                  ar="جرّب تغيير البحث أو الفلاتر. يمكن إضافة منتجات أخرى لاحقًا دون الإيحاء بأن التجارة الإلكترونية مفعلة."
                />
              </p>
              <Link href="/marketplace" className="btn btn-primary"><T en="Reset catalog" ar="إعادة ضبط الكتالوج" /></Link>
            </div>
          )}
        </section>

        <style dangerouslySetInnerHTML={{ __html: `
          .marketplace-page { max-width: 1240px; margin: 0 auto; padding: 32px 20px 64px; }
          .marketplace-header { display: grid; gap: 12px; margin-bottom: 20px; }
          .marketplace-header h1 { font-size: clamp(2rem, 5vw, 3.5rem); margin: 0; }
          .marketplace-intro { max-width: 780px; color: var(--gb-text-muted); line-height: 1.75; margin: 0; }
          .catalog-notice { display: grid; gap: 4px; padding: 14px 16px; border: 1px solid rgba(212,175,55,.2); border-radius: 14px; background: rgba(212,175,55,.06); }
          .catalog-notice strong { color: var(--gb-gold-light); }
          .catalog-notice span { color: var(--gb-text-muted); font-size: .9rem; }
          .marketplace-filter-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; align-items: end; }
          .marketplace-filter-actions { display: flex; gap: 8px; }
          .marketplace-filter-actions .btn { flex: 1; min-height: 42px; }
          .marketplace-results-bar { display: flex; justify-content: space-between; gap: 12px; align-items: center; flex-wrap: wrap; margin: 18px 0; color: var(--gb-text-muted); }
          .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 18px; }
          .marketplace-empty { grid-column: 1 / -1; text-align: center; padding: 48px 24px; }
          .marketplace-empty-icon { font-size: 2.5rem; margin-bottom: 14px; }
          .marketplace-empty p { color: var(--gb-text-muted); max-width: 620px; margin: 10px auto 22px; line-height: 1.7; }
          @media (max-width: 900px) { .marketplace-filter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
          @media (max-width: 600px) { .marketplace-page { padding-inline: 16px; } .marketplace-filter-grid { grid-template-columns: 1fr; } .marketplace-filter-actions { width: 100%; } }
        `}} />
      </main>
    );
  } catch (error) {
    console.error("Marketplace catalog failed:", error);
    return (
      <main className="marketplace-page">
        <div className="card marketplace-empty" style={{ marginTop: 32 }}>
          <h1><T en="Catalog unavailable" ar="الكتالوج غير متاح" /></h1>
          <p>
            <T
              en="We could not load the catalog right now. Please try again."
              ar="تعذر تحميل الكتالوج الآن. يرجى المحاولة مرة أخرى."
            />
          </p>
          <Link href="/marketplace" className="btn btn-primary"><T en="Try again" ar="حاول مرة أخرى" /></Link>
        </div>
      </main>
    );
  }
}
