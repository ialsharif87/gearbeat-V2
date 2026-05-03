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
    <main 
      className="dashboard-page" 
      style={{ 
        background: '#0a0a0a', 
        minHeight: '100vh', 
        padding: '32px' 
      }}
    >
      <section style={{ marginBottom: '32px' }}>
        <span className="gb-dash-badge" style={{ background: 'rgba(207, 168, 110, 0.1)', color: 'var(--gb-gold)', border: '1px solid var(--gb-gold)', marginBottom: '12px' }}>
          <T en="Orders" ar="الطلبات" />
        </span>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '8px 0 0', color: 'white' }}>
          <T en="Orders" ar="الطلبات" />
        </h1>

        <p style={{ color: "#888", fontSize: '0.9rem', marginTop: '8px' }}>
          <T
            en="Manage your marketplace orders and update their status."
            ar="أدر طلبات متجرك وحدّث حالتها."
          />
        </p>
      </section>

      <section className="gb-dash-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div className="gb-card" style={{ background: '#111', borderRadius: '20px', border: '1px solid #1e1e1e', padding: '24px' }}>
          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}><T en="Total items" ar="إجمالي العناصر" /></div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>{items?.length || 0}</div>
        </div>

        <div className="gb-card" style={{ background: '#111', borderRadius: '20px', border: '1px solid #1e1e1e', padding: '24px' }}>
          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}><T en="Paid/active" ar="مدفوع/نشط" /></div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>{paidItems.length}</div>
        </div>

        <div className="gb-card" style={{ background: '#111', borderRadius: '20px', border: '1px solid #1e1e1e', padding: '24px' }}>
          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}><T en="Pending" ar="معلق" /></div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>{pendingItems.length}</div>
        </div>

        <div className="gb-card" style={{ background: '#111', borderRadius: '20px', border: '1px solid #1e1e1e', padding: '24px' }}>
          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}><T en="Revenue" ar="الإيراد" /></div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#cfa86e' }}>{formatMoney(totalRevenue)}</div>
        </div>
      </section>

      <section 
        className="gb-card" 
        style={{ 
          background: '#111', 
          borderRadius: '20px', 
          border: '1px solid #1e1e1e', 
          padding: '24px' 
        }}
      >
        <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px' }}>
          <T en="Order items" ar="عناصر الطلبات" />
        </div>

        <div className="gb-table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: '#666', fontSize: '0.8rem', borderBottom: '1px solid #1a1a1a', textAlign: 'start' }}>
                <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="Order ID" ar="رقم الطلب" /></th>
                <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="Customer" ar="العميل" /></th>
                <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="Product" ar="المنتج" /></th>
                <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="Amount" ar="المبلغ" /></th>
                <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="Status" ar="الحالة" /></th>
                <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="Date" ar="التاريخ" /></th>
              </tr>
            </thead>

            <tbody>
              {!items || items.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 48, color: '#666' }}>
                    <T en="No orders yet" ar="لا توجد طلبات بعد" />
                  </td>
                </tr>
              ) : (
                items.map((item: any) => {
                  const order = Array.isArray(item.order) ? item.order[0] : item.order;
                  const product = Array.isArray(item.product) ? item.product[0] : item.product;

                  const statusLabels: any = {
                    pending: <T en="Pending" ar="معلق" />,
                    paid: <T en="Paid" ar="مدفوع" />,
                    processing: <T en="Processing" ar="قيد المعالجة" />,
                    shipped: <T en="Shipped" ar="تم الشحن" />,
                    delivered: <T en="Delivered" ar="تم التسليم" />,
                    returned: <T en="Returned" ar="مُرجع" />,
                    cancelled: <T en="Cancelled" ar="ملغي" />,
                    refunded: <T en="Refunded" ar="مسترد" />
                  };

                  return (
                    <tr 
                      key={item.id} 
                      style={{ borderBottom: '1px solid #111', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 800 }}>
                          {order?.order_number || item.order_id}
                        </div>
                      </td>

                      <td style={{ padding: '16px' }}>
                        <div>{order?.customer_name || "—"}</div>
                        <div style={{ color: "#666", fontSize: "0.85rem" }}>
                          {order?.customer_email || "—"}
                        </div>
                      </td>

                      <td style={{ padding: '16px' }}>{getProductName(item.product_snapshot, product)}</td>

                      <td style={{ padding: '16px', fontWeight: 700 }}>{formatMoney(item.total_amount, item.currency_code)}</td>

                      <td style={{ padding: '16px' }}>
                        <span 
                          style={{ 
                            padding: '4px 12px', 
                            borderRadius: '99px', 
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: '#3b82f6'
                          }}
                        >
                          {statusLabels[item.status] || item.status}
                        </span>
                      </td>

                      <td style={{ padding: '16px', color: '#666', fontSize: '0.85rem' }}>
                        {formatDate(order?.created_at || item.created_at)}
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
