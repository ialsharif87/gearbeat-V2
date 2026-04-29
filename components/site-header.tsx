import Link from "next/link";
import LanguageSwitcher from "./language-switcher";
import T from "./t";

type SiteHeaderProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
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
          <NavLink href="/studios" en="Studios" ar="تصفح الاستوديوهات" />
          <NavLink href="/marketplace" en="Marketplace" ar="السوق" />
          <NavLink href="/about" en="About" ar="من نحن" />
          <NavLink href="/support" en="Support" ar="الدعم" />

          {isLoggedIn ? (
            <>
              <Link href={dashboardPath} className="gb-nav-link gb-nav-link-strong">
                <T en="Dashboard" ar="لوحة التحكم" />
              </Link>

              {!isAdmin && userRole === "owner" ? (
                <>
                  <NavLink href="/owner/studios" en="My studios" ar="استوديوهاتي" />
                  <NavLink href="/owner/bookings" en="Bookings" ar="الحجوزات" />
                </>
              ) : null}

              {!isAdmin && userRole === "customer" ? (
                <>
                  <NavLink href="/customer/bookings" en="My bookings" ar="حجوزاتي" />
                  <NavLink href="/customer/profile" en="Profile" ar="ملفي الشخصي" />
                </>
              ) : null}

              {isAdmin ? (
                <>
                  <NavLink href="/admin/bookings" en="Bookings" ar="الحجوزات" />
                  <NavLink href="/admin/studios" en="Studios" ar="الاستوديوهات" />
                </>
              ) : null}
            </>
          ) : null}
        </nav>

        <div className="gb-header-actions">
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
