import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import {
  requireAdminOrRedirect,
} from "../../../../../lib/auth-guards";
import {
  createFinanceAuditLog,
  getRequestAuditContext,
  type FinanceAuditActionType,
  type FinanceAuditEntityType,
} from "../../../../../lib/finance-audit";

const allowedActionTypes = new Set([
  "created",
  "updated",
  "status_changed",
  "approved",
  "rejected",
  "cancelled",
  "marked_paid",
  "ledger_rebuilt",
  "adjustment_created",
  "refund_created",
  "payout_requested",
  "settlement_created",
  "acceleration_order_created",
  "system",
]);

const allowedEntityTypes = new Set([
  "finance_ledger",
  "settlement_batch",
  "settlement_batch_item",
  "payout_request",
  "finance_adjustment",
  "acceleration_package",
  "acceleration_order",
  "commission_setting",
  "booking",
  "marketplace_order",
  "system",
]);

function readObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { user } = await requireAdminOrRedirect(supabase);

  const body = await request.json().catch(() => null);

  const actionType =
    typeof body?.actionType === "string" ? body.actionType.trim() : "";

  const entityType =
    typeof body?.entityType === "string" ? body.entityType.trim() : "";

  const entityId =
    typeof body?.entityId === "string" ? body.entityId.trim() : "";

  const entityLabel =
    typeof body?.entityLabel === "string" ? body.entityLabel.trim() : "";

  const reason = typeof body?.reason === "string" ? body.reason.trim() : "";

  if (!allowedActionTypes.has(actionType)) {
    return NextResponse.json(
      { error: "Invalid audit action type." },
      { status: 400 }
    );
  }

  if (!allowedEntityTypes.has(entityType)) {
    return NextResponse.json(
      { error: "Invalid audit entity type." },
      { status: 400 }
    );
  }

  const requestContext = getRequestAuditContext(request);

  const { error } = await createFinanceAuditLog(supabase, {
    actionType: actionType as FinanceAuditActionType,
    entityType: entityType as FinanceAuditEntityType,
    entityId,
    entityLabel,
    actorUserId: user.id,
    actorEmail:
      typeof user.email === "string" ? user.email : null,
    reason,
    beforeData: readObject(body?.beforeData),
    afterData: readObject(body?.afterData),
    metadata: readObject(body?.metadata),
    ipAddress: requestContext.ipAddress,
    userAgent: requestContext.userAgent,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
