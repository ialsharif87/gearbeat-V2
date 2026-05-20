import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

type AuthUser = {
  id: string;
  email?: string | null;
  phone?: string | null;
  email_confirmed_at?: string | null;
  phone_confirmed_at?: string | null;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
};

type EnsureCustomerProfileResult =
  | { ok: true; status: "created" | "exists" | "updated" }
  | { ok: false; reason: string };

function readMetadataString(
  metadata: Record<string, unknown> | undefined,
  keys: string[]
) {
  for (const key of keys) {
    const value = metadata?.[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function normalizeRole(value: string) {
  return value.trim().toLowerCase();
}

function getCustomerMetadata(user: AuthUser) {
  const userMetadata = user.user_metadata || {};
  const appMetadata = user.app_metadata || {};

  const role = normalizeRole(
    readMetadataString(appMetadata, ["role", "account_type"]) ||
      readMetadataString(userMetadata, ["role", "account_type"]) ||
      "customer"
  );

  const fullName = readMetadataString(userMetadata, ["full_name", "name"]);
  const phone =
    readMetadataString(userMetadata, [
      "phone_e164",
      "phone",
      "phone_number",
      "mobile",
      "mobile_number",
    ]) || user.phone || "";
  const countryCode = readMetadataString(userMetadata, ["country_code"]) || "SA";
  const phoneCountryCode = readMetadataString(userMetadata, ["phone_country_code"]);
  const preferredCurrency =
    readMetadataString(userMetadata, ["preferred_currency"]) || "SAR";
  const preferredLanguage =
    readMetadataString(userMetadata, ["preferred_language"]) || "ar";

  return {
    role,
    fullName,
    phone,
    countryCode,
    phoneCountryCode,
    preferredCurrency,
    preferredLanguage,
  };
}

export async function ensureCustomerProfileForUser(
  user: AuthUser
): Promise<EnsureCustomerProfileResult> {
  if (!user.id) {
    return { ok: false, reason: "missing_user" };
  }

  const supabaseAdmin = createAdminClient();

  const [{ data: adminUser }, { data: vendorProfile }, { data: profile, error }] =
    await Promise.all([
      supabaseAdmin
        .from("admin_users")
        .select("id")
        .eq("auth_user_id", user.id)
        .eq("status", "active")
        .maybeSingle(),
      supabaseAdmin.from("vendor_profiles").select("id").eq("id", user.id).maybeSingle(),
      supabaseAdmin
        .from("profiles")
        .select("id, auth_user_id, role")
        .or(`auth_user_id.eq.${user.id},id.eq.${user.id}`)
        .limit(1)
        .maybeSingle(),
    ]);

  if (error) {
    console.warn("Customer profile lookup failed", { message: error.message });
    return { ok: false, reason: "profile_lookup_failed" };
  }

  if (adminUser || vendorProfile) {
    return { ok: false, reason: "not_customer_account" };
  }

  const metadata = getCustomerMetadata(user);

  if (metadata.role !== "customer" && metadata.role !== "user") {
    return { ok: false, reason: "not_customer_role" };
  }

  if (profile) {
    if (profile.role === "customer" || profile.role === "user") {
      return { ok: true, status: "exists" };
    }

    return { ok: false, reason: "existing_profile_not_customer" };
  }

  if (!user.email) {
    return { ok: false, reason: "missing_email" };
  }

  if (metadata.fullName.length < 2) {
    return { ok: false, reason: "missing_full_name" };
  }

  if (metadata.phone.length < 8) {
    return { ok: false, reason: "missing_phone" };
  }

  const { error: upsertError } = await supabaseAdmin.from("profiles").upsert(
    {
      id: user.id,
      auth_user_id: user.id,
      email: user.email,
      full_name: metadata.fullName,
      phone: metadata.phone,
      country_code: metadata.countryCode,
      phone_country_code: metadata.phoneCountryCode || null,
      phone_e164: metadata.phone,
      role: "customer",
      account_status: "active",
      email_verified: Boolean(user.email_confirmed_at),
      phone_verified: Boolean(user.phone_confirmed_at),
      preferred_currency: metadata.preferredCurrency,
      preferred_language: metadata.preferredLanguage,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "auth_user_id",
    }
  );

  if (upsertError) {
    console.warn("Customer profile auto-repair failed", {
      message: upsertError.message,
    });
    return { ok: false, reason: "profile_upsert_failed" };
  }

  return { ok: true, status: "created" };
}
