import T from "@/components/t";
import { requireVendorLayoutAccess } from "@/lib/route-guards";

function formatMoney(value: unknown) {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return "0.00 SAR";
  }

  return `${numberValue.toFixed(2)} SAR`;
}

function formatDate(value: unknown) {
  if (!value) {
    return "—";
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-SA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default async function VendorFinancePage() {
  const { supabaseAdmin, user } = await requireVendorLayoutAccess();

  const { data: orderItems, error } = await supabaseAdmin
    .from("marketplace_order_items")
    .select(`
      id,
      order_id,
      product_name,
      variant_name,
      sku,
      quantity,
      total_price,
      commission_amount,
      vendor_net_amount,
      status,
      created_at,
      order:marketplace_orders(
        id,
        order_number,
        status,
        payment_status,
        created_at
      )
    `)
    .eq("vendor_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const items = orderItems || [];

  const totalSales = items.reduce(
    (sum: number, item: any) => sum + Number(item.total_price || 0),
    0
  );

  const totalCommission = items.reduce(
    (sum: number, item: any) => sum + Number(item.commission_amount || 0),
    0
  );

  const totalNet = items.reduce(
    (sum: number, item: any) => sum + Number(item.vendor_net_amount || 0),
    0
  );

  const pendingSales = items
    .filter((item: any) => item.status !== "delivered")
    .reduce(
      (sum: number, item: any) => sum + Number(item.vendor_net_amount || 0),
      0
    );

  const availableBalance = items
    .filter((item: any) => item.status === "delivered")
    .reduce(
      (sum: number, item: any) => sum + Number(item.vendor_net_amount || 0),
      0
    );

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <span className="badge">
            <T en="Financial Management" ar="الإدارة المالية" />
          </span>
          <h1>
            <T en="Earnings & Reports" ar="الأرباح والتقارير" />
          </h1>
          <p>
            <T
              en="Track your vendor revenue, platform commissions, and available balance."
              ar="تابع إيرادات التاجر، وعمولات المنصة، والرصيد المتاح."
            />
          </p>
        </div>
      </div>

      <div className="stats-grid" style={{ marginTop: 30 }}>
        <div className="card stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <label>
              <T en="Total Gross Sales" ar="إجمالي المبيعات" />
            </label>
            <div className="stat-value">{formatMoney(totalSales)}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <label>
              <T en="Net Earnings" ar="صافي الأرباح" />
            </label>
            <div className="stat-value" style={{ color: "var(--gb-gold)" }}>
              {formatMoney(totalNet)}
            </div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">🏦</div>
          <div className="stat-content">
            <label>
              <T en="Available for Payout" ar="متاح للسحب" />
            </label>
            <div className="stat-value" style={{ color: "#00ff88" }}>
              {formatMoney(availableBalance)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 30 }}>
        <div className="card">
          <div className="card-head">
            <h3>
              <T en="Revenue Breakdown" ar="تفاصيل الإيرادات" />
            </h3>
          </div>

          <div style={{ marginTop: 20, display: "grid", gap: 15 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>
                <T en="Total Sales" ar="إجمالي المبيعات" />
              </span>
              <span>{formatMoney(totalSales)}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>
                <T en="Platform Commission" ar="عمولة المنصة" />
              </span>
              <span style={{ color: "#ff4d4d" }}>
                - {formatMoney(totalCommission)}
              </span>
            </div>

            <hr
              style={{
                border: 0,
                borderTop: "1px solid rgba(255,255,255,0.05)",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 700,
              }}
            >
              <span>
                <T en="Your Net Share" ar="صافي حصتك" />
              </span>
              <span style={{ color: "var(--gb-gold)" }}>
                {formatMoney(totalNet)}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>
              <T en="Payout Status" ar="حالة السحب" />
            </h3>
          </div>

          <div style={{ marginTop: 20, display: "grid", gap: 15 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>
                <T en="Pending Fulfillment" ar="بانتظار التنفيذ" />
              </span>
              <span>{formatMoney(pendingSales)}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--muted)" }}>
                <T en="Settled & Ready" ar="تمت التسوية وجاهز" />
              </span>
              <span style={{ color: "#00ff88" }}>
                {formatMoney(availableBalance)}
              </span>
            </div>

            <button
              className="btn btn-primary w-full"
              style={{ marginTop: 10 }}
              disabled={availableBalance <= 0}
              type="button"
            >
              <T en="Request Payout" ar="طلب سحب الأرباح" />
            </button>

            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--muted)",
                textAlign: "center",
              }}
            >
              <T
                en="Payout requests are not active yet. This button is currently disabled until the payout workflow is finalized."
                ar="طلبات السحب غير مفعلة حاليًا. هذا الزر معطل إلى أن يتم تثبيت مسار التحويلات."
              />
            </p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 30, padding: 0 }}>
        <div className="card-head" style={{ padding: "25px 25px 10px" }}>
          <h3>
            <T en="Detailed Sales Report" ar="تقرير المبيعات التفصيلي" />
          </h3>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <T en="Item ID" ar="رقم العنصر" />
                </th>
                <th>
                  <T en="Order" ar="الطلب" />
                </th>
                <th>
                  <T en="Product" ar="المنتج" />
                </th>
                <th>
                  <T en="Date" ar="التاريخ" />
                </th>
                <th>
                  <T en="Gross" ar="الإجمالي" />
                </th>
                <th>
                  <T en="Fee" ar="العمولة" />
                </th>
                <th>
                  <T en="Net" ar="الصافي" />
                </th>
                <th>
                  <T en="Status" ar="الحالة" />
                </th>
              </tr>
            </thead>

            <tbody>
              {items.slice(0, 10).map((item: any) => {
                const order = Array.isArray(item.order)
                  ? item.order[0]
                  : item.order;

                const orderLabel =
                  order?.order_number ||
                  item.order_id?.slice?.(0, 8) ||
                  "—";

                const productLabel =
                  item.product_name ||
                  item.variant_name ||
                  item.sku ||
                  "Marketplace Item";

                return (
                  <tr key={item.id}>
                    <td style={{ fontSize: "0.8rem" }}>
                      #{String(item.id).slice(0, 8)}
                    </td>

                    <td style={{ fontSize: "0.8rem" }}>
                      #{orderLabel}
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>{productLabel}</div>
                      {item.sku ? (
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--muted)",
                          }}
                        >
                          SKU: {item.sku}
                        </div>
                      ) : null}
                    </td>

                    <td style={{ fontSize: "0.85rem" }}>
                      {formatDate(item.created_at)}
                    </td>

                    <td>{formatMoney(item.total_price)}</td>

                    <td style={{ color: "#ff4d4d" }}>
                      {formatMoney(item.commission_amount)}
                    </td>

                    <td style={{ fontWeight: 700, color: "var(--gb-gold)" }}>
                      {formatMoney(item.vendor_net_amount)}
                    </td>

                    <td>
                      <span
                        className={`badge badge-small badge-${
                          item.status === "delivered" ? "success" : "warning"
                        }`}
                      >
                        {item.status || "pending"}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: "center",
                      padding: 40,
                      color: "var(--muted)",
                    }}
                  >
                    <T en="No sales data found." ar="لا توجد بيانات مبيعات." />
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
