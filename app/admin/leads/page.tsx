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

  // Fetch all pending leads (Sellers)
  const { data: leads } = await supabaseAdmin
    .from("provider_leads")
    .select("*")
    .eq("type", "seller")
    .order("created_at", { ascending: false });

  // Fetch all studio applications
  const { data: studioApps } = await supabaseAdmin
    .from("studio_applications")
    .select("*")
    .order("created_at", { ascending: false });

  const stats = {
    sellers: (leads || []).filter(l => l.status !== 'approved').length,
    studios: (studioApps || []).filter(sa => sa.status !== 'approved').length,
  };

  const tableData = activeTab === 'seller' ? (leads || []) : (studioApps || []);

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
              const tableData = activeTab === 'seller' ? (leads || []) : (studioApps || []);

              return tableData.length > 0 ? tableData.map((item: any) => {
                const isStudio = activeTab === 'studio';
                const name = isStudio ? (item.company_name_en || item.full_name) : (item.business_name || item.full_name);
                const email = item.email;
                const status = item.status || 'pending';
                const date = new Date(item.created_at).toLocaleDateString();
                const updatedDate = item.updated_at ? new Date(item.updated_at).toLocaleDateString() : date;
                const id = item.id;
                
                const isWaitingFinal = isStudio && item.contract_url && !item.final_approved_at;
                const detailLink = `/admin/leads/${id}`;

                return (
                  <tr key={id} style={{ borderBottom: '1px solid #1a1a1a', background: isWaitingFinal ? 'rgba(212, 175, 55, 0.05)' : 'transparent' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <Link href={detailLink} style={{ color: '#cfa86e', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                        {name}
                        {isWaitingFinal && (
                          <span style={{ background: '#D4AF37', color: '#000', fontSize: '0.6rem', padding: '2px 8px', borderRadius: 4, fontWeight: 900 }}>
                            SIGNED
                          </span>
                        )}
                      </Link>
                    </td>
                    <td style={{ padding: '20px 24px', color: '#666' }}>{email}</td>
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{ 
                        padding: '4px 12px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 800,
                        background: status === 'approved' ? '#22c55e22' : '#eab30822',
                        color: status === 'approved' ? '#22c55e' : '#eab308'
                      }}>
                        {status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px', color: '#444', fontSize: '0.9rem' }}>{date}</td>
                    <td style={{ padding: '20px 24px', color: '#444', fontSize: '0.9rem' }}>{updatedDate}</td>
                  </tr>
                );
              }) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '60px', color: '#333' }}>
                  <T en="No applications found." ar="لا توجد طلبات." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
