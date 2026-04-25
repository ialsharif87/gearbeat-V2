"use client";

import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import T from "./t";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button className="btn btn-secondary btn-small" type="button" onClick={handleLogout}>
      <T en="Logout" ar="تسجيل الخروج" />
    </button>
  );
}
