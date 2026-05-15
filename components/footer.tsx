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
            </p>
            <p className="footer-desc">
              {lang === "en" 
                ? "The global marketplace for audio creators, music studios, and gear vendors."
                : "Ø§Ù„Ù…Ù†ØµØ© Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠØ© Ù„Ù…Ø¨Ø¯Ø¹ÙŠ Ø§Ù„ØµÙˆØªØŒ Ø§Ø³ØªÙˆØ¯ÙŠÙˆÙ‡Ø§Øª Ø§Ù„Ù…ÙˆØ³ÙŠÙ‚Ù‰ØŒ ÙˆØªØ¬Ø§Ø± Ø§Ù„Ù…Ø¹Ø¯Ø§Øª."}
            </p>
          </div>

          <div className="footer-col">
            <h4>{lang === "en" ? "Platform" : "Ø§Ù„Ù…Ù†ØµØ©"}</h4>
            <Link href="/studios">{lang === "en" ? "Discovery" : "Ø§Ù„Ø§ÙƒØªØ´Ø§Ù"}</Link>
            <Link href="/marketplace">{lang === "en" ? "Marketplace" : "Ø§Ù„Ø³ÙˆÙ‚"}</Link>
            <Link href="/academy">{lang === "en" ? "Academy" : "Ø§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠØ©"}</Link>
            <Link href="/tickets">{lang === "en" ? "Tickets" : "Ø§Ù„ØªØ°Ø§ÙƒØ±"}</Link>
            <Link href="/how-it-works">{lang === "en" ? "How it Works" : "ÙƒÙŠÙ ÙŠØ¹Ù…Ù„"}</Link>
          </div>

          <div className="footer-col">
            <h4>{lang === "en" ? "Partner Network" : "Ø´Ø¨ÙƒØ© Ø§Ù„Ø´Ø±ÙƒØ§Ø¡"}</h4>
            <Link href="/join/studio">{lang === "en" ? "Apply as Studio" : "Ù‚Ø¯Ù… ÙƒØ§Ø³ØªÙˆØ¯ÙŠÙˆ"}</Link>
            <Link href="/join/seller">{lang === "en" ? "Apply as Vendor" : "Ù‚Ø¯Ù… ÙƒØªØ§Ø¬Ø±"}</Link>
            <Link href="/partner">{lang === "en" ? "Become a Partner" : "ÙƒÙ† Ø´Ø±ÙŠÙƒØ§Ù‹"}</Link>
            <Link href="/support">{lang === "en" ? "Partner Support" : "Ø¯Ø¹Ù… Ø§Ù„Ø´Ø±ÙƒØ§Ø¡"}</Link>
          </div>

          <div className="footer-col">
            <h4>{lang === "en" ? "Legal & Trust" : "Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© ÙˆØ§Ù„Ø«Ù‚Ø©"}</h4>
            <Link href="/legal">{lang === "en" ? "Legal Hub" : "Ø§Ù„Ù…Ø±ÙƒØ² Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠ"}</Link>
            <Link href="/legal/terms">{lang === "en" ? "Terms of Service" : "Ø´Ø±ÙˆØ· Ø§Ù„Ø®Ø¯Ù…Ø©"}</Link>
            <Link href="/legal/privacy">{lang === "en" ? "Privacy Policy" : "Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø®ØµÙˆØµÙŠØ©"}</Link>
            <Link href="/legal/marketplace-policy">{lang === "en" ? "Marketplace Policy" : "Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø³ÙˆÙ‚"}</Link>
            <Link href="/legal/academy-policy">{lang === "en" ? "Academy Policy" : "Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠØ©"}</Link>
            <Link href="/legal/booking-policy">{lang === "en" ? "Booking Policy" : "Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø­Ø¬Ø²"}</Link>
            <Link href="/gearbeat-certified">{lang === "en" ? "GearBeat Certified" : "Ø¬ÙŠØ±Ø¨ÙŠØª Ø§Ù„Ù…Ø¹ØªÙ…Ø¯"}</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>Â© {currentYear} GearBeat. {lang === "en" ? "All rights reserved." : "Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø­Ù‚ÙˆÙ‚ Ù…Ø­ÙÙˆØ¸Ø©."}</p>
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
          .footer-grid { grid-template-columns: 1fr; text-align: center; }
          .logo-img-sm { margin-inline: auto; margin-bottom: 16px; }
          .footer-bottom { flex-direction: column; gap: 20px; text-align: center; }
        }
      `}} />
    </footer>
  );
}

