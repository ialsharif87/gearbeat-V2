import Link from "next/link";
import LanguageSwitcher from "./language-switcher";
import T from "./t";
import CartBadge from "./cart-badge";
import NotificationBell from "./notification-bell";

type SiteHeaderProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  isVendor: boolean;
  userRole: string | null;
  dashboardPath: string;
  logoutAction?: () => Promise<void>;
};

function NavLink({
  href,
  en,
  ar,
}: {
  href: string;
  en: string;
  ar: string;
}) {
  return (
    <Link href={href} className="gb-nav-link">
      <T en={en} ar={ar} />
    </Link>
  );
}

export default function SiteHeader({
  isLoggedIn,
  isAdmin,
  isVendor,
  userRole,
  dashboardPath,
  logoutAction,
}: SiteHeaderProps) {
  return (
    <header className="gb-site-header">
      <div className="gb-header-shell">
        <Link href="/" aria-label="GearBeat Home" className="gb-logo-link">
          <img
            src="/brand/logo-horizontal-ai.png"
            alt="GearBeat"
            className="gb-header-logo-image"
          />
        </Link>

        <nav className="gb-header-nav" aria-label="Main navigation">
          <NavLink href="/studios" en="Studios" ar="الاستوديوهات" />
          <NavLink href="/services" en="Services" ar="الخدمات" />
          <NavLink href="/gear" en="Gear" ar="المعدات" />
          <NavLink href="/how-it-works" en="How it Works" ar="كيف يعمل" />

          {isLoggedIn ? (
            <>
              <Link href={dashboardPath} className="gb-nav-link gb-nav-link-strong">
                <T en="Dashboard" ar="لوحة التحكم" />
              </Link>
              <NotificationBell />
              {isVendor && (
                <Link href="/portal/store" className="gb-nav-link" style={{ color: 'var(--gb-gold)' }}>
                  <T en="Vendor Portal" ar="بوابة التاجر" />
                </Link>
              )}
            </>
          ) : (
            <div className="partner-dropdown-container">
              <button className="gb-nav-link partner-trigger">
                <T en="Partner with Us" ar="انضم كشريك" />
                <span className="chevron">▾</span>
              </button>
              <div className="partner-dropdown-menu">
                <Link href="/join/studio" className="partner-item">
                  <span className="partner-icon">🎧</span>
                  <div className="partner-text">
                    <strong><T en="Studio Owner" ar="صاحب استديو" /></strong>
                    <p><T en="List your space" ar="اعرض مساحتك" /></p>
                  </div>
                </Link>
                <Link href="/join/seller" className="partner-item">
                  <div className="partner-icon">📦</div>
                  <div className="partner-text">
                    <strong><T en="Gear Vendor" ar="تاجر معدات" /></strong>
                    <p><T en="Sell your gear" ar="بع معداتك هنا" /></p>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </nav>

        <div className="gb-header-actions">
          <CartBadge />
          <LanguageSwitcher />

          {isLoggedIn && logoutAction ? (
            <form action={logoutAction} className="gb-logout-form">
              <button type="submit" className="gb-header-ghost-button">
                <T en="Logout" ar="تسجيل الخروج" />
              </button>
            </form>
          ) : (
            <>
              <Link href="/login" className="gb-header-ghost-button">
                <T en="Login" ar="دخول" />
              </Link>
              <Link href="/signup" className="gb-header-primary-button">
                <T en="Sign Up" ar="تسجيل" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
