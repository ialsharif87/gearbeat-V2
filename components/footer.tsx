import Link from "next/link";
import Image from "next/image";

type FooterProps = {
  lang?: "en" | "ar";
};

export default function Footer({ lang = "ar" }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              <Image
                src="/brand/logo-horizontal.svg"
                alt="GearBeat"
                width={100}
                height={24}
                className="logo-img-sm"
              />
            </Link>
            <p className="footer-tagline">
              STUDIO. SOUND. CONNECTED.
              <span style={{ display: 'block', fontSize: '0.65rem', marginTop: 4, opacity: 0.6, letterSpacing: '1px' }}>
                {lang === "en" ? "ACTIVE PILOT PHASE — INVESTOR & GOVERNANCE DEMO" : "المرحلة التجريبية النشطة — عرض المستثمرين والحوكمة"}
              </span>
              <span style={{ display: 'block', fontSize: '0.65rem', marginTop: 4, opacity: 0.8, color: 'var(--gb-gold)' }}>
                {lang === "en" ? "MANUAL BANK TRANSFER VERIFICATION ONLY — NO LIVE CARD TRANSACTIONS" : "التحقق عبر التحويل البنكي اليدوي فقط — لا توجد معاملات بطاقات مباشرة"}
              </span>
            </p>
            <p className="footer-desc">
              {lang === "en" 
                ? "The global marketplace for audio creators, music studios, and gear vendors."
                : "المنصة العالمية لمبدعي الصوت، استوديوهات الموسيقى، وتجار المعدات."}
            </p>
          </div>

          <div className="footer-col">
            <h4>{lang === "en" ? "Experiences" : "التجارب"}</h4>
            <Link href="/studios">{lang === "en" ? "Book a Studio" : "احجز استوديو"}</Link>
            <Link href="/marketplace">{lang === "en" ? "Shop Gear" : "تسوق معدات"}</Link>
            <Link href="/services">{lang === "en" ? "Book Services" : "احجز خدمات"}</Link>
            <Link href="/academy">{lang === "en" ? "Join Academy" : "انضم للأكاديمية"}</Link>
            <Link href="/tickets">{lang === "en" ? "Explore Experiences" : "استكشف التجارب"}</Link>
            <Link href="/how-it-works">{lang === "en" ? "How it Works" : "كيف يعمل"}</Link>
          </div>

          <div className="footer-col">
            <h4>{lang === "en" ? "Partner Network" : "شبكة الشركاء"}</h4>
            <Link href="/join/studio">{lang === "en" ? "Become a Studio Partner" : "انضم كاستوديو شريك"}</Link>
            <Link href="/join/seller">{lang === "en" ? "Become a Vendor Partner" : "انضم كتاجر شريك"}</Link>
            <Link href="/partner">{lang === "en" ? "Become a Partner" : "انضم كشريك"}</Link>
            <Link href="/support">{lang === "en" ? "Operations Support" : "دعم العمليات"}</Link>
          </div>

          <div className="footer-col">
            <h4>{lang === "en" ? "Legal & Trust" : "القانونية والثقة"}</h4>
            <Link href="/legal">{lang === "en" ? "Legal Hub" : "المركز القانوني"}</Link>
            <Link href="/legal/terms">{lang === "en" ? "Terms of Service" : "شروط الخدمة"}</Link>
            <Link href="/legal/privacy">{lang === "en" ? "Privacy Policy" : "سياسة الخصوصية"}</Link>
            <Link href="/legal/marketplace-policy">{lang === "en" ? "Marketplace Policy" : "سياسة السوق"}</Link>
            <Link href="/legal/academy-policy">{lang === "en" ? "Academy Policy" : "سياسة الأكاديمية"}</Link>
            <Link href="/legal/booking-policy">{lang === "en" ? "Booking Policy" : "سياسة الحجز"}</Link>
            <Link href="/gearbeat-certified">{lang === "en" ? "Get Certified" : "احصل على التوثيق"}</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} GearBeat. {lang === "en" ? "All rights reserved." : "جميع الحقوق محفوظة."}</p>
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
          transform: translateX(var(--hover-translate, 5px));
        }

        [dir="rtl"] .footer-col a:hover {
          --hover-translate: -5px;
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

        @media (max-width: 1000px) {
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 40px; }
        }

        @media (max-width: 600px) {
          .site-footer {
            padding: 40px 0 24px !important;
            margin-top: 40px !important;
          }
          .footer-grid { 
            grid-template-columns: 1fr; 
            text-align: center; 
            gap: 32px !important; 
            margin-bottom: 32px !important; 
          }
          .logo-img-sm { margin-inline: auto; margin-bottom: 16px; }
          .footer-bottom { 
            flex-direction: column; 
            gap: 16px; 
            text-align: center; 
            padding-top: 24px !important; 
          }
        }
      `}} />
    </footer>
  );
}
