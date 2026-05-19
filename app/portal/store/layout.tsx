import PortalSidebar from "@/components/portal-sidebar";
import { requireVendorLayoutAccess } from "@/lib/route-guards";

export default async function StorePortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireVendorLayoutAccess();

  return (
    <div className="portal-layout">
      <PortalSidebar role="vendor" />
      <main className="portal-main">{children}</main>
    </div>
  );
}
