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

  // Fetch admin role
  const { data: adminData } = await supabaseAdmin
    .from("admin_users")
    .select("admin_role")
    .eq("auth_user_id", adminUserAuth.id)
    .maybeSingle();

  // Fetch all pending leads
  const { data: leads } = await supabaseAdmin
    .from("provider_leads")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch studio applications for extra data
  const { data: studioApps } = await supabaseAdmin
    .from("studio_applications")
    .select("*");

  const filteredLeads = (leads || []).filter(l => l.type === activeTab);

  const stats = {
    sellers: (leads || []).filter(l => l.type === 'seller' && l.status !== 'approved').length,
    studios: (leads || []).filter(l => l.type === 'studio' && l.status !== 'approved').length,
  };

  return (
    <main style={{ padding: 32, background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 8 }}>
          <T en="Onboarding Management" ar="إدارة طلبات الانضمام" />
        </h1>
        <p style={{ color: '#666' }}>
          <T en="Manage and review all incoming provider applications." ar="إدارة ومراجعة كافة طلبات الموردين والاستوديوهات." />
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

      {/* Clean Table */}
      <div style={{ background: '#111', borderRadius: 20, border: '1px solid #1e1e1e', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #1e1e1e' }}>
              <th style={thStyle}><T en="Company Name" ar="اسم الشركة" /></th>
              <th style={thStyle}><T en="Email" ar="البريد الإلكتروني" /></th>
              <th style={thStyle}><T en="Status" ar="الحالة" /></th>
              <th style={thStyle}><T en="Applied Date" ar="تاريخ التقديم" /></th>
              <th style={thStyle}><T en="Last Update" ar="آخر تعديل" /></th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => {
              const studioApp = studioApps?.find(sa => sa.email === lead.email);
              const companyName = studioApp?.company_name_en || lead.full_name;
              const lastUpdate = studioApp?.updated_at || lead.created_at;

              return (
                <tr key={lead.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={tdStyle}>
                    <Link href={`/admin/leads/${lead.id}`} style={{ color: '#cfa86e', fontWeight: 700, textDecoration: 'none', fontSize: '1.05rem' }}>
                      {companyName}
                    </Link>
                  </td>
                  <td style={tdStyle}>{lead.email}</td>
                  <td style={tdStyle}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: 8, 
                      fontSize: '0.7rem', 
                      fontWeight: 800, 
                      background: lead.status === 'approved' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                      color: lead.status === 'approved' ? '#22c55e' : '#eab308'
                    }}>
                      {lead.status?.toUpperCase()}
                    </span>
                  </td>
                  <td style={tdStyle}>{new Date(lead.created_at).toLocaleDateString()}</td>
                  <td style={tdStyle}>{new Date(lastUpdate).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredLeads.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', color: '#444' }}>
            <T en="No applications found." ar="لا توجد طلبات." />
          </div>
        )}
      </div>
    </main>
  );
}

function TabLink({ type, active, count, labelEn, labelAr }: { type: string, active: boolean, count: number, labelEn: string, labelAr: string }) {
  return (
    <Link href={`/admin/leads?type=${type}`} style={{ 
      padding: '16px 0', 
      fontSize: '1rem', 
      fontWeight: active ? 700 : 400, 
      color: active ? '#fff' : '#666', 
      textDecoration: 'none', 
      borderBottom: `2px solid ${active ? '#cfa86e' : 'transparent'}`,
      display: 'flex', gap: 8, alignItems: 'center'
    }}>
      <T en={labelEn} ar={labelAr} />
      {count > 0 && <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: 20 }}>{count}</span>}
    </Link>
  );
}

const thStyle: React.CSSProperties = { padding: '16px 24px', fontSize: '0.8rem', color: '#555', fontWeight: 600, textTransform: 'uppercase' };
const tdStyle: React.CSSProperties = { padding: '16px 24px', fontSize: '0.9rem' };
