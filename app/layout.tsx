import "./globals.css";
import Link from "next/link";
import { getCurrentProfile, getDashboardPath } from "../lib/auth";
import LogoutButton from "../components/logout-button";
import LanguageSwitcher from "../components/language-switcher";
import T from "../components/t";

export const metadata = {
  title: "GearBeat",
  description: "Premium music studio booking marketplace"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { profile } = await getCurrentProfile();

  return (
    <html lang="en" dir="ltr">
      <body>
        <header className="site-header">
          <div className="container nav">
            <Link href="/" className="brand">
              <span className="brand-logo" aria-hidden="true">
                <span className="logo-gear">
                  <span className="logo-wave"></span>
                </span>
              </span>

              <span className="brand-text">
                Gear<span>Beat</span>
              </span>
            </Link>

            <nav className="nav-links">
              <Link href="/studios">
                <T en="Browse Studios" ar="تصفح الاستوديوهات" />
              </Link>

              {profile ? (
                <>
                  <Link href={getDashboardPath(profile.role)}>
                    <T en="Dashboard" ar="لوحة التحكم" />
                  </Link>

                  {profile.role === "customer" ? (
                    <Link href="/customer/bookings">
                      <T en="My Bookings" ar="حجوزاتي" />
                    </Link>
                  ) : null}

                  {profile.role === "owner" ? (
                    <>
                      <Link href="/owner/studios">
                        <T en="My Studios" ar="استوديوهاتي" />
                      </Link>

                      <Link href="/owner/bookings">
                        <T en="Bookings" ar="الحجوزات" />
                      </Link>
                    </>
                  ) : null}

                  {profile.role === "vendor" ? (
                    <>
                      <Link href="/vendor">
                        <T en="Vendor Dashboard" ar="لوحة المتجر" />
                      </Link>

                      <Link href="/vendor/products">
                        <T en="Products" ar="المنتجات" />
                      </Link>

                      <Link href="/vendor/orders">
                        <T en="Orders" ar="الطلبات" />
                      </Link>
                    </>
                  ) : null}

                  <LogoutButton />
                </>
              ) : (
                <>
                  <Link href="/login">
                    <T en="Login" ar="تسجيل الدخول" />
                  </Link>

                  <Link href="/signup" className="btn btn-small">
                    <T en="Sign up" ar="إنشاء حساب" />
                  </Link>
                </>
              )}

              <LanguageSwitcher />
            </nav>
          </div>
        </header>

        <main className="container page">{children}</main>
      </body>
    </html>
  );
}
