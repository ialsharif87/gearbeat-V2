import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import "./globals.css";
import { createClient } from "../lib/supabase/server";
import { createAdminClient } from "../lib/supabase/admin";
import T from "../components/t";
import LanguageSwitcher from "../components/language-switcher";
import Footer from "../components/footer";

export const metadata: Metadata = {
  title: "GearBeat",
  description: "Book music studios and creative spaces."
};

type ProfileRow = {
  id: string;
  auth_user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: string | null;
  account_status: string | null;
};

type AdminUserRow = {
  id: string;
  auth_user_id: string;
  email: string | null;
  admin_role: string;
  status: string;
};

function getDashboardPath({
  profile,
  adminUser
}: {
  profile: ProfileRow | null;
  adminUser: AdminUserRow | null;
}) {
  if (adminUser) return "/admin";

  if (profile?.role === "owner") return "/owner";

  if (profile?.role === "customer") return "/customer";

  return "/login";
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

  let adminUser: AdminUserRow | null = null;
  let profile: ProfileRow | null = null;

  if (user) {
    const supabaseAdmin = createAdminClient();

    const [adminResult, profileResult] = await Promise.all([
      supabaseAdmin
        .from("admin_users")
        .select("id, auth_user_id, email, admin_role, status")
        .eq("auth_user_id", user.id)
        .eq("status", "active")
        .maybeSingle(),

      supabaseAdmin
        .from("profiles")
        .select("id, auth_user_id, email, full_name, phone, role, account_status")
        .eq("auth_user_id", user.id)
        .maybeSingle()
    ]);

    adminUser = (adminResult.data || null) as AdminUserRow | null;
    profile = (profileResult.data || null) as ProfileRow | null;
  }

  async function logout() {
    "use server";

    const supabase = await createClient();
    await supabase.auth.signOut();

    redirect("/login");
  }

  const dashboardPath = user
    ? getDashboardPath({
        profile,
        adminUser
      })
    : "/login";

  const isAdmin = Boolean(adminUser);
  const userRole = profile?.role || null;

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
                    {isAdmin ? (
                      <T en="Admin Dashboard" ar="لوحة الإدارة" />
                    ) : (
                      <T en="Dashboard" ar="لوحة التحكم" />
                    )}
                  </Link>

                  {!isAdmin && userRole === "customer" ? (
                    <>
                      <Link href="/customer/bookings">
                        <T en="My Bookings" ar="حجوزاتي" />
                      </Link>

                      <Link href="/profile">
                        <T en="My Profile" ar="ملفي الشخصي" />
                      </Link>
                    </>
                  ) : null}

                  {!isAdmin && userRole === "owner" ? (
                    <>
                      <Link href="/owner">
                        <T en="Owner Dashboard" ar="لوحة صاحب الاستوديو" />
                      </Link>

                      <Link href="/owner/studios">
                        <T en="My Studios" ar="استوديوهاتي" />
                      </Link>

                      <Link href="/owner/bookings">
                        <T en="Owner Bookings" ar="حجوزات الاستوديو" />
                      </Link>
                    </>
                  ) : null}

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
