import type { ReactNode } from "react";
import { requireAdminLayoutAccess } from "@/lib/route-guards";
import { AdminSidebar } from "./AdminSidebar";
import PortalNotificationBell from "@/components/portal-notification-bell";

export default async function AdminLayout({
  children
}: {
  children: ReactNode;
}) {
  const { supabaseAdmin } = await requireAdminLayoutAccess();

  // Fetch lead counts for badges
  const [sellerLeads, studioLeads] = await Promise.all([
    supabaseAdmin.from("provider_leads").select("id", { count: "exact", head: true }).eq("type", "seller").neq("status", "approved"),
    supabaseAdmin.from("studio_applications").select("id", { count: "exact", head: true }).neq("status", "approved"),
  ]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      <AdminSidebar 
        sellerLeadCount={sellerLeads.count || 0} 
        studioLeadCount={studioLeads.count || 0} 
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Admin Top Bar */}
        <header style={{ 
          height: 64, borderBottom: '1px solid #1a1a1a', 
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', 
          padding: '0 32px', gap: 20 
        }}>
          <div style={{ color: '#555', fontSize: '0.85rem' }}>Admin Control Center</div>
          <PortalNotificationBell />
        </header>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
