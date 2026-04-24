import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

export type AppRole = "customer" | "owner" | "admin";

export function getDashboardPath(role?: string | null) {
  if (role === "admin") return "/admin";
  if (role === "owner") return "/owner";
  return "/customer";
}

export async function getCurrentProfile() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  return { user, profile };
}

export async function requireRole(role: AppRole) {
  const { user, profile } = await getCurrentProfile();

  if (!user) {
    redirect("/login");
  }

  if (!profile) {
    redirect("/forbidden");
  }

  if (profile.role !== role) {
    redirect(getDashboardPath(profile.role));
  }

  return { user, profile };
}
