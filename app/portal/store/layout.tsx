import type { ReactNode } from "react";
import { requireVendorLayoutAccess } from "@/lib/route-guards";
import PortalSidebar from "@/components/portal-sidebar";

export default async function StorePortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireVendorLayoutAccess();

  return (
    <div className="portal-layout">
      <PortalSidebar role="vendor" />
      <main className="portal-main">
        <div className="portal-content">{children}</div>
      </main>
    </div>
  );
}
