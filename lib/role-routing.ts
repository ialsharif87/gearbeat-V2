/**
 * Client-safe dashboard routing logic.
 * This file must NOT import any server-side modules (supabase/admin, cookies, etc.).
 */

export function dashboardPathForRole(role: string | null | undefined): string {
  if (!role) return "/customer";

  // Admin roles
  if (role === "admin" || role === "super_admin") {
    return "/admin";
  }

  // Owner roles (Patch 24 canonical: studio_owner)
  if (role === "owner" || role === "studio_owner") {
    return "/portal/studio";
  }

  // Vendor roles (Patch 25 canonical: vendor)
  if (role === "vendor" || role === "seller") {
    return "/portal/store";
  }

  // Customer roles
  if (role === "customer" || role === "user") {
    return "/customer";
  }

  // Safe default
  return "/customer";
}
