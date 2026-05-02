import type { ReactNode } from "react";
import { requireOwnerLayoutAccess } from "@/lib/route-guards";
import PortalSidebar from "@/components/portal-sidebar";

export default async function StudioPortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireOwnerLayoutAccess();

  return (
    <div className="portal-layout">
      <PortalSidebar role="owner" />
      <main className="portal-main">
        <div className="portal-content">{children}</div>
      </main>
    </div>
  );
}
