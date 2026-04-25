import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import "./globals.css";
import { createClient } from "../lib/supabase/server";
import T from "../components/t";
import LanguageSwitcher from "../components/language-switcher";
import Footer from "../components/footer";

export const metadata: Metadata = {
  title: "GearBeat",
  description: "Book music studios and creative spaces."
};

function getDashboardPath(user: any) {
  const role = user?.user_metadata?.role;

  if (role === "owner") return "/owner";
  if (role === "admin") return "/admin";

  return "/customer";
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  async function logout() {
    "use server";

    const supabase = await createClient();
    await supabase.auth.signOut();

    redirect("/login");
  }

  const dashboardPath = user ? getDashboardPath(user) : "/login";

  return (
    <html lang="ar" dir="rtl">
      <body>
        <header className="site-header">
          <nav className="nav enhanced-nav">
            <div className="nav-left">
              <Link href="/" className="brand" aria-label="GearBeat Home">
                <img
                  src="/gearbeat-logo.png"
                  alt="GearBeat"
                  className="brand-logo"
                />
              </Link>
            </div>

            <div className="nav-links enhanced-nav-links">
              <Link href="/studios">
                <T en="Browse Studios" ar="تصفح الاستوديوهات" />
              </Link>

              <Link href="/about">
                <T en="About" ar="من نحن" />
              </Link>

              <Link href="/support">
                <T en="Support" ar="الدعم" />
              </Link>

              {user ? (
                <>
                  <Link href={dashboardPath}>
                    <T en="Dashboard" ar="لوحة التحكم" />
                  </Link>

                  <Link href="/customer/bookings">
                    <T en="My Bookings" ar="حجوزاتي" />
                  </Link>

                  <Link href="/profile">
                    <T en="My Profile" ar="ملفي الشخصي" />
                  </Link>

                  <form action={logout}>
                    <button className="nav-button" type="submit">
                      <T en="Logout" ar="تسجيل الخروج" />
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <T en="Login" ar="تسجيل الدخول" />
                  </Link>

                  <Link href="/signup" className="nav-button-link nav-cta">
                    <T en="Sign Up" ar="إنشاء حساب" />
                  </Link>
                </>
              )}
            </div>

            <div className="nav-right">
              <LanguageSwitcher />
            </div>
          </nav>
        </header>

        <main className="main">{children}</main>

        <Footer />
      </body>
    </html>
  );
}
