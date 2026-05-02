import { redirect } from "next/navigation";
import T from "@/components/t";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

function getProductName(snapshot: any, product: any) {
  if (snapshot && typeof snapshot === "object") {
    return snapshot.name_en || snapshot.name_ar || snapshot.sku || "Product";
  }

  return product?.name_en || product?.name_ar || product?.sku || "Product";
}

export default async function VendorOrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login");
  }

  const supabaseAdmin = createAdminClient();

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("auth_user_id, role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (!profile || !["vendor", "admin"].includes(profile.role)) {
    redirect("/forbidden");
  }

  const { data: vendorProfile } = await supabaseAdmin
    .from("vendor_profiles")
    .select("id, auth_user_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const vendorIdCandidates = [
    user.id,
    vendorProfile?.id,
    vendorProfile?.auth_user_id,
  ].filter(Boolean);

  let itemsQuery = supabaseAdmin
    .from("marketplace_order_items")
    .select(`
      id,
      order_id,
      product_id,
      vendor_id,
      quantity,
      unit_price,
      total_amount,
      currency_code,
      status,
      product_snapshot,
      created_at,
      order:marketplace_orders(
        id,
        order_number,
        status,
        payment_status,
        customer_name,
        customer_email,
        created_at
      ),
      product:marketplace_products(
        id,
        sku,
        name_en,
        name_ar
      )
    `)
    .order("created_at", { ascending: false })
    .limit(120);

  if (profile.role !== "admin") {
    itemsQuery = itemsQuery.in("vendor_id", vendorIdCandidates);
  }

  const { data: items, error: itemsError } = await itemsQuery;

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  const paidItems = (items || []).filter((item: any) =>
    ["paid", "processing", "shipped", "delivered", "completed"].includes(item.status)
  );

  const pendingItems = (items || []).filter((item: any) =>
    ["pending"].includes(item.status)
  );

  const totalRevenue = paidItems.reduce(
    (sum: number, item: any) => sum + Number(item.total_amount || 0),
    0
  );

  return (
    <main className="dashboard-page" style={{ maxWidth: 1160, margin: "0 auto" }}>
      <section style={{ marginTop: 24 }}>
        <span className="badge badge-gold">
          <T en="Orders" ar="الطلبات" />
        </span>

        <h1 style={{ marginTop: 10 }}>
          <T en="Vendor marketplace orders" ar="طلبات متجر التاجر" />
        </h1>

        <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
          <T
            en="Manage marketplace order items assigned to your vendor account."
            ar="إدارة عناصر طلبات المتجر المرتبطة بحساب التاجر."
          />
        </p>
      </section>

      <section className="stats-grid" style={{ marginTop: 26 }}>
        <div className="card stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <label>Total items</label>
            <div className="stat-value">{items?.length || 0}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <label>Paid/active</label>
            <div className="stat-value">{paidItems.length}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <label>Pending</label>
            <div className="stat-value">{pendingItems.length}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <label>Revenue</label>
            <div className="stat-value">{formatMoney(totalRevenue)}</div>
          </div>
        </div>
      </section>

      <section className="card" style={{ marginTop: 26 }}>
        <h2>
          <T en="Order items" ar="عناصر الطلبات" />
        </h2>

        <div className="table-responsive" style={{ marginTop: 18 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>

            <tbody>
              {!items || items.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 30 }}>
                    <T en="No order items found." ar="لا توجد عناصر طلبات." />
                  </td>
                </tr>
              ) : (
                items.map((item: any) => {
                  const order = Array.isArray(item.order) ? item.order[0] : item.order;
                  const product = Array.isArray(item.product) ? item.product[0] : item.product;

                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 800 }}>
                          {order?.order_number || item.order_id}
                        </div>
                        <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                          {formatDate(order?.created_at || item.created_at)}
                        </div>
                      </td>

                      <td>
                        <div>{order?.customer_name || "—"}</div>
                        <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                          {order?.customer_email || "—"}
                        </div>
                      </td>

                      <td>{getProductName(item.product_snapshot, product)}</td>

                      <td>{item.quantity}</td>

                      <td>{formatMoney(item.total_amount, item.currency_code)}</td>

                      <td>
                        <span className="badge">{item.status}</span>
                      </td>

                      <td>
                        <form
                          action="/api/marketplace/orders/update-status"
                          method="post"
                          style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                        >
                          <select className="input" name="status" defaultValue={item.status}>
                            <option value="processing">processing</option>
                            <option value="shipped">shipped</option>
                            <option value="delivered">delivered</option>
                            <option value="completed">completed</option>
                            <option value="cancelled">cancelled</option>
                          </select>

                          <button
                            type="button"
                            className="btn btn-small"
                            data-order-item-status
                            data-item-id={item.id}
                          >
                            Save
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener("click", async function(event) {
              const button = event.target.closest("[data-order-item-status]");
              if (!button) return;

              const form = button.closest("form");
              const itemId = button.getAttribute("data-item-id");
              const status = form.querySelector("select[name='status']").value;

              const response = await fetch("/api/marketplace/orders/update-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ scope: "item", itemId, status })
              });

              if (response.ok) {
                window.location.reload();
              } else {
                const data = await response.json().catch(() => null);
                alert(data && data.error ? data.error : "Could not update item status.");
              }
            });
          `,
        }}
      />
    </main>
  );
}
