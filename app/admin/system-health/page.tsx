import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";
import {
  requireAdminOrRedirect,
} from "../../../lib/auth-guards";

export const dynamic = "force-dynamic";

type HealthCheck = {
  label: string;
  status: "ok" | "warning";
  detail: string;
};

async function tableExists(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tableName: string
): Promise<boolean> {
  const { error } = await supabase.from(tableName).select("*").limit(1);

  return !error;
}

async function getTableStatus(
  supabase: Awaited<ReturnType<typeof createClient>>,
  label: string,
  tableName: string
): Promise<HealthCheck> {
  const exists = await tableExists(supabase, tableName);

  return {
    label,
    status: exists ? "ok" : "warning",
    detail: exists
      ? `${tableName} is available.`
      : `${tableName} is missing or not accessible.`,
  };
}

export default async function AdminSystemHealthPage() {
  const supabase = await createClient();

  await requireAdminOrRedirect(supabase);

  const checks = await Promise.all([
    getTableStatus(supabase, "Profiles", "profiles"),
    getTableStatus(supabase, "Studios", "studios"),
    getTableStatus(supabase, "Bookings", "bookings"),
    getTableStatus(
      supabase,
      "Checkout payment sessions",
      "checkout_payment_sessions"
    ),
    getTableStatus(supabase, "Marketplace products", "marketplace_products"),
    getTableStatus(supabase, "Marketplace orders", "marketplace_orders"),
    getTableStatus(supabase, "Commission settings", "commission_settings"),
    getTableStatus(supabase, "Notifications", "notifications"),
  ]);

  const okCount = checks.filter((check) => check.status === "ok").length;
  const warningCount = checks.length - okCount;

  return (
    <main className="gb-dashboard-page">
      <section className="gb-dashboard-header">
        <div>
          <p className="gb-eyebrow">Admin dashboard</p>
          <h1>System Health</h1>
          <p className="gb-muted-text">
            Review key GearBeat tables and basic production readiness signals.
          </p>
        </div>

        <Link href="/admin" className="gb-button gb-button-secondary">
          Back to admin dashboard
        </Link>
      </section>

      <section className="gb-card">
        <div className="gb-kpi-grid">
          <div className="gb-kpi-card">
            <span>Available checks</span>
            <strong>{okCount}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Warnings</span>
            <strong>{warningCount}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Mode</span>
            <strong>Manual payment</strong>
          </div>
        </div>
      </section>

      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">Build readiness</p>
            <h2>Core system checks</h2>
            <p className="gb-muted-text">
              Warnings here do not always mean the build failed. They highlight
              missing or inaccessible database tables.
            </p>
          </div>
        </div>

        <div className="gb-table-wrap">
          <table className="gb-table">
            <thead>
              <tr>
                <th>Check</th>
                <th>Status</th>
                <th>Detail</th>
              </tr>
            </thead>

            <tbody>
              {checks.map((check) => (
                <tr key={check.label}>
                  <td>{check.label}</td>
                  <td>{check.status === "ok" ? "OK" : "Warning"}</td>
                  <td>{check.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">Notes</p>
            <h2>Production cleanup notes</h2>
          </div>
        </div>

        <ul>
          <li>Real payment remains disabled.</li>
          <li>Manual test payment remains enabled.</li>
          <li>Email, SMS, and push notifications are not enabled.</li>
          <li>The middleware/proxy warning is not a build blocker.</li>
        </ul>
      </section>
    </main>
  );
}
