import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import T from "../../components/t";

export default async function PortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login");
  }

  // Fetch the user's role from the profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role;

  // If role is not "owner", "studio_owner", or "vendor": redirect to /portal/login
  if (role !== "owner" && role !== "studio_owner" && role !== "vendor") {
    // Optional: Sign out if they have a session but wrong role? 
    // The instructions just say redirect.
    redirect("/portal/login");
  }

  return <div className="portal-root">{children}</div>;
}
