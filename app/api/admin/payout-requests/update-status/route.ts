import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { requireAdminOrRedirect } from "../../../../../lib/auth-guards";

const allowedStatuses = new Set([
  "pending",
  "reviewed",
  "approved",
  "rejected",
  "paid",
  "cancelled",
]);

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { user } = await requireAdminOrRedirect(supabase);

  const body = await request.json().catch(() => null);
  const requestId =
    typeof body?.requestId === "string" ? body.requestId.trim() : "";
  const status = typeof body?.status === "string" ? body.status.trim() : "";
  const adminNotes =
    typeof body?.adminNotes === "string" ? body.adminNotes.trim() : "";

  if (!requestId) {
    return NextResponse.json({ error: "Request ID is required." }, { status: 400 });
  }

  if (!allowedStatuses.has(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const now = new Date().toISOString();

  const payload: Record<string, unknown> = {
    status,
    admin_notes: adminNotes || null,
    reviewed_by: user.id,
    updated_at: now,
  };

  if (status === "reviewed") payload.reviewed_at = now;
  if (status === "approved") payload.approved_at = now;
  if (status === "rejected") payload.rejected_at = now;
  if (status === "paid") payload.paid_at = now;

  const { error } = await supabase
    .from("payout_requests")
    .update(payload)
    .eq("id", requestId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
