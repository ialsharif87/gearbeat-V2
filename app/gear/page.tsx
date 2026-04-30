import Link from "next/link";
import T from "../../components/t";
import { createClient } from "../../lib/supabase/server";
import ProductCard from "../../components/product-card";

export default async function GearMarketplacePage() {
  const supabase = await createClient();

  // Fetch featured categories
  const { data: categories } = await supabase
    .from("marketplace_categories")
    .select("id, name_en, name_ar, slug, icon_url")
    .eq("status", "active")
    .order("sort_order", { ascending: true })
    .limit(6);

  // Fetch featured products
  const { data: featuredProducts } = await supabase
    .from("marketplace_products")
    .select(`
      id, name_en, name_ar, slug, base_price,
      brand:marketplace_brands(name_en),
      images:marketplace_product_images(image_url)
    `)
    .eq("status", "approved")
    .eq("is_featured", true)
    .limit(8);

  return (
    <div className="marketplace-home">
      {/* HERO SECTION */}
      <section className="marketplace-hero">
        <div className="hero-content">
          <span className="badge badge-gold">
            <T en="Official Marketplace" ar="السوق الرسمي" />
          </span>
          <h1>
            <T en="Buy the Gear." ar="اشترِ المعدات." />{" "}
            <span className="neon-text">
              <T en="Create the Sound." ar="وابدأ الإبداع." />
            </span>
          </h1>
          <p>
            <T 
              en="Premium audio interfaces, microphones, instruments, and studio essentials from top global brands." 
              ar="واجهات صوتية احترافية، ميكروفونات، آلات موسيقية، وأساسيات الاستوديو من أفضل العلامات التجارية العالمية." 
            />
          </p>
          <div className="hero-actions">
            <Link href="/gear/products" className="btn btn-primary btn-large">
              <T en="Shop All Gear" ar="تسوق كل المعدات" />
            </Link>
            <Link href="/gear/categories" className="btn btn-secondary btn-large">
              <T en="Browse Categories" ar="تصفح التصنيفات" />
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES GRID */}
      <section className="section-padding">
        <div className="section-head">
          <h2><T en="Top Categories" ar="أبرز التصنيفات" /></h2>
        </div>
        <div className="categories-grid">
          {categories?.map((cat) => (
            <Link key={cat.id} href={`/gear/categories/${cat.slug}`} className="card category-card">
              <div className="cat-icon">{cat.icon_url || "🎧"}</div>
              <h3><T en={cat.name_en} ar={cat.name_ar} /></h3>
            </Link>
          ))}
          {(!categories || categories.length === 0) && (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40 }}>
              <p style={{ color: 'var(--muted)' }}><T en="No categories found." ar="لا توجد تصنيفات بعد." /></p>
            </div>
          )}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section-padding" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2><T en="Featured Gear" ar="معدات مختارة" /></h2>
            <p><T en="Handpicked premium tools for your studio." ar="أدوات احترافية مختارة بعناية للاستوديو الخاص بك." /></p>
          </div>
          <Link href="/gear/products" className="text-link">
            <T en="View All" ar="عرض الكل" /> →
          </Link>
        </div>

        <div className="grid grid-4">
          {featuredProducts?.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {(!featuredProducts || featuredProducts.length === 0) && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: '3rem', marginBottom: 20 }}>🛒</div>
              <h3><T en="Marketplace is coming soon" ar="السوق سيتوفر قريباً" /></h3>
              <p><T en="We are currently onboarding top vendors." ar="نحن حالياً في مرحلة تسجيل كبار الموردين." /></p>
            </div>
          )}
        </div>
      </section>

      {/* TRUST BANNER */}
      <section className="section-padding">
        <div className="card trust-banner">
          <div className="trust-grid">
            <div className="trust-item">
              <span className="trust-icon">🛡️</span>
              <div>
                <h4><T en="Authentic Gear" ar="معدات أصلية" /></h4>
                <p><T en="100% genuine products only." ar="منتجات أصلية 100% فقط." /></p>
              </div>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🚚</span>
              <div>
                <h4><T en="Fast Shipping" ar="شحن سريع" /></h4>
                <p><T en="Reliable delivery across GCC." ar="توصيل موثوق عبر الخليج." /></p>
              </div>
            </div>
            <div className="trust-item">
              <span className="trust-icon">💳</span>
              <div>
                <h4><T en="Secure Payment" ar="دفع آمن" /></h4>
                <p><T en="Multiple trusted payment options." ar="خيارات دفع متعددة وموثوقة." /></p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
