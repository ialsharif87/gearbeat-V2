import Link from "next/link";
import LanguageSwitcher from "./language-switcher";
import T from "./t";
import CartBadge from "./cart-badge";

type SiteHeaderProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  isVendor: boolean;
  userRole: string | null;
  dashboardPath: string;
  logoutAction?: () => Promise<void>;
};

export default function SiteHeader({
  isLoggedIn,
  isAdmin,
  isVendor,
  userRole,
  dashboardPath,
  logoutAction,
}: SiteHeaderProps) {
  return (
    <header className="site-header glass">
      <div className="container header-shell">
        <Link href="/" className="header-logo">
          <img
            src="/brand/logo-horizontal.svg"
            alt="GearBeat"
            className="logo-img"
          />
        </Link>

        <nav className="header-nav">
          <Link href="/studios" className="nav-link">
            <T en="Studios" ar="الاستوديوهات" />
          </Link>
          <Link href="/gear" className="nav-link">
            <T en="Gear" ar="المعدات" />
          </Link>
          <Link href="/how-it-works" className="nav-link">
            <T en="How it Works" ar="كيف يعمل" />
          </Link>
          <Link href="/support" className="nav-link">
            <T en="Contact" ar="اتصل بنا" />
          </Link>
        </nav>

        <div className="header-actions">
          <CartBadge />
          <LanguageSwitcher />

          {isLoggedIn ? (
            <div className="user-group">
              <Link href={dashboardPath} className="btn btn-primary btn-sm">
                <T en="Dashboard" ar="لوحة التحكم" />
              </Link>
              {logoutAction && (
                <form action={logoutAction}>
                  <button type="submit" className="logout-trigger">
                    <T en="Logout" ar="خروج" />
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="auth-group">
              <Link href="/login" className="nav-link">
                <T en="Login" ar="دخول" />
              </Link>
              <Link href="/signup" className="btn btn-primary btn-sm">
                <T en="Sign Up" ar="تسجيل" />
              </Link>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .site-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          height: 80px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid var(--gb-border);
        }

        .header-shell {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
        }

        .logo-img {
          height: 32px;
          width: auto;
          display: block;
        }

        .header-nav {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-link {
          color: var(--gb-text-muted);
          font-weight: 600;
          font-size: 0.9rem;
          padding: 8px 16px;
          border-radius: 8px;
          text-decoration: none;
          transition: var(--transition);
        }

        .nav-link:hover {
          color: var(--gb-gold);
          background: rgba(201, 162, 77, 0.05);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .auth-group, .user-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .btn-sm {
          padding: 10px 20px;
          font-size: 0.85rem;
        }

        .logout-trigger {
          background: none;
          border: none;
          color: #ff4d4d;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          padding: 8px;
          opacity: 0.7;
          transition: var(--transition);
        }

        .logout-trigger:hover {
          opacity: 1;
        }

        [dir="rtl"] .header-nav {
          order: 2;
        }
        [dir="rtl"] .header-actions {
          order: 1;
        }
        [dir="rtl"] .header-logo {
          order: 3;
        }

        @media (max-width: 900px) {
          .header-nav { display: none; }
        }
      `}} />
    </header>
  );
}
