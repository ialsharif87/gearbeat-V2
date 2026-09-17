import React from 'react';
import T from '@/components/t';
import Link from 'next/link';

export default function LaunchPage() {
  return (
    <div className="launch-page">
      <section className="launch-hero">
        <div className="container">
          <div className="badge-glow">
             <T en="Official Launch 2026" ar="الإطلاق الرسمي ٢٠٢٦" />
          </div>
          <h1>
            <T 
              en="The Future of Creative Sound is Here." 
              ar="مستقبل الإبداع الصوتي يبدأ من هنا." 
            />
          </h1>
          <p className="lead">
            <T 
              en="Book premium studios. Buy elite gear. Create your masterpiece." 
              ar="احجز أفضل الاستوديوهات. اشترِ أرقى المعدات. وابدأ صنع تحفتك الفنية." 
            />
          </p>
          <div className="launch-actions">
            <Link href="/signup" className="btn btn-gold-lg">
              <T en="Join the Community" ar="انضم إلى مجتمعنا" />
            </Link>
            <Link href="/studios" className="btn btn-outline-lg">
              <T en="Explore Studios" ar="اكتشف الاستوديوهات" />
            </Link>
          </div>
        </div>
      </section>

      <section className="launch-certified">
        <div className="container grid grid-2 gap-80">
          <div className="certified-visual">
            <div className="floating-kit">
               <div className="kit-box">
                 <div className="kit-label">GEARBEAT CERTIFIED</div>
               </div>
            </div>
          </div>
          <div className="certified-text">
            <span className="badge"><T en="Trust Redefined" ar="مفهوم جديد للثقة" /></span>
            <h2><T en="GearBeat Certified" ar="موثق من GearBeat" /></h2>
            <p>
              <T 
                en="Look for the physical GearBeat seal in studios across Saudi Arabia. Every certified space undergoes a rigorous verification process to ensure your sessions are professional, secure, and world-class."
                ar="ابحث عن ختم GearBeat في الاستوديوهات عبر المملكة. كل مساحة معتمدة تخضع لعملية توثيق صارمة لضمان أن تكون جلساتك احترافية وآمنة وعالمية المستوى."
              />
            </p>
            <ul className="benefit-list">
              <li>✓ <T en="Verified Equipment" ar="معدات موثقة" /></li>
              <li>✓ <T en="Secure Payment Escrow" ar="دفع آمن بالضمان" /></li>
              <li>✓ <T en="Elite Studio Tiers" ar="مستويات استوديو راقية" /></li>
            </ul>
          </div>
        </div>
      </section>

      <section className="launch-merch">
        <div className="container text-center">
          <h2><T en="Every Booking Unlocks More" ar="كل حجز يفتح لك عالماً جديداً" /></h2>
          <p className="lead"><T en="Our exclusive rewards program for serious creators." ar="برنامج مكافآت حصري للمبدعين الطموحين." /></p>
          
          <div className="merch-grid" style={{ marginTop: 60 }}>
            <div className="merch-item">
              <div className="merch-icon">🧢</div>
              <h3><T en="Elite Merch" ar="منتجات حصرية" /></h3>
            </div>
            <div className="merch-item">
              <div className="merch-icon">🎟️</div>
              <h3><T en="Event Access" ar="وصول للفعاليات" /></h3>
            </div>
            <div className="merch-item">
              <div className="merch-icon">💎</div>
              <h3><T en="Priority Drops" ar="أولوية الوصول" /></h3>
            </div>
          </div>
        </div>
      </section>

      <footer className="launch-footer">
        <div className="container">
           <div className="gb-logo gb-logo-lg">
             <span className="gb-logo-word">Gear<span>Beat</span></span>
           </div>
           <p><T en="Saudi Arabia & GCC's Premier Studio Marketplace" ar="أول ماركت بليس للاستوديوهات في السعودية والخليج" /></p>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .launch-page { background: #050505; color: #fff; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        
        .launch-hero { padding: 160px 0 100px; text-align: center; background: radial-gradient(circle at center, #111 0%, #050505 100%); }
        .launch-hero h1 { font-size: 4.5rem; letter-spacing: -0.04em; margin: 24px 0; font-weight: 800; }
        .launch-hero .lead { font-size: 1.5rem; color: #888; max-width: 700px; margin: 0 auto 48px; }
        
        .badge-glow {
          display: inline-block; padding: 8px 24px; border-radius: 99px; background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.3);
          color: #d4af37; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; font-size: 0.8rem;
          box-shadow: 0 0 20px rgba(212,175,55,0.15);
        }

        .btn-gold-lg { background: #d4af37; color: #000; padding: 20px 48px; border-radius: 16px; font-weight: 800; font-size: 1.1rem; text-decoration: none; display: inline-block; }
        .btn-outline-lg { border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 20px 48px; border-radius: 16px; font-weight: 800; font-size: 1.1rem; text-decoration: none; display: inline-block; margin-left: 20px; }
        
        .launch-certified { padding: 120px 0; background: #0a0a0a; }
        .certified-text h2 { font-size: 3.5rem; margin: 24px 0; }
        .certified-text p { font-size: 1.2rem; color: #888; line-height: 1.8; margin-bottom: 32px; }
        .benefit-list { list-style: none; padding: 0; }
        .benefit-list li { margin-bottom: 12px; font-weight: 700; color: #d4af37; font-size: 1.1rem; }

        .floating-kit {
           width: 400px; height: 400px; background: #111; border: 1px solid rgba(255,255,255,0.05); border-radius: 24px;
           display: flex; justify-content: center; align-items: center; position: relative;
           box-shadow: 0 40px 80px rgba(0,0,0,0.6); animation: float 6s infinite ease-in-out;
        }
        .kit-box { width: 250px; height: 250px; background: #000; border: 4px solid #d4af37; border-radius: 8px; display: flex; justify-content: center; align-items: center; }
        .kit-label { color: #d4af37; font-weight: 800; font-size: 1.2rem; letter-spacing: 4px; text-align: center; }

        .launch-merch { padding: 120px 0; }
        .merch-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
        .merch-item { background: #111; padding: 60px 40px; border-radius: 32px; border: 1px solid rgba(255,255,255,0.05); }
        .merch-icon { font-size: 4rem; margin-bottom: 24px; }

        .launch-footer { padding: 100px 0; border-top: 1px solid #111; text-align: center; }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
        }

        @media (max-width: 900px) {
          .grid-2 { grid-template-columns: 1fr; }
          .launch-hero h1 { font-size: 3rem; }
          .btn-outline-lg { margin-left: 0; margin-top: 20px; }
        }
      `}} />
    </div>
  );
}
