import { createClient } from "@/lib/supabase/server";
import T from "@/components/t";
import Link from "next/link";

export const dynamic = "force-dynamic";

type DbRow = Record<string, any>;

function formatDateTime(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export default async function AdminBoostPage() {
  const supabase = await createClient();

  const { data: activeBoosts } = await supabase
    .from("studio_boost_subscriptions")
    .select(`
      *,
      studios(name),
      profiles:owner_auth_user_id(full_name, email)
    `)
    .eq("status", "active")
    .gt("ends_at", new Date().toISOString())
    .order("ends_at", { ascending: true });

  return (
    <main className="gb-dashboard-page">
      <section className="gb-dashboard-header">
        <div>
          <p className="gb-eyebrow">Admin Panel</p>
          <h1>Active Studio Boosts</h1>
          <p className="gb-muted-text">
            Monitor all active visibility boosts and commission overrides.
          </p>
        </div>
        <Link href="/admin" className="gb-button gb-button-secondary">
          Back to Admin
        </Link>
      </section>

      <section className="gb-card">
        {activeBoosts && activeBoosts.length > 0 ? (
          <div className="gb-table-wrap">
            <table className="gb-dash-table">
              <thead>
                <tr>
                  <th>Studio</th>
                  <th>Owner</th>
                  <th>Boost %</th>
                  <th>Total %</th>
                  <th>Ends At</th>
                  <th>Time Left</th>
                </tr>
              </thead>
              <tbody>
                {activeBoosts.map((boost: any) => {
                  const timeLeftMs = new Date(boost.ends_at).getTime() - Date.now();
                  const daysLeft = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
                  const hoursLeft = Math.floor((timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

                  return (
                    <tr key={boost.id}>
                      <td>
                        <strong>{boost.studios?.name}</strong>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          {boost.profiles?.full_name || "Unknown"}
                          <br />
                          <span className="gb-muted-text">{boost.profiles?.email}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--gb-gold)' }}>+{boost.boost_commission_percent}%</td>
                      <td><strong>{boost.total_commission_percent}%</strong></td>
                      <td>{formatDateTime(boost.ends_at)}</td>
                      <td>
                        <span className="gb-dash-badge gb-dash-badge-confirmed">
                          {daysLeft}d {hoursLeft}h
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="gb-empty-state">
            <p>No active studio boosts at the moment.</p>
          </div>
        )}
      </section>
    </main>
  );
}
