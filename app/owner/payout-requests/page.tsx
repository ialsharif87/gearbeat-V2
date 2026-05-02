import Link from "next/link";
import PartnerPayoutRequestsPanel, {
  type PayoutRequestRow,
} from "../../../components/partner-payout-requests-panel";
import { createClient } from "../../../lib/supabase/server";
import {
  requireOwnerOrRedirect,
  readNumber,
  readText,
  type DbRow,
} from "../../../lib/auth-guards";

export const dynamic = "force-dynamic";

type SupabaseAny = any;

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

async function availableBalance(
  supabase: SupabaseAny,
  partnerType: string,
  partnerId: string
) {
  const { data } = await supabase
    .from("finance_ledger")
    .select("*")
    .eq("entry_group", "payable")
    .eq("partner_type", partnerType)
    .eq("partner_id", partnerId)
    .in("status", ["pending", "posted"]);

  return ((data || []) as DbRow[]).reduce(
    (sum, row) => sum + readNumber(row, ["amount"]),
    0
  );
}

async function fetchRequests(
  supabase: SupabaseAny,
  partnerType: string,
  partnerId: string
) {
  const { data } = await supabase
    .from("payout_requests")
    .select("*")
    .eq("partner_type", partnerType)
    .eq("partner_id", partnerId)
    .order("created_at", { ascending: false });

  return ((data || []) as DbRow[]).map(normalizeRequest);
}

export default async function OwnerPayoutRequestsPage() {
  const supabase = await createClient();
  const { user } = await requireOwnerOrRedirect(supabase);

  const balance = await availableBalance(supabase, "studio_owner", user.id);
  const requests = await fetchRequests(supabase, "studio_owner", user.id);

  return (
    <main className="gb-dashboard-page">
      <section className="gb-dashboard-header">
        <div>
          <p className="gb-eyebrow">Owner dashboard</p>
          <h1>Payout Requests</h1>
        </div>
        <Link href="/owner" className="gb-button gb-button-secondary">
          Back to owner dashboard
        </Link>
      </section>

      <PartnerPayoutRequestsPanel
        partnerType="studio_owner"
        availableBalance={balance}
        currency="SAR"
        requests={requests}
      />
    </main>
  );
}
