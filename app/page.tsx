import Image from "next/image";
import Link from "next/link";
import T from "../components/t";

export default function HomePage() {
  return (
    <section className="home-page">
      {/* MEGA RETAIL HERO */}
      <div className="home-retail-hero">
        <div className="mega-banner">
          <div className="mega-banner-content">
            <span className="badge badge-gold" style={{ marginBottom: 15 }}>
              <T en="New Arrival" ar="وصل حديثاً" />
            </span>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1 }}>
              <T en="Join the Music Revolution" ar="انضم لثورة الموسيقى" />
            </h1>
            <p style={{ margin: '20px 0 30px', fontSize: '1.2rem' }}>
              <T 
                en="Explore the best gear, book world-class studios, and collaborate with pros. All in one place." 
                ar="استكشف أفضل المعدات، احجز استوديوهات عالمية، وتعاون مع المحترفين. كل ذلك في مكان واحد."
              />
            </p>
            <div className="actions">
              <Link href="/studios" className="btn btn-lg">
                <T en="Explore Studios" ar="استكشف الاستوديوهات" />
              </Link>
              <Link href="/gear/products" className="btn btn-secondary btn-lg">
                <T en="Shop Gear" ar="تسوق المعدات" />
              </Link>
            </div>
          </div>
          <div className="mega-banner-visual">
             <div style={{ width: '100%', height: '100%', background: 'radial-gradient(circle at center, #C7A45D 0%, transparent 70%)', opacity: 0.15 }} />
          </div>
        </div>
      </div>

      {/* CATEGORY PILLS - RETAIL STYLE */}
      <div className="category-pills">
        <Link href="/studios?category=podcast" className="category-pill">
          <div className="category-icon-wrap">🎙️</div>
          <span><T en="Podcast" ar="بودكاست" /></span>
        </Link>
        <Link href="/gear/products?category=microphones" className="category-pill">
          <div className="category-icon-wrap">🎤</div>
          <span><T en="Microphones" ar="ميكروفونات" /></span>
        </Link>
        <Link href="/studios?category=recording" className="category-pill">
          <div className="category-icon-wrap">🎧</div>
          <span><T en="Recording" ar="تسجيل" /></span>
        </Link>
        <Link href="/gear/products?category=keyboards" className="category-pill">
          <div className="category-icon-wrap">🎹</div>
          <span><T en="Keyboards" ar="كيبورد" /></span>
        </Link>
        <Link href="/studios?category=mixing" className="category-pill">
          <div className="category-icon-wrap">🎚️</div>
          <span><T en="Mixing" ar="مكس" /></span>
        </Link>
        <Link href="/gear/products?category=monitors" className="category-pill">
          <div className="category-icon-wrap">🔊</div>
          <span><T en="Monitors" ar="سماعات" /></span>
        </Link>
      </div>

      {/* PROMO ADS / BANK OFFERS */}
      <div className="retail-section">
        <div className="promo-grid">
          <div className="promo-card bank">
            <span className="promo-badge"><T en="Offer" ar="عرض" /></span>
            <h3><T en="Zero Interest" ar="قسطها بسعر الكاش" /></h3>
            <p><T en="On all equipment above 2000 SAR with selected banks." ar="على جميع المعدات فوق 2000 ريال مع بنوك مختارة." /></p>
            <Link href="#" className="view-all" style={{ color: '#fff', marginTop: 10 }}>
              <T en="Learn More" ar="لمعرفة المزيد" /> →
            </Link>
          </div>
          <div className="promo-card new-drop">
            <span className="promo-badge" style={{ background: '#000' }}><T en="New" ar="جديد" /></span>
            <h3><T en="The Creator Kit" ar="حقيبة المبدع" /></h3>
            <p><T en="Everything you need to start your podcast today." ar="كل ما تحتاجه لتبدأ البودكاست الخاص بك اليوم." /></p>
            <Link href="/gear/products" className="view-all" style={{ color: '#000', marginTop: 10 }}>
              <T en="Shop Now" ar="تسوق الآن" /> →
            </Link>
          </div>
        </div>
      </div>

      {/* FEATURED MARKETPLACE SHELF */}
      <div className="retail-section">
        <div className="retail-section-head">
          <h2><T en="Trending in Marketplace" ar="الأكثر طلباً في المتجر" /></h2>
          <Link href="/gear/products" className="view-all"><T en="View All" ar="عرض الكل" /></Link>
        </div>
        <div className="product-shelf">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="retail-product-card">
              <div className="retail-product-img">
                <div style={{ color: '#ccc', fontSize: '2rem' }}>📦</div>
              </div>
              <div className="retail-product-title">
                <T en="Professional Studio Microphone V2" ar="ميكروفون استوديو احترافي الاصدار الثاني" />
              </div>
              <div className="retail-product-price">
                1,200 <span>SAR</span>
              </div>
              <button className="retail-add-btn">
                <T en="Add to Cart" ar="أضف للسلة" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* TOP STUDIOS SHELF */}
      <div className="retail-section">
        <div className="retail-section-head">
          <h2><T en="Top Rated Studios in Riyadh" ar="أفضل الاستوديوهات في الرياض" /></h2>
          <Link href="/studios" className="view-all"><T en="View All" ar="عرض الكل" /></Link>
        </div>
        <div className="grid grid-3">
          {[1, 2, 3].map((i) => (
            <Link href="/studios" key={i} className="card studio-card">
              <div className="studio-cover">
                <div className="placeholder">STUDIO IMAGE</div>
              </div>
              <div style={{ marginTop: 15 }}>
                <h3>Studio X {i}</h3>
                <p><T en="Pro Sound & Mixing" ar="تسجيل ومكس احترافي" /></p>
                <div style={{ color: 'var(--gb-gold)', fontWeight: 800, marginTop: 5 }}>
                  250 SAR / <T en="hr" ar="ساعة" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* JOIN THE ECOSYSTEM - CALL TO ACTION */}
      <div className="section-padding" style={{ background: 'var(--gb-surface)', borderRadius: 30, margin: '60px 0', padding: '60px 20px', textAlign: 'center' }}>
        <div className="section-head">
          <span className="badge badge-gold"><T en="Partner Ecosystem" ar="منظومة الشركاء" /></span>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}><T en="Join & Share Your Gear" ar="سجل وشارك معداتك" /></h2>
          <p><T en="Join thousands of owners and sellers in the Saudi music scene." ar="انضم لآلاف الملاك والبائعين في المشهد الموسيقي السعودي." /></p>
        </div>

        <div className="grid grid-3" style={{ marginTop: 50, gap: 30 }}>
          <Link href="/owner/onboarding" className="card home-join-card" style={{ border: '1px solid var(--gb-gold)' }}>
            <div className="join-icon">🎧</div>
            <h3><T en="Studio Owner" ar="صاحب استوديو" /></h3>
            <p><T en="Monetize your space." ar="حقق دخلاً من مساحتك." /></p>
          </Link>
          <Link href="/vendor-signup" className="card home-join-card">
            <div className="join-icon">📦</div>
            <h3><T en="Gear Vendor" ar="تاجر معدات" /></h3>
            <p><T en="Reach pro buyers." ar="صل للمشترين المحترفين." /></p>
          </Link>
          <Link href="/signup" className="card home-join-card">
            <div className="join-icon">🎵</div>
            <h3><T en="I am a Creator" ar="أنا مبدع" /></h3>
            <p><T en="Access everything." ar="احصل على كل شيء." /></p>
          </Link>
        </div>
      </div>
    </section>
  );
}
