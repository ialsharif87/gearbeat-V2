import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

export async function getCurrentAdmin() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      admin: null
    };
  }

  const { data: admin } = await supabase
    .from("admin_users")
    .select("id,auth_user_id,email,full_name,admin_role,status")
    .eq("auth_user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  return {
    user,
    admin
  };
}

export async function requireAdmin() {
  const { user, admin } = await getCurrentAdmin();

  if (!user) {
    redirect("/login");
  }

  if (!admin) {
    redirect("/");
  }

  return {
    user,
    admin
  };
}

export async function requireSuperAdmin() {
  const { user, admin } = await requireAdmin();

  if (admin.admin_role !== "super_admin") {
    redirect("/admin");
  }

  return {
    user,
    admin
  };
}
