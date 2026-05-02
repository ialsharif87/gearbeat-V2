import Link from "next/link";
import AdminRefundsAdjustmentsManager, {
  type FinanceAdjustmentRow,
} from "../../../components/admin-refunds-adjustments-manager";
import { createClient } from "../../../lib/supabase/server";
import {
  requireAdminOrRedirect,
  readNumber,
  readText,
  type DbRow,
} from "../../../lib/auth-guards";

export const dynamic = "force-dynamic";

function normalize(row: DbRow): FinanceAdjustmentRow {
  return {
    id: readText(row, ["id"]),
    adjustmentNumber: readText(row, ["adjustment_number"]),
    adjustmentType: readText(row, ["adjustment_type"]),
    sourceType: readText(row, ["source_type"]),
    sourceId: readText(row, ["source_id"]),
    partnerType: readText(row, ["partner_type"]),
    partnerId: readText(row, ["partner_id"]),
    partnerLabel: readText(row, ["partner_label"]),
    amount: readNumber(row, ["amount"]),
    currency: readText(row, ["currency"], "SAR"),
    reason: readText(row, ["reason"]),
    status: readText(row, ["status"], "posted"),
    createdAt: readText(row, ["created_at"]),
  };
}

export default async function AdminRefundsPage() {
  const supabase = await createClient();
  await requireAdminOrRedirect(supabase);

  const { data } = await supabase
    .from("finance_adjustments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  const rows = ((data || []) as DbRow[]).map(normalize);

  return (
    <main className="gb-dashboard-page">
      <section className="gb-dashboard-header">
        <div>
          <p className="gb-eyebrow">Admin finance</p>
          <h1>Refunds & Adjustments</h1>
        </div>

        <Link href="/admin/finance-ledger" className="gb-button gb-button-secondary">
          Finance ledger
        </Link>
      </section>

      <AdminRefundsAdjustmentsManager rows={rows} />
    </main>
  );
}
