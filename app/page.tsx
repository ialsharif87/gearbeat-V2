import Link from "next/link";
import T from "../components/t";

export default function HomePage() {
  return (
    <main className="home-root">
      {/* 1. CINEMATIC HERO */}
      <section className="hero-section">
        <div className="container hero-container animate-up">
          <div className="hero-content">
            <div className="badge-gold mb-16">
              <T en="Official Launch Pilot" ar="الإطلاق التجريبي الرسمي" />
            </div>
            <h1 className="text-balance" style={{ fontWeight: 900 }}>
              <T
                en="The global pulse of studio sound."
                ar="النبض العالمي لصوت الاستوديوهات."
              />
            </h1>
            <p className="lead mb-40">
              <T
                en="GearBeat is the ultimate ecosystem for audio professionals. Discover world-class studios, shop elite verified gear, and secure tickets to exclusive industry experiences."
                ar="GearBeat هو النظام البيئي الأمثل لمحترفي الصوت. اكتشف استوديوهات عالمية، تسوق معدات موثقة، واحجز تذاكر لتجارب حصرية في الصناعة."
              />
            </p>
            <div className="hero-actions">
              <Link href="/studios" className="btn btn-primary btn-lg shadow-gold">
                <T en="Find a Studio" ar="ابحث عن استوديو" />
              </Link>
              <Link href="/marketplace" className="btn btn-outline btn-lg">
                <T en="Shop Verified Gear" ar="تسوق معدات موثقة" />
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="ambient-glow"></div>
            <div className="pulse-halo halo-1"></div>
            <div className="pulse-halo halo-2"></div>
            <div className="pulse-ring ring-1"></div>
            <div className="pulse-ring ring-2"></div>
            <div className="pulse-ring ring-3"></div>
            <div className="abstract-orb">
              <div className="orb-inner-glow"></div>
              <div className="soundwave-container">
                <div className="sw-line sw-1"></div>
                <div className="sw-line sw-2"></div>
                <div className="sw-line sw-3"></div>
                <div className="sw-line sw-4"></div>
                <div className="sw-line sw-5"></div>
                <div className="sw-line sw-6"></div>
                <div className="sw-line sw-7"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CHOOSE YOUR PATH */}
      <section className="section-padding">
        <div className="container">
          <div className="section-head text-center">
            <span className="badge-gold"><T en="Network Status: Operational" ar="حالة الشبكة: تعمل" /></span>
            <h2><T en="Join the Ecosystem" ar="انضم إلى النظام البيئي" /></h2>
          </div>

          <div className="grid grid-3 path-grid">
            <Link href="/signup" className="card-premium path-card hover-lift">
              <div className="path-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="22"></line>
                </svg>
              </div>
              <h3><T en="Creators & Artists" ar="المبدعون والفنانون" /></h3>
              <p><T en="Book legendary spaces, buy certified equipment, and attend exclusive workshops." ar="احجز مساحات أسطورية، اشترِ معدات معتمدة، واحضر ورش عمل حصرية." /></p>
              <span className="path-cta text-gold font-bold"><T en="Start Creating" ar="ابدأ الإبداع" /> →</span>
            </Link>

            <Link href="/join/studio" className="card-premium path-card active-border hover-lift">
              <div className="path-icon text-gold">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3a9 9 0 0 0-9 9v7a2 2 0 0 0 2 2h2v-6H5v-3a7 7 0 0 1 14 0v3h-2v6h2a2 2 0 0 0 2-2v-7a9 9 0 0 0-9-9z"/>
                </svg>
              </div>
              <h3><T en="Studio Owners" ar="أصحاب الاستوديوهات" /></h3>
              <p><T en="Monetize your space, simplify bookings, and gain 'GearBeat Certified' status." ar="استثمر مساحتك، بسط حجوزاتك، واحصل على حالة 'GearBeat Certified'." /></p>
              <span className="path-cta text-gold font-bold"><T en="Get Certified" ar="احصل على التوثيق" /> →</span>
            </Link>

            <Link href="/join/seller" className="card-premium path-card hover-lift">
              <div className="path-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
              </div>
              <h3><T en="Certified Vendors" ar="التجار المعتمدون" /></h3>
              <p><T en="Reach professional buyers and list gear with integrated global shipping support." ar="صل إلى مشترين محترفين واعرض معداتك مع دعم شحن عالمي مدمج." /></p>
              <span className="path-cta text-gold font-bold"><T en="Open Store" ar="افتح متجرك" /> →</span>
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
                  en="Every studio is vetted, every piece of gear is verified, and every transaction is secured. No more session friction, just pure sound."
                  ar="كل استوديو يتم فحصه، كل قطعة معدات يتم توثيقها، وكل عملية شراء مؤمنة. لا مزيد من معوقات الجلسات، فقط صوت نقي."
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
            <Link href="/studios" className="btn btn-outline btn-sm"><T en="View All Studios" ar="عرض كل الاستوديوهات" /> →</Link>
          </div>
          <div className="grid grid-3 gap-32">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-premium studio-preview-card hover-lift p-0 overflow-hidden">
                <div className="studio-thumb-placeholder relative" style={{ height: 250, background: '#111' }}>
                   <div className="absolute top-16 right-16">
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
                    <T en="Check Availability" ar="تحقق من التوفر" />
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
             <Link href="/marketplace" className="btn btn-outline btn-sm"><T en="Browse All Gear" ar="تصفح كل المعدات" /> →</Link>
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
                   <T en="Explore Tickets" ar="استكشف التذاكر" />
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
              <T en="Create Your Account" ar="أنشئ حسابك" />
            </Link>
            <Link href="/support" className="btn btn-outline btn-lg">
               <T en="Speak to an Expert" ar="تحدث مع خبير" />
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
          height: 450px;
          display: flex;
          justify-content: center;
          align-items: center;
          perspective: 1000px;
        }

        .ambient-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%);
          filter: blur(80px);
          pointer-events: none;
        }

        .pulse-halo {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.05) 0%, transparent 70%);
          animation: halo-pulse 6s infinite ease-in-out;
          pointer-events: none;
        }
        .halo-1 { width: 500px; height: 500px; animation-delay: 0s; }
        .halo-2 { width: 500px; height: 500px; animation-delay: -3s; }

        @keyframes halo-pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.6; }
        }

        .pulse-ring {
          position: absolute;
          border: 2px solid rgba(212, 175, 55, 0.3);
          border-radius: 50%;
          animation: elegant-pulse 8s infinite cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.1);
        }

        .ring-1 { width: 300px; height: 300px; animation-delay: 0s; }
        .ring-2 { width: 300px; height: 300px; animation-delay: -2.66s; }
        .ring-3 { width: 300px; height: 300px; animation-delay: -5.33s; }

        @keyframes elegant-pulse {
          0% { transform: scale(0.8); opacity: 0; }
          20% { opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }

        .abstract-orb {
          position: relative;
          width: 280px;
          height: 280px;
          background: radial-gradient(circle at 30% 30%, #151c29 0%, #000 100%);
          border: 2.5px solid rgba(212, 175, 55, 0.6);
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          box-shadow: 
            0 0 60px rgba(0,0,0,0.9),
            0 0 30px rgba(212, 175, 55, 0.2),
            inset 0 0 40px rgba(212, 175, 55, 0.15);
          z-index: 10;
        }

        .orb-inner-glow {
          position: absolute;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 60%);
          animation: orb-drift 12s infinite linear;
        }

        @keyframes orb-drift {
          0% { transform: translate(-20%, -20%); }
          50% { transform: translate(10%, 10%); }
          100% { transform: translate(-20%, -20%); }
        }

        .soundwave-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          width: 180px;
          z-index: 20;
        }

        .sw-line {
          height: 2.5px;
          background: linear-gradient(to right, transparent, var(--gb-gold-light), transparent);
          border-radius: 4px;
          animation: sw-horizontal-vibrate 1.5s infinite ease-in-out;
          filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.5));
        }

        .sw-1 { width: 80px; animation-delay: 0s; opacity: 0.4; }
        .sw-2 { width: 130px; animation-delay: 0.1s; opacity: 0.6; }
        .sw-3 { width: 170px; animation-delay: 0.2s; opacity: 0.9; }
        .sw-4 { width: 140px; animation-delay: 0.3s; opacity: 0.7; }
        .sw-5 { width: 160px; animation-delay: 0.4s; opacity: 0.8; }
        .sw-6 { width: 110px; animation-delay: 0.5s; opacity: 0.5; }
        .sw-7 { width: 70px; animation-delay: 0.6s; opacity: 0.3; }

        @keyframes sw-horizontal-vibrate {
          0%, 100% { transform: scaleX(1); }
          50% { transform: scaleX(1.2); }
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
