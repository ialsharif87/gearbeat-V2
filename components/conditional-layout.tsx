"use client";

import { usePathname } from "next/navigation";
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

  const hideChrome =
    pathname.startsWith("/portal") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/staff-access");

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
        />
      )}
      {children}
      {!hideChrome && <Footer />}
    </>
  );
}
