import Link from "next/link";
import AdminSettlementsManager, {
  type PayableLedgerEntry,
  type SettlementBatch,
} from "../../../../components/admin-settlements-manager";
import { createClient } from "../../../../lib/supabase/server";
import {
  requireAdminOrRedirect,
  readNumber,
  readText,
  type DbRow,
} from "../../../../lib/auth-guards";

export const dynamic = "force-dynamic";

type SupabaseAny = any;

function normalizeBatch(row: DbRow): SettlementBatch {
  return {
    id: readText(row, ["id"]),
    batchNumber: readText(row, ["batch_number"]),
    title: readText(row, ["title"]),
    description: readText(row, ["description"]),
    status: readText(row, ["status"], "draft"),
    currency: readText(row, ["currency"], "SAR"),
    grossAmount: readNumber(row, ["gross_amount"]),
    commissionAmount: readNumber(row, ["commission_amount"]),
    netPayableAmount: readNumber(row, ["net_payable_amount"]),
    itemCount: readNumber(row, ["item_count"]),
    createdAt: readText(row, ["created_at"]),
  };
}

function normalizePayable(row: DbRow): PayableLedgerEntry {
  return {
    id: readText(row, ["id"]),
    partnerType: readText(row, ["partner_type"]),
    partnerId: readText(row, ["partner_id"]),
    partnerLabel: readText(row, ["partner_label"]),
    sourceType: readText(row, ["source_type"]),
    sourceId: readText(row, ["source_id"]),
    sourceLabel: readText(row, ["source_label"]),
    amount: readNumber(row, ["amount"]),
    currency: readText(row, ["currency"], "SAR"),
    status: readText(row, ["status"], "pending"),
    transactionDate: readText(row, ["transaction_date"]),
  };
}

async function fetchBatches(supabase: SupabaseAny): Promise<SettlementBatch[]> {
  const { data, error } = await supabase
    .from("settlement_batches")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error || !data) return [];
  return (data as DbRow[]).map(normalizeBatch);
}

async function fetchPayableEntries(
  supabase: SupabaseAny
): Promise<PayableLedgerEntry[]> {
  const { data: usedItems } = await supabase
    .from("settlement_batch_items")
    .select("ledger_entry_id");

  const usedIds = new Set(
    ((usedItems || []) as DbRow[])
      .map((item) => readText(item, ["ledger_entry_id"]))
      .filter(Boolean)
  );

  const { data, error } = await supabase
    .from("finance_ledger")
    .select("*")
    .eq("entry_group", "payable")
    .in("entry_type", ["vendor_payable", "owner_payable"])
    .in("status", ["pending", "posted"])
    .order("transaction_date", { ascending: false })
    .limit(500);

  if (error || !data) return [];

  return (data as DbRow[])
    .filter((row) => !usedIds.has(readText(row, ["id"])))
    .map(normalizePayable);
}

export default async function AdminSettlementsPage() {
  const supabase = await createClient();
  await requireAdminOrRedirect(supabase);

  const [batches, payableEntries] = await Promise.all([
    fetchBatches(supabase),
    fetchPayableEntries(supabase),
  ]);

  return (
    <main className="gb-dashboard-page">
      <section className="gb-dashboard-header">
        <div>
          <p className="gb-eyebrow">Admin finance</p>
          <h1>Settlement Batches</h1>
          <p className="gb-muted-text">
            Group payable ledger entries into internal settlement batches.
          </p>
        </div>

        <div className="gb-action-row">
          <Link href="/admin/finance-ledger" className="gb-button">
            Finance ledger
          </Link>
          <Link href="/admin/finance" className="gb-button gb-button-secondary">
            Finance center
          </Link>
        </div>
      </section>

      <AdminSettlementsManager
        batches={batches}
        payableEntries={payableEntries}
      />
    </main>
  );
}
