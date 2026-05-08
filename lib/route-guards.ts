import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";
import { dashboardPathForRole } from "./role-routing";
import { isOwnerRole, isCustomerRole, isAdminRole, GearBeatRole } from "./auth-guards";

type ProfileRow = {
  id: string;
  auth_user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: string | null;
  account_status: string | null;
};

type AdminUserRow = {
  id: string;
  auth_user_id: string;
  email: string | null;
  admin_role: string;
  status: string;
};

const ALL_ADMIN_ROLES = [
  "super_admin",
  "operations",
  "support",
  "content",
  "sales",
  "finance"
];

async function getProtectedContext(loginPath: string) {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(loginPath);
  }

  const [adminResult, profileResult] = await Promise.all([
    supabaseAdmin
      .from("admin_users")
      .select("id, auth_user_id, email, admin_role, status")
      .eq("auth_user_id", user.id)
      .eq("status", "active")
      .maybeSingle(),

    supabaseAdmin
      .from("profiles")
      .select("id, auth_user_id, email, full_name, phone, role, account_status")
      .eq("id", user.id)
      .maybeSingle()
  ]);

  if (profileResult.error) {
    throw new Error(profileResult.error.message);
  }

  return {
    supabase,
    supabaseAdmin,
    user,
    adminUser: (adminResult.data || null) as AdminUserRow | null,
    profile: (profileResult.data || null) as ProfileRow | null
  };
}

function requireActiveProfile(profile: ProfileRow | null, loginPath: string) {
  if (!profile) {
    redirect(loginPath);
  }

  if (profile.account_status === "deleted") {
    redirect("/forbidden");
  }

  if (profile.account_status === "pending_deletion") {
    redirect("/account/delete");
  }

  if (profile.account_status && profile.account_status !== "active") {
    redirect(loginPath);
  }

  return profile;
}

export async function requireCustomerLayoutAccess() {
  const context = await getProtectedContext("/login");

  if (context.adminUser) {
    redirect(dashboardPathForRole("admin"));
  }

  const profile = requireActiveProfile(context.profile, "/login");

  if (profile.role === "admin") {
    redirect("/admin");
  }

  if (profile.role === "owner") {
    redirect("/portal/studio");
  }

  if (profile.role !== "customer") {
    redirect("/forbidden");
  }

  return {
    ...context,
    profile
  };
}

export async function requireOwnerLayoutAccess() {
  const context = await getProtectedContext("/portal/login");

  if (context.adminUser) {
    redirect(dashboardPathForRole("admin"));
  }

  const profile = requireActiveProfile(context.profile, "/portal/login");

  const role = profile.role as GearBeatRole;

  if (isAdminRole(role)) {
    redirect(dashboardPathForRole(role));
  }

  if (isCustomerRole(role)) {
    redirect(dashboardPathForRole(role));
  }

  if (!isOwnerRole(role)) {
    redirect("/forbidden");
  }

  return {
    ...context,
    profile
  };
}

export async function requireAdminLayoutAccess(
  allowedRoles: string[] = ALL_ADMIN_ROLES
) {
  const context = await getProtectedContext("/staff-access");

  if (!context.adminUser) {
    const role = context.profile?.role as GearBeatRole;
    
    if (role) {
      redirect(dashboardPathForRole(role));
    }

    redirect("/staff-access");
  }

  if (context.adminUser.admin_role !== "super_admin" && !allowedRoles.includes(context.adminUser.admin_role)) {
    redirect("/forbidden");
  }

  return {
    ...context,
    adminUser: context.adminUser
  };
}

export async function requireVendorLayoutAccess() {
  const context = await getProtectedContext("/portal/login");

  if (context.adminUser) {
    redirect(dashboardPathForRole("admin"));
  }

  const profile = requireActiveProfile(context.profile, "/portal/login");

  // Vendors are tracked in vendor_profiles, not in profile.role necessarily
  const { data: vendorProfile } = await context.supabaseAdmin
    .from("vendor_profiles")
    .select("id, status")
    .eq("id", context.user.id)
    .maybeSingle();

  if (!vendorProfile) {
    redirect("/portal/store/onboarding");
  }

  if (vendorProfile.status === "pending" || vendorProfile.status === "rejected") {
    redirect("/vendor-pending");
  }

  return {
    ...context,
    profile,
    vendorProfile
  };
}
