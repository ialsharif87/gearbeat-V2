type SupabaseAny = any;

export type FinanceAuditActionType =
  | "created"
  | "updated"
  | "status_changed"
  | "approved"
  | "rejected"
  | "cancelled"
  | "marked_paid"
  | "ledger_rebuilt"
  | "adjustment_created"
  | "refund_created"
  | "payout_requested"
  | "settlement_created"
  | "acceleration_order_created"
  | "system";

export type FinanceAuditEntityType =
  | "finance_ledger"
  | "settlement_batch"
  | "settlement_batch_item"
  | "payout_request"
  | "finance_adjustment"
  | "acceleration_package"
  | "acceleration_order"
  | "commission_setting"
  | "booking"
  | "marketplace_order"
  | "system";

export type CreateFinanceAuditLogInput = {
  actionType: FinanceAuditActionType;
  entityType: FinanceAuditEntityType;
  entityId?: string;
  entityLabel?: string;
  actorUserId?: string | null;
  actorEmail?: string | null;
  reason?: string | null;
  beforeData?: Record<string, unknown> | null;
  afterData?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function createFinanceAuditLog(
  supabase: SupabaseAny,
  input: CreateFinanceAuditLogInput
) {
  const { data, error } = await supabase
    .from("finance_audit_logs")
    .insert({
      action_type: input.actionType,
      entity_type: input.entityType,
      entity_id: input.entityId || "",
      entity_label: input.entityLabel || null,
      actor_user_id: input.actorUserId || null,
      actor_email: input.actorEmail || null,
      reason: input.reason || null,
      before_data: input.beforeData || {},
      after_data: input.afterData || {},
      metadata: input.metadata || {},
      ip_address: input.ipAddress || null,
      user_agent: input.userAgent || null,
    })
    .select("*")
    .single();

  if (error) {
    return {
      data: null,
      error,
    };
  }

  return {
    data,
    error: null,
  };
}

export function getRequestAuditContext(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for") || "";
  const realIp = request.headers.get("x-real-ip") || "";
  const userAgent = request.headers.get("user-agent") || "";

  return {
    ipAddress: forwardedFor.split(",")[0]?.trim() || realIp || null,
    userAgent: userAgent || null,
  };
}
