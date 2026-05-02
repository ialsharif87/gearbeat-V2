import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

export default async function PortalHubPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login");
  }

  // Fetch profile to get role and generic account status
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, account_status")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/portal/login");
  }

  const role = profile.role;
  const profileStatus = profile.account_status;

  // Check if role is vendor to also check vendor_profiles status
  if (role === "vendor") {
    const { data: vendorProfile } = await supabase
      .from("vendor_profiles")
      .select("status")
      .eq("id", user.id)
      .maybeSingle();

    const vendorStatus = vendorProfile?.status;

    if (vendorStatus === "pending" || vendorStatus === "under_review") {
      redirect("/portal/pending");
    }

    if (vendorStatus === "rejected") {
      // For now, redirect to pending or a forbidden page?
      // Instructions only mention pending/under_review -> /portal/pending
      redirect("/portal/pending");
    }

    redirect("/portal/store");
  }

  if (role === "owner" || role === "studio_owner") {
    if (profileStatus === "pending" || profileStatus === "under_review") {
      redirect("/portal/pending");
    }

    redirect("/portal/studio");
  }

  // If no matching role: redirect to /portal/login
  redirect("/portal/login");
}
