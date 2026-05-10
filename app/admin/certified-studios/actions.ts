"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserRole, isAdminRole } from "@/lib/auth-guards";
import { revalidatePath } from "next/cache";

/**
 * Updates the certification status of a studio.
 * Restricted to admins only.
 */
export async function updateCertificationStatusAction(
  certId: string, 
  newStatus: 'pending' | 'approved' | 'rejected' | 'suspended' | 'expired'
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error("Unauthorized");

    const role = await getCurrentUserRole(supabase, user);
    if (!isAdminRole(role)) throw new Error("Forbidden: Admin access required");

    const supabaseAdmin = createAdminClient();

    // 1. Update the status
    const { error: updateError } = await supabaseAdmin
      .from("certified_studios")
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", certId);

    if (updateError) throw updateError;

    // Optional: Log to certification_audit_events if needed
    await supabaseAdmin
      .from("certification_audit_events")
      .insert({
        certified_studio_id: certId,
        event_type: `status_changed_to_${newStatus}`,
        metadata: {
          changed_by: user.id,
          timestamp: new Date().toISOString()
        }
      });

    revalidatePath("/admin/certified-studios");
    return { success: true };
  } catch (error: any) {
    console.error("Update Certification Status Error:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}
