import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminLayoutAccess } from "@/lib/route-guards";
import T from "@/components/t";
import { revalidatePath } from "next/cache";
import SetupButton from "./SetupButton";

export const dynamic = "force-dynamic";

export default async function OnboardingSetupPage() {
  const { supabaseAdmin } = await requireAdminLayoutAccess();

  // Fetch recently created profiles with role vendor/owner to show as results
  const { data: recentProfiles } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .in("role", ["vendor", "owner"])
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <main style={{ padding: 40, background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 24 }}>
        <T en="Onboarding Test Setup" ar="إعداد اختبار الربط" />
      </h1>
      
      <p style={{ color: '#888', marginBottom: 40, maxWidth: 600 }}>
        <T 
          en="This tool will create test credentials for the most recently approved leads so you can test the onboarding flow." 
          ar="هذه الأداة ستقوم بإنشاء بيانات دخول تجريبية لآخر الطلبات المعتمدة لتتمكن من اختبار مسار الربط." 
        />
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 60 }}>
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>🏪 Seller Test Account</h2>
          <p style={cardDescStyle}><T en="Creates a vendor account for the last approved seller lead." ar="ينشئ حساب تاجر لآخر طلب تاجر معتمد." /></p>
          <SetupButton type="seller" createAction={createTestAction} />
        </div>
        
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>🎙️ Studio Test Account</h2>
          <p style={cardDescStyle}><T en="Creates an owner account for the last approved studio lead." ar="ينشئ حساب صاحب استوديو لآخر طلب استوديو معتمد." /></p>
          <SetupButton type="studio" createAction={createTestAction} />
        </div>
      </div>

      <div style={{ background: '#1a1100', padding: 32, borderRadius: 24, border: '1px solid #cfa86e', marginBottom: 60, textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 12, color: '#cfa86e' }}>🚀 Super Test Account</h2>
        <p style={{ color: '#888', marginBottom: 24 }}>
          This creates a vendor account: <b>supertest@gearbeat.com</b> / <b>gearbeat123</b>
        </p>
        <SetupButton type="super" createAction={createTestAction} />
      </div>

      {/* Results Section */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: 20, color: '#cfa86e' }}>
        <T en="Recent Test Accounts" ar="الحسابات التجريبية المنشأة حديثاً" />
      </h2>
      <div style={{ background: '#111', borderRadius: 20, border: '1px solid #1e1e1e', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e1e1e', background: 'rgba(255,255,255,0.02)' }}>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Password</th>
              <th style={thStyle}>Created</th>
            </tr>
          </thead>
          <tbody>
            {recentProfiles?.map((p: any) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                <td style={tdStyle}>{p.email}</td>
                <td style={tdStyle}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: p.role === 'vendor' ? '#cfa86e' : '#3b82f6' }}>
                    {p.role?.toUpperCase()}
                  </span>
                </td>
                <td style={tdStyle}><code>GearBeat2026!</code></td>
                <td style={tdStyle}>{new Date(p.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!recentProfiles || recentProfiles.length === 0) && (
          <div style={{ padding: 40, textAlign: 'center', color: '#444' }}>
            <T en="No accounts created yet." ar="لم يتم إنشاء حسابات بعد." />
          </div>
        )}
      </div>
    </main>
  );
}

const cardStyle = { background: '#111', padding: 32, borderRadius: 24, border: '1px solid #1e1e1e' };
const cardTitleStyle = { fontSize: '1.2rem', marginBottom: 12 };
const cardDescStyle = { color: '#666', fontSize: '0.9rem', marginBottom: 24 };
const thStyle = { padding: '16px 24px', fontSize: '0.8rem', color: '#555' };
const tdStyle = { padding: '16px 24px', fontSize: '0.9rem' };

// Server Action
async function createTestAction(formData: FormData) {
  "use server";
  const type = formData.get("type")?.toString();
  const supabase = createAdminClient();
  
  let email = "";
  let fullName = "";
  let role = "";
  let testPassword = "GearBeat2026!";
  let leadId = null;

  if (type === 'super') {
    email = "supertest@gearbeat.com";
    fullName = "Super Test User";
    role = "vendor";
    testPassword = "gearbeat123";
  } else {
    const { data: lead } = await supabase
      .from("provider_leads")
      .select("*")
      .eq("status", "approved")
      .eq("type", type)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!lead) return { error: "No approved lead found." };
    
    email = lead.email;
    fullName = lead.full_name;
    role = type === 'seller' ? 'vendor' : 'owner';
    leadId = lead.id;
  }

  // 2. Create Auth User or get existing
  let userId: string | undefined;
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email,
    password: testPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });

  if (authError) {
    if (authError.message.includes("already registered")) {
      // Find existing user ID and RESET password
      const { data: listUsers } = await supabase.auth.admin.listUsers();
      const existingUser = listUsers?.users?.find(u => u.email === email);
      if (existingUser) {
        userId = existingUser.id;
        // Update password to the test password
        await supabase.auth.admin.updateUserById(userId, { password: testPassword });
      }
    } else {
      return { error: authError.message };
    }
  } else {
    userId = authData?.user?.id;
  }

  if (userId) {
    // Ensure lead exists for super user so contract generation works
    if (type === 'super') {
      await supabase.from("provider_leads").upsert({
        email: email,
        name: fullName,
        business_name: "GearBeat Test Store",
        phone: "+966500000000",
        city: "Riyadh",
        type: "seller",
        status: "approved",
        approved_at: new Date().toISOString()
      }, { onConflict: 'email' });
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: fullName,
      email: email,
      role: role,
      account_status: 'active',
    });
    if (profileError) return { error: `Profile error: ${profileError.message}` };
    
    // If it's a lead, we might want to link it (optional)
  } else {
    return { error: "Could not determine User ID." };
  }

  revalidatePath("/admin/onboarding-setup");
  return { success: true };
}
