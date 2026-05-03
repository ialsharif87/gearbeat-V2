import Link from "next/link";
import { redirect } from "next/navigation";
import T from "@/components/t";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireCustomerOrRedirect } from "@/lib/auth-guards";

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

function getBadgeClass(status: string | null | undefined) {
  if (status === "paid" || status === "processing" || status === "shipped" || status === "delivered" || status === "completed") {
    return "badge badge-success";
  }

  if (status === "pending" || status === "pending_payment" || status === "unpaid") {
    return "badge badge-warning";
  }

  if (status === "cancelled" || status === "canceled" || status === "failed" || status === "refunded") {
    return "badge badge-danger";
  }

  return "badge";
}

function getProductName(snapshot: any) {
  if (!snapshot || typeof snapshot !== "object") {
    return "Product";
  }

  return snapshot.name_en || snapshot.name_ar || snapshot.sku || "Product";
}

export default async function CustomerMarketplaceOrdersPage() {
  const supabase = await createClient();

  const { user } = await requireCustomerOrRedirect(supabase);

  const supabaseAdmin = createAdminClient();

  const { data: orders, error } = await supabaseAdmin
    .from("marketplace_orders")
    .select(`
      id,
      order_number,
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
    .eq("auth_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(80);

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="gb-customer-page">
      <section className="gb-customer-header">
        <div>
          <p className="gb-eyebrow">
            <T en="Marketplace Orders" ar="طلبات المتجر" />
          </p>

          <h1 style={{ marginTop: 10 }}>
            <T en="My marketplace orders" ar="طلباتي من المتجر" />
          </h1>

          <p className="gb-muted-text">
            <T
              en="Track your marketplace equipment orders."
              ar="تابع طلبات معدات المتجر الخاصة بك."
            />
          </p>
        </div>

        <Link href="/marketplace" className="btn">
          <T en="Browse marketplace" ar="تصفح المتجر" />
        </Link>
      </section>

      <div className="gb-customer-shell">
        <section style={{ display: "grid", gap: 18 }}>
          {!orders || orders.length === 0 ? (
            <div className="gb-empty-state" style={{ textAlign: "center", padding: 34 }}>
              <h2>
                <T en="No marketplace orders yet" ar="لا توجد طلبات متجر بعد" />
              </h2>
              <p style={{ color: "var(--muted)" }}>
                <T
                  en="Your marketplace orders will appear here after checkout."
                  ar="ستظهر طلبات المتجر هنا بعد إتمام الطلب."
                />
              </p>
            </div>
          ) : (
            orders.map((order: any) => (
              <article key={order.id} className="card" style={{ display: "grid", gap: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 14,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h2 style={{ margin: 0 }}>{order.order_number || order.id}</h2>
                    <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
                      {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span className={getBadgeClass(order.status)}>
                      {order.status}
                    </span>
                    <span className={getBadgeClass(order.payment_status)}>
                      {order.payment_status}
                    </span>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  {(order.items || []).map((item: any) => (
                    <div
                      key={item.id}
                      style={{
                        padding: 12,
                        borderRadius: 14,
                        background: "rgba(255,255,255,0.035)",
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <strong>{getProductName(item.product_snapshot)}</strong>
                        <p style={{ color: "var(--muted)", margin: "4px 0 0" }}>
                          Qty: {item.quantity} · {item.status}
                        </p>
                      </div>

                      <strong>
                        {formatMoney(item.total_amount, order.currency_code || "SAR")}
                      </strong>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    paddingTop: 14,
                  }}
                >
                  <span style={{ color: "var(--muted)" }}>
                    <T en="Total" ar="الإجمالي" />
                  </span>
                  <strong>{formatMoney(order.total_amount, order.currency_code)}</strong>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
