import type { ReactNode } from "react";
import { requireVendorLayoutAccess } from "../../lib/route-guards";
import VendorSidebar from "../../components/vendor-sidebar";

export default async function VendorLayout({
  children
}: {
  children: ReactNode;
}) {
  const { vendorProfile } = await requireVendorLayoutAccess();

  return (
    <div className="portal-layout">
      <VendorSidebar />
      <main className="portal-main">
        <div className="portal-content">
          {children}
        </div>
      </main>
    </div>
  );
}
