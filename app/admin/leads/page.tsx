import { requireAdminLayoutAccess } from "@/lib/route-guards";
import T from "@/components/t";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

interface LeadsPageParams {
  type?: string;
  tab?: string;
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams?: Promise<LeadsPageParams>;
}) {
  const { supabaseAdmin, user: adminUserAuth } = await requireAdminLayoutAccess();
  const params = (await searchParams) || {};
  
  // Tab-based architecture (Sellers vs Studios)
  const activeTab = params.type || "seller";

  // Fetch admin role for permissions
  const { data: adminData } = await supabaseAdmin
    .from("admin_users")
    .select("admin_role")
    .eq("auth_user_id", adminUserAuth.id)
    .maybeSingle();

  const isSuperAdmin = adminData?.admin_role === "super_admin";

  // Fetch all pending leads
  const { data: leads } = await supabaseAdmin
    .from("provider_leads")
    .select("*")
    .order("created_at", { ascending: false });

  const filteredLeads = (leads || []).filter(l => l.type === activeTab);

  const stats = {
    sellers: (leads || []).filter(l => l.type === 'seller' && l.status !== 'approved').length,
    studios: (leads || []).filter(l => l.type === 'studio' && l.status !== 'approved').length,
  };

  return (
    <main style={{ padding: 32, background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <div style={{ marginBottom: 32 }}>
        <Link href="/admin" style={{ color: '#888', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}>
          ← <T en="Back to Admin" ar="رجوع للإدارة" />
        </Link>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginTop: 12, marginBottom: 8 }}>
          <T en="Onboarding Leads" ar="طلبات الانضمام" />
        </h1>
        <p style={{ color: '#666', fontSize: '1rem' }}>
          <T en="Review and approve new sellers and music studios." ar="مراجعة واعتماد طلبات الموردين والاستوديوهات الجديدة." />
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 32, borderBottom: '1px solid #1a1a1a', marginBottom: 32 }}>
        <TabLink 
          type="seller" 
          active={activeTab === 'seller'} 
          count={stats.sellers}
          labelEn="Marketplace Sellers" 
          labelAr="تجار المتجر" 
        />
        <TabLink 
          type="studio" 
          active={activeTab === 'studio'} 
          count={stats.studios}
          labelEn="Music Studios" 
          labelAr="استوديوهات الموسيقى" 
        />
      </div>

      {/* Leads Table */}
      <div style={{ background: '#111', borderRadius: 24, border: '1px solid #1e1e1e', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #1e1e1e' }}>
              <th style={thStyle}><T en="Provider" ar="المزود" /></th>
              <th style={thStyle}><T en="Type" ar="النوع" /></th>
              <th style={thStyle}><T en="Status" ar="الحالة" /></th>
              <th style={thStyle}><T en="Applied" ar="تاريخ الطلب" /></th>
              <th style={thStyle}><T en="Actions" ar="إجراءات" /></th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <LeadRow key={lead.id} lead={lead} isSuperAdmin={isSuperAdmin} />
            ))}
          </tbody>
        </table>
        {filteredLeads.length === 0 && (
          <div style={{ padding: 80, textAlign: 'center', color: '#555' }}>
            <T en="No pending applications found." ar="لا توجد طلبات انضمام معلقة." />
          </div>
        )}
      </div>
    </main>
  );
}

function TabLink({ type, active, count, labelEn, labelAr }: { type: string, active: boolean, count: number, labelEn: string, labelAr: string }) {
  return (
    <Link 
      href={`/admin/leads?type=${type}`} 
      style={{ 
        padding: '16px 0', 
        fontSize: '1.05rem', 
        fontWeight: active ? 700 : 400, 
        color: active ? '#fff' : '#666', 
        textDecoration: 'none', 
        borderBottom: `2px solid ${active ? '#cfa86e' : 'transparent'}`,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        transition: 'all 0.2s'
      }}
    >
      <T en={labelEn} ar={labelAr} />
      {count > 0 && (
        <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: 20 }}>
          {count}
        </span>
      )}
    </Link>
  );
}

function LeadRow({ lead, isSuperAdmin }: { lead: any, isSuperAdmin: boolean }) {
  const isApproved = lead.status === 'approved';
  
  return (
    <tr style={{ borderBottom: '1px solid #1a1a1a', transition: 'background 0.2s' }}>
      <td style={tdStyle}>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>{lead.full_name}</div>
        <div style={{ fontSize: '0.8rem', color: '#666' }}>{lead.email} • {lead.phone}</div>
      </td>
      <td style={tdStyle}>
        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: lead.type === 'seller' ? '#cfa86e' : '#3b82f6', textTransform: 'uppercase' }}>
          {lead.type}
        </span>
      </td>
      <td style={tdStyle}>
        <span style={{ 
          padding: '4px 12px', 
          borderRadius: 8, 
          fontSize: '0.7rem', 
          fontWeight: 800, 
          background: isApproved ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
          color: isApproved ? '#22c55e' : '#eab308'
        }}>
          {lead.status?.toUpperCase()}
        </span>
      </td>
      <td style={tdStyle}>
        <div style={{ fontSize: '0.85rem' }}>{new Date(lead.created_at).toLocaleDateString()}</div>
      </td>
      <td style={tdStyle}>
        <div style={{ display: 'flex', gap: 10 }}>
          {isSuperAdmin && !isApproved && (
            <form action={approveLeadAction}>
              <input type="hidden" name="id" value={lead.id} />
              <button style={{ background: '#cfa86e', color: '#000', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                <T en="Approve" ar="اعتماد" />
              </button>
            </form>
          )}
        </div>
      </td>
    </tr>
  );
}

const thStyle: React.CSSProperties = { padding: '20px 24px', fontSize: '0.8rem', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' };
const tdStyle: React.CSSProperties = { padding: '20px 24px' };

async function approveLeadAction(formData: FormData) {
  "use server";
  const id = formData.get("id")?.toString();
  const supabaseAdmin = createAdminClient();
  await supabaseAdmin.from("provider_leads").update({ status: 'approved' }).eq("id", id);
  revalidatePath("/admin/leads");
}
