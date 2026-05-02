import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

function makeRequestNumber() {
  return `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  const partnerType =
    body?.partnerType === "studio_owner" ? "studio_owner" : "vendor";

  const requestedAmount = Number(body?.requestedAmount || 0);
  const payoutMethod =
    typeof body?.payoutMethod === "string" ? body.payoutMethod.trim() : "";
  const payoutDetails =
    typeof body?.payoutDetails === "string" ? body.payoutDetails.trim() : "";
  const requesterNotes =
    typeof body?.requesterNotes === "string" ? body.requesterNotes.trim() : "";

  if (requestedAmount <= 0) {
    return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
  }

  const { error } = await supabase.from("payout_requests").insert({
    request_number: makeRequestNumber(),
    requester_user_id: user.id,
    partner_type: partnerType,
    partner_id: user.id,
    partner_label: user.email || user.id,
    requested_amount: requestedAmount,
    currency: "SAR",
    status: "pending",
    payout_method: payoutMethod || null,
    payout_details: payoutDetails || null,
    requester_notes: requesterNotes || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
