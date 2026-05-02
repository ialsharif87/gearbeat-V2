import Link from "next/link";
import AdminFinanceLedgerReport, {
  type FinanceLedgerRow,
} from "../../../../components/admin-finance-ledger-report";
import { createClient } from "../../../../lib/supabase/server";
import {
  requireAdminOrRedirect,
  readNumber,
  readText,
  type DbRow,
} from "../../../../lib/auth-guards";

export const dynamic = "force-dynamic";

function normalizeLedgerRow(row: DbRow): FinanceLedgerRow {
  return {
    id: readText(row, ["id"]),
    entryType: readText(row, ["entry_type"]),
    entryGroup: readText(row, ["entry_group"]),
    sourceType: readText(row, ["source_type"]),
    sourceId: readText(row, ["source_id"]),
    sourceLabel: readText(row, ["source_label"]),
    partnerType: readText(row, ["partner_type"]),
    partnerId: readText(row, ["partner_id"]),
    partnerLabel: readText(row, ["partner_label"]),
    amount: readNumber(row, ["amount"], 0),
    currency: readText(row, ["currency"], "SAR"),
    status: readText(row, ["status"], "pending"),
    transactionDate: readText(row, ["transaction_date"]),
    createdAt: readText(row, ["created_at"]),
  };
}

async function fetchFinanceLedgerRows(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<FinanceLedgerRow[]> {
  const { data, error } = await supabase
    .from("finance_ledger")
    .select("*")
    .order("transaction_date", { ascending: false })
    .limit(1000);

  if (error || !data) {
    return [];
  }

  return (data as DbRow[]).map(normalizeLedgerRow);
}

export default async function AdminFinanceLedgerPage() {
  const supabase = await createClient();

  await requireAdminOrRedirect(supabase);

  const rows = await fetchFinanceLedgerRows(supabase);

  return (
    <main className="gb-dashboard-page">
      <section className="gb-dashboard-header">
        <div>
          <p className="gb-eyebrow">Admin finance</p>
          <h1>Finance Ledger</h1>
          <p className="gb-muted-text">
            Internal ledger foundation for GearBeat payments, commissions,
            payables, refunds, adjustments, and future settlement batches.
          </p>
        </div>

        <div className="gb-action-row">
          <Link href="/admin/finance" className="gb-button">
            Finance center
          </Link>

          <Link href="/admin/payouts" className="gb-button gb-button-secondary">
            Payout reports
          </Link>

          <Link href="/admin" className="gb-button gb-button-secondary">
            Back to admin
          </Link>
        </div>
      </section>

      <AdminFinanceLedgerReport rows={rows} />
    </main>
  );
}
