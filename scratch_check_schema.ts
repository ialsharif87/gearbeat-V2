import { createAdminClient } from "./lib/supabase/admin";

async function checkSchema() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('provider_leads').select('*').limit(1);
  if (error) console.error(error);
  else console.log(Object.keys(data[0] || {}));
}

checkSchema();
