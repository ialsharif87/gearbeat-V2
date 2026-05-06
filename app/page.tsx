import Link from "next/link";
import T from "../components/t";

export default function HomePage() {
  return (
    <main className="home-root">
      {/* 1. CINEMATIC HERO */}
      <section className="hero-section">
        <div className="container hero-container animate-up">
          <div className="hero-content">
            <span className="badge-gold">
              <T en="Premium Creator Marketplace" ar="المنصة الفاخرة لصناع الصوت" />
            </span>
            <h1>
              <T
                en="Book the right studio for your next sound."
                ar="احجز الاستوديو المناسب لصوتك القادم."
              />
            </h1>
            <p className="lead">
              <T
                en="GearBeat connects you with top studios, elite gear, and verified audio services in a trusted, seamless experience."
                ar="GearBeat يربطك بأفضل الاستوديوهات، المعدات، والخدمات الصوتية في تجربة موثوقة وسهلة."
              />
            </p>
            <div className="hero-actions">
              <Link href="/studios" className="btn btn-primary btn-lg">
                <T en="Explore Studios" ar="استكشف الاستوديوهات" />
              </Link>
              <Link href="/join/studio" className="btn btn-outline btn-lg">
                <T en="List Your Studio" ar="اعرض استوديوك" />
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="sound-wave-glow"></div>
            <div className="abstract-orb"></div>
          </div>
        </div>
      </section>

      {/* 2. CHOOSE YOUR PATH */}
      <section className="section-padding">
        <div className="container">
          <div className="section-head text-center">
            <span className="badge-gold"><T en="Partner Ecosystem" ar="منظومة الشركاء" /></span>
            <h2><T en="Choose your path" ar="اختر مسارك في GearBeat" /></h2>
          </div>

          <div className="grid grid-3 path-grid">
            <Link href="/signup" className="card-premium path-card">
              <div className="path-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="22"></line>
                </svg>
              </div>
              <h3><T en="I am a Creator" ar="أنا مبدع" /></h3>
              <p><T en="Book world-class studios and buy elite gear for your next project." ar="احجز استوديوهات عالمية واشترِ معدات احترافية لمشروعك القادم." /></p>
              <span className="path-cta"><T en="Get Started" ar="ابدأ الآن" /> →</span>
            </Link>

            <Link href="/join/studio" className="card-premium path-card active-border">
              <div className="path-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3a9 9 0 0 0-9 9v7a2 2 0 0 0 2 2h2v-6H5v-3a7 7 0 0 1 14 0v3h-2v6h2a2 2 0 0 0 2-2v-7a9 9 0 0 0-9-9z"/>
                </svg>
              </div>
              <h3><T en="Studio Owner" ar="صاحب استوديو" /></h3>
              <p><T en="List your space, manage bookings, and join a verified network." ar="اعرض مساحتك، أدر حجوزاتك، وانضم لشبكة موثقة من المحترفين." /></p>
              <span className="path-cta"><T en="Join as Owner" ar="انضم كصاحب استوديو" /> →</span>
            </Link>

            <Link href="/join/seller" className="card-premium path-card">
              <div className="path-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
              </div>
              <h3><T en="Gear Vendor" ar="تاجر معدات" /></h3>
              <p><T en="Sell your professional audio gear to a targeted creative audience." ar="بع معداتك الصوتية المحترفة لجمهور مبدع ومستهدف." /></p>
              <span className="path-cta"><T en="Start Selling" ar="ابدأ البيع" /> →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. TRUST / WHY GEARBEAT */}
      <section className="section-padding trust-section">
        <div className="container">
          <div className="grid grid-2 items-center">
            <div className="trust-text">
              <span className="badge-gold"><T en="Why GearBeat" ar="لماذا GearBeat؟" /></span>
              <h2><T en="Built for real sessions and clear accountability." ar="مبنية لجلسات حقيقية ومسؤولية واضحة." /></h2>
              <p className="text-muted">
                <T 
                  en="GearBeat is designed to support a trusted marketplace with verified profiles, secure payments, and honest feedback."
                  ar="جيربيت مصممة لدعم ماركت بليس موثوق بملفات موثقة، مدفوعات آمنة، وتقييمات حقيقية."
                />
              </p>
            </div>
            <div className="grid grid-2 gap-20">
              <div className="card-premium trust-item">
                <div className="trust-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <h4><T en="Verified Studios" ar="استوديوهات موثقة" /></h4>
              </div>
              <div className="card-premium trust-item">
                <div className="trust-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <h4><T en="Easy Booking" ar="حجز واضح وسهل" /></h4>
              </div>
              <div className="card-premium trust-item">
                <div className="trust-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                </div>
                <h4><T en="Secure Payments" ar="مدفوعات آمنة" /></h4>
              </div>
              <div className="card-premium trust-item">
                <div className="trust-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h4><T en="Pro Community" ar="مجتمع محترف" /></h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED STUDIOS PREVIEW */}
      <section className="section-padding bg-darker">
        <div className="container">
          <div className="flex-between section-head">
            <h2><T en="Featured Studios" ar="استوديوهات مميزة" /></h2>
            <Link href="/studios" className="text-gold"><T en="View all" ar="عرض الكل" /> →</Link>
          </div>
          <div className="grid grid-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-premium studio-preview-card">
                <div className="studio-thumb-placeholder"></div>
                <div style={{ marginTop: 20 }}>
                  <div className="flex-between">
                    <h4>Studio Space {i}</h4>
                    <span className="text-gold">4.9 ★</span>
                  </div>
                  <p className="text-muted">Riyadh, Saudi Arabia</p>
                  <Link href="/studios" className="btn btn-outline btn-sm w-full mt-20">
                    <T en="View Details" ar="عرض التفاصيل" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. GEAR MARKETPLACE PREVIEW */}
      <section className="section-padding">
        <div className="container">
          <div className="flex-between section-head">
            <h2><T en="Marketplace" ar="سوق المعدات" /></h2>
            <Link href="/marketplace" className="text-gold"><T en="Shop Gear" ar="تسوق المعدات" /> →</Link>
          </div>
          <div className="grid grid-4 category-grid">
            {['Microphones', 'Monitors', 'Interfaces', 'Controllers'].map((cat) => (
              <div key={cat} className="card-premium cat-card">
                <div className="cat-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                </div>
                <h4>{cat}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="section-padding final-cta">
        <div className="container text-center animate-up">
          <h2><T en="Ready to create your next masterpiece?" ar="جاهز لصناعة تحفتك الفنية القادمة؟" /></h2>
          <div className="cta-actions" style={{ marginTop: 40, display: 'flex', gap: 20, justifyContent: 'center' }}>
            <Link href="/studios" className="btn btn-primary btn-lg">
              <T en="Book Your Session" ar="احجز جلستك القادمة" />
            </Link>
            <Link href="/join/studio" className="btn btn-outline btn-lg">
              <T en="Join as Partner" ar="انضم كاستوديو معتمد" />
            </Link>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .home-root { overflow-x: hidden; }
        
        /* HERO */
        .hero-section {
          padding: 140px 0 100px;
          background: radial-gradient(circle at 80% 20%, rgba(201, 162, 77, 0.08) 0%, transparent 40%);
          position: relative;
        }

        .hero-container {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 60px;
          align-items: center;
        }

        .hero-content h1 {
          font-size: clamp(2.5rem, 6vw, 4.8rem);
          margin: 24px 0;
          color: #fff;
        }

        .hero-content .lead {
          font-size: 1.25rem;
          color: var(--gb-text-muted);
          margin-bottom: 48px;
          max-width: 600px;
        }

        .hero-actions { display: flex; gap: 16px; }

        .hero-visual {
          position: relative;
          height: 400px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .sound-wave-glow {
          position: absolute;
          width: 400px;
          height: 200px;
          background: var(--gb-gold);
          filter: blur(120px);
          opacity: 0.15;
          border-radius: 50%;
        }

        .abstract-orb {
          width: 280px;
          height: 280px;
          border: 1px solid var(--gb-gold);
          border-radius: 50%;
          opacity: 0.2;
          box-shadow: 0 0 40px var(--gb-gold-glow);
          animation: pulse 4s infinite ease-in-out;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.1); opacity: 0.3; }
        }

        /* PATH SECTION */
        .section-head { margin-bottom: 60px; }
        .section-head h2 { font-size: 3rem; margin-top: 24px; }
        .text-center { text-align: center; }
        
        .path-card { text-align: center; }
        .path-icon { font-size: 3.5rem; margin-bottom: 24px; }
        .path-card h3 { margin-bottom: 16px; font-size: 1.5rem; }
        .path-card p { color: var(--gb-text-muted); margin-bottom: 30px; font-size: 0.95rem; line-height: 1.7; }
        .path-cta { color: var(--gb-gold); font-weight: 800; font-size: 0.9rem; }
        
        .active-border { border-color: var(--gb-gold); }

        /* TRUST SECTION */
        .trust-section { background: #080b0e; }
        .trust-text h2 { font-size: 2.8rem; margin: 24px 0; }
        .trust-item { text-align: center; padding: 24px; }
        .trust-icon { font-size: 2.2rem; margin-bottom: 12px; }
        .trust-item h4 { font-size: 1.1rem; }

        /* STUDIO PREVIEW */
        .bg-darker { background: #030507; }
        .flex-between { display: flex; justify-content: space-between; gap: 20px; align-items: flex-end; }
        .studio-thumb-placeholder { height: 220px; background: #1a222c; border-radius: 16px; }
        .w-full { width: 100%; }
        .mt-20 { margin-top: 20px; }

        /* CATEGORY CARDS */
        .cat-card { text-align: center; padding: 30px 20px; }
        .cat-icon { font-size: 2rem; margin-bottom: 12px; color: var(--gb-gold); }

        /* FINAL CTA */
        .final-cta { background: linear-gradient(to bottom, #05080B, #000); }
        .final-cta h2 { font-size: 3.5rem; max-width: 800px; margin: 0 auto; }

        .btn-lg { padding: 18px 48px; font-size: 1.1rem; }

        @media (max-width: 1000px) {
          .hero-container { grid-template-columns: 1fr; text-align: center; }
          .hero-content .lead { margin: 24px auto 48px; }
          .hero-actions { justify-content: center; }
          .hero-visual { height: 200px; order: -1; }
          .hero-section { padding-top: 80px; }
          .grid-2 { grid-template-columns: 1fr; }
          .section-head h2 { font-size: 2.2rem; }
          .final-cta h2 { font-size: 2.2rem; }
        }

        @media (max-width: 600px) {
          .hero-actions { flex-direction: column; width: 100%; }
          .cta-actions { flex-direction: column; width: 100%; }
          .hero-content h1 { font-size: 2.2rem; }
          .section-padding { padding: 60px 0; }
        }

        /* RTL HELPER */
        [dir="rtl"] .hero-container { direction: rtl; }
        [dir="rtl"] .hero-content { text-align: right; }
        [dir="rtl"] .section-head { text-align: right; }
        [dir="rtl"] .text-center { text-align: center; }
      `}} />
    </main>
  );
}
