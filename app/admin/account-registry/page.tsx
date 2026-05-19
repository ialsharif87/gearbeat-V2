import { requireAdminLayoutAccess } from "@/lib/route-guards";
import T from "@/components/t";
import Link from "next/link";

export default async function AccountRegistryPage() {
  const { supabaseAdmin: supabase } = await requireAdminLayoutAccess();

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, auth_user_id, full_name, email, phone, role, account_status, created_at")
    .order("created_at", { ascending: false });

  if (profilesError) throw profilesError;

  return (
    <main style={{ background: '#0a0a0a', minHeight: '100vh', padding: '32px', color: 'white' }}>
      {/* HEADER */}
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, color: 'white', letterSpacing: '-1px' }}>
            <T en="Account Registry" ar="سجل الحسابات" />
          </h1>
          <p style={{ color: '#888', marginTop: '8px' }}>
            <T en="Safe audit and synchronization registry of all user account types." ar="سجل التدقيق الآمن والمزامنة لجميع أنواع حسابات المستخدمين." />
          </p>
        </div>
        <Link href="/admin/users" className="gb-button gb-button-outline" style={{ textDecoration: 'none' }}>
          <T en="User Management" ar="إدارة المستخدمين" />
        </Link>
      </div>

      {/* SECURITY ARCHITECTURE WARNING/EXPLANATION */}
      <section style={{ 
        background: 'rgba(212, 175, 55, 0.03)', 
        border: '1px solid rgba(212, 175, 55, 0.2)', 
        padding: '28px', 
        borderRadius: '24px', 
        marginBottom: '40px',
        lineHeight: '1.6'
      }}>
        <h2 style={{ color: 'var(--gb-gold)', fontSize: '1.25rem', fontWeight: 800, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🛡️ <T en="Auth Security Boundary Audit" ar="تدقيق حدود أمان المصادقة" />
        </h2>
        <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.85)' }}>
          <T 
            en="To prevent privilege escalation and protect sensitive user credentials, direct reads or writes to the auth.users table are strictly forbidden from client-side environments. Below is our dual-tier account architecture status:"
            ar="لمنع تصعيد الصلاحيات وحماية بيانات اعتماد المستخدم الحساسة، يُمنع تمامًا القراءة أو الكتابة المباشرة لجدول auth.users من بيئات العميل. أدناه حالة بنية الحسابات ثنائية الطبقة:"
          />
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <strong style={{ display: 'block', color: 'white', marginBottom: '8px', fontSize: '0.95rem' }}>
              🔒 1. Auth Database (auth.users)
            </strong>
            <span style={{ fontSize: '0.8rem', color: '#888' }}>
              <T 
                en="Governed by Supabase GoTrue. Contains password hashes, session states, and metadata. Accessible only via secure service-role clients on isolated server environments." 
                ar="مدار بواسطة Supabase GoTrue. يحتوي على هاش كلمة المرور وحالات الجلسات والبيانات الوصفية. يمكن الوصول إليه فقط عبر عملاء service-role الآمنين في بيئات خادم معزولة."
              />
            </span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <strong style={{ display: 'block', color: 'white', marginBottom: '8px', fontSize: '0.95rem' }}>
              🌐 2. Public Profiles (public.profiles)
            </strong>
            <span style={{ fontSize: '0.8rem', color: '#888' }}>
              <T 
                en="The safe, RLS-protected database representation of users. Contains roles (customer, owner, vendor) and status (active, suspended). Client applications safely query this layer." 
                ar="تمثيل المستخدمين الآمن والمحمي بسياسات RLS في قاعدة البيانات. يحتوي على الأدوار والحالة. تقوم تطبيقات العميل بالاستعلام من هذه الطبقة بأمان."
              />
            </span>
          </div>
        </div>
      </section>

      {/* REGISTRY PREVIEW TABLE */}
      <section style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '24px', padding: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 20px 0', color: 'white' }}>
          <T en="Safe Registry Preview" ar="معاينة السجل الآمن" />
        </h3>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'start', color: '#666', fontSize: '0.8rem', borderBottom: '1px solid #222' }}>
              <th style={{ padding: '16px', textAlign: 'left' }}><T en="Profile ID" ar="معرف الملف الشخصي" /></th>
              <th style={{ padding: '16px', textAlign: 'left' }}><T en="Name / Email" ar="الاسم / البريد الإلكتروني" /></th>
              <th style={{ padding: '16px', textAlign: 'left' }}><T en="Role" ar="الدور" /></th>
              <th style={{ padding: '16px', textAlign: 'left' }}><T en="Status" ar="الحالة" /></th>
              <th style={{ padding: '16px', textAlign: 'left' }}><T en="Metadata Access Status" ar="حالة الوصول للبيانات الوصفية" /></th>
            </tr>
          </thead>
          <tbody>
            {profiles?.map((profile) => {
              const roleColors: any = {
                customer: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', label: 'عميل' },
                owner: { bg: 'rgba(207, 168, 110, 0.1)', text: '#cfa86e', label: 'صاحب استوديو' },
                studio_owner: { bg: 'rgba(207, 168, 110, 0.1)', text: '#cfa86e', label: 'صاحب استوديو' },
                vendor: { bg: 'rgba(168, 85, 247, 0.1)', text: '#a855f7', label: 'تاجر' },
                super_admin: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', label: 'سوبر أدمن' },
              };
              const rStyle = roleColors[profile.role || ""] || { bg: '#222', text: '#888', label: profile.role };

              return (
                <tr key={profile.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '16px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#888' }}>
                    {profile.id}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 700, color: 'white' }}>{profile.full_name || "No Name"}</div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>{profile.email}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ background: rStyle.bg, color: rStyle.text, padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                      <T en={profile.role} ar={rStyle.label} />
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '99px', 
                      fontSize: '0.7rem', 
                      fontWeight: 800,
                      background: profile.account_status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: profile.account_status === 'active' ? '#22c55e' : '#ef4444'
                    }}>
                      <T en={profile.account_status} ar={profile.account_status === 'active' ? 'نشط' : 'معلق/موقوف'} />
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: '#888', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#ef4444' }}>●</span> 
                      <T en="Direct Auth.users queries restricted" ar="الاستعلام المباشر من Auth.users مقيد" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </main>
  );
}
