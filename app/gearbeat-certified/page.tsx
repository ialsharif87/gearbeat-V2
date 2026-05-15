import { Metadata } from "next";
import Link from "next/link";
import T from "@/components/t";
import StudioTierBadge from "@/components/studio-tier-badge";

export const metadata: Metadata = {
  title: "GearBeat Certified | The Benchmark for Studio Integrity",
  description: "Learn about GearBeat Certified standards. We verify hardware, acoustic integrity, and business legitimacy to ensure absolute session reliability for audio creators.",
};

export default function GearBeatCertifiedPage() {
  return (
    <main className="certified-root">
      {/* HERO SECTION */}
      <section className="certified-hero">
        <div className="container animate-up">
          <div className="hero-content text-center">
            <div className="badge-gold mb-24 ms-auto me-auto">
              <T en="GEARBEAT CERTIFIED — OFFICIAL" ar="موثق من جيربيت — رسمي" />
            </div>
            <h1 className="text-balance" style={{ lineHeight: 1.1, fontWeight: 900 }}>
              <T
                en="The global benchmark for studio integrity."
                ar="المعيار العالمي لنزاهة الاستوديوهات."
              />
            </h1>
            <p className="lead text-balance mb-48">
              <T
                en="GearBeat Certified is currently in its Pilot Phase, establishing the most rigorous audit standards in the music industry. We are actively verifying signal chains and hardware assets for our launch partners."
                ar="موثق من جيربيت حالياً في مرحلته التجريبية، حيث يضع أكثر معايير التدقيق صرامة في صناعة الموسيقى. نحن نتحقق بنشاط من سلاسل الإشارة وأصول العتاد لشركاء الإطلاق."
              />
            </p>
            <div className="hero-actions" style={{ justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
              <Link href="/join/studio" className="btn btn-primary btn-lg shadow-gold">
                <T en="Get Certified" ar="احصل على التوثيق" />
              </Link>
              <Link href="/studios" className="btn btn-outline btn-lg">
                <T en="Find Certified Studios" ar="ابحث عن استوديو موثق" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CORE PILLARS */}
      <section className="section-padding bg-darker">
        <div className="container">
          <div className="section-head text-center">
            <h2><T en="The Three Pillars of Certification" ar="أركان التوثيق الثلاثة" /></h2>
            <p className="text-muted"><T en="We verify the details so you can focus on the sound." ar="نحن نتحقق من التفاصيل لتركز أنت على الصوت." /></p>
          </div>

          <div className="grid grid-3 gap-40">
            <div className="card-premium pillar-card">
              <div className="pillar-icon">🛠️</div>
              <h3><T en="Verified Hardware" ar="عتاد موثق" /></h3>
              <p><T en="Direct audit of professional gear, maintenance logs, and signal chains." ar="تدقيق مباشر للمعدات الاحترافية، سجلات الصيانة، وسلاسل الإشارة." /></p>
            </div>
            <div className="card-premium pillar-card">
              <div className="pillar-icon">🔊</div>
              <h3><T en="Acoustic Integrity" ar="الجودة الصوتية" /></h3>
              <p><T en="Review of room treatment, monitor calibration, and professional isolation standards." ar="مراجعة لمعالجة الغرف، معايرة الشاشات، ومعايير العزل الاحترافية." /></p>
            </div>
            <div className="card-premium pillar-card">
              <div className="pillar-icon">📜</div>
              <h3><T en="Business Legitimacy" ar="شرعية العمل" /></h3>
              <p><T en="Verification of commercial licenses, professional insurance, and secure operations." ar="التحقق من التراخيص التجارية، التأمين المهني، والعمليات الآمنة." /></p>
            </div>
          </div>
        </div>
      </section>

      {/* TIER BADGES PREVIEW */}
      <section className="section-padding">
        <div className="container">
          <div className="section-head text-center">
            <span className="badge-gold"><T en="Tier System" ar="نظام الفئات" /></span>
            <h2><T en="Certification Tiers" ar="فئات التوثيق" /></h2>
            <p className="text-muted"><T en="From entry-level verification to flagship status." ar="من التوثيق الأساسي إلى الحالة الرئيسية المعتمدة." /></p>
          </div>

          <div className="grid grid-5 gap-20">
            {[
              { tier: 'verified', desc_en: "Identity and business license verified.", desc_ar: "تم التحقق من الهوية والسجل التجاري." },
              { tier: 'trusted', desc_en: "Proven track record and creator feedback.", desc_ar: "سجل حافل وتقييمات إيجابية من المبدعين." },
              { tier: 'premium', desc_en: "Professional acoustics and elite hardware.", desc_ar: "صوتيات احترافية وعتاد من الفئة النخبة." },
              { tier: 'elite', desc_en: "Top-tier specs and world-class engineers.", desc_ar: "مواصفات عالمية ومهندسون من الطراز الأول." },
              { tier: 'flagship', desc_en: "Industry benchmarks and ultimate acoustics.", desc_ar: "معايير الصناعة والكمال الصوتي." }
            ].map((item, i) => (
              <div key={i} className="card-premium tier-preview-card text-center">
                <div style={{ marginBottom: 20 }}>
                  <StudioTierBadge tier={item.tier as any} />
                </div>
                <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.5 }}>
                  <T en={item.desc_en} ar={item.desc_ar} />
                </p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 60, textAlign: 'center' }}>
            <Link href="/gearbeat-certified/sample-studio" className="card-premium animate-up" style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 20, 
              padding: '24px 40px', 
              textDecoration: 'none',
              border: '1px dashed rgba(201, 162, 77, 0.4)'
            }}>
              <div style={{ fontSize: '2rem' }}>🔍</div>
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ margin: 0, color: '#fff' }}><T en="See it in action" ar="شاهدها في الواقع" /></h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}><T en="View a sample studio verification certificate." ar="اعرض نموذجاً لشهادة توثيق استوديو." /></p>
              </div>
              <span style={{ fontSize: '1.2rem', color: 'var(--gb-gold)' }}>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* WHY IT MATTERS */}
      <section className="section-padding">
        <div className="container">
          <div className="grid grid-2 items-center gap-60">
            <div className="why-text">
              <span className="badge-gold"><T en="Creators" ar="المبدعون" /></span>
              <h2><T en="Book with Absolute Confidence." ar="احجز بثقة مطلقة." /></h2>
              <p className="text-muted">
                <T 
                  en="No more surprises. When you see the GearBeat Certified badge, you know the gear is real, the room is treated, and the session will be professional."
                  ar="لا مزيد من المفاجآت. عندما ترى شارة 'موثق من جيربيت'، فأنت تعلم أن العتاد حقيقي، والغرفة معالجة، والجلسة ستكون احترافية."
                />
              </p>
              <ul className="check-list">
                <li><T en="Verified Equipment Lists" ar="قوائم معدات موثقة" /></li>
                <li><T en="Calibrated Listening Environments" ar="بيئات استماع معايرة" /></li>
                <li><T en="Secure Payment Protection" ar="حماية المدفوعات الآمنة" /></li>
              </ul>
            </div>
            <div className="card-premium preview-visual">
              <div className="badge-mockup animate-pulse">
                <div className="badge-inner">
                  <span className="star-icon">★</span>
                  <span className="badge-text">GB CERTIFIED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STUDIO BENEFITS */}
      <section className="section-padding bg-darker">
        <div className="container">
          <div className="grid grid-2 items-center gap-60 reverse-mobile">
            <div className="card-premium qr-mockup">
              <div className="qr-container">
                <div className="qr-box">
                  <div className="qr-dot"></div>
                  <div className="qr-dot"></div>
                  <div className="qr-dot"></div>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#cfa86e', marginTop: 12, fontWeight: 700 }}>SCAN TO VERIFY</p>
              </div>
            </div>
            <div className="why-text">
              <span className="badge-gold"><T en="Studio Owners" ar="أصحاب الاستوديوهات" /></span>
              <h2><T en="Elite Recognition for Your Space." ar="تقدير نخبة لمساحتك." /></h2>
              <p className="text-muted">
                <T 
                  en="Stand out from the crowd. Certified studios get higher ranking, exclusive badges for their physical space, and increased creator trust."
                  ar="تميز عن الآخرين. تحصل الاستوديوهات الموثقة على تصنيف أعلى، وشارات حصرية لمساحتها المادية، وزيادة في ثقة المبدعين."
                />
              </p>
              <ul className="check-list">
                <li><T en="Priority Search Ranking" ar="أولوية في نتائج البحث" /></li>
                <li><T en="Physical QR Verification Badges" ar="شارات توثيق QR مادية" /></li>
                <li><T en="Exclusive Marketing Support" ar="دعم تسويقي حصري" /></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* THE PROCESS */}
      <section className="section-padding">
        <div className="container">
          <div className="section-head text-center">
            <h2><T en="The Path to Certification" ar="طريقك نحو التوثيق" /></h2>
          </div>
          <div className="grid grid-4 gap-20">
            {[
              { step: "01", title_en: "Apply", title_ar: "التقديم", desc_en: "Submit your business and gear profile.", desc_ar: "قدم ملف عملك ومعداتك." },
              { step: "02", title_en: "Audit", title_ar: "التدقيق", desc_en: "Our experts review your setup.", desc_ar: "خبراؤنا يراجعون إعداداتك." },
              { step: "03", title_en: "Calibrate", title_ar: "المعايرة", desc_en: "Ensure standards are met.", desc_ar: "التأكد من استيفاء المعايير." },
              { step: "04", title_en: "Certify", title_ar: "التوثيق", desc_en: "Receive your physical & digital badge.", desc_ar: "احصل على شارتك المادية والرقمية." },
            ].map((item, i) => (
              <div key={i} className="card-premium step-card">
                <div className="step-num">{item.step}</div>
                <h4><T en={item.title_en} ar={item.title_ar} /></h4>
                <p style={{ fontSize: '0.85rem', color: '#666' }}><T en={item.desc_en} ar={item.desc_ar} /></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding final-cta text-center py-120">
        <div className="container animate-up">
          <div className="badge-gold mb-24 ms-auto me-auto"><T en="Ready to Start?" ar="هل أنت مستعد للبدء؟" /></div>
          <h2 className="mb-40 text-balance" style={{ marginInline: 'auto' }}><T en="Ready to raise the volume on trust?" ar="جاهز لرفع مستوى الثقة؟" /></h2>
          <div className="cta-actions" style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/join/studio" className="btn btn-primary btn-lg shadow-gold">
              <T en="Apply for Certification" ar="قدم لطلب التوثيق" />
            </Link>
            <Link href="/studios" className="btn btn-outline btn-lg">
              <T en="Browse Certified Studios" ar="تصفح الاستوديوهات الموثقة" />
            </Link>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .certified-root { overflow-x: hidden; background: #000; color: #fff; }
        
        .certified-hero {
          padding: 180px 0 100px;
          background: radial-gradient(circle at 50% 30%, rgba(201, 162, 77, 0.12) 0%, transparent 60%);
        }

        .certified-hero h1 {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 900;
          margin: 24px 0;
          letter-spacing: -1px;
        }

        .certified-hero .lead {
          font-size: 1.2rem;
          color: #888;
          max-width: 700px;
          margin: 0 auto 48px;
          line-height: 1.6;
        }

        .section-head h2 { font-size: 2.8rem; margin-bottom: 16px; }
        .bg-darker { background: #050505; }

        .pillar-card { text-align: center; padding: 40px 30px; }
        .cat-icon { font-size: 2rem; margin-bottom: 12px; color: var(--gb-gold); }
        .grid-5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 20px; }

        @media (max-width: 1200px) {
          .grid-5 { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 800px) {
          .grid-5 { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 500px) {
          .grid-5 { grid-template-columns: 1fr; }
        }

        .pillar-icon { font-size: 3rem; margin-bottom: 24px; }
        .pillar-card h3 { color: var(--gb-gold); margin-bottom: 16px; }

        .why-text h2 { font-size: 2.5rem; margin: 20px 0; }
        .check-list { list-style: none; padding: 0; margin-top: 32px; }
        .check-list li { margin-bottom: 12px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 12px; }
        .check-list li::before { content: "✓"; color: var(--gb-gold); font-weight: 900; }

        .preview-visual { height: 400px; display: flex; justify-content: center; align-items: center; background: #080808; position: relative; overflow: hidden; }
        .preview-visual::after { content: ""; position: absolute; width: 100%; height: 100%; background: radial-gradient(circle, rgba(201,162,77,0.1) 0%, transparent 70%); }

        .badge-mockup {
          width: 180px; height: 180px; border: 4px solid var(--gb-gold); border-radius: 50%;
          display: flex; justify-content: center; align-items: center;
          box-shadow: 0 0 40px rgba(201,162,77,0.3);
          transform: rotate(-10deg);
        }
        .badge-inner { text-align: center; }
        .star-icon { display: block; font-size: 2.5rem; color: var(--gb-gold); }
        .badge-text { font-size: 0.7rem; font-weight: 900; letter-spacing: 2px; color: var(--gb-gold); }

        .qr-mockup { height: 400px; display: flex; justify-content: center; align-items: center; background: #080808; }
        .qr-container { text-align: center; padding: 30px; background: #000; border: 1px solid #222; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
        .qr-box { width: 150px; height: 150px; border: 4px solid #fff; position: relative; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 15px; }
        .qr-dot { background: #fff; width: 100%; height: 100%; }

        .step-card { padding: 32px; position: relative; overflow: hidden; }
        .step-num { font-size: 3rem; font-weight: 900; color: #111; position: absolute; top: -10px; right: -10px; z-index: 0; }
        .step-card h4, .step-card p { position: relative; z-index: 1; }

        .final-cta { background: linear-gradient(to bottom, #050505, #000); }
        .animate-pulse { animation: pulse 2s infinite ease-in-out; }
        @keyframes pulse { 0%, 100% { transform: rotate(-10deg) scale(1); } 50% { transform: rotate(-10deg) scale(1.05); } }

        @media (max-width: 1000px) {
          .grid-2 { grid-template-columns: 1fr; }
          .reverse-mobile { direction: ltr; } /* simple hack */
          .section-head h2 { font-size: 2.2rem; }
          .why-text h2 { font-size: 2.1rem; }
        }

        [dir="rtl"] .hero-actions { flex-direction: row-reverse; }
        [dir="rtl"] .check-list li::before { content: "✓"; }
      `}} />
    </main>
  );
}
