import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const getSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      profile: null,
      adminUser: null,
      vendorProfile: null,
    };
  }

  const supabaseAdmin = createAdminClient();

  const [{ data: adminUser }, { data: profile }, { data: vendorProfile }] = await Promise.all([
    supabaseAdmin
      .from("admin_users")
      .select("*")
      .eq("auth_user_id", user.id)
      .eq("status", "active")
      .maybeSingle(),
    supabaseAdmin.from("profiles").select("*").eq("auth_user_id", user.id).maybeSingle(),
    supabaseAdmin.from("vendor_profiles").select("*").eq("id", user.id).maybeSingle(),
  ]);

  return {
    user,
    profile,
    adminUser,
    vendorProfile,
  };
});
