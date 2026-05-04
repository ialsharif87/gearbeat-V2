import type { ReactNode } from "react";
import { requireAdminLayoutAccess } from "@/lib/route-guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminSidebar } from "./AdminSidebar"; // I will create this as a client component in the same file or nearby

export default async function AdminLayout({
  children
}: {
  children: ReactNode;
}) {
  const { supabaseAdmin, user } = await requireAdminLayoutAccess();

  // Fetch lead counts for badges
  const [sellerLeads, studioLeads] = await Promise.all([
    supabaseAdmin.from("provider_leads").select("id", { count: "exact", head: true }).eq("type", "seller").neq("status", "approved"),
    supabaseAdmin.from("provider_leads").select("id", { count: "exact", head: true }).eq("type", "studio").neq("status", "approved"),
  ]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      <AdminSidebar 
        sellerLeadCount={sellerLeads.count || 0} 
        studioLeadCount={studioLeads.count || 0} 
      />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
