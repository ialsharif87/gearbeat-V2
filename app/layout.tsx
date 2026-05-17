import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Space_Grotesk, Cairo } from "next/font/google";
import "./globals.css";
import "./brand-system.css";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ClientProviders } from "@/components/client-providers";
import ConditionalLayout from "@/components/conditional-layout";
import Analytics from "@/components/analytics";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-latin",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});
 
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-arabic",
  display: "swap",
  fallback: ["system-ui", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: {
    default: "GearBeat | The Global Pulse of Studio Sound",
    template: "%s | GearBeat"
  },
  description: "GearBeat is the ultimate ecosystem for audio professionals. Discover world-class studios, shop elite verified gear, and secure tickets to exclusive industry experiences across Saudi Arabia and the GCC.",
  keywords: ["music studio", "recording studio", "audio gear", "music production", "Saudi Arabia", "GCC", "GearBeat"],
  authors: [{ name: "GearBeat Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gearbeat.app",
    siteName: "GearBeat",
    title: "GearBeat | The Global Pulse of Studio Sound",
    description: "Book premium music and audio studios across Saudi Arabia and the GCC.",
    images: [
      {
        url: "/brand/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GearBeat - Studio. Sound. Connected."
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "GearBeat | The Global Pulse of Studio Sound",
    description: "Book premium music and audio studios across Saudi Arabia and the GCC.",
    images: ["/brand/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  }
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
  isVendor,
}: {
  profile: ProfileRow | null;
  adminUser: AdminUserRow | null;
  isVendor: boolean;
}) {
  if (adminUser) return "/admin";
  if (isVendor) return "/portal/store";
  if (profile?.role === "owner" || profile?.role === "studio_owner") return "/portal/studio";
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
        .eq("id", user.id)
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

  const dashboardPath = user ? getDashboardPath({ profile, adminUser, isVendor }) : "/login";
  const isAdmin = Boolean(adminUser);
  const userRole = profile?.role || null;

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${spaceGrotesk.variable} ${cairo.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const lang = new URLSearchParams(window.location.search).get('lang');
                if (lang === 'en') {
                  document.documentElement.lang = 'en';
                  document.documentElement.dir = 'ltr';
                } else {
                  document.documentElement.lang = 'ar';
                  document.documentElement.dir = 'rtl';
                }
                const isApp = new URLSearchParams(window.location.search).get('app') === '1';
                if (isApp) {
                  document.body.classList.add('app-mode');
                }
              } catch (e) {}
            `
          }}
        />
      </head>
      <body>
        <Analytics />
        <ClientProviders>
          <ConditionalLayout
            isLoggedIn={Boolean(user)}
            isAdmin={isAdmin}
            isVendor={isVendor}
            userRole={userRole}
            dashboardPath={dashboardPath}
            logoutAction={logout}
          >
            <main className="main">{children}
        <SpeedInsights /></main>
          </ConditionalLayout>
        </ClientProviders>
      </body>
    </html>
  );
}
