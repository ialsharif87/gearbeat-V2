import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

export type AdminRole =
  | "super_admin"
  | "operations"
  | "support"
  | "finance"
  | "content"
  | "sales";

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

export async function requireAdminRole(allowedRoles: AdminRole[]) {
  const { user, admin } = await requireAdmin();

  const adminRole = admin.admin_role as AdminRole;

  if (adminRole === "super_admin") {
    return {
      user,
      admin
    };
  }

  if (!allowedRoles.includes(adminRole)) {
    redirect("/admin");
  }

  return {
    user,
    admin
  };
}

export function canAccessAdminArea(
  adminRole: string,
  area:
    | "dashboard"
    | "team"
    | "studios"
    | "bookings"
    | "reviews"
    | "review_requests"
    | "finance"
) {
  if (adminRole === "super_admin") return true;

  const permissions: Record<string, string[]> = {
    operations: ["dashboard", "studios", "bookings", "review_requests"],
    support: ["dashboard", "bookings", "reviews", "review_requests"],
    finance: ["dashboard", "bookings", "finance"],
    content: ["dashboard", "studios", "reviews"],
    sales: ["dashboard", "studios"]
  };

  return permissions[adminRole]?.includes(area) || false;
}
