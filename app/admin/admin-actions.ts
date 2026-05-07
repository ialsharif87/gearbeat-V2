"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function publishStudioOverride(studioId: string) {
  const supabaseAdmin = createAdminClient();
  
  const { error } = await supabaseAdmin
    .from("studios")
    .update({
      status: "approved",
      verified: true,
      booking_enabled: true,
      // We don't change completion_score, we just override the publication status
    })
    .eq("id", studioId);

  if (error) throw error;
  
  revalidatePath("/admin/studios");
  revalidatePath("/studios");
  return { success: true };
}
