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
              en="Join the region's premium music and audio marketplace. List your rooms, control your schedule, and connect with thousands of artists and creators." 
              ar="انضم إلى منصة استوديوهات الصوت والموسيقى الفاخرة في المنطقة. اعرض غرفك، وتحكم بجدول حوزاتك، وتواصل مع آلاف الفنانين والمبدعين." 
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
            <h3><T en="Automated Booking Management" ar="إدارة حجوزات مؤتمتة" /></h3>
            <p>
              <T 
                en="Say goodbye to double bookings. Our calendar system handles reservations, availability, and session planning in real time." 
                ar="وداعاً للحجوزات المزدوجة. يتولى نظام التقويم لدينا إدارة الحجوزات والتوافر وتخطيط الجلسات في الوقت الفعلي." 
              />
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3><T en="Secure Invoicing & Payouts" ar="فواتير ومدفوعات آمنة" /></h3>
            <p>
              <T 
                en="Accept online payments securely. Automated payouts are wired directly to your local Saudi business bank account." 
                ar="اقبل المدفوعات عبر الإنترنت بشكل آمن. يتم تحويل المدفوعات التلقائية مباشرة إلى حسابك البنكي التجاري السعودي المحلي." 
              />
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3><T en="Grow Your Audience" ar="نمو قاعدة عملائك" /></h3>
            <p>
              <T 
                en="Get discovered by musicians, podcasters, and voice actors. Boost your studio's occupancy rate with our targeted marketing." 
                ar="اجعل الموسيقيين وصانعي البودكاست ومؤدي الأصوات يكتشفون استوديوهاتك. ضاعف نسبة إشغال غرفك عبر تسويقنا المستهدف." 
              />
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3><T en="Saudi PDPL Compliance First" ar="الامتثال لنظام حماية البيانات السعودي أولاً" /></h3>
            <p>
              <T 
                en="Rest easy knowing partner verification and contract data comply strictly with Saudi PDPL and financial guidelines." 
                ar="اطمئن تماماً؛ حيث تتوافق عملية التحقق من الشركاء وبيانات العقود بدقة مع نظام حماية البيانات الشخصية السعودي (PDPL) والأنظمة المالية." 
              />
            </p>
          </div>
        </div>
      </section>

      {/* Saudi Compliance Callout */}
      <section className="compliance-section">
        <div className="compliance-card">
          <div className="badge badge-gold">🛡️ <T en="Pre-Launch Phase Notice" ar="تنويه مرحلة ما قبل الإطلاق" /></div>
          <h3><T en="Saudi-First Secure Compliance" ar="امتثال آمن ذو أولوية سعودية" /></h3>
          <p>
            <T 
              en="To protect sensitive partner credentials, GearBeat does not collect official government IDs, CR, VAT certificates, or IBAN numbers on public web pages. Commercial verification and contracting happen through a secure, direct process." 
              ar="لحماية مستندات الشركاء الحساسة، لا يقوم GearBeat بجمع الهويات الحكومية الرسمية، أو السجل التجاري، أو شهادات القيمة المضافة، أو أرقام الآيبان على الصفحات العامة. سيتم التحقق والتعاقد لاحقاً عبر قنوات آمنة ومباشرة." 
            />
          </p>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="cta-section">
        <div className="cta-card">
          <h2><T en="Ready to List Your Studio?" ar="هل أنت جاهز لعرض الاستوديو الخاص بك؟" /></h2>
          <p>
            <T en="Create your free partner account today and start listing in under 10 minutes." ar="أنشئ حسابك المجاني كشريك اليوم وابدأ في إدراج غرفك خلال أقل من 10 دقائق." />
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
