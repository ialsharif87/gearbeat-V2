import Link from "next/link";
import T from "./t";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              <img
                src="/brand/logo-horizontal.svg"
                alt="GearBeat"
                className="logo-img-sm"
              />
            </Link>
            <p className="footer-tagline">
              STUDIO. SOUND. CONNECTED.
            </p>
            <p className="footer-desc">
              <T
                en="The global marketplace for audio creators, music studios, and gear vendors."
                ar="المنصة العالمية لمبدعي الصوت، استوديوهات الموسيقى، وتجار المعدات."
              />
            </p>
          </div>

          <div className="footer-col">
            <h4><T en="Platform" ar="المنصة" /></h4>
            <Link href="/studios"><T en="Studios" ar="الاستوديوهات" /></Link>
            <Link href="/gear"><T en="Gear" ar="المعدات" /></Link>
            <Link href="/how-it-works"><T en="How it Works" ar="كيف يعمل" /></Link>
            <Link href="/support"><T en="Contact" ar="اتصل بنا" /></Link>
          </div>

          <div className="footer-col">
            <h4><T en="Partners" ar="الشركاء" /></h4>
            <Link href="/owner/onboarding"><T en="List Your Studio" ar="أضف استوديوك" /></Link>
            <Link href="/vendor-signup"><T en="Sell Gear" ar="بع معداتك" /></Link>
            <Link href="/login?account=owner"><T en="Partner Login" ar="دخول الشركاء" /></Link>
          </div>

          <div className="footer-col">
            <h4><T en="Account" ar="الحساب" /></h4>
            <Link href="/login"><T en="Login" ar="تسجيل الدخول" /></Link>
            <Link href="/signup"><T en="Sign Up" ar="إنشاء حساب" /></Link>
            <Link href="/portal"><T en="Dashboard" ar="لوحة التحكم" /></Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} GearBeat. <T en="All rights reserved." ar="جميع الحقوق محفوظة." /></p>
          <div className="footer-legal">
            <Link href="/terms"><T en="Terms" ar="الشروط" /></Link>
            <Link href="/privacy"><T en="Privacy" ar="الخصوصية" /></Link>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .site-footer {
          background: #000;
          padding: 80px 0 40px;
          border-top: 1px solid var(--gb-border);
          margin-top: 80px;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: 60px;
          margin-bottom: 60px;
        }

        .logo-img-sm {
          height: 24px;
          width: auto;
          margin-bottom: 16px;
          display: block;
        }

        .footer-tagline {
          color: var(--gb-gold);
          font-weight: 800;
          font-size: 0.75rem;
          letter-spacing: 2px;
          margin-bottom: 12px;
        }

        .footer-desc {
          color: var(--gb-text-muted);
          font-size: 0.9rem;
          line-height: 1.7;
        }

        .footer-col h4 {
          color: #fff;
          font-size: 1rem;
          margin-bottom: 24px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .footer-col a {
          display: block;
          color: var(--gb-text-muted);
          text-decoration: none;
          margin-bottom: 12px;
          font-size: 0.95rem;
          transition: var(--transition);
        }

        .footer-col a:hover {
          color: var(--gb-gold);
          transform: translateX(5px);
        }

        [dir="rtl"] .footer-col a:hover {
          transform: translateX(-5px);
        }

        .footer-bottom {
          padding-top: 40px;
          border-top: 1px solid rgba(255,255,255,0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #555;
          font-size: 0.85rem;
        }

        .footer-legal {
          display: flex;
          gap: 24px;
        }

        .footer-legal a {
          color: #555;
          text-decoration: none;
        }

        @media (max-width: 1000px) {
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 40px; }
        }

        @media (max-width: 600px) {
          .footer-grid { grid-template-columns: 1fr; text-align: center; }
          .logo-img-sm { margin: 0 auto 16px; }
          .footer-bottom { flex-direction: column; gap: 20px; }
        }
      `}} />
    </footer>
  );
}
