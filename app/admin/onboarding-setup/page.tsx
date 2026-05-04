import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminLayoutAccess } from "@/lib/route-guards";
import T from "@/components/t";
import { revalidatePath } from "next/cache";

export default async function OnboardingSetupPage() {
  await requireAdminLayoutAccess();

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <SetupCard type="seller" />
        <SetupCard type="studio" />
      </div>
    </main>
  );
}

async function SetupCard({ type }: { type: 'seller' | 'studio' }) {
  return (
    <div style={{ background: '#111', padding: 32, borderRadius: 24, border: '1px solid #1e1e1e' }}>
      <h2 style={{ fontSize: '1.2rem', marginBottom: 16, textTransform: 'capitalize' }}>{type} Test Account</h2>
      <form action={createTestAction}>
        <input type="hidden" name="type" value={type} />
        <button className="btn btn-primary" style={{ width: '100%', height: 48, fontWeight: 700 }}>
          <T en={`Create ${type} account`} ar={`إنشاء حساب ${type === 'seller' ? 'تاجر' : 'استوديو'}`} />
        </button>
      </form>
    </div>
  );
}

// Server Action
async function createTestAction(formData: FormData) {
  "use server";
  const type = formData.get("type")?.toString();
  const supabase = createAdminClient();
  
  // 1. Find lead
  const { data: lead } = await supabase
    .from("provider_leads")
    .select("*")
    .eq("status", "approved")
    .eq("type", type)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!lead) {
    console.error("No approved lead found for type:", type);
    return;
  }

  const testPassword = "GearBeat2026!";
  const role = type === 'seller' ? 'vendor' : 'owner';

  // 2. Create Auth User
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: lead.email,
    password: testPassword,
    email_confirm: true,
    user_metadata: { full_name: lead.full_name }
  });

  if (authError && !authError.message.includes("already registered")) {
    console.error("Auth error:", authError.message);
    return;
  }

  const userId = authData?.user?.id;

  // 3. Create/Update Profile
  if (userId) {
    await supabase.from("profiles").upsert({
      id: userId,
      full_name: lead.full_name,
      email: lead.email,
      role: role,
      account_status: 'active',
      phone: lead.phone
    });
  }

  console.log(`[SETUP] Account created for ${lead.email} with password ${testPassword}`);
  revalidatePath("/admin/onboarding-setup");
}
