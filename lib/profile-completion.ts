import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

function getFullName(user: any, profile: any) {
  return (
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    ""
  );
}

function getPhone(user: any, profile: any) {
  return (
    profile?.phone ||
    user?.phone ||
    user?.user_metadata?.phone ||
    user?.user_metadata?.phone_number ||
    user?.user_metadata?.mobile ||
    user?.user_metadata?.mobile_number ||
    ""
  );
}

function getRole(user: any, profile: any) {
  return profile?.role || user?.user_metadata?.role || "";
}

function getIdentityType(user: any, profile: any) {
  return profile?.identity_type || user?.user_metadata?.identity_type || "";
}

function getIdentityNumber(user: any, profile: any) {
  return (
    profile?.identity_number ||
    user?.user_metadata?.identity_number ||
    ""
  );
}

export function isProfileComplete(user: any, profile: any) {
  const fullName = String(getFullName(user, profile) || "").trim();
  const phone = String(getPhone(user, profile) || "").trim();
  const role = String(getRole(user, profile) || "").trim();
  const identityType = String(getIdentityType(user, profile) || "").trim();
  const identityNumber = String(getIdentityNumber(user, profile) || "").trim();

  const identityLocked =
    Boolean(profile?.identity_locked || user?.user_metadata?.identity_locked) &&
    Boolean(identityType) &&
    Boolean(identityNumber);

  return (
    fullName.length >= 2 &&
    phone.length >= 8 &&
    ["customer", "owner"].includes(role) &&
    ["national_id", "iqama", "passport", "gcc_id"].includes(identityType) &&
    identityNumber.length >= 5 &&
    identityLocked
  );
}

export async function requireCompleteProfile() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id,auth_user_id,email,full_name,phone,role,identity_type,identity_number,identity_locked,identity_created_at,updated_at"
    )
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!isProfileComplete(user, profile)) {
    redirect("/profile?complete=1");
  }

  return {
    user,
    profile
  };
}
