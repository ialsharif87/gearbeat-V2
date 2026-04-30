import Link from "next/link";
import LanguageSwitcher from "./language-switcher";
import T from "./t";

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
          <NavLink href="/gear" en="Gear" ar="المعدات" />
          <NavLink href="/how-it-works" en="How it Works" ar="كيف يعمل" />

          {isLoggedIn ? (
            <>
              <Link href={dashboardPath} className="gb-nav-link gb-nav-link-strong">
                <T en="Dashboard" ar="لوحة التحكم" />
              </Link>

              {isVendor && (
                <Link href="/vendor" className="gb-nav-link" style={{ color: 'var(--gb-gold)' }}>
                  <T en="Vendor Portal" ar="بوابة التاجر" />
                </Link>
              )}
            </>
          ) : (
            <>
              <NavLink href="/owner/onboarding" en="Become a Partner" ar="كن شريكاً" />
              <NavLink href="/vendor/onboarding" en="Become a Vendor" ar="كن تاجراً" />
            </>
          )}
        </nav>

        <div className="gb-header-actions">
          <Link href="/cart" className="gb-cart-link" aria-label="Cart">
            <span className="icon">🛒</span>
            <span className="badge">0</span>
          </Link>

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
                <T en="Login" ar="تسجيل الدخول" />
              </Link>

              <Link href="/signup" className="gb-header-primary-button">
                <T en="Create account" ar="إنشاء حساب" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
