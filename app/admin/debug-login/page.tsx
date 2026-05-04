import { createAdminClient } from "@/lib/supabase/admin";

export default async function DebugLoginPage() {
  // This is a server component, we can run logic here
  const supabase = createAdminClient();
  const email = "ebowman-666@hotmail.com";
  
  // 1. Check Auth User
  const { data: users } = await supabase.auth.admin.listUsers();
  const authUser = users?.users?.find(u => u.email === email);
  
  // 2. Check Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  // 3. Check Lead
  const { data: lead } = await supabase
    .from("provider_leads")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  return (
    <div style={{ padding: 40, background: '#000', color: '#fff', fontSize: '0.8rem' }}>
      <h1>Debug Info for {email}</h1>
      <pre>Auth User: {JSON.stringify(authUser || "NOT FOUND", null, 2)}</pre>
      <hr />
      <pre>Profile: {JSON.stringify(profile || "NOT FOUND", null, 2)}</pre>
      <hr />
      <pre>Lead: {JSON.stringify(lead || "NOT FOUND", null, 2)}</pre>
    </div>
  );
}
