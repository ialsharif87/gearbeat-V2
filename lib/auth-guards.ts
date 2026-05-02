import { redirect } from "next/navigation";

export type DbRow = Record<string, unknown>;

export type GearBeatRole =
  | "admin"
  | "super_admin"
  | "owner"
  | "studio_owner"
  | "vendor"
  | "seller"
  | "customer"
  | "user"
  | "";

type SupabaseLikeClient = any;

export function readText(
  row: DbRow | null | undefined,
  keys: string[],
  fallback = ""
) {
  if (!row) return fallback;

  for (const key of keys) {
    const value = row[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }

    if (typeof value === "number") {
      return String(value);
    }

    if (typeof value === "boolean") {
      return String(value);
    }
  }

  return fallback;
}

export function readNumber(
  row: DbRow | null | undefined,
  keys: string[],
  fallback = 0
) {
  if (!row) return fallback;

  for (const key of keys) {
    const value = row[key];

    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);

      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  return fallback;
}

export function normalizeRole(value: unknown): GearBeatRole {
  if (typeof value !== "string") return "";

  const role = value.trim().toLowerCase();

  if (
    role === "admin" ||
    role === "super_admin" ||
    role === "owner" ||
    role === "studio_owner" ||
    role === "vendor" ||
    role === "seller" ||
    role === "customer" ||
    role === "user"
  ) {
    return role;
  }

  return "";
}

export function roleFromMetadata(
  appMetadata?: Record<string, unknown>,
  userMetadata?: Record<string, unknown>
): GearBeatRole {
  const appRole = normalizeRole(appMetadata?.role);

  if (appRole) {
    return appRole;
  }

  const userRole = normalizeRole(userMetadata?.role);

  if (userRole) {
    return userRole;
  }

  const appAccountType = normalizeRole(appMetadata?.account_type);

  if (appAccountType) {
    return appAccountType;
  }

  const userAccountType = normalizeRole(userMetadata?.account_type);

  if (userAccountType) {
    return userAccountType;
  }

  return "";
}

export async function getCurrentUserOrRedirect(
  supabase: SupabaseLikeClient,
  redirectTo = "/login"
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(redirectTo);
  }

  return user as {
    id: string;
    email?: string;
    app_metadata?: Record<string, unknown>;
    user_metadata?: Record<string, unknown>;
  };
}

export async function getProfileRole(
  supabase: SupabaseLikeClient,
  userId: string
): Promise<GearBeatRole> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  const profile = (data || null) as DbRow | null;

  return normalizeRole(
    readText(profile, ["role", "user_role", "account_type", "type"])
  );
}

export async function getCurrentUserRole(
  supabase: SupabaseLikeClient,
  user: {
    id: string;
    email?: string;
    app_metadata?: Record<string, unknown>;
    user_metadata?: Record<string, unknown>;
  }
): Promise<GearBeatRole> {
  const metadataRole = roleFromMetadata(user.app_metadata, user.user_metadata);

  if (metadataRole) {
    return metadataRole;
  }

  return getProfileRole(supabase, user.id);
}

export function isAdminRole(role: GearBeatRole) {
  return role === "admin" || role === "super_admin";
}

export function isOwnerRole(role: GearBeatRole) {
  return role === "owner" || role === "studio_owner";
}

export function isVendorRole(role: GearBeatRole) {
  return role === "vendor" || role === "seller";
}

export function isCustomerRole(role: GearBeatRole) {
  return role === "customer" || role === "user" || role === "";
}

export async function requireAdminOrRedirect(
  supabase: SupabaseLikeClient,
  redirectTo = "/"
) {
  const user = await getCurrentUserOrRedirect(supabase);
  const role = await getCurrentUserRole(supabase, user);

  if (!isAdminRole(role)) {
    redirect(redirectTo);
  }

  return {
    user,
    role,
  };
}

export async function requireOwnerOrRedirect(
  supabase: SupabaseLikeClient,
  redirectTo = "/"
) {
  const user = await getCurrentUserOrRedirect(supabase);
  const role = await getCurrentUserRole(supabase, user);

  if (!isOwnerRole(role) && !isAdminRole(role)) {
    redirect(redirectTo);
  }

  return {
    user,
    role,
  };
}

export async function requireVendorOrRedirect(
  supabase: SupabaseLikeClient,
  redirectTo = "/"
) {
  const user = await getCurrentUserOrRedirect(supabase);
  const role = await getCurrentUserRole(supabase, user);

  if (!isVendorRole(role) && !isAdminRole(role)) {
    redirect(redirectTo);
  }

  return {
    user,
    role,
  };
}

export async function requireCustomerOrRedirect(
  supabase: SupabaseLikeClient,
  redirectTo = "/login"
) {
  const user = await getCurrentUserOrRedirect(supabase, redirectTo);
  const role = await getCurrentUserRole(supabase, user);

  return {
    user,
    role,
  };
}

export function dashboardPathForRole(role: GearBeatRole) {
  if (isAdminRole(role)) return "/admin";
  if (isOwnerRole(role)) return "/owner";
  if (isVendorRole(role)) return "/vendor";

  return "/customer";
}
