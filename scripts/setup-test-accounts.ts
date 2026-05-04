import { createAdminClient } from "./lib/supabase/admin";

async function setupTestAccounts() {
  const supabase = createAdminClient();
  
  // 1. Get 2 approved leads
  const { data: leads, error: leadsError } = await supabase
    .from("provider_leads")
    .select("*")
    .eq("status", "approved")
    .limit(5);

  if (leadsError || !leads) {
    console.error("Error fetching leads:", leadsError);
    return;
  }

  const sellerLead = leads.find(l => l.type === 'seller');
  const studioLead = leads.find(l => l.type === 'studio');

  const testPassword = "GearBeat2026!";

  console.log("--- TEST ACCOUNTS SETUP ---");

  if (sellerLead) {
    await createAccount(supabase, sellerLead, 'vendor', testPassword);
  } else {
    console.log("No approved SELLER lead found. Please approve one first.");
  }

  if (studioLead) {
    await createAccount(supabase, studioLead, 'owner', testPassword);
  } else {
    console.log("No approved STUDIO lead found. Please approve one first.");
  }
}

async function createAccount(supabase: any, lead: any, role: string, password: string) {
  // Create Auth User
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: lead.email,
    password: password,
    email_confirm: true,
    user_metadata: { full_name: lead.full_name }
  });

  if (authError) {
    if (authError.message.includes("already registered")) {
      console.log(`[EXISTING] ${lead.type.toUpperCase()}: ${lead.email} is already registered.`);
    } else {
      console.error(`Error creating auth user for ${lead.email}:`, authError.message);
    }
    return;
  }

  const userId = authData.user.id;

  // Create Profile
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    full_name: lead.full_name,
    email: lead.email,
    role: role,
    account_status: 'active', // So they can log in
    phone: lead.phone
  });

  if (profileError) {
    console.error(`Error creating profile for ${lead.email}:`, profileError.message);
    return;
  }

  console.log(`[SUCCESS] ${lead.type.toUpperCase()} Account Ready:`);
  console.log(`Email: ${lead.email}`);
  console.log(`Password: ${password}`);
  console.log(`Login at: /portal/login`);
  console.log(`--------------------------`);
}

setupTestAccounts();
