"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import SiteHeader from "@/components/site-header";
import Footer from "@/components/footer";

export default function ConditionalLayout({
  children,
  isLoggedIn,
  isAdmin,
  isVendor,
  userRole,
  dashboardPath,
  logoutAction,
}: {
  children: React.ReactNode;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isVendor: boolean;
  userRole: string | null;
  dashboardPath: string;
  logoutAction?: () => Promise<void>;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lang = searchParams.get("lang") === "en" ? "en" : "ar";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const hideChrome =
    pathname.startsWith("/portal") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/staff-access") ||
    pathname.startsWith("/notifications");

  return (
    <>
      {!hideChrome && (
        <SiteHeader
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          isVendor={isVendor}
          userRole={userRole}
          dashboardPath={dashboardPath}
          logoutAction={logoutAction}
          lang={lang as "en" | "ar"}
        />
      )}
      {children}
      {!hideChrome && <Footer lang={lang as "en" | "ar"} />}
    </>
  );
}
