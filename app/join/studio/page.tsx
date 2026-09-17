"use client";

import Link from "next/link";
import T from "@/components/t";

export default function JoinStudioPage() {
  return (
    <main className="landing-page">
      {/* Hero Section */}
      <section className="hero-section animate-fade-in">
        <div className="hero-content">
          <div className="brand-tag">GearBeat</div>
          <div className="badge badge-gold">
            <T en="Studio Partner Program" ar="برنامج شركاء الاستوديوهات" />
          </div>
          <h1>
            <T en="Elevate Your Studio Business" ar="ارتقِ بأعمال استوديو الصوت الخاص بك" />
          </h1>
          <p className="hero-desc">
            <T
              en="Apply to list your studio on GearBeat and prepare your profile for booking requests from creators."
              ar="قدّم طلبك لإضافة استوديوك على GearBeat وجهّز ملفك لاستقبال طلبات الحجز من المبدعين."
            />
          </p>
          <div className="hero-actions">
            <Link href="/studio-owner/signup" className="gb-button btn-large">
              <T en="Register as a Partner" ar="التسجيل كشريك استوديو" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="section-header">
          <h2>
            <T en="Why Partner with GearBeat?" ar="لماذا تنضم كشريك في GearBeat؟" />
          </h2>
          <p>
            <T en="Everything you need to scale your recording and production space." ar="كل ما تحتاجه لتوسيع نطاق أعمال التسجيل والإنتاج الصوتي الخاصة بك." />
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3><T en="Booking Request Management" ar="إدارة طلبات الحجز" /></h3>
            <p>
              <T
                en="Review incoming booking requests and manage session details from your partner workspace as the MVP evolves."
                ar="راجع طلبات الحجز الواردة وأدر تفاصيل الجلسات من مساحة الشريك مع تطور النسخة الأولية."
              />
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3><T en="Commercial Tools — Coming Later" ar="أدوات تجارية — لاحقًا" /></h3>
            <p>
              <T
                en="Online payments and automated payouts are not enabled in the MVP. Commercial tools will only launch after the required operational and compliance work is complete."
                ar="المدفوعات عبر الإنترنت والتحويلات التلقائية غير مفعلة في النسخة الأولية. لن يتم إطلاق الأدوات التجارية إلا بعد اكتمال المتطلبات التشغيلية والامتثال اللازمة."
              />
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3><T en="Grow Your Audience" ar="نمو قاعدة عملائك" /></h3>
            <p>
              <T
                en="Build a clear studio profile so creators can discover your space and send booking requests."
                ar="أنشئ ملفًا واضحًا لاستوديوك ليتمكن المبدعون من اكتشاف مساحتك وإرسال طلبات الحجز."
              />
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3><T en="Privacy-Aware Onboarding" ar="تسجيل يراعي الخصوصية" /></h3>
            <p>
              <T
                en="Partner onboarding is being reviewed against applicable privacy and operational requirements before broader launch."
                ar="تتم مراجعة تسجيل الشركاء وفق متطلبات الخصوصية والتشغيل المطبقة قبل الإطلاق الأوسع."
              />
            </p>
          </div>
        </div>
      </section>

      {/* Saudi Compliance Callout */}
      <section className="compliance-section">
        <div className="compliance-card">
          <div className="badge badge-gold">🛡️ <T en="Pre-Launch Phase Notice" ar="تنويه مرحلة ما قبل الإطلاق" /></div>
          <h3><T en="Pre-Launch Data Handling" ar="معالجة البيانات قبل الإطلاق" /></h3>
          <p>
            <T
              en="Do not submit sensitive government, tax, banking, or identity documents through general public pages. Any future verification flow will be introduced only with dedicated controls and clear instructions."
              ar="لا ترسل مستندات حكومية أو ضريبية أو بنكية أو وثائق هوية حساسة عبر الصفحات العامة. سيتم تقديم أي مسار تحقق مستقبلي فقط مع ضوابط مخصصة وتعليمات واضحة."
            />
          </p>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="cta-section">
        <div className="cta-card">
          <h2><T en="Ready to List Your Studio?" ar="هل أنت جاهز لعرض الاستوديو الخاص بك؟" /></h2>
          <p>
            <T en="Create your partner account and prepare your studio profile for review." ar="أنشئ حساب الشريك وجهّز ملف استوديوك للمراجعة." />
          </p>
          <Link href="/studio-owner/signup" className="gb-button btn-large">
            <T en="Join as a Studio Partner Now" ar="انضم كشريك استوديو الآن" />
          </Link>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .landing-page {
          min-height: 100vh;
          background: #080706;
          color: #fff;
          font-family: 'Inter', system-ui, sans-serif;
          padding: 80px 20px;
          display: flex;
          flex-direction: column;
          gap: 100px;
        }

        .hero-section {
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
          padding: 40px 0;
        }
        .brand-tag {
          font-size: 1.5rem;
          font-weight: 900;
          letter-spacing: -1px;
          color: #D4AF37;
          margin-bottom: 24px;
        }
        .hero-section h1 {
          font-size: 3rem;
          font-weight: 900;
          line-height: 1.2;
          margin: 16px 0 24px;
          color: #fff;
          letter-spacing: -1px;
        }
        .hero-desc {
          font-size: 1.2rem;
          color: #aaa;
          line-height: 1.6;
          max-width: 700px;
          margin: 0 auto 40px;
        }

        .gb-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #D4AF37;
          color: #000;
          font-weight: 700;
          text-decoration: none;
          border-radius: 12px;
          transition: all 0.2s ease-in-out;
        }
        .btn-large {
          padding: 18px 40px;
          font-size: 1.15rem;
        }
        .gb-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(212, 175, 55, 0.4);
        }

        .badge {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 99px;
          font-weight: 800;
          font-size: 0.8rem;
        }
        .badge-gold {
          background: rgba(212, 175, 55, 0.1);
          color: #D4AF37;
          border: 1px solid rgba(212, 175, 55, 0.2);
        }

        /* Features */
        .features-section {
          max-width: 1100px;
          margin: 0 auto;
          width: 100%;
        }
        .section-header {
          text-align: center;
          margin-bottom: 60px;
        }
        .section-header h2 {
          font-size: 2.2rem;
          font-weight: 800;
          margin-bottom: 16px;
        }
        .section-header p {
          color: #888;
          font-size: 1.05rem;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
        }
        .feature-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 32px;
          transition: border-color 0.2s;
        }
        .feature-card:hover {
          border-color: rgba(212, 175, 55, 0.2);
        }
        .feature-icon {
          font-size: 2.5rem;
          margin-bottom: 20px;
        }
        .feature-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 12px;
          color: #fff;
        }
        .feature-card p {
          color: #888;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        /* Compliance */
        .compliance-section {
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
        }
        .compliance-card {
          background: rgba(212, 175, 55, 0.03);
          border: 1px dashed rgba(212, 175, 55, 0.2);
          border-radius: 24px;
          padding: 40px;
          text-align: center;
        }
        .compliance-card h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 16px 0 12px;
        }
        .compliance-card p {
          color: #aaa;
          font-size: 0.95rem;
          line-height: 1.6;
          margin: 0;
        }

        /* Final CTA */
        .cta-section {
          max-width: 900px;
          margin: 0 auto;
          width: 100%;
        }
        .cta-card {
          background: linear-gradient(135deg, rgba(20, 20, 20, 0.8) 0%, rgba(10, 10, 10, 0.9) 100%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 60px 40px;
          text-align: center;
          box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.8);
        }
        .cta-card h2 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 16px;
        }
        .cta-card p {
          color: #888;
          font-size: 1.1rem;
          margin-bottom: 32px;
        }

        /* Animations */
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* RTL Support */
        html[dir="rtl"] .landing-page {
          text-align: right;
          direction: rtl;
        }
      `}} />
    </main>
  );
}
