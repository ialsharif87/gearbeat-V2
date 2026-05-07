import { requireAdminLayoutAccess } from "@/lib/route-guards";
import T from "@/components/t";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { giveFinalApproval, approveStudioApplication } from "./actions";

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

  // Fetch all studio applications to join data
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
              <th style={thStyle}><T en="Compliance" ar="الامتثال" /></th>
              <th style={thStyle}><T en="Status" ar="الحالة" /></th>
              <th style={thStyle}><T en="Applied" ar="تاريخ الطلب" /></th>
              <th style={thStyle}><T en="Actions" ar="إجراءات" /></th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => {
              const studioApp = studioApps?.find(sa => sa.email === lead.email);
              return <LeadRow key={lead.id} lead={lead} studioApp={studioApp} isSuperAdmin={isSuperAdmin} />;
            })}
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

function LeadRow({ lead, studioApp, isSuperAdmin }: { lead: any, studioApp: any, isSuperAdmin: boolean }) {
  const isApproved = lead.status === 'approved';
  const hasContract = !!studioApp?.contract_url || !!lead.signed_contract_url;
  const isFinalApproved = !!studioApp?.final_approved_at;
  
  return (
    <tr style={{ borderBottom: '1px solid #1a1a1a', transition: 'background 0.2s' }}>
      <td style={tdStyle}>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>{studioApp?.company_name_en || lead.full_name}</div>
        <div style={{ fontSize: '0.8rem', color: '#666' }}>{lead.email} • {lead.phone}</div>
        {studioApp && (
          <div style={{ fontSize: '0.75rem', color: 'var(--gb-gold)', marginTop: 4 }}>
            CR: {studioApp.commercial_registration} • VAT: {studioApp.vat_number}
          </div>
        )}
      </td>
      <td style={tdStyle}>
        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: lead.type === 'seller' ? '#cfa86e' : '#3b82f6', textTransform: 'uppercase' }}>
          {lead.type}
        </span>
      </td>
      <td style={tdStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {hasContract ? (
            <a href={studioApp?.contract_url || lead.signed_contract_url} target="_blank" style={{ fontSize: '0.7rem', color: '#22c55e', textDecoration: 'underline', fontWeight: 700 }}>
              📄 <T en="Contract Uploaded" ar="تم رفع العقد" />
            </a>
          ) : (
            <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 700 }}><T en="No Contract" ar="لا يوجد عقد" /></span>
          )}
          
          <div style={{ display: 'flex', gap: 6 }}>
            <DocStatusIcon exists={!!studioApp?.cr_document_url} label="CR" />
            <DocStatusIcon exists={!!studioApp?.vat_certificate_url} label="VAT" />
            <DocStatusIcon exists={!!studioApp?.national_address_url} label="ADDR" />
            <DocStatusIcon exists={!!studioApp?.bank_document_url} label="BANK" />
          </div>

          <div style={{ fontSize: '0.7rem', color: '#888' }}>
            <T en="Comm:" ar="العمولة:" /> {studioApp?.commission_rate || lead.commission_percent || 15}%
          </div>
        </div>
      </td>
      <td style={tdStyle}>
        <div style={{ display: "grid", gap: 4 }}>
          <span style={{ 
            padding: '4px 12px', 
            borderRadius: 8, 
            fontSize: '0.7rem', 
            fontWeight: 800, 
            background: isApproved ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
            color: isApproved ? '#22c55e' : '#eab308',
            textAlign: 'center'
          }}>
            {lead.status?.toUpperCase()}
          </span>
          {isFinalApproved && (
            <span style={{ fontSize: '0.65rem', color: '#22c55e', fontWeight: 700, textAlign: 'center' }}>✓ FINAL</span>
          )}
        </div>
      </td>
      <td style={tdStyle}>
        <div style={{ fontSize: '0.85rem' }}>{new Date(lead.created_at).toLocaleDateString()}</div>
      </td>
      <td style={tdStyle}>
        <div style={{ display: 'flex', gap: 10 }}>
          {isSuperAdmin && (
            <>
              {!isApproved ? (
                <form action={approveLeadAction}>
                  <input type="hidden" name="id" value={lead.id} />
                  <input type="hidden" name="type" value={lead.type} />
                  <input type="hidden" name="email" value={lead.email} />
                  <button style={{ background: '#cfa86e', color: '#000', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                    <T en="Approve" ar="اعتماد" />
                  </button>
                </form>
              ) : (
                hasContract && !isFinalApproved && (
                  <form action={finalApproveAction}>
                    <input type="hidden" name="app_id" value={studioApp?.id} />
                    <button style={{ background: '#22c55e', color: '#000', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                      <T en="Final Activate" ar="تنشيط نهائي" />
                    </button>
                  </form>
                )
              )}
              
              <div style={{ display: "flex", gap: 8 }}>
                {studioApp?.cr_document_url && <a href={studioApp.cr_document_url} target="_blank" title="CR" style={{ textDecoration: 'none' }}>📄</a>}
                {studioApp?.vat_certificate_url && <a href={studioApp.vat_certificate_url} target="_blank" title="VAT" style={{ textDecoration: 'none' }}>📜</a>}
              </div>
            </>
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
  const type = formData.get("type")?.toString();
  const email = formData.get("email")?.toString();
  
  const supabaseAdmin = createAdminClient();

  if (type === "studio" && email) {
    // New flow: Use approveStudioApplication from local actions
    const { data: app } = await supabaseAdmin
      .from("studio_applications")
      .select("id")
      .eq("email", email)
      .single();

    if (app) {
      await approveStudioApplication(app.id, 15, 1); // Defaults: 15% comm, 1 studio limit
    }
  }

  // Always update the lead status
  await supabaseAdmin.from("provider_leads").update({ status: 'approved' }).eq("id", id);
  
  revalidatePath("/admin/leads");
}

async function finalApproveAction(formData: FormData) {
  "use server";
  const appId = formData.get("app_id")?.toString();
  if (!appId) return;
  await giveFinalApproval(appId);
  revalidatePath("/admin/leads");
}

function DocStatusIcon({ exists, label }: { exists: boolean, label: string }) {
  return (
    <div 
      title={label}
      style={{ 
        width: 24, 
        height: 24, 
        borderRadius: 6, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: '0.6rem',
        fontWeight: 900,
        background: exists ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)',
        color: exists ? '#22c55e' : '#444',
        border: `1px solid ${exists ? '#22c55e' : '#222'}`
      }}
    >
      {label[0]}
    </div>
  );
}
