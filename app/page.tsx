import Image from "next/image";
import Link from "next/link";
import T from "../components/t";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createAdminClient();

  // 1. Fetch Dynamic Promos
  const { data: promos } = await supabase
    .from("marketplace_promos")
    .select("*")
    .eq("is_active", true)
    .order("priority", { ascending: false });

  const heroBanners = promos?.filter(p => p.promo_type === 'hero_banner') || [];
  const sideCards = promos?.filter(p => p.promo_type === 'bank_offer' || p.promo_type === 'side_card') || [];

  // 2. Fetch Trending Gear (First 4 active products)
  const { data: products } = await supabase
    .from("marketplace_products")
    .select("*")
    .eq("is_active", true)
    .limit(4);

  // 3. Fetch Top Studios
  const { data: studios } = await supabase
    .from("studios")
    .select("*")
    .eq("status", "approved")
    .limit(3);

  const mainHero = heroBanners[0];

  return (
    <section className="home-page">
      {/* MEGA RETAIL HERO */}
      <div className="home-retail-hero">
        <div className="mega-banner" style={mainHero ? { backgroundImage: `url(${mainHero.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
          <div className="mega-banner-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #080706 0%, rgba(8,7,6,0.6) 50%, transparent 100%)', zIndex: 0 }} />
          <div className="mega-banner-content" style={{ position: 'relative', zIndex: 1 }}>
            <span className="badge badge-gold" style={{ marginBottom: 15 }}>
              {mainHero ? (mainHero.metadata?.badge || <T en="Special Offer" ar="عرض خاص" />) : <T en="New Arrival" ar="وصل حديثاً" />}
            </span>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1 }}>
              {mainHero ? (
                <>
                  <div className="en">{mainHero.title_en}</div>
                  <div className="ar" style={{ fontFamily: 'var(--font-ar)', marginTop: 10 }}>{mainHero.title_ar}</div>
                </>
              ) : (
                <T en="Join the Music Revolution" ar="انضم لثورة الموسيقى" />
              )}
            </h1>
            <p style={{ margin: '20px 0 30px', fontSize: '1.2rem', color: '#ccc' }}>
              {mainHero ? (
                <>
                  <div>{mainHero.description_en}</div>
                  <div style={{ direction: 'rtl' }}>{mainHero.description_ar}</div>
                </>
              ) : (
                <T 
                  en="Explore the best gear, book world-class studios, and collaborate with pros. All in one place." 
                  ar="استكشف أفضل المعدات، احجز استوديوهات عالمية، وتعاون مع المحترفين. كل ذلك في مكان واحد."
                />
              )}
            </p>
            <div className="actions">
              <Link href={mainHero?.link_url || "/studios"} className="btn btn-lg">
                <T en="Explore Now" ar="استكشف الآن" />
              </Link>
              {!mainHero && (
                <Link href="/gear/products" className="btn btn-secondary btn-lg">
                  <T en="Shop Gear" ar="تسوق المعدات" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY PILLS */}
      <div className="category-pills">
        <CategoryItem href="/studios?category=podcast" icon="🎙️" labelEn="Podcast" labelAr="بودكاست" />
        <CategoryItem href="/gear/products?category=microphones" icon="🎤" labelEn="Microphones" labelAr="ميكروفونات" />
        <CategoryItem href="/studios?category=recording" icon="🎧" labelEn="Recording" labelAr="تسجيل" />
        <CategoryItem href="/gear/products?category=keyboards" icon="🎹" labelEn="Keyboards" labelAr="كيبورد" />
        <CategoryItem href="/studios?category=mixing" icon="🎚️" labelEn="Mixing" labelAr="مكس" />
        <CategoryItem href="/gear/products?category=monitors" icon="🔊" labelEn="Monitors" labelAr="سماعات" />
      </div>

      {/* PROMO ADS / BANK OFFERS */}
      {sideCards.length > 0 && (
        <div className="retail-section">
          <div className="promo-grid">
            {sideCards.map((card) => (
              <div key={card.id} className="promo-card" style={{ backgroundImage: `url(${card.image_url})`, backgroundSize: 'cover' }}>
                <div className="promo-card-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 0 }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <span className="promo-badge"><T en="Offer" ar="عرض" /></span>
                  <h3>{card.title_en} <span style={{ fontFamily: 'var(--font-ar)', display: 'block', fontSize: '0.9rem' }}>{card.title_ar}</span></h3>
                  <p style={{ fontSize: '0.85rem' }}>{card.description_en}</p>
                  <Link href={card.link_url || "#"} className="view-all" style={{ color: '#fff', marginTop: 10 }}>
                    <T en="Learn More" ar="لمعرفة المزيد" /> →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FEATURED MARKETPLACE SHELF */}
      <div className="retail-section">
        <div className="retail-section-head">
          <h2><T en="Trending in Marketplace" ar="الأكثر طلباً في المتجر" /></h2>
          <Link href="/gear/products" className="view-all"><T en="View All" ar="عرض الكل" /></Link>
        </div>
        <div className="product-shelf">
          {products && products.length > 0 ? products.map((p) => (
            <div key={p.id} className="retail-product-card">
              <div className="retail-product-img">
                {p.images?.[0] ? <img src={p.images[0]} alt={p.name_en} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <div style={{ color: '#ccc', fontSize: '2rem' }}>📦</div>}
              </div>
              <div className="retail-product-title">
                <T en={p.name_en} ar={p.name_ar} />
              </div>
              <div className="retail-product-price">
                {p.base_price.toLocaleString()} <span>SAR</span>
              </div>
              <button className="retail-add-btn">
                <T en="Add to Cart" ar="أضف للسلة" />
              </button>
            </div>
          )) : (
            <p style={{ color: '#555' }}><T en="No products available yet." ar="لا توجد منتجات متوفرة حالياً." /></p>
          )}
        </div>
      </div>

      {/* TOP STUDIOS SHELF */}
      <div className="retail-section">
        <div className="retail-section-head">
          <h2><T en="Top Rated Studios" ar="أفضل الاستوديوهات" /></h2>
          <Link href="/studios" className="view-all"><T en="View All" ar="عرض الكل" /></Link>
        </div>
        <div className="grid grid-3">
          {studios && studios.length > 0 ? studios.map((s) => (
            <Link href={`/studios/${s.slug}`} key={s.id} className="card studio-card">
              <div className="studio-cover" style={{ backgroundImage: `url(${s.cover_image_url})`, backgroundSize: 'cover' }}>
                {!s.cover_image_url && <div className="placeholder">STUDIO IMAGE</div>}
              </div>
              <div style={{ marginTop: 15 }}>
                <h3>{s.name_en}</h3>
                <p><T en={s.city} ar={s.city_ar || s.city} /></p>
                <div style={{ color: 'var(--gb-gold)', fontWeight: 800, marginTop: 5 }}>
                  {s.hourly_rate} SAR / <T en="hr" ar="ساعة" />
                </div>
              </div>
            </Link>
          )) : (
            <p style={{ color: '#555' }}><T en="Coming soon..." ar="قريباً..." /></p>
          )}
        </div>
      </div>

      {/* BRAND COLLABORATIONS */}
      <div className="retail-section" style={{ borderTop: '1px solid #111', paddingTop: 60, marginTop: 60 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: '1.8rem', opacity: 0.5 }}><T en="Trusted by the Best" ar="نشرك النجاح مع الأفضل" /></h2>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 60, flexWrap: 'wrap', opacity: 0.3, filter: 'grayscale(1)' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>YAMAHA</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>SENNHEISER</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>FOCUSRITE</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>UNIVERSAL AUDIO</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>GENELEC</div>
        </div>
      </div>

      {/* JOIN THE ECOSYSTEM */}
      <div className="section-padding" style={{ background: 'var(--gb-surface)', borderRadius: 30, margin: '60px 0', padding: '60px 20px', textAlign: 'center' }}>
        <div className="section-head">
          <span className="badge badge-gold"><T en="Partner Ecosystem" ar="منظومة الشركاء" /></span>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}><T en="Register, Share & Join" ar="سجل، شارك، وانضم إلينا" /></h2>
          <p><T en="Join thousands of creators, owners and sellers in the Saudi music scene." ar="انضم لآلاف المبدعين والملاك والبائعين في المشهد الموسيقي السعودي." /></p>
        </div>

        <div className="grid grid-3" style={{ marginTop: 50, gap: 30 }}>
          <JoinCard href="/owner/onboarding" icon="🎧" labelEn="Register Studio" labelAr="سجل استوديو" descEn="Monetize your space." descAr="حقق دخلاً من مساحتك." highlight />
          <JoinCard href="/vendor-signup" icon="📦" labelEn="Become a Seller" labelAr="كن بائعاً" descEn="Reach pro buyers." descAr="صل للمشترين المحترفين." />
          <JoinCard href="/signup" icon="🎵" labelEn="Join as Creator" labelAr="انضم كمبدع" descEn="Access everything." descAr="احصل على كل شيء." />
        </div>
      </div>
    </section>
  );
}

function CategoryItem({ href, icon, labelEn, labelAr }: any) {
  return (
    <Link href={href} className="category-pill">
      <div className="category-icon-wrap">{icon}</div>
      <span><T en={labelEn} ar={labelAr} /></span>
    </Link>
  );
}

function JoinCard({ href, icon, labelEn, labelAr, descEn, descAr, highlight }: any) {
  return (
    <Link href={href} className="card home-join-card" style={highlight ? { border: '1px solid var(--gb-gold)' } : {}}>
      <div className="join-icon">{icon}</div>
      <h3><T en={labelEn} ar={labelAr} /></h3>
      <p><T en={descEn} ar={descAr} /></p>
    </Link>
  );
}
