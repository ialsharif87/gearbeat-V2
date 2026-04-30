import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Space_Grotesk, Cairo } from "next/font/google";
import "./globals.css";
import "./brand-system.css";
import { createClient } from "../lib/supabase/server";
import { createAdminClient } from "../lib/supabase/admin";
import Footer from "../components/footer";
import SiteHeader from "../components/site-header";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-latin",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GearBeat",
  description: "Book premium music and audio studios across Saudi Arabia and the GCC.",
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
  adminUser,
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
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let adminUser: AdminUserRow | null = null;
  let profile: ProfileRow | null = null;
  let isVendor = false;

  if (user) {
    const supabaseAdmin = createAdminClient();

    const [adminResult, profileResult, vendorResult] = await Promise.all([
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
        .maybeSingle(),

      supabaseAdmin
        .from("vendor_profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle(),
    ]);

    adminUser = (adminResult.data || null) as AdminUserRow | null;
    profile = (profileResult.data || null) as ProfileRow | null;
    isVendor = Boolean(vendorResult.data);
  }

  async function logout() {
    "use server";

    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  const dashboardPath = user ? getDashboardPath({ profile, adminUser }) : "/login";
  const isAdmin = Boolean(adminUser);
  const userRole = profile?.role || null;

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${spaceGrotesk.variable} ${cairo.variable}`}
    >
      <body>
        <SiteHeader
          isLoggedIn={Boolean(user)}
          isAdmin={isAdmin}
          isVendor={Boolean(isVendor)}
          userRole={userRole}
          dashboardPath={dashboardPath}
          logoutAction={logout}
        />

        <main className="main">{children}</main>

        <Footer />
      </body>
    </html>
  );
}
