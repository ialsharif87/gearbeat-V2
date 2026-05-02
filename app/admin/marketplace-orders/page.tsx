import T from "@/components/t";
import { requireAdminLayoutAccess } from "@/lib/route-guards";

export const dynamic = "force-dynamic";

function formatDate(value: unknown) {
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

export default async function AdminMarketplaceOrdersPage() {
  const { supabaseAdmin } = await requireAdminLayoutAccess();

  const { data: orders, error } = await supabaseAdmin
    .from("marketplace_orders")
    .select(`
      id,
      order_number,
      auth_user_id,
      customer_name,
      customer_email,
      status,
      payment_status,
      subtotal_amount,
      total_amount,
      currency_code,
      created_at,
      items:marketplace_order_items(
        id,
        product_id,
        vendor_id,
        quantity,
        unit_price,
        total_amount,
        status,
        product_snapshot
      )
    `)
    .order("created_at", { ascending: false })
    .limit(120);

  if (error) {
    throw new Error(error.message);
  }

  const totalRevenue = (orders || []).reduce(
    (sum: number, order: any) =>
      sum + (order.payment_status === "paid" ? Number(order.total_amount || 0) : 0),
    0
  );

  const paidOrders = (orders || []).filter(
    (order: any) => order.payment_status === "paid"
  );

  const pendingOrders = (orders || []).filter(
    (order: any) => order.payment_status !== "paid"
  );

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <span className="badge badge-gold">
          <T en="Marketplace Orders" ar="طلبات المتجر" />
        </span>

        <h1>
          <T en="Admin Marketplace Orders" ar="إدارة طلبات المتجر" />
        </h1>

        <p>
          <T
            en="Monitor marketplace orders, payment status, and vendor order items."
            ar="راقب طلبات المتجر وحالة الدفع وعناصر طلبات التجار."
          />
        </p>
      </div>

      <div className="stats-grid" style={{ marginTop: 30 }}>
        <div className="card stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <label>Total orders</label>
            <div className="stat-value">{orders?.length || 0}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <label>Paid</label>
            <div className="stat-value">{paidOrders.length}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <label>Pending</label>
            <div className="stat-value">{pendingOrders.length}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <label>Paid revenue</label>
            <div className="stat-value">{formatMoney(totalRevenue)}</div>
          </div>
        </div>
      </div>

      <section className="card" style={{ marginTop: 30 }}>
        <h2>
          <T en="Orders" ar="الطلبات" />
        </h2>

        <div className="table-responsive" style={{ marginTop: 20 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Update</th>
              </tr>
            </thead>

            <tbody>
              {!orders || orders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 30 }}>
                    <T en="No marketplace orders found." ar="لا توجد طلبات متجر." />
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order.id}>
                    <td>
                      <div style={{ fontWeight: 900 }}>
                        {order.order_number || order.id}
                      </div>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        {formatDate(order.created_at)}
                      </div>
                    </td>

                    <td>
                      <div>{order.customer_name || "—"}</div>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        {order.customer_email || order.auth_user_id}
                      </div>
                    </td>

                    <td>{order.items?.length || 0}</td>

                    <td>{formatMoney(order.total_amount, order.currency_code)}</td>

                    <td>
                      <span className="badge">{order.status}</span>
                    </td>

                    <td>
                      <span className="badge">{order.payment_status}</span>
                    </td>

                    <td>
                      <form
                        action="/api/marketplace/orders/update-status"
                        method="post"
                        style={{ display: "grid", gap: 8 }}
                      >
                        <select className="input" name="status" defaultValue={order.status}>
                          <option value="pending_payment">pending_payment</option>
                          <option value="paid">paid</option>
                          <option value="processing">processing</option>
                          <option value="shipped">shipped</option>
                          <option value="delivered">delivered</option>
                          <option value="completed">completed</option>
                          <option value="cancelled">cancelled</option>
                          <option value="refunded">refunded</option>
                          <option value="archived">archived</option>
                        </select>

                        <button
                          type="button"
                          className="btn btn-small"
                          data-order-status
                          data-order-id={order.id}
                        >
                          Save
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener("click", async function(event) {
              const button = event.target.closest("[data-order-status]");
              if (!button) return;

              const form = button.closest("form");
              const orderId = button.getAttribute("data-order-id");
              const status = form.querySelector("select[name='status']").value;

              const response = await fetch("/api/marketplace/orders/update-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ scope: "order", orderId, status })
              });

              if (response.ok) {
                window.location.reload();
              } else {
                const data = await response.json().catch(() => null);
                alert(data && data.error ? data.error : "Could not update order status.");
              }
            });
          `,
        }}
      />
    </div>
  );
}
