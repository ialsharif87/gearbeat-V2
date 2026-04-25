import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import "./globals.css";
import { createClient } from "../lib/supabase/server";
import T from "../components/t";

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
    <html lang="en">
      <body>
        <header className="site-header">
          <nav className="nav">
            <div className="nav-left">
              <Link href="/" className="brand brand-logo">
                <Image
                  src="/logo.png"
                  alt="GearBeat"
                  width={150}
                  height={46}
                  priority
                  className="logo-image"
                />
              </Link>
            </div>

            <div className="nav-links">
              <Link href="/studios">
                <T en="Browse Studios" ar="تصفح الاستوديوهات" />
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

                  <Link href="/signup" className="nav-button-link">
                    <T en="Sign Up" ar="إنشاء حساب" />
                  </Link>
                </>
              )}
            </div>

            <div className="language-switch">
              <Link href="?lang=ar" className="lang-pill">
                AR
              </Link>
              <Link href="?lang=en" className="lang-link">
                EN
              </Link>
            </div>
          </nav>
        </header>

        <main className="main">{children}</main>
      </body>
    </html>
  );
}
