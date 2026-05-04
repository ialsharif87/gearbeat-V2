import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import T from "@/components/t";
import { requireAdminLayoutAccess } from "@/lib/route-guards";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const { supabaseAdmin, user: adminUserAuth } = await requireAdminLayoutAccess();

  // Fetch admin role
  const { data: adminData } = await supabaseAdmin
    .from("admin_users")
    .select("admin_role")
    .eq("auth_user_id", adminUserAuth.id)
    .maybeSingle();

  const isSuperAdmin = adminData?.admin_role === "super_admin";

  // Fetch staff
  const { data: staff } = await supabaseAdmin
    .from("admin_users")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main style={{ padding: 32, background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 40 }}>
        <T en="Platform Settings" ar="إعدادات المنصة" />
      </h1>

      <div style={{ display: 'grid', gap: 40, maxWidth: 1000 }}>
        
        {/* SECTION 1: Commissions */}
        <section style={sectionStyle}>
          <h2 style={h2Style}><T en="Commission Settings" ar="إعدادات العمولات" /></h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}><T en="Default Seller Commission (%)" ar="عمولة التجار الافتراضية (%)" /></label>
              <input className="input" defaultValue="15" />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}><T en="Default Studio Commission (%)" ar="عمولة الاستوديوهات الافتراضية (%)" /></label>
              <input className="input" defaultValue="15" />
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: 140, height: 44, fontSize: '0.9rem' }}><T en="Save Changes" ar="حفظ التغييرات" /></button>
        </section>

        {/* SECTION 2: Platform Info */}
        <section style={sectionStyle}>
          <h2 style={h2Style}><T en="Platform Information" ar="معلومات المنصة" /></h2>
          <div style={{ display: 'grid', gap: 20 }}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}><T en="Platform Name" ar="اسم المنصة" /></label>
              <input className="input" defaultValue="GearBeat" disabled style={{ opacity: 0.5 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}><T en="Support Email" ar="بريد الدعم" /></label>
                <input className="input" defaultValue="support@gearbeat.sa" />
              </div>
              <div style={inputGroupStyle}>
                <label style={labelStyle}><T en="Contact Phone" ar="رقم التواصل" /></label>
                <input className="input" defaultValue="+966 500 000 000" />
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: 140, height: 44, fontSize: '0.9rem' }}><T en="Save Info" ar="حفظ المعلومات" /></button>
          </div>
        </section>

        {/* SECTION 3: Staff Management */}
        <section style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ ...h2Style, margin: 0 }}><T en="Staff Management" ar="إدارة فريق العمل" /></h2>
            {isSuperAdmin && <button className="btn" style={{ background: 'rgba(207,168,110,0.1)', color: '#cfa86e', border: '1px solid #cfa86e', height: 36, padding: '0 16px', fontSize: '0.8rem', borderRadius: 8 }}>+ <T en="Add Staff" ar="إضافة موظف" /></button>}
          </div>
          <div style={{ background: '#0d0d0d', borderRadius: 16, overflow: 'hidden', border: '1px solid #1e1e1e' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left' }}><th style={thStyle}>Staff Member</th><th style={thStyle}>Role</th><th style={thStyle}>Actions</th></tr></thead>
              <tbody>
                {staff?.map(member => (
                  <tr key={member.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600 }}>{member.email?.split('@')[0]}</div>
                      <div style={{ fontSize: '0.75rem', color: '#555' }}>{member.email}</div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: member.admin_role === 'super_admin' ? '#cfa86e' : '#888' }}>{member.admin_role?.toUpperCase()}</span>
                    </td>
                    <td style={tdStyle}>
                      {isSuperAdmin && member.auth_user_id !== adminUserAuth.id && (
                        <button style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}><T en="Deactivate" ar="تعطيل" /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 4: Danger Zone */}
        {isSuperAdmin && (
          <section style={{ ...sectionStyle, border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.02)' }}>
            <h2 style={{ ...h2Style, color: '#ef4444' }}><T en="Danger Zone" ar="منطقة الخطر" /></h2>
            <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: 20 }}><T en="Actions here are irreversible. Please proceed with caution." ar="الإجراءات هنا لا يمكن التراجع عنها. يرجى الحذر." /></p>
            <button className="btn btn-danger" style={{ height: 44, padding: '0 24px', fontSize: '0.9rem' }} onClick={() => alert("This feature is disabled for safety.")}>
              <T en="Clear All Test Data" ar="مسح جميع بيانات الاختبار" />
            </button>
          </section>
        )}
      </div>
    </main>
  );
}

const sectionStyle: React.CSSProperties = { background: '#111', padding: 32, borderRadius: 24, border: '1px solid #1e1e1e' };
const h2Style: React.CSSProperties = { fontSize: '1.1rem', fontWeight: 700, color: '#cfa86e', marginBottom: 24 };
const inputGroupStyle: React.CSSProperties = { display: 'grid', gap: 8 };
const labelStyle: React.CSSProperties = { fontSize: '0.85rem', color: '#888' };
const thStyle: React.CSSProperties = { padding: '16px 24px', fontSize: '0.8rem', color: '#666', fontWeight: 600 };
const tdStyle: React.CSSProperties = { padding: '16px 24px', fontSize: '0.9rem' };
