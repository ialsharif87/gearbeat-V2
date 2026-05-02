import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { requireAdminOrRedirect } from "../../../../../lib/auth-guards";

const allowedStatuses = new Set([
  "draft",
  "reviewed",
  "approved",
  "paid",
  "cancelled",
]);

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { user } = await requireAdminOrRedirect(supabase);

  const body = await request.json().catch(() => null);
  const batchId = typeof body?.batchId === "string" ? body.batchId.trim() : "";
  const status = typeof body?.status === "string" ? body.status.trim() : "";

  if (!batchId) {
    return NextResponse.json({ error: "Batch ID is required." }, { status: 400 });
  }

  if (!allowedStatuses.has(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const now = new Date().toISOString();

  const payload: Record<string, unknown> = {
    status,
    updated_by: user.id,
    updated_at: now,
  };

  if (status === "reviewed") payload.reviewed_at = now;
  if (status === "approved") payload.approved_at = now;
  if (status === "paid") payload.paid_at = now;
  if (status === "cancelled") payload.cancelled_at = now;

  const { error } = await supabase
    .from("settlement_batches")
    .update(payload)
    .eq("id", batchId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (status === "paid") {
    await supabase
      .from("settlement_batch_items")
      .update({ status: "paid" })
      .eq("batch_id", batchId);
  }

  if (status === "cancelled") {
    await supabase
      .from("settlement_batch_items")
      .update({ status: "cancelled" })
      .eq("batch_id", batchId);
  }

  return NextResponse.json({ ok: true });
}
