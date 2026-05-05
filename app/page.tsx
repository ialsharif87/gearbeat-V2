import Link from "next/link";
import T from "../components/t";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createAdminClient();

  const [{ data: products }, { data: studios }] = await Promise.all([
    supabase.from("marketplace_products").select("*").eq("is_active", true).limit(4),
    supabase.from("studios").select("*").eq("status", "approved").limit(6),
  ]);

  return (
    <div className="gb-home-root">
      {/* Hero Section */}
      <section className="gb-hero">
        <div className="gb-hero-overlay" />
        <div className="gb-hero-content container">
          <p className="gb-eyebrow">
            <span className="gb-eyebrow-line" />
            <T en="STUDIO. SOUND. CONNECTED." ar="استوديو. صوت. تواصل." />
          </p>
          <h1 className="gb-hero-title">
            <T 
              en="Book premium creative studios across Saudi Arabia." 
              ar="احجز أفخم الاستوديوهات الإبداعية في المملكة العربية السعودية." 
            />
          </h1>
          <p className="gb-hero-text">
            <T 
              en="GearBeat connects audio creators with verified studios, clear pricing, and a smoother booking experience built for the Saudi and GCC market." 
              ar="جير بيت يربط المبدعين باستوديوهات موثقة، بأسعار واضحة، وتجربة حجز سلسة مصممة للسوق السعودي والخليجي." 
            />
          </p>
          <div className="gb-cta-row">
            <Link href="/studios" className="gb-button-primary">
              <T en="Browse Studios" ar="تصفح الاستوديوهات" />
            </Link>
            <Link href="/join/studio" className="gb-button-secondary">
              <T en="List Your Studio" ar="أضف استوديوك" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Studios */}
      <section className="gb-section container" id="studios">
        <div className="gb-section-header">
          <span className="gb-section-tag"><T en="Featured Studios" ar="استوديوهات مميزة" /></span>
          <h2><T en="Premium spaces for serious creators." ar="مساحات فاخرة للمبدعين الجادين." /></h2>
        </div>

        <div className="gb-studio-grid">
          {studios?.map((studio) => (
            <Link href={`/studios/${studio.slug || studio.id}`} key={studio.id} className="gb-studio-card">
              <div className="gb-studio-visual">
                {studio.cover_image_url ? (
                  <img src={studio.cover_image_url} alt={studio.name_en} className="gb-studio-img" />
                ) : (
                  <div className="gb-studio-placeholder" />
                )}
                <div className="gb-studio-overlay" />
              </div>
              <div className="gb-studio-body">
                <div className="gb-card-top">
                  <div>
                    <h3>{studio.name_en || studio.name_ar}</h3>
                    <p>{studio.city_name || studio.city}</p>
                  </div>
                  <span className="gb-rating">★ 4.9</span>
                </div>
                <div className="gb-meta-row">
                  <strong>{studio.hourly_rate} SAR / hour</strong>
                  <span className="gb-verified"><T en="Verified" ar="موثق" /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Gear Marketplace Teaser */}
      <section className="gb-section gb-surface-alt">
        <div className="container gb-marketplace-teaser">
          <div className="gb-teaser-content">
            <span className="gb-section-tag"><T en="Gear Marketplace" ar="سوق المعدات" /></span>
            <h2><T en="The tools you need to sound your best." ar="الأدوات التي تحتاجها لأفضل صوت." /></h2>
            <p><T en="From vintage mics to the latest synths, find and rent gear from top vendors in the region." ar="من الميكروفونات الكلاسيكية إلى أحدث أجهزة السنث، ابحث واستأجر المعدات من أفضل الموردين في المنطقة." /></p>
            <Link href="/gear" className="gb-button-primary" style={{ marginTop: '24px' }}>
              <T en="Shop Equipment" ar="تسوق المعدات" />
            </Link>
          </div>
          <div className="gb-teaser-grid">
            {products?.map((p) => (
              <div key={p.id} className="gb-mini-product">
                <img src={p.images?.[0] || "/placeholder-gear.png"} alt={p.name_en} />
                <div className="gb-mini-product-info">
                  <strong>{p.name_en}</strong>
                  <span>{p.base_price} SAR</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why GearBeat */}
      <section className="gb-section container">
        <div className="gb-features-grid">
          <div className="gb-feature">
            <div className="gb-feature-icon">🎙️</div>
            <h3><T en="Sound First" ar="الصوت أولًا" /></h3>
            <p><T en="Built specifically for the audio production workflow." ar="مصمم خصيصاً لسير عمل الإنتاج الصوتي." /></p>
          </div>
          <div className="gb-feature">
            <div className="gb-feature-icon">🤝</div>
            <h3><T en="Connect" ar="تواصل" /></h3>
            <p><T en="Linking talent with the GCC's finest creative spaces." ar="ربط المواهب بأفضل المساحات الإبداعية في الخليج." /></p>
          </div>
          <div className="gb-feature">
            <div className="gb-feature-icon">🛡️</div>
            <h3><T en="Trust" ar="ثقة" /></h3>
            <p><T en="Verified providers and secure payment processing." ar="مزودو خدمات موثوقون ومعالجة دفع آمنة." /></p>
          </div>
        </div>
      </section>

      <style jsx>{`
        .gb-home-root {
          background: var(--gb-bg);
          color: var(--gb-text-ivory);
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .gb-hero {
          position: relative;
          padding: 120px 0 80px;
          min-height: 80vh;
          display: flex;
          align-items: center;
          overflow: hidden;
          background: radial-gradient(circle at top left, rgba(212, 175, 55, 0.1), transparent 40%),
                      radial-gradient(circle at bottom right, rgba(15, 160, 138, 0.05), transparent 40%);
        }
        .gb-hero-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
        }
        .gb-eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--gb-gold);
          font-weight: 800;
          letter-spacing: 0.2em;
          font-size: 0.8rem;
          margin-bottom: 24px;
        }
        .gb-eyebrow-line {
          width: 40px;
          height: 1px;
          background: linear-gradient(90deg, var(--gb-gold), transparent);
        }
        .gb-hero-title {
          font-size: clamp(2.5rem, 6vw, 5rem);
          line-height: 1.1;
          font-weight: 900;
          margin: 0;
          letter-spacing: -0.04em;
        }
        .gb-hero-text {
          font-size: 1.25rem;
          color: var(--gb-text-steel);
          margin: 32px 0;
          line-height: 1.6;
          max-width: 600px;
        }
        .gb-cta-row {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        .gb-button-primary {
          background: var(--gb-gold);
          color: #000;
          padding: 16px 32px;
          border-radius: 99px;
          font-weight: 800;
          transition: transform 0.2s;
        }
        .gb-button-secondary {
          background: rgba(255,255,255,0.05);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.1);
          padding: 16px 32px;
          border-radius: 99px;
          font-weight: 800;
          transition: transform 0.2s;
        }
        .gb-button-primary:hover, .gb-button-secondary:hover {
          transform: translateY(-2px);
        }
        .gb-section {
          padding: 100px 0;
        }
        .gb-section-header {
          margin-bottom: 48px;
        }
        .gb-section-tag {
          color: var(--gb-teal);
          font-weight: 800;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 12px;
          display: block;
        }
        .gb-section h2 {
          font-size: 3rem;
          margin: 0;
          letter-spacing: -0.03em;
        }
        .gb-studio-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 24px;
        }
        .gb-studio-card {
          background: var(--gb-surface);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 24px;
          overflow: hidden;
          transition: transform 0.3s, border-color 0.3s;
        }
        .gb-studio-card:hover {
          transform: translateY(-8px);
          border-color: var(--gb-gold);
        }
        .gb-studio-visual {
          height: 240px;
          position: relative;
          background: #000;
        }
        .gb-studio-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .gb-studio-placeholder {
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at center, #222, #000);
        }
        .gb-studio-body {
          padding: 24px;
        }
        .gb-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        .gb-card-top h3 {
          margin: 0;
          font-size: 1.25rem;
        }
        .gb-card-top p {
          margin: 4px 0 0;
          color: var(--gb-text-steel);
          font-size: 0.9rem;
        }
        .gb-rating {
          background: rgba(212, 175, 55, 0.1);
          color: var(--gb-gold);
          padding: 4px 10px;
          border-radius: 99px;
          font-size: 0.8rem;
          font-weight: 800;
        }
        .gb-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .gb-verified {
          color: var(--gb-teal);
          font-size: 0.8rem;
          font-weight: 800;
        }
        .gb-surface-alt {
          background: var(--gb-surface);
        }
        .gb-marketplace-teaser {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }
        .gb-teaser-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .gb-mini-product {
          background: var(--gb-bg);
          padding: 16px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .gb-mini-product img {
          width: 60px;
          height: 60px;
          object-fit: contain;
        }
        .gb-mini-product-info strong {
          display: block;
          font-size: 0.9rem;
        }
        .gb-mini-product-info span {
          color: var(--gb-gold);
          font-size: 0.8rem;
          font-weight: 700;
        }
        .gb-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
        }
        .gb-feature {
          text-align: center;
        }
        .gb-feature-icon {
          font-size: 3rem;
          margin-bottom: 24px;
        }
        @media (max-width: 768px) {
          .gb-hero-title { font-size: 3rem; }
          .gb-marketplace-teaser { grid-template-columns: 1fr; }
          .gb-features-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
