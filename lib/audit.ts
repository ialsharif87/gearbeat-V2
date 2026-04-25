import { createAdminClient } from "./supabase/admin";

type AuditLogInput = {
  actorAuthUserId?: string | null;
  actorEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  oldValues?: Record<string, any> | null;
  newValues?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
};

export async function createAuditLog({
  actorAuthUserId,
  actorEmail,
  action,
  entityType,
  entityId,
  oldValues,
  newValues,
  metadata
}: AuditLogInput) {
  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin.from("audit_logs").insert({
    actor_auth_user_id: actorAuthUserId || null,
    actor_email: actorEmail || null,
    action,
    entity_type: entityType,
    entity_id: entityId || null,
    old_values: oldValues || null,
    new_values: newValues || null,
    metadata: metadata || null
  });

  if (error) {
    console.error("Audit log error:", error.message);
  }
}
