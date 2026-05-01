import Link from "next/link";
import T from "@/components/t";
import { requireAdminLayoutAccess } from "@/lib/route-guards";
import AdminManualRefundButton from "@/components/admin-manual-refund-button";

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

function getBadgeClass(status: string | null | undefined) {
  if (status === "paid" || status === "completed" || status === "captured") {
    return "badge badge-success";
  }

  if (
    status === "created" ||
    status === "pending" ||
    status === "processing"
  ) {
    return "badge badge-warning";
  }

  if (
    status === "failed" ||
    status === "cancelled" ||
    status === "canceled" ||
    status === "expired" ||
    status === "refunded"
  ) {
    return "badge badge-danger";
  }

  return "badge";
}

function getSourceLabel(sourceType: string | null | undefined) {
  if (sourceType === "studio_booking" || sourceType === "booking") {
    return "Studio booking";
  }

  if (
    sourceType === "marketplace_order" ||
    sourceType === "order" ||
    sourceType === "marketplace"
  ) {
    return "Marketplace order";
  }

  return sourceType || "Unknown";
}

function truncateId(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  if (value.length <= 12) {
    return value;
  }

  return `${value.slice(0, 8)}…${value.slice(-4)}`;
}

export default async function AdminPaymentsPage() {
  const { supabaseAdmin } = await requireAdminLayoutAccess();

  const [
    transactionsResult,
    sessionsResult,
    providersResult,
    refundsResult,
  ] = await Promise.all([
    supabaseAdmin
      .from("payment_transaction_summary")
      .select(`
        id,
        auth_user_id,
        full_name,
        email,
        checkout_session_id,
        source_type,
        source_id,
        provider_code,
        provider_display_name_en,
        provider_display_name_ar,
        payment_method,
        installment_provider,
        amount,
        currency_code,
        status,
        provider_checkout_id,
        provider_payment_id,
        provider_reference,
        authorized_amount,
        captured_amount,
        refunded_amount,
        failure_code,
        failure_message,
        paid_at,
        captured_at,
        failed_at,
        cancelled_at,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false })
      .limit(80),

    supabaseAdmin
      .from("checkout_payment_sessions")
      .select(`
        id,
        auth_user_id,
        source_type,
        source_id,
        provider_code,
        payment_method,
        installment_provider,
        amount,
        currency_code,
        status,
        provider_checkout_id,
        provider_payment_id,
        provider_reference,
        coupon_code,
        coupon_discount_amount,
        wallet_credit_used,
        loyalty_points_redeemed,
        expires_at,
        completed_at,
        cancelled_at,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false })
      .limit(80),

    supabaseAdmin
      .from("payment_provider_configs")
      .select(`
        provider_code,
        provider_name,
        display_name_en,
        display_name_ar,
        provider_type,
        status,
        checkout_enabled,
        supports_card,
        supports_apple_pay,
        supports_mada,
        supports_installments,
        supports_refunds,
        supports_webhooks,
        display_order
      `)
      .order("display_order", { ascending: true }),

    supabaseAdmin
      .from("payment_refunds")
      .select(`
        id,
        payment_transaction_id,
        auth_user_id,
        provider_code,
        provider_refund_id,
        provider_payment_id,
        amount,
        currency_code,
        reason,
        status,
        requested_at,
        completed_at,
        failed_at,
        failure_code,
        failure_message,
        created_at
      `)
      .order("created_at", { ascending: false })
      .limit(40),
  ]);

  if (transactionsResult.error) {
    throw new Error(transactionsResult.error.message);
  }

  if (sessionsResult.error) {
    throw new Error(sessionsResult.error.message);
  }

  if (providersResult.error) {
    throw new Error(providersResult.error.message);
  }

  if (refundsResult.error) {
    throw new Error(refundsResult.error.message);
  }

  const transactions = transactionsResult.data || [];
  const sessions = sessionsResult.data || [];
  const providers = providersResult.data || [];
  const refunds = refundsResult.data || [];

  const paidTransactions = transactions.filter(
    (transaction: any) =>
      transaction.status === "paid" || transaction.status === "captured"
  );

  const pendingSessions = sessions.filter(
    (session: any) =>
      session.status === "created" ||
      session.status === "pending" ||
      session.status === "processing"
  );

  const failedTransactions = transactions.filter(
    (transaction: any) =>
      transaction.status === "failed" ||
      transaction.status === "cancelled" ||
      transaction.status === "canceled"
  );

  const totalCaptured = paidTransactions.reduce(
    (sum: number, transaction: any) =>
      sum + Number(transaction.captured_amount || transaction.amount || 0),
    0
  );

  const totalRefunded = transactions.reduce(
    (sum: number, transaction: any) =>
      sum + Number(transaction.refunded_amount || 0),
    0
  );

  const manualTransactions = transactions.filter(
    (transaction: any) => transaction.provider_code === "manual"
  );

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <span className="badge badge-gold">
          <T en="Payments" ar="المدفوعات" />
        </span>

        <h1>
          <T en="Admin Payments Center" ar="مركز مدفوعات الإدارة" />
        </h1>

        <p>
          <T
            en="Monitor checkout sessions, manual testing payments, provider readiness, transactions, and refunds."
            ar="راقب جلسات الدفع، مدفوعات الاختبار اليدوية، جاهزية مزودي الدفع، العمليات، والاستردادات."
          />
        </p>
      </div>

      <div className="stats-grid" style={{ marginTop: 30 }}>
        <div className="card stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <label>
              <T en="Captured Revenue" ar="إجمالي المدفوع" />
            </label>
            <div className="stat-value">{formatMoney(totalCaptured)}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <label>
              <T en="Paid Transactions" ar="عمليات مدفوعة" />
            </label>
            <div className="stat-value">{paidTransactions.length}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <label>
              <T en="Pending Sessions" ar="جلسات معلقة" />
            </label>
            <div className="stat-value">{pendingSessions.length}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">↩️</div>
          <div className="stat-content">
            <label>
              <T en="Refunded" ar="مسترد" />
            </label>
            <div className="stat-value">{formatMoney(totalRefunded)}</div>
          </div>
        </div>
      </div>

      <section className="card" style={{ marginTop: 30 }}>
        <h2>
          <T en="Payment Providers" ar="مزودو الدفع" />
        </h2>

        <div className="table-responsive" style={{ marginTop: 20 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Type</th>
                <th>Status</th>
                <th>Checkout</th>
                <th>Capabilities</th>
              </tr>
            </thead>

            <tbody>
              {providers.map((provider: any) => (
                <tr key={provider.provider_code}>
                  <td>
                    <div style={{ fontWeight: 800 }}>
                      {provider.display_name_en || provider.provider_name}
                    </div>
                    <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                      {provider.provider_code}
                    </div>
                  </td>

                  <td>{provider.provider_type}</td>

                  <td>
                    <span className={getBadgeClass(provider.status)}>
                      {provider.status}
                    </span>
                  </td>

                  <td>
                    <span
                      className={
                        provider.checkout_enabled
                          ? "badge badge-success"
                          : "badge"
                      }
                    >
                      {provider.checkout_enabled ? "enabled" : "disabled"}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {provider.supports_card ? <span className="badge">card</span> : null}
                      {provider.supports_mada ? <span className="badge">mada</span> : null}
                      {provider.supports_apple_pay ? <span className="badge">apple pay</span> : null}
                      {provider.supports_installments ? <span className="badge">installments</span> : null}
                      {provider.supports_refunds ? <span className="badge">refunds</span> : null}
                      {provider.supports_webhooks ? <span className="badge">webhooks</span> : null}
                    </div>
                  </td>
                </tr>
              ))}

              {providers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 30 }}>
                    <T en="No payment providers configured." ar="لا توجد مزودات دفع." />
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginTop: 30 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2>
              <T en="Recent Transactions" ar="آخر العمليات" />
            </h2>

            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              <T
                en="Manual/testing transactions appear here after checkout confirmation."
                ar="تظهر هنا عمليات الدفع اليدوية/الاختبارية بعد تأكيد جلسة الدفع."
              />
            </p>
          </div>

          <span className="badge">
            {manualTransactions.length} manual
          </span>
        </div>

        <div className="table-responsive" style={{ marginTop: 20 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Source</th>
                <th>Provider</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Reference</th>
                <th>Refund</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 30 }}>
                    <T en="No transactions found." ar="لا توجد عمليات دفع." />
                  </td>
                </tr>
              ) : (
                transactions.map((transaction: any) => (
                  <tr key={transaction.id}>
                    <td>
                      <div style={{ fontWeight: 800 }}>
                        {transaction.full_name || "—"}
                      </div>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        {transaction.email || truncateId(transaction.auth_user_id)}
                      </div>
                    </td>

                    <td>
                      <div>{getSourceLabel(transaction.source_type)}</div>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        {truncateId(transaction.source_id)}
                      </div>
                    </td>

                    <td>
                      <div>{transaction.provider_display_name_en || transaction.provider_code}</div>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        {transaction.payment_method || "—"}
                      </div>
                    </td>

                    <td>
                      <strong>
                        {formatMoney(
                          transaction.amount,
                          transaction.currency_code || "SAR"
                        )}
                      </strong>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        Captured:{" "}
                        {formatMoney(
                          transaction.captured_amount,
                          transaction.currency_code || "SAR"
                        )}
                      </div>
                    </td>

                    <td>
                      <span className={getBadgeClass(transaction.status)}>
                        {transaction.status}
                      </span>
                    </td>

                    <td>
                      <div>{transaction.provider_reference || "—"}</div>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        Tx: {truncateId(transaction.id)}
                      </div>
                    </td>

                    <td>
                      {transaction.provider_code === "manual" &&
                      (transaction.status === "paid" ||
                        transaction.status === "captured" ||
                        transaction.status === "partially_refunded") ? (
                        <AdminManualRefundButton
                          paymentTransactionId={transaction.id}
                          maxRefundAmount={Math.max(
                            Number(transaction.captured_amount || transaction.amount || 0) -
                              Number(transaction.refunded_amount || 0),
                            0
                          )}
                          currencyCode={transaction.currency_code || "SAR"}
                        />
                      ) : (
                        <span className="badge">
                          <T en="Unavailable" ar="غير متاح" />
                        </span>
                      )}
                    </td>

                    <td>{formatDateTime(transaction.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginTop: 30 }}>
        <h2>
          <T en="Recent Checkout Sessions" ar="آخر جلسات الدفع" />
        </h2>

        <div className="table-responsive" style={{ marginTop: 20 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Session</th>
                <th>Source</th>
                <th>Provider</th>
                <th>Amount</th>
                <th>Coupon / Wallet</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>

            <tbody>
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 30 }}>
                    <T en="No checkout sessions found." ar="لا توجد جلسات دفع." />
                  </td>
                </tr>
              ) : (
                sessions.map((session: any) => (
                  <tr key={session.id}>
                    <td>
                      <div style={{ fontWeight: 800 }}>
                        {truncateId(session.id)}
                      </div>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        Ref: {session.provider_reference || "—"}
                      </div>
                    </td>

                    <td>
                      <div>{getSourceLabel(session.source_type)}</div>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        {truncateId(session.source_id)}
                      </div>
                    </td>

                    <td>
                      <div>{session.provider_code}</div>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        {session.payment_method || "—"}
                      </div>
                    </td>

                    <td>
                      <strong>
                        {formatMoney(session.amount, session.currency_code || "SAR")}
                      </strong>
                    </td>

                    <td>
                      <div>Coupon: {session.coupon_code || "—"}</div>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        Discount:{" "}
                        {formatMoney(
                          session.coupon_discount_amount,
                          session.currency_code || "SAR"
                        )}
                      </div>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        Wallet:{" "}
                        {formatMoney(
                          session.wallet_credit_used,
                          session.currency_code || "SAR"
                        )}
                      </div>
                    </td>

                    <td>
                      <span className={getBadgeClass(session.status)}>
                        {session.status}
                      </span>
                    </td>

                    <td>{formatDateTime(session.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginTop: 30 }}>
        <h2>
          <T en="Recent Refunds" ar="آخر الاستردادات" />
        </h2>

        <div className="table-responsive" style={{ marginTop: 20 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Refund</th>
                <th>Transaction</th>
                <th>Provider</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {refunds.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 30 }}>
                    <T en="No refunds found." ar="لا توجد استردادات." />
                  </td>
                </tr>
              ) : (
                refunds.map((refund: any) => (
                  <tr key={refund.id}>
                    <td>{truncateId(refund.id)}</td>
                    <td>{truncateId(refund.payment_transaction_id)}</td>
                    <td>{refund.provider_code}</td>
                    <td>
                      {formatMoney(refund.amount, refund.currency_code || "SAR")}
                    </td>
                    <td>
                      <span className={getBadgeClass(refund.status)}>
                        {refund.status}
                      </span>
                    </td>
                    <td>{refund.reason || "—"}</td>
                    <td>{formatDateTime(refund.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginTop: 30 }}>
        <h2>
          <T en="Important payment notes" ar="ملاحظات مهمة عن الدفع" />
        </h2>

        <ul style={{ color: "var(--muted)", lineHeight: 1.9 }}>
          <li>
            <T
              en="Manual payments are for testing only."
              ar="الدفع اليدوي مخصص للاختبار فقط."
            />
          </li>
          <li>
            <T
              en="Tabby and Tamara are still placeholders until commercial and technical activation."
              ar="تابي وتمارا ما زالت خيارات جاهزة لاحقًا إلى حين التفعيل التجاري والتقني."
            />
          </li>
          <li>
            <T
              en="Real payment provider APIs are not connected yet."
              ar="واجهات مزودي الدفع الحقيقية غير مربوطة حتى الآن."
            />
          </li>
          <li>
            <T
              en="Refund creation will be added in a later patch."
              ar="إنشاء الاستردادات سيتم إضافته في باتش لاحق."
            />
          </li>
        </ul>

        <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/admin/offers" className="btn">
            <T en="Manage offers" ar="إدارة العروض" />
          </Link>

          <Link href="/admin/verifications" className="btn">
            <T en="Verification center" ar="مركز التحقق" />
          </Link>
        </div>
      </section>
    </div>
  );
}
