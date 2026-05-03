import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PortalSidebar from "@/components/portal-sidebar";

export default async function StorePortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, account_status")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!profile) redirect("/portal/login");
  if (profile.account_status !== "active") redirect("/portal/pending");
  if (profile.role !== "vendor") redirect("/portal/login");

  return (
    <div className="portal-layout">
      <PortalSidebar role="vendor" />
      <main className="portal-main">{children}</main>
    </div>
  );
}
