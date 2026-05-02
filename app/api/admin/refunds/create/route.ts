import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { requireAdminOrRedirect } from "../../../../../lib/auth-guards";
import { upsertFinanceLedgerEntry } from "../../../../../lib/finance-ledger";

function adjustmentNumber() {
  return `ADJ-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { user } = await requireAdminOrRedirect(supabase);

  const body = await request.json().catch(() => null);

  const adjustmentType =
    typeof body?.adjustmentType === "string" ? body.adjustmentType : "refund";
  const sourceType =
    typeof body?.sourceType === "string" ? body.sourceType : "manual_adjustment";
  const sourceId = typeof body?.sourceId === "string" ? body.sourceId : "";
  const partnerType =
    typeof body?.partnerType === "string" ? (body.partnerType as any) : "platform";
  const partnerId = typeof body?.partnerId === "string" ? body.partnerId : "";
  const partnerLabel =
    typeof body?.partnerLabel === "string" ? body.partnerLabel : "";
  const amount = Number(body?.amount || 0);
  const reason = typeof body?.reason === "string" ? body.reason.trim() : "";

  if (amount <= 0) {
    return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
  }

  if (!reason) {
    return NextResponse.json({ error: "Reason is required." }, { status: 400 });
  }

  const number = adjustmentNumber();

  const { data, error } = await supabase
    .from("finance_adjustments")
    .insert({
      adjustment_number: number,
      adjustment_type: adjustmentType,
      source_type: sourceType,
      source_id: sourceId,
      partner_type: partnerType,
      partner_id: partnerId,
      partner_label: partnerLabel || null,
      amount,
      currency: "SAR",
      reason,
      status: "posted",
      created_by: user.id,
    })
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || "Could not create adjustment." },
      { status: 500 }
    );
  }

  await upsertFinanceLedgerEntry(supabase, {
    entryType: (adjustmentType === "refund" ? "refund" : "manual_adjustment") as any,
    entryGroup: (adjustmentType === "refund" ? "refund" : "adjustment") as any,
    sourceType: (adjustmentType === "refund" ? "refund" : "manual_adjustment") as any,
    sourceId: number,
    sourceLabel: number,
    partnerType,
    partnerId,
    partnerLabel,
    amount,
    currency: "SAR",
    status: "posted",
    transactionDate: new Date().toISOString(),
    userId: user.id,
    metadata: {
      reason,
      originalSourceType: sourceType,
      originalSourceId: sourceId,
    },
  });

  return NextResponse.json({ ok: true });
}
