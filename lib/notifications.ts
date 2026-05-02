import type { SupabaseClient } from "@supabase/supabase-js";

type CreateNotificationInput = {
  userId?: string | null;
  audience?: "user" | "admin" | "owner" | "vendor" | "customer" | "system";
  title: string;
  body?: string;
  notificationType?: string;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
};

export async function createNotification(
  supabase: SupabaseClient,
  input: CreateNotificationInput
) {
  if (!input.title.trim()) {
    return null;
  }

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: input.userId || null,
      audience: input.audience || "user",
      title: input.title,
      body: input.body || null,
      notification_type: input.notificationType || "general",
      entity_type: input.entityType || null,
      entity_id: input.entityId || null,
      action_url: input.actionUrl || null,
      metadata: input.metadata || {},
    })
    .select("*")
    .single();

  if (error) {
    return null;
  }

  return data;
}
