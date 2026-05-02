import Link from "next/link";
import AdminPayoutRequestsManager from "../../../../components/admin-payout-requests-manager";
import type { PayoutRequestRow } from "../../../../components/partner-payout-requests-panel";
import { createClient } from "../../../../lib/supabase/server";
import {
  requireAdminOrRedirect,
  readNumber,
  readText,
  type DbRow,
} from "../../../../lib/auth-guards";

export const dynamic = "force-dynamic";

function normalizeRequest(row: DbRow): PayoutRequestRow {
  return {
    id: readText(row, ["id"]),
    requestNumber: readText(row, ["request_number"]),
    partnerType: readText(row, ["partner_type"]),
    requestedAmount: readNumber(row, ["requested_amount"]),
    currency: readText(row, ["currency"], "SAR"),
    status: readText(row, ["status"], "pending"),
    payoutMethod: readText(row, ["payout_method"]),
    requesterNotes: readText(row, ["requester_notes"]),
    adminNotes: readText(row, ["admin_notes"]),
    createdAt: readText(row, ["created_at"]),
  };
}

export default async function AdminPayoutRequestsPage() {
  const supabase = await createClient();
  await requireAdminOrRedirect(supabase);

  const { data } = await supabase
    .from("payout_requests")
    .select("*")
    .order("created_at", { ascending: false });

  const requests = ((data || []) as DbRow[]).map(normalizeRequest);

  return (
    <main className="gb-dashboard-page">
      <section className="gb-dashboard-header">
        <div>
          <p className="gb-eyebrow">Admin finance</p>
          <h1>Payout Requests</h1>
        </div>
        <Link href="/admin/settlements" className="gb-button gb-button-secondary">
          Settlement batches
        </Link>
      </section>

      <AdminPayoutRequestsManager requests={requests} />
    </main>
  );
}
