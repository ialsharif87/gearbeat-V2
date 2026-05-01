import Link from "next/link";
import T from "@/components/t";
import AdminLoyaltyAdjustButton from "@/components/admin-loyalty-adjust-button";
import { requireAdminLayoutAccess } from "@/lib/route-guards";

export const dynamic = "force-dynamic";

function formatDateTime(value: unknown) {
  if (!value) {
    return "—";
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-SA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(value: unknown, currency = "SAR") {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return `0.00 ${currency}`;
  }

  return `${numberValue.toFixed(2)} ${currency}`;
}

function formatPoints(value: unknown) {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return "0";
  }

  return numberValue.toLocaleString();
}

function getBadgeClass(status: string | null | undefined) {
  if (status === "posted" || status === "active") {
    return "badge badge-success";
  }

  if (status === "pending") {
    return "badge badge-warning";
  }

  if (status === "cancelled" || status === "expired") {
    return "badge badge-danger";
  }

  return "badge";
}

export default async function AdminLoyaltyPage() {
  const { supabaseAdmin } = await requireAdminLayoutAccess();

  const [walletsResult, tiersResult, ledgerResult] = await Promise.all([
    supabaseAdmin
      .from("customer_wallet_summary")
      .select(`
        wallet_id,
        auth_user_id,
        full_name,
        email,
        membership_number,
        referral_code,
        tier_code,
        tier_name_en,
        tier_name_ar,
        points_balance,
        pending_points,
        wallet_balance,
        currency_code,
        lifetime_points,
        lifetime_spend,
        membership_card_status,
        card_style_code,
        joined_at,
        updated_at
      `)
      .order("updated_at", { ascending: false })
      .limit(100),

    supabaseAdmin
      .from("loyalty_tiers")
      .select(`
        code,
        name_en,
        name_ar,
        min_points,
        min_lifetime_spend,
        earn_multiplier,
        redemption_cap_percent,
        sort_order,
        is_active
      `)
      .order("sort_order", { ascending: true }),

    supabaseAdmin
      .from("loyalty_points_ledger")
      .select(`
        id,
        auth_user_id,
        event_type,
        source_type,
        source_id,
        points,
        status,
        description,
        amount_basis,
        created_at
      `)
      .order("created_at", { ascending: false })
      .limit(80),
  ]);

  if (walletsResult.error) {
    throw new Error(walletsResult.error.message);
  }

  if (tiersResult.error) {
    throw new Error(tiersResult.error.message);
  }

  if (ledgerResult.error) {
    throw new Error(ledgerResult.error.message);
  }

  const wallets = walletsResult.data || [];
  const tiers = tiersResult.data || [];
  const ledgerRows = ledgerResult.data || [];

  const totalWallets = wallets.length;
  const totalAvailablePoints = wallets.reduce(
    (sum: number, wallet: any) => sum + Number(wallet.points_balance || 0),
    0
  );

  const totalPendingPoints = wallets.reduce(
    (sum: number, wallet: any) => sum + Number(wallet.pending_points || 0),
    0
  );

  const totalWalletBalance = wallets.reduce(
    (sum: number, wallet: any) => sum + Number(wallet.wallet_balance || 0),
    0
  );

  const activeTierCount = tiers.filter((tier: any) => tier.is_active).length;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <span className="badge badge-gold">
          <T en="Loyalty" ar="الولاء" />
        </span>

        <h1>
          <T en="Admin Loyalty Center" ar="مركز إدارة الولاء" />
        </h1>

        <p>
          <T
            en="Monitor customer wallets, membership numbers, loyalty tiers, points balances, and recent loyalty activity."
            ar="راقب محافظ العملاء، أرقام العضوية، مستويات الولاء، أرصدة النقاط، وآخر نشاط الولاء."
          />
        </p>
      </div>

      <div className="stats-grid" style={{ marginTop: 30 }}>
        <div className="card stat-card">
          <div className="stat-icon">🪪</div>
          <div className="stat-content">
            <label>
              <T en="Customer Wallets" ar="محافظ العملاء" />
            </label>
            <div className="stat-value">{totalWallets}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <label>
              <T en="Available Points" ar="النقاط المتاحة" />
            </label>
            <div className="stat-value">{formatPoints(totalAvailablePoints)}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <label>
              <T en="Pending Points" ar="النقاط المعلقة" />
            </label>
            <div className="stat-value">{formatPoints(totalPendingPoints)}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">🏦</div>
          <div className="stat-content">
            <label>
              <T en="Wallet Balance" ar="رصيد المحافظ" />
            </label>
            <div className="stat-value">
              {formatMoney(totalWalletBalance)}
            </div>
          </div>
        </div>
      </div>

      <section className="card" style={{ marginTop: 30 }}>
        <h2>
          <T en="Loyalty tiers" ar="مستويات الولاء" />
        </h2>

        <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
          <T
            en="Current active loyalty levels and earn multipliers."
            ar="مستويات الولاء الحالية ومضاعفات كسب النقاط."
          />
        </p>

        <div
          style={{
            marginTop: 20,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          {tiers.map((tier: any) => (
            <div
              key={tier.code}
              className="card"
              style={{
                borderColor: tier.is_active
                  ? "rgba(207,167,98,0.28)"
                  : "rgba(255,255,255,0.08)",
              }}
            >
              <span className={tier.is_active ? "badge badge-success" : "badge"}>
                {tier.is_active ? "active" : "inactive"}
              </span>

              <h3 style={{ marginTop: 10 }}>
                {tier.name_en} / {tier.name_ar}
              </h3>

              <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Min points</span>
                  <strong>{formatPoints(tier.min_points)}</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Min spend</span>
                  <strong>{formatMoney(tier.min_lifetime_spend)}</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Multiplier</span>
                  <strong>{tier.earn_multiplier}x</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Redemption cap</span>
                  <strong>{tier.redemption_cap_percent}%</strong>
                </div>
              </div>
            </div>
          ))}

          {activeTierCount === 0 ? (
            <div className="card">
              <T en="No active loyalty tiers found." ar="لا توجد مستويات ولاء فعالة." />
            </div>
          ) : null}
        </div>
      </section>

      <section className="card" style={{ marginTop: 30 }}>
        <h2>
          <T en="Customer wallets" ar="محافظ العملاء" />
        </h2>

        <div className="table-responsive" style={{ marginTop: 20 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Membership</th>
                <th>Tier</th>
                <th>Points</th>
                <th>Wallet</th>
                <th>Lifetime</th>
                <th>Joined</th>
                <th>Adjust</th>
              </tr>
            </thead>

            <tbody>
              {wallets.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 30 }}>
                    <T en="No customer wallets found." ar="لا توجد محافظ عملاء." />
                  </td>
                </tr>
              ) : (
                wallets.map((wallet: any) => (
                  <tr key={wallet.wallet_id}>
                    <td>
                      <div style={{ fontWeight: 800 }}>
                        {wallet.full_name || "—"}
                      </div>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        {wallet.email || wallet.auth_user_id}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 800 }}>
                        {wallet.membership_number || "—"}
                      </div>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        Ref: {wallet.referral_code || "—"}
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-gold">
                        {wallet.tier_name_en || wallet.tier_code || "listener"}
                      </span>
                    </td>

                    <td>
                      <div>
                        <strong>{formatPoints(wallet.points_balance)}</strong>
                      </div>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        Pending: {formatPoints(wallet.pending_points)}
                      </div>
                    </td>

                    <td>
                      {formatMoney(
                        wallet.wallet_balance,
                        wallet.currency_code || "SAR"
                      )}
                    </td>

                    <td>
                      <div>{formatPoints(wallet.lifetime_points)} pts</div>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        {formatMoney(
                          wallet.lifetime_spend,
                          wallet.currency_code || "SAR"
                        )}
                      </div>
                    </td>

                    <td>{formatDateTime(wallet.joined_at)}</td>

                    <td>
                      <AdminLoyaltyAdjustButton
                        authUserId={wallet.auth_user_id}
                        customerName={wallet.full_name}
                        currentPoints={wallet.points_balance}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginTop: 30 }}>
        <h2>
          <T en="Recent loyalty activity" ar="آخر نشاط الولاء" />
        </h2>

        <div className="table-responsive" style={{ marginTop: 20 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Customer</th>
                <th>Source</th>
                <th>Points</th>
                <th>Status</th>
                <th>Description</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {ledgerRows.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 30 }}>
                    <T en="No loyalty activity found." ar="لا يوجد نشاط ولاء." />
                  </td>
                </tr>
              ) : (
                ledgerRows.map((row: any) => (
                  <tr key={row.id}>
                    <td>
                      <div style={{ fontWeight: 800 }}>{row.event_type}</div>
                    </td>

                    <td>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        {row.auth_user_id}
                      </div>
                    </td>

                    <td>
                      <div>{row.source_type || "—"}</div>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        {row.source_id || "—"}
                      </div>
                    </td>

                    <td>
                      <strong
                        style={{
                          color:
                            Number(row.points || 0) >= 0
                              ? "#00ff88"
                              : "#ff7070",
                        }}
                      >
                        {Number(row.points || 0) >= 0 ? "+" : ""}
                        {formatPoints(row.points)}
                      </strong>
                    </td>

                    <td>
                      <span className={getBadgeClass(row.status)}>
                        {row.status}
                      </span>
                    </td>

                    <td>{row.description || "—"}</td>

                    <td>{formatDateTime(row.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginTop: 30 }}>
        <h2>
          <T en="Related admin pages" ar="صفحات إدارية مرتبطة" />
        </h2>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
          <Link href="/admin/payments" className="btn">
            <T en="Payments" ar="المدفوعات" />
          </Link>

          <Link href="/admin/coupons" className="btn">
            <T en="Coupons" ar="القسائم" />
          </Link>

          <Link href="/admin/offers" className="btn">
            <T en="Offers" ar="العروض" />
          </Link>
        </div>
      </section>
    </div>
  );
}
