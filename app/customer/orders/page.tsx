import Link from "next/link";
import { redirect } from "next/navigation";
import T from "@/components/t";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function formatDate(value: unknown) {
  if (!value) return "—";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-SA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatMoney(value: unknown, currency = "SAR") {
  const numberValue = Number(value || 0);
  if (!Number.isFinite(numberValue)) return `0.00 ${currency}`;
  return `${numberValue.toFixed(2)} ${currency}`;
}

function getStatusColor(status: string) {
  const s = status.toLowerCase();
  if (s === "pending") return "rgba(255, 176, 32, 0.15)";
  if (s === "paid" || s === "processing") return "rgba(32, 156, 255, 0.15)";
  if (s === "shipped") return "rgba(156, 32, 255, 0.15)";
  if (s === "delivered") return "rgba(0, 255, 136, 0.15)";
  if (s === "returned") return "rgba(255, 120, 32, 0.15)";
  if (s === "refunded") return "rgba(120, 120, 120, 0.15)";
  return "rgba(255, 255, 255, 0.1)";
}

function getStatusTextColor(status: string) {
  const s = status.toLowerCase();
  if (s === "pending") return "#ffb020";
  if (s === "paid" || s === "processing") return "#209cff";
  if (s === "shipped") return "#9c20ff";
  if (s === "delivered") return "#00ff88";
  if (s === "returned") return "#ff7820";
  if (s === "refunded") return "#888888";
  return "white";
}

export default async function CustomerOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?account=customer");
  }

  // Fetch marketplace orders with items and products
  const { data: orders, error } = await supabase
    .from("marketplace_orders")
    .select(`
      id,
      order_number,
      status,
      total_amount,
      currency_code,
      created_at,
      items:marketplace_order_items(
        id,
        quantity,
        total_price,
        product:marketplace_products(
          id,
          name_en,
          name_ar,
          slug,
          images
        )
      )
    `)
    .eq("customer_auth_user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
  }

  const orderRows = orders || [];

  return (
    <main className="gb-customer-page">
      <section className="gb-customer-header">
        <div>
          <p className="gb-eyebrow">
            <T en="My Orders" ar="طلباتي" />
          </p>

          <h1 style={{ marginTop: 10 }}>
            <T en="Gear order history" ar="سجل طلبات المعدات" />
          </h1>

          <p className="gb-muted-text" style={{ maxWidth: 760 }}>
            <T
              en="Track your gear purchases, status updates, and marketplace orders."
              ar="تابع مشترياتك من المعدات، تحديثات الحالة، وطلبات السوق الخاصة بك."
            />
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/gear" className="btn btn-primary">
            <T en="Browse gear" ar="تصفح المعدات" />
          </Link>

          <Link href="/customer" className="btn">
            <T en="Dashboard" ar="لوحة العميل" />
          </Link>
        </div>
      </section>

      <div className="gb-customer-shell">
        <div style={{ display: "grid", gap: 20 }}>
        {orderRows.length === 0 ? (
          <div
            className="card"
            style={{
              textAlign: "center",
              padding: "80px 20px",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: 20 }}>📦</div>
            <h3>
              <T en="No orders yet" ar="لا توجد طلبات بعد" />
            </h3>
            <p style={{ color: "var(--muted)", marginBottom: 24 }}>
              <T
                en="Explore the marketplace and find the best creative gear."
                ar="استكشف السوق وجد أفضل المعدات الإبداعية."
              />
            </p>
            <Link href="/gear" className="btn btn-primary">
              <T en="Go to Marketplace" ar="اذهب إلى السوق" />
            </Link>
          </div>
        ) : (
          orderRows.map((order: any) => (
            <article key={order.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div
                style={{
                  padding: "16px 24px",
                  background: "rgba(255,255,255,0.03)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>
                      <T en="ORDER ID" ar="رقم الطلب" />
                    </label>
                    <strong style={{ fontSize: "0.95rem" }}>
                      #{String(order.order_number || order.id).slice(0, 8).toUpperCase()}
                    </strong>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>
                      <T en="PLACED ON" ar="تم الطلب في" />
                    </label>
                    <span style={{ fontSize: "0.95rem" }}>{formatDate(order.created_at)}</span>
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginBottom: 4 }}>
                      <T en="TOTAL" ar="الإجمالي" />
                    </label>
                    <strong style={{ fontSize: "0.95rem" }}>
                      {formatMoney(order.total_amount, order.currency_code || "SAR")}
                    </strong>
                  </div>
                </div>

                <div
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    background: getStatusColor(order.status),
                    color: getStatusTextColor(order.status),
                    border: `1px solid ${getStatusTextColor(order.status)}33`,
                  }}
                >
                  {order.status}
                </div>
              </div>

              <div style={{ padding: 24 }}>
                <div style={{ display: "grid", gap: 16 }}>
                  {order.items?.map((item: any) => (
                    <div key={item.id} style={{ display: "flex", gap: 16, alignItems: "center" }}>
                      <div
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 8,
                          background: "rgba(255,255,255,0.05)",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        {item.product?.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                            📦
                          </div>
                        )}
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <Link
                          href={`/gear/products/${item.product?.slug}`}
                          className="text-link"
                          style={{ fontWeight: 600, fontSize: "1rem", display: "block" }}
                        >
                          <T en={item.product?.name_en} ar={item.product?.name_ar} />
                        </Link>
                        <div style={{ fontSize: "0.9rem", color: "var(--muted)", marginTop: 4 }}>
                          <T en="Quantity" ar="الكمية" />: {item.quantity} · {formatMoney(item.total_price, order.currency_code)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: 24,
                    paddingTop: 20,
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    gap: 12,
                    justifyContent: "flex-end",
                  }}
                >
                  <button className="btn btn-secondary" style={{ pointerEvents: "none", opacity: 0.8 }}>
                    <T en="Track Order" ar="تتبع الطلب" />
                  </button>
                  <Link href={`/customer/orders/${order.id}`} className="btn">
                    <T en="Order Details" ar="تفاصيل الطلب" />
                  </Link>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
        </div>
      </div>
    </main>
  );
}
