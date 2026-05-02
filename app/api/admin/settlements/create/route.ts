import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import {
  requireAdminOrRedirect,
  readNumber,
  readText,
  type DbRow,
} from "../../../../../lib/auth-guards";
import { createFinanceAuditLog } from "../../../../../lib/finance-audit";

type SupabaseAny = any;

function batchNumber() {
  return `SET-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  const supabase: SupabaseAny = await createClient();
  const { user } = await requireAdminOrRedirect(supabase);

  const body = await request.json().catch(() => null);

  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const description =
    typeof body?.description === "string" ? body.description.trim() : "";
  const ledgerEntryIds = Array.isArray(body?.ledgerEntryIds)
    ? body.ledgerEntryIds.filter((id: unknown) => typeof id === "string")
    : [];

  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  if (ledgerEntryIds.length === 0) {
    return NextResponse.json(
      { error: "At least one ledger entry is required." },
      { status: 400 }
    );
  }

  const { data: entries, error: entriesError } = await supabase
    .from("finance_ledger")
    .select("*")
    .in("id", ledgerEntryIds)
    .eq("entry_group", "payable");

  if (entriesError || !entries || (entries as DbRow[]).length === 0) {
    return NextResponse.json(
      { error: "No valid payable entries found." },
      { status: 400 }
    );
  }

  const rows = entries as DbRow[];
  const netPayable = rows.reduce((sum, row) => sum + readNumber(row, ["amount"]), 0);
  const currency = readText(rows[0], ["currency"], "SAR");
  const now = new Date().toISOString();

  const { data: batch, error: batchError } = await supabase
    .from("settlement_batches")
    .insert({
      batch_number: batchNumber(),
      title,
      description: description || null,
      status: "draft",
      currency,
      net_payable_amount: netPayable,
      item_count: rows.length,
      created_by: user.id,
      updated_by: user.id,
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  if (batchError || !batch) {
    return NextResponse.json(
      { error: batchError?.message || "Could not create batch." },
      { status: 500 }
    );
  }

  const batchId = readText(batch as DbRow, ["id"]);

  const items = rows.map((row) => ({
    batch_id: batchId,
    ledger_entry_id: readText(row, ["id"]),
    partner_type: readText(row, ["partner_type"]),
    partner_id: readText(row, ["partner_id"]),
    partner_label: readText(row, ["partner_label"]),
    source_type: readText(row, ["source_type"]),
    source_id: readText(row, ["source_id"]),
    amount: readNumber(row, ["amount"]),
    currency: readText(row, ["currency"], "SAR"),
    status: "included",
  }));

  const { error: itemsError } = await supabase
    .from("settlement_batch_items")
    .insert(items);

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  await createFinanceAuditLog(supabase, {
    actionType: "settlement_created",
    entityType: "settlement_batch",
    entityId: batchId,
    entityLabel: title,
    actorUserId: user.id,
    actorEmail: typeof user.email === "string" ? user.email : null,
    reason: "Admin created settlement batch.",
    afterData: {
      title,
      itemCount: rows.length,
      netPayable,
    },
  });

  return NextResponse.json({ ok: true, batchId });
}
