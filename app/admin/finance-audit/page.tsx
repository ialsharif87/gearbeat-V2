import Link from "next/link";
import AdminFinanceAuditLog, {
  type FinanceAuditLogRow,
} from "../../../components/admin-finance-audit-log";
import { createClient } from "../../../lib/supabase/server";
import {
  requireAdminOrRedirect,
  readText,
  type DbRow,
} from "../../../lib/auth-guards";

export const dynamic = "force-dynamic";

function readJsonObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function normalizeAuditRow(row: DbRow): FinanceAuditLogRow {
  return {
    id: readText(row, ["id"]),
    actionType: readText(row, ["action_type"]),
    entityType: readText(row, ["entity_type"]),
    entityId: readText(row, ["entity_id"]),
    entityLabel: readText(row, ["entity_label"]),
    actorUserId: readText(row, ["actor_user_id"]),
    actorEmail: readText(row, ["actor_email"]),
    reason: readText(row, ["reason"]),
    beforeData: readJsonObject(row.before_data),
    afterData: readJsonObject(row.after_data),
    metadata: readJsonObject(row.metadata),
    ipAddress: readText(row, ["ip_address"]),
    userAgent: readText(row, ["user_agent"]),
    createdAt: readText(row, ["created_at"]),
  };
}

async function fetchAuditRows(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<FinanceAuditLogRow[]> {
  const { data, error } = await supabase
    .from("finance_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error || !data) {
    return [];
  }

  return (data as DbRow[]).map(normalizeAuditRow);
}

export default async function AdminFinanceAuditPage() {
  const supabase = await createClient();

  await requireAdminOrRedirect(supabase);

  const rows = await fetchAuditRows(supabase);

  return (
    <main className="gb-dashboard-page">
      <section className="gb-dashboard-header">
        <div>
          <p className="gb-eyebrow">Admin finance</p>
          <h1>Finance Audit Log</h1>
          <p className="gb-muted-text">
            Review finance actions across ledger, settlements, payouts, refunds,
            adjustments, and acceleration.
          </p>
        </div>

        <div className="gb-action-row">
          <Link href="/admin/finance" className="gb-button">
            Finance center
          </Link>

          <Link href="/admin/finance-ledger" className="gb-button gb-button-secondary">
            Finance ledger
          </Link>

          <Link href="/admin" className="gb-button gb-button-secondary">
            Back to admin
          </Link>
        </div>
      </section>

      <AdminFinanceAuditLog rows={rows} />
    </main>
  );
}
