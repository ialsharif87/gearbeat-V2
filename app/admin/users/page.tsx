import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminLayoutAccess } from "@/lib/route-guards";
import T from "@/components/t";
import Link from "next/link";
import { revalidatePath } from "next/cache";

const ALLOWED_PROFILE_ACCOUNT_STATUSES = ["active", "suspended", "pending_deletion", "deleted"] as const;
type ProfileAccountStatus = (typeof ALLOWED_PROFILE_ACCOUNT_STATUSES)[number];

function isAllowedProfileAccountStatus(value: string): value is ProfileAccountStatus {
  return ALLOWED_PROFILE_ACCOUNT_STATUSES.includes(value as ProfileAccountStatus);
}

function warnUserLifecycle(reason: string, details?: unknown) {
  if (!details || typeof details !== "object") {
    console.warn("[admin-users]", reason);
    return;
  }

  const record = details as Record<string, unknown>;
  console.warn("[admin-users]", reason, {
    code: typeof record.code === "string" ? record.code : undefined,
    message: typeof record.message === "string" ? record.message : undefined,
  });
}

export default async function UserManagementPage() {
  const { supabaseAdmin: supabase, user: authUser } = await requireAdminLayoutAccess();

  const { data: currentAdmin } = await supabase
    .from("admin_users")
    .select("admin_role")
    .eq("auth_user_id", authUser.id)
    .maybeSingle();

  const isSuperAdmin = currentAdmin?.admin_role === "super_admin";

  // 2. Fetch all profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, auth_user_id, full_name, email, phone, role, account_status, created_at")
    .order("created_at", { ascending: false });

  if (profilesError) throw profilesError;

  // 3. Fetch all admin users
  const { data: admins } = await supabase
    .from("admin_users")
    .select("auth_user_id, admin_role, status");

  const adminMap = new Map(admins?.map(a => [a.auth_user_id, a]) || []);

  // 4. Calculate Stats
  const stats = {
    total: profiles?.length || 0,
    customers: profiles?.filter(p => p.role === 'customer').length || 0,
    owners: profiles?.filter(p => p.role === 'owner' || p.role === 'studio_owner').length || 0,
    sellers: profiles?.filter(p => p.role === 'vendor').length || 0,
    admins: admins?.length || 0
  };

  // Server Action for Status Update
  async function updateUserStatus(formData: FormData) {
    "use server";
    const targetUserId = String(formData.get("userId"));
    const newStatus = String(formData.get("status"));

    if (!isAllowedProfileAccountStatus(newStatus)) {
      warnUserLifecycle("Blocked invalid profile account status update", {
        code: "invalid_account_status",
      });
      return;
    }
    
    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ account_status: newStatus })
      .eq("auth_user_id", targetUserId);

    if (error) warnUserLifecycle("Status update failed", error);
    revalidatePath("/admin/users");
  }

  // Server Action for soft deletion marker. This does not delete auth users.
  async function deleteUser(formData: FormData) {
    "use server";
    const targetAuthId = String(formData.get("authId"));
    
    const supabaseAdmin = createAdminClient();

    const { data: linkedAdminUser, error: adminLookupError } = await supabaseAdmin
      .from("admin_users")
      .select("id")
      .eq("auth_user_id", targetAuthId)
      .maybeSingle();

    if (adminLookupError) {
      warnUserLifecycle("Admin lookup failed before soft delete", adminLookupError);
      revalidatePath("/admin/users");
      return;
    }

    if (linkedAdminUser) {
      warnUserLifecycle("Blocked admin account soft delete from user management", {
        code: "admin_account_delete_blocked",
      });
      revalidatePath("/admin/users");
      return;
    }
    
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        account_status: "deleted",
        deleted_at: new Date().toISOString(),
        deleted_reason: "Marked deleted from admin user management.",
        updated_at: new Date().toISOString(),
      })
      .eq("auth_user_id", targetAuthId);

    if (error) warnUserLifecycle("Soft delete marker failed", error);
    revalidatePath("/admin/users");
  }

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : "??";
  };

  return (
    <main style={{ background: '#0a0a0a', minHeight: '100vh', padding: '32px', color: 'white' }}>
      {/* HEADER */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0 }}>
          <T en="User Management" ar="إدارة المستخدمين" />
        </h1>
        <p style={{ color: '#888', marginTop: '8px' }}>
          <T en="Control and monitor all platform accounts." ar="التحكم ومراقبة جميع حسابات المنصة." />
        </p>
      </div>

      {/* STATS BAR */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', marginBottom: '40px' }}>
        {[
          { label: "Total", labelAr: "الكل", value: stats.total, color: "#cfa86e" },
          { label: "Customers", labelAr: "العملاء", value: stats.customers, color: "#3b82f6" },
          { label: "Studio Owners", labelAr: "أصحاب الاستديو", value: stats.owners, color: "#eab308" },
          { label: "Sellers", labelAr: "التجار", value: stats.sellers, color: "#a855f7" },
          { label: "Admins", labelAr: "الإدارة", value: stats.admins, color: "#ef4444" },
        ].map(s => (
          <div key={s.label} style={{ background: '#111', border: '1px solid #1e1e1e', padding: '24px', borderRadius: '20px', borderTop: `3px solid ${s.color}` }}>
            <div style={{ color: '#666', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>
              <T en={s.label} ar={s.labelAr} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900 }}>{s.value}</div>
          </div>
        ))}
      </section>

      {/* TABLE SECTION */}
      <section style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '24px', padding: '24px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
             {/* Simple filter UI placeholder as per request */}
             <div style={{ background: '#0a0a0a', padding: '6px', borderRadius: '12px', display: 'flex', gap: '4px' }}>
                {['All', 'Customers', 'Owners', 'Sellers', 'Admins'].map(t => (
                  <button key={t} style={{ border: 'none', background: t === 'All' ? '#cfa86e' : 'transparent', color: t === 'All' ? 'black' : '#666', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                    <T en={t} ar={t === 'All' ? "الكل" : t === 'Customers' ? "العملاء" : t === 'Owners' ? "أصحاب الاستوديو" : t === 'Sellers' ? "التجار" : "الإدارة"} />
                  </button>
                ))}
             </div>
          </div>
          <div>
            <input 
              type="text" 
              placeholder="Search users..." 
              style={{ background: '#0a0a0a', border: '1px solid #222', padding: '12px 20px', borderRadius: '12px', color: 'white', width: '300px' }} 
            />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'start', color: '#666', fontSize: '0.8rem', borderBottom: '1px solid #222' }}>
              <th style={{ padding: '16px' }}><T en="User" ar="المستخدم" /></th>
              <th style={{ padding: '16px' }}><T en="Type" ar="النوع" /></th>
              <th style={{ padding: '16px' }}><T en="Status" ar="الحالة" /></th>
              <th style={{ padding: '16px' }}><T en="Joined" ar="تاريخ الانضمام" /></th>
              <th style={{ padding: '16px' }}><T en="Actions" ar="إجراءات" /></th>
            </tr>
          </thead>
          <tbody>
            {profiles?.map((profile) => {
              const admin = adminMap.get(profile.auth_user_id);
              const role = admin ? admin.admin_role : profile.role;
              
              const roleColors: any = {
                customer: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', label: 'عميل' },
                owner: { bg: 'rgba(207, 168, 110, 0.1)', text: '#cfa86e', label: 'صاحب استوديو' },
                studio_owner: { bg: 'rgba(207, 168, 110, 0.1)', text: '#cfa86e', label: 'صاحب استوديو' },
                vendor: { bg: 'rgba(168, 85, 247, 0.1)', text: '#a855f7', label: 'تاجر' },
                super_admin: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', label: 'سوبر أدمن' },
                staff: { bg: 'rgba(249, 115, 22, 0.1)', text: '#f97316', label: 'موظف' },
              };

              const rStyle = roleColors[role] || { bg: '#222', text: '#888', label: role };

              return (
                <tr key={profile.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', background: '#cfa86e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', color: 'black', fontWeight: 900, fontSize: '0.8rem' }}>
                        {getInitials(profile.full_name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{profile.full_name || "No Name"}</div>
                        <div style={{ fontSize: '0.75rem', color: '#666' }}>{profile.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ background: rStyle.bg, color: rStyle.text, padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                      <T en={role} ar={rStyle.label} />
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '99px', 
                      fontSize: '0.7rem', 
                      fontWeight: 800,
                      background: profile.account_status === 'active' ? 'rgba(34, 197, 94, 0.1)' : profile.account_status === 'suspended' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                      color: profile.account_status === 'active' ? '#22c55e' : profile.account_status === 'suspended' ? '#ef4444' : '#eab308'
                    }}>
                      <T en={profile.account_status} ar={profile.account_status === 'active' ? 'نشط' : profile.account_status === 'suspended' ? 'موقوف' : 'معلق'} />
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: '#888', fontSize: '0.85rem' }}>
                    {new Date(profile.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px' }}>
                    {isSuperAdmin && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <form action={updateUserStatus}>
                          <input type="hidden" name="userId" value={profile.auth_user_id} />
                          <input type="hidden" name="status" value={profile.account_status === 'active' ? 'suspended' : 'active'} />
                          <button type="submit" style={{ background: 'transparent', border: '1px solid #333', color: profile.account_status === 'active' ? '#ef4444' : '#22c55e', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}>
                            {profile.account_status === 'active' ? <T en="Suspend" ar="تعليق" /> : <T en="Activate" ar="تفعيل" />}
                          </button>
                        </form>
                        
                        <form action={deleteUser} onSubmit={(e) => { if(!confirm("هل أنت متأكد؟ لا يمكن التراجع.")) e.preventDefault(); }}>
                          <input type="hidden" name="userId" value={profile.id} />
                          <input type="hidden" name="authId" value={profile.auth_user_id} />
                          <button type="submit" style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}>
                            <T en="Delete" ar="حذف" />
                          </button>
                        </form>
                      </div>
                    )}
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
