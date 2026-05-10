import Link from "next/link";
import Image from "next/image";
import LanguageSwitcher from "./language-switcher";
import T from "./t";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown on route change
  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="site-header glass">
      <div className="container header-shell">
        <Link href="/" className="header-logo">
          <Image
            src="/brand/logo-horizontal.svg"
            alt="GearBeat"
            width={120}
            height={32}
            className="logo-img"
            priority
          />
        </Link>

        <nav className="header-nav">
          <Link href="/studios" className="nav-link">
            <T en="Studios" ar="الاستوديوهات" />
          </Link>
          <Link href="/gear" className="nav-link">
            <T en="Gear" ar="المعدات" />
          </Link>
          <Link href="/services" className="nav-link">
            <T en="Services" ar="الخدمات" />
          </Link>
          <Link href="/about" className="nav-link">
            <T en="About GearBeat" ar="عن GearBeat" />
          </Link>
          <Link href="/how-it-works" className="nav-link">
            <T en="How it Works" ar="كيف يعمل" />
          </Link>
          <Link href="/partner" className="nav-link">
            <T en="Partner Portal" ar="بوابة الشركاء" />
          </Link>
          <Link href="/support" className="nav-link">
            <T en="Contact" ar="اتصل بنا" />
          </Link>
        </nav>

        <div className="header-actions">
          <CartBadge />
          <LanguageSwitcher />

          {isLoggedIn ? (
            <div className="user-dropdown-container" ref={dropdownRef}>
              <button 
                className="user-menu-trigger"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <div className="user-avatar-placeholder">
                  {userRole?.[0]?.toUpperCase() || "U"}
                </div>
              </button>

              {isUserMenuOpen && (
                <div className="user-dropdown-menu glass animate-fade-in">
                  <div className="dropdown-info">
                    <p className="user-role-badge">{userRole || "User"}</p>
                  </div>
                  <hr className="dropdown-divider" />
                  <Link href={dashboardPath} className="dropdown-item">
                    <T en="Dashboard" ar="لوحة التحكم" />
                  </Link>
                  {logoutAction && (
                    <form action={logoutAction}>
                      <button type="submit" className="dropdown-item logout-btn">
                        <T en="Logout" ar="خروج" />
                      </button>
                    </form>
                  )}
                </div>
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
          order: 1;
        }
        [dir="rtl"] .header-actions {
          order: 2;
        }
        [dir="rtl"] .header-logo {
          order: 3;
        }

        .user-dropdown-container {
          position: relative;
        }

        .user-menu-trigger {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
        }

        .user-avatar-placeholder {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--gb-gold);
          color: var(--gb-navy);
          display: grid;
          place-items: center;
          font-weight: bold;
          border: 2px solid rgba(255,255,255,0.1);
        }

        .user-dropdown-menu {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          min-width: 200px;
          background: rgba(11, 15, 22, 0.95);
          border: 1px solid var(--gb-border);
          border-radius: 12px;
          padding: 8px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          z-index: 1001;
        }

        [dir="rtl"] .user-dropdown-menu {
          right: auto;
          left: 0;
        }

        .dropdown-info {
          padding: 8px 12px;
        }

        .user-role-badge {
          font-size: 0.75rem;
          color: var(--gb-gold);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0;
        }

        .dropdown-divider {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.05);
          margin: 4px 0;
        }

        .dropdown-item {
          display: block;
          width: 100%;
          padding: 10px 12px;
          color: #fff;
          text-decoration: none;
          font-size: 0.9rem;
          border-radius: 6px;
          transition: background 0.2s;
          text-align: start;
        }

        .dropdown-item:hover {
          background: rgba(255,255,255,0.05);
          color: var(--gb-gold);
        }

        .logout-btn {
          color: #ff4d4d;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: inherit;
        }

        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          .header-nav { display: none; }
        }
      `}} />
    </header>
  );
}
