import Link from "next/link";
import Image from "next/image";
import T from "../components/t";
import AskGearBeatPreview from "../components/ask-gearbeat-preview";

export default function HomePage() {
  return (
    <main className="home-root">
      {/* 1. CINEMATIC HERO */}
      <section className="hero-section">
        <div className="container hero-container animate-up">
          <div className="hero-content">
            <div className="badge-gold mb-16">
              <T en="Saudi-First Creative Marketplace" ar="منصة إبداعية صوتية سعودية أولاً" />
            </div>
            <h1 className="text-balance" style={{ fontWeight: 900 }}>
              <T
                en="The global pulse of studio sound."
                ar="النبض العالمي لصوت الاستوديوهات."
              />
            </h1>
            <p className="lead mb-40">
              <T
                en="Built for Saudi launch, GCC expansion, and global reach. Explore now. Full commercial activation coming in controlled phases. Payments and sensitive onboarding are activated only after compliance readiness."
                ar="مصممة للإطلاق في المملكة العربية السعودية، والتوسع في الخليج، والوصول العالمي. استكشف الآن. التفعيل التجاري الكامل يأتي في مراحل خاضعة للرقابة. يتم تنشيط المدفوعات والتسجيل الحساس للمعلومات فقط بعد جاهزية الامتثال."
              />
            </p>
            <div className="hero-actions">
              <Link href="/studios" className="btn btn-primary btn-lg shadow-gold">
                <T en="Book a Studio" ar="احجز استوديو" />
              </Link>
              <Link href="/marketplace" className="btn btn-outline btn-lg">
                <T en="Shop Gear" ar="تسوق معدات" />
              </Link>
            </div>
            <div style={{ marginTop: 24, fontSize: '0.8rem', color: 'var(--gb-gold-light)', display: 'flex', alignItems: 'center', gap: 8, opacity: 0.8 }}>
              <span>🛡️</span>
              <T 
                en="Verified listings and partner review before full activation." 
                ar="قوائم موثقة ومراجعة للشركاء قبل التفعيل الكامل للخدمات." 
              />
            </div>
          </div>
          <div className="hero-visual">
            {/* Premium Gold Glow Accents */}
            <div className="ambient-glow glow-1"></div>
            <div className="ambient-glow glow-2"></div>
            
            {/* Rhythm Waves Background System */}
            <div className="rhythm-waves">
              <div className="rhythm-bar bar-1"></div>
              <div className="rhythm-bar bar-2"></div>
              <div className="rhythm-bar bar-3"></div>
              <div className="rhythm-bar bar-4"></div>
              <div className="rhythm-bar bar-5"></div>
              <div className="rhythm-bar bar-6"></div>
              <div className="rhythm-bar bar-7"></div>
              <div className="rhythm-bar bar-8"></div>
              <div className="rhythm-bar bar-9"></div>
              <div className="rhythm-bar bar-10"></div>
              <div className="rhythm-bar bar-11"></div>
              <div className="rhythm-bar bar-12"></div>
            </div>

            {/* Premium Abstract Panel 1: Riyadh Studio Live Status */}
            <div className="brand-panel panel-main animate-float-slow">
              <div className="panel-glow"></div>
              <div className="panel-header">
                <span className="dot dot-green"></span>
                <span className="panel-title"><T en="RIYADH STUDIO A" ar="استوديو الرياض A" /></span>
                <span className="panel-status"><T en="LIVE" ar="مباشر" /></span>
              </div>
              <div className="panel-body">
                {/* Embedded Soundwave Rhythm lines */}
                <div className="frequency-display">
                  <div className="freq-bar f-1"></div>
                  <div className="freq-bar f-2"></div>
                  <div className="freq-bar f-3"></div>
                  <div className="freq-bar f-4"></div>
                  <div className="freq-bar f-5"></div>
                  <div className="freq-bar f-6"></div>
                  <div className="freq-bar f-7"></div>
                  <div className="freq-bar f-8"></div>
                  <div className="freq-bar f-9"></div>
                  <div className="freq-bar f-10"></div>
                </div>
                <div className="panel-metrics">
                  <div>
                    <span className="metric-label"><T en="Latency" ar="زمن الاستجابة" /></span>
                    <span className="metric-val">1.2ms</span>
                  </div>
                  <div>
                    <span className="metric-label"><T en="Resolution" ar="الدقة" /></span>
                    <span className="metric-val">192kHz</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Abstract Panel 2: GearBeat Certified Onboarding */}
            <div className="brand-panel panel-secondary animate-float-delayed">
              <div className="panel-header">
                <span className="text-gold font-bold" style={{ fontSize: '0.8rem' }}>🛡️ GearBeat Certified</span>
              </div>
              <div className="panel-body">
                <p className="panel-desc">
                  <T en="Verified Saudi partners with premium escrow protection." ar="شركاء سعوديون موثقون مع حماية كاملة للمدفوعات." />
                </p>
                <div className="gcc-badge-small">
                  <span>🇸🇦 GCC ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AskGearBeatPreview />

      {/* 2. CHOOSE YOUR PATH */}
      <section className="section-padding">
        <div className="container">
          <div className="section-head text-center">
            <span className="badge-gold"><T en="Network Status: Operational" ar="حالة الشبكة: تعمل" /></span>
            <h2><T en="Join the Ecosystem" ar="انضم إلى النظام البيئي" /></h2>
          </div>

          <div className="grid grid-3 path-grid">
            <Link href="/studios" className="card-premium path-card hover-lift">
              <div className="path-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="22"></line>
                </svg>
              </div>
              <h3><T en="Creators & Artists" ar="المبدعون والفنانون" /></h3>
              <p><T en="Discover world-class studios, browse verified equipment, and book your next session with confidence." ar="اكتشف استوديوهات عالمية، تصفح معدات موثقة، واحجز جلستك القادمة بكل ثقة." /></p>
              <span className="path-cta text-gold font-bold"><T en="Book a Studio" ar="احجز استوديو" /> →</span>
            </Link>

            <Link href="/join/studio" className="card-premium path-card active-border hover-lift">
              <div className="path-icon text-gold">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3a9 9 0 0 0-9 9v7a2 2 0 0 0 2 2h2v-6H5v-3a7 7 0 0 1 14 0v3h-2v6h2a2 2 0 0 0 2-2v-7a9 9 0 0 0-9-9z"/>
                </svg>
              </div>
              <h3><T en="Studio Owners" ar="أصحاب الاستوديوهات" /></h3>
              <p><T en="Monetize your space, simplify bookings, and apply for 'GearBeat Certified' status." ar="استثمر مساحتك، بسط حجوزاتك، وقدم طلباً للحصول على حالة 'GearBeat Certified'." /></p>
              <span className="path-cta text-gold font-bold"><T en="Become a Partner" ar="انضم كشريك" /> →</span>
            </Link>

            <Link href="/join/seller" className="card-premium path-card hover-lift">
              <div className="path-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
              </div>
              <h3><T en="Certified Vendors" ar="التجار المعتمدون" /></h3>
              <p><T en="Join the elite marketplace. List professional audio gear with integrated logistics and verified status." ar="انضم إلى السوق المتميز. اعرض معدات الصوت الاحترافية مع خدمات لوجستية متكاملة وحالة موثقة." /></p>
              <span className="path-cta text-gold font-bold"><T en="Become a Partner" ar="انضم كشريك" /> →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. TRUST / WHY GEARBEAT */}
      <section className="trust-section border-y border-white/5" style={{ padding: '60px 0' }}>
        <div className="container">
          <div className="grid grid-2 items-center gap-40">
            <div className="trust-text">
              <div className="badge-gold mb-12"><T en="Verified Integrity" ar="نزاهة موثقة" /></div>
              <h2 className="mb-16 text-balance" style={{ fontSize: '2.2rem' }}><T en="The benchmark for trust in audio." ar="المعيار المرجعي للثقة في عالم الصوت." /></h2>
              <p className="text-muted leading-relaxed" style={{ maxWidth: 450, fontSize: '0.95rem' }}>
                <T 
                  en="GearBeat is setting the global standard for studio operations. From verified equipment to secure session booking, we ensure a seamless professional environment for every artist."
                  ar="تضع GearBeat المعيار العالمي لعمليات الاستوديو. من المعدات الموثقة إلى حجز الجلسات الآمن، نضمن بيئة احترافية سلسة لكل فنان."
                />
              </p>
            </div>
            <div className="grid grid-3 gap-12">
              {[
                { icon: '🛡️', en: 'Verified Gear', ar: 'معدات موثقة' },
                { icon: '🎚️', en: 'Studio Grade', ar: 'جودة استوديو' },
                { icon: '⭐', en: 'Top Talent', ar: 'مواهب متميزة' },
                { icon: '🔒', en: 'Secure Escrow', ar: 'ضمان آمن' },
                { icon: '🌍', en: 'Global Reach', ar: 'وصول عالمي' },
                { icon: '🏛️', en: 'Certified Network', ar: 'شبكة معتمدة' },
              ].map(item => (
                <div key={item.en} className="trust-item-compact hover-lift" style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  padding: '16px 12px',
                  background: 'rgba(212, 175, 55, 0.03)',
                  border: '1px solid rgba(212, 175, 55, 0.1)',
                  borderRadius: '16px',
                  textAlign: 'center'
                }}>
                  <div className="trust-icon-mini" style={{ fontSize: '1.2rem', marginBottom: 8 }}>{item.icon}</div>
                  <h4 style={{ fontSize: '0.65rem', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--gb-gold-light)' }}>
                    <T en={item.en} ar={item.ar} />
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED STUDIOS PREVIEW */}
      <section className="section-padding bg-darker overflow-hidden">
        <div className="container">
          <div className="flex-between section-head items-center mb-60">
            <div>
              <span className="badge-gold"><T en="Curated Selection" ar="مختارات مختارة" /></span>
              <h2 className="mt-8"><T en="Elite Studios" ar="استوديوهات النخبة" /></h2>
            </div>
            <Link href="/studios" className="btn btn-outline btn-sm"><T en="Book a Studio" ar="احجز استوديو" /> →</Link>
          </div>
          <div className="grid grid-3 gap-32">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-premium studio-preview-card hover-lift p-0 overflow-hidden">
                <div className="studio-thumb-placeholder relative" style={{ height: 250 }}>
                   <Image
                     src="/brand/studio-placeholder.jpg"
                     alt={`Global Sound Station ${i}`}
                     fill
                     sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                     style={{ objectFit: "cover" }}
                   />
                   <div className="absolute top-16 right-16" style={{ zIndex: 1 }}>
                     <span className="badge badge-gold">Certified</span>
                   </div>
                </div>
                <div style={{ padding: 24 }}>
                  <div className="flex-between mb-8">
                    <h4 className="m-0">Global Sound Station {i}</h4>
                    <span className="text-gold font-bold">5.0 ★</span>
                  </div>
                  <p className="text-muted text-sm mb-20">Verified Partner • Riyadh</p>
                  <Link href="/studios" className="btn btn-outline btn-sm w-full">
                    <T en="Book a Studio" ar="احجز استوديو" />
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
          <div className="flex-between section-head items-center mb-60">
             <div>
               <span className="badge-gold"><T en="Boutique Inventory" ar="مخزون فاخر" /></span>
               <h2 className="mt-8"><T en="Verified Marketplace" ar="سوق موثق" /></h2>
             </div>
             <Link href="/marketplace" className="btn btn-outline btn-sm"><T en="Shop Gear" ar="تسوق معدات" /> →</Link>
          </div>
          <div className="grid grid-4 category-grid gap-24">
            {[
              { name: 'Microphones', ar: 'ميكروفونات', icon: '🎙️' },
              { name: 'Analog Outboard', ar: 'أجهزة تماثلية', icon: '🎛️' },
              { name: 'Studio Monitors', ar: 'سماعات استوديو', icon: '🔊' },
              { name: 'Instruments', ar: 'آلات موسيقية', icon: '🎸' }
            ].map((cat) => (
              <div key={cat.name} className="card-premium cat-card hover-lift text-center" style={{ padding: 40 }}>
                <div className="cat-icon" style={{ fontSize: '2.5rem', marginBottom: 20 }}>
                  {cat.icon}
                </div>
                <h4 className="m-0"><T en={cat.name} ar={cat.ar} /></h4>
              </div>
            ))}
          </div>
        </div>
      </section>
 
       {/* 5B. EXPERIENCES & TICKETING PREVIEW */}
       <section className="section-padding bg-darker relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--gb-gold) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
         <div className="container relative z-10">
           <div className="grid grid-2 items-center gap-60">
             <div className="experience-content">
               <div className="badge-gold mb-16"><T en="Live Access" ar="وصول مباشر" /></div>
               <h2 className="text-balance" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', margin: '24px 0', lineHeight: 1.1 }}>
                 <T en="Beyond the studio walls." ar="خلف جدران الاستوديو." />
               </h2>
               <p className="text-muted mb-40" style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                 <T 
                   en="GearBeat Ticketing connects you to masterclasses, product launches, and exclusive studio sessions. Experience the industry, live."
                   ar="تذاكر جيربيت تربطك بالدورات التدريبية المتقدمة، إطلاق المنتجات، وجلسات الاستوديو الحصرية. اختبر الصناعة، مباشرة."
                 />
               </p>
               <div className="hero-actions">
                 <Link href="/tickets" className="btn btn-primary btn-lg shadow-gold">
                   <T en="Explore Hub" ar="استكشف المركز" />
                 </Link>
                 <Link href="/partner" className="btn btn-outline btn-lg">
                   <T en="Host an Event" ar="استضف فعالية" />
                 </Link>
               </div>
             </div>
             <div className="experience-visual shadow-gold-lg" style={{ 
               height: 400, 
               background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0,0,0,0) 100%)', 
               borderRadius: 'var(--gb-radius-lg)', 
               border: '1px solid rgba(212, 175, 55, 0.15)',
               display: 'grid',
               placeItems: 'center',
               position: 'relative'
             }}>
               <div style={{ textAlign: 'center' }}>
                 <span style={{ fontSize: '6rem', display: 'block', marginBottom: 24, filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.3))' }}>🎫</span>
                 <div className="badge badge-gold" style={{ padding: '10px 24px', fontSize: '0.8rem' }}>
                   <T en="TICKETING HUB — COMING SOON" ar="مركز التذاكر — قريباً" />
                 </div>
               </div>
               <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-gold rounded-full blur-3xl opacity-10"></div>
             </div>
           </div>
         </div>
       </section>
 
      <section className="section-padding final-cta text-center py-120">
        <div className="container animate-up">
          <div className="badge-gold mb-24"><T en="Ready to Start?" ar="هل أنت مستعد للبدء؟" /></div>
          <h2 className="mb-60 text-balance" style={{ marginInline: 'auto' }}><T en="The future of sound belongs to you." ar="مستقبل الصوت ملك لك." /></h2>
          <div className="cta-actions" style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
            <Link href="/signup" className="btn btn-primary btn-lg shadow-gold">
              <T en="Create Account" ar="إنشاء حساب" />
            </Link>
            <Link href="/support" className="btn btn-outline btn-lg">
               <T en="Speak to an Expert" ar="تحدث مع خبير" />
            </Link>
          </div>
        </div>
      </section>


      <style dangerouslySetInnerHTML={{ __html: `
        .home-root { overflow-x: hidden; }
        
        /* HERO - PREMIUM BRANDED BLACK/GOLD & SOUNDWAVE ACCENTS */
        .hero-section {
          padding: 140px 0 100px;
          background: linear-gradient(135deg, #040609 0%, #0c0f16 50%, #030507 100%);
          position: relative;
          overflow: hidden;
        }

        /* Subtle horizontal grid lines for premium technical feel */
        .hero-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(212, 175, 55, 0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(212, 175, 55, 0.02) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
          z-index: 1;
        }

        .hero-container {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 60px;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .hero-content h1 {
          font-size: clamp(2.5rem, 6vw, 4.8rem);
          margin: 24px 0;
          color: #fff;
          text-shadow: 0 0 40px rgba(0,0,0,0.5);
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
          height: 480px;
          display: flex;
          justify-content: center;
          align-items: center;
          perspective: 1200px;
        }

        /* Royal Gold Glow Accents */
        .ambient-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          opacity: 0.7;
          z-index: 1;
        }

        .glow-1 {
          top: 10%;
          right: 5%;
          width: 380px;
          height: 380px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.18) 0%, transparent 70%);
        }

        .glow-2 {
          bottom: 10%;
          left: 5%;
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, rgba(15, 160, 138, 0.12) 0%, transparent 70%);
        }

        /* Rhythm / Soundwave Visual lines in Background */
        .rhythm-waves {
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: center;
          height: 200px;
          width: 100%;
          position: absolute;
          z-index: 2;
          opacity: 0.18;
          pointer-events: none;
        }

        .rhythm-bar {
          width: 5px;
          background: linear-gradient(to top, rgba(212, 175, 55, 0) 0%, rgba(212, 175, 55, 0.8) 50%, rgba(212, 175, 55, 0) 100%);
          border-radius: 99px;
          animation: rhythm-pulse 3s infinite ease-in-out;
        }

        .bar-1 { height: 60px; animation-delay: 0.1s; }
        .bar-2 { height: 120px; animation-delay: 0.4s; }
        .bar-3 { height: 80px; animation-delay: 0.2s; }
        .bar-4 { height: 160px; animation-delay: 0.6s; }
        .bar-5 { height: 100px; animation-delay: 0.3s; }
        .bar-6 { height: 180px; animation-delay: 0.8s; }
        .bar-7 { height: 140px; animation-delay: 0.5s; }
        .bar-8 { height: 90px; animation-delay: 0.7s; }
        .bar-9 { height: 150px; animation-delay: 0.15s; }
        .bar-10 { height: 70px; animation-delay: 0.45s; }
        .bar-11 { height: 110px; animation-delay: 0.25s; }
        .bar-12 { height: 50px; animation-delay: 0.35s; }

        @keyframes rhythm-pulse {
          0%, 100% { transform: scaleY(0.5); opacity: 0.4; }
          50% { transform: scaleY(1.1); opacity: 1; }
        }

        /* Brand Panels (Abstract Glassmorphic Cards) */
        .brand-panel {
          background: rgba(15, 22, 33, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1.5px solid rgba(212, 175, 55, 0.25);
          border-radius: 20px;
          box-shadow: 
            0 30px 60px rgba(0,0,0,0.8), 
            0 0 30px rgba(212, 175, 55, 0.05), 
            inset 0 0 20px rgba(255, 255, 255, 0.02);
          z-index: 5;
          transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.3s;
          padding: 24px;
          position: absolute;
        }

        .brand-panel:hover {
          border-color: rgba(212, 175, 55, 0.75);
          transform: scale(1.03) translateY(-10px) !important;
          z-index: 10;
          box-shadow: 0 45px 90px rgba(0,0,0,0.9), 0 0 40px rgba(212,175,55,0.25);
        }

        .panel-main {
          width: 330px;
          height: auto;
          top: 30px;
          left: 8%;
        }

        .panel-secondary {
          width: 260px;
          height: auto;
          bottom: 30px;
          right: 5%;
        }

        .panel-glow {
          position: absolute;
          top: -20px;
          left: -20px;
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, transparent 70%);
          pointer-events: none;
          animation: panel-glow-drift 8s infinite ease-in-out;
        }

        @keyframes panel-glow-drift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, 30px); }
        }

        .panel-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 12px;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .dot-green {
          background: #0FA08A;
          box-shadow: 0 0 12px #0FA08A;
          animation: dot-pulse 1.8s infinite ease-in-out;
        }

        @keyframes dot-pulse {
          0%, 100% { opacity: 0.5; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.15); }
        }

        .panel-title {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--gb-text-muted);
          letter-spacing: 1px;
        }

        .panel-status {
          margin-inline-start: auto;
          font-size: 0.65rem;
          font-weight: 900;
          color: #0FA08A;
          background: rgba(15, 160, 138, 0.1);
          padding: 3px 10px;
          border-radius: 4px;
        }

        /* Soundwave Frequency Display in panel */
        .frequency-display {
          display: flex;
          align-items: flex-end;
          gap: 6px;
          height: 60px;
          margin-bottom: 20px;
          justify-content: center;
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 12px;
          border: 1px solid rgba(212, 175, 55, 0.08);
        }

        .freq-bar {
          width: 5px;
          height: 15px;
          background: linear-gradient(to top, var(--gb-gold), var(--gb-gold-light));
          border-radius: 3px;
          animation: freq-pulse-bars 1.2s infinite ease-in-out;
        }

        .f-1 { height: 12px; animation-delay: 0.1s; }
        .f-2 { height: 35px; animation-delay: 0.35s; }
        .f-3 { height: 48px; animation-delay: 0.5s; }
        .f-4 { height: 22px; animation-delay: 0.2s; }
        .f-5 { height: 38px; animation-delay: 0.4s; }
        .f-6 { height: 18px; animation-delay: 0.6s; }
        .f-7 { height: 32px; animation-delay: 0.15s; }
        .f-8 { height: 45px; animation-delay: 0.3s; }
        .f-9 { height: 26px; animation-delay: 0.55s; }
        .f-10 { height: 20px; animation-delay: 0.25s; }

        @keyframes freq-pulse-bars {
          0%, 100% { transform: scaleY(0.45); opacity: 0.65; }
          50% { transform: scaleY(1.15); opacity: 1; filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.7)); }
        }

        .panel-metrics {
          display: flex;
          justify-content: space-between;
          gap: 16px;
        }

        .metric-label {
          display: block;
          font-size: 0.65rem;
          color: var(--gb-text-muted);
          text-transform: uppercase;
        }

        .metric-val {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--gb-gold-light);
        }

        .panel-desc {
          font-size: 0.8rem;
          color: var(--gb-text-muted);
          margin-bottom: 16px;
          line-height: 1.5;
        }

        .gcc-badge-small {
          display: inline-flex;
          align-items: center;
          font-size: 0.7rem;
          font-weight: 900;
          color: #fff;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(15, 160, 138, 0.15));
          border: 1px solid rgba(212, 175, 55, 0.25);
          padding: 4px 12px;
          border-radius: 6px;
          letter-spacing: 0.5px;
        }

        /* FLOAT FLOATING EFFECTS */
        .animate-float-slow {
          animation: float-slow-key 8s infinite ease-in-out;
        }

        .animate-float-delayed {
          animation: float-delayed-key 8s infinite ease-in-out;
        }

        @keyframes float-slow-key {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(-16px) rotate(-1.5deg); }
        }

        @keyframes float-delayed-key {
          0%, 100% { transform: translateY(0) rotate(5deg); }
          50% { transform: translateY(16px) rotate(3.5deg); }
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
        .trust-item-compact { transition: var(--transition); }

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
          .hero-visual { 
            height: 260px; 
            order: 2; /* Put visual second (secondary) */
            margin-top: 30px; 
            width: 100%;
          }
          .panel-main {
            left: 50% !important;
            top: 20px !important;
            transform: translateX(-50%) rotate(0deg) !important;
            width: 92% !important;
            max-width: 320px !important;
            animation: float-mobile-key 6s infinite ease-in-out;
          }
          .panel-secondary {
            display: none !important; /* Keep mobile clean by hiding the second panel */
          }
          .hero-section { padding-top: 80px; }

          @keyframes float-mobile-key {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(-10px); }
          }
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
