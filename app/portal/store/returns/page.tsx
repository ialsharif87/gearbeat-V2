import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import T from "@/components/t";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function getVendorUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login");
  }

  const supabaseAdmin = createAdminClient();
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!profile || !["vendor", "admin"].includes(profile.role)) {
    redirect("/forbidden");
  }

  return user;
}

export default async function VendorReturnsPage() {
  const user = await getVendorUser();
  const supabaseAdmin = createAdminClient();

  const { data: orders } = await supabaseAdmin
    .from("marketplace_orders")
    .select(`
      id,
      order_number,
      customer_auth_user_id,
      status,
      total_amount,
      currency_code,
      created_at,
      items:marketplace_order_items(
        id,
        quantity,
        total_price,
        product:marketplace_products(
          name_en,
          name_ar,
          sku
        )
      )
    `)
    .eq("vendor_auth_user_id", user.id)
    .in("status", ["return_requested", "returned", "refunded"])
    .order("created_at", { ascending: false });

  async function updateStatus(formData: FormData) {
    "use server";
    const orderId = formData.get("orderId") as string;
    const nextStatus = formData.get("nextStatus") as string;

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin
      .from("marketplace_orders")
      .update({ status: nextStatus })
      .eq("id", orderId);

    if (!error) {
      revalidatePath("/portal/store/returns");
    }
  }

  return (
    <main 
      className="dashboard-page" 
      style={{ 
        background: '#0a0a0a', 
        minHeight: '100vh', 
        padding: '32px',
        color: '#fff'
      }}
    >
      <section style={{ marginBottom: '40px' }}>
        <span className="gb-dash-badge" style={{ background: 'rgba(207, 168, 110, 0.1)', color: 'var(--gb-gold)', border: '1px solid var(--gb-gold)', marginBottom: '12px' }}>
          <T en="Returns" ar="الإرجاعات" />
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '8px 0 0', color: 'white' }}>
          <T en="Return Requests" ar="طلبات الإرجاع" />
        </h1>
        <p style={{ color: "#888", fontSize: '0.9rem', marginTop: '8px', maxWidth: 600 }}>
          <T
            en="Manage and track customer return requests, approval, and refund processing."
            ar="إدارة وتتبع طلبات إرجاع العملاء، والاعتماد، ومعالجة استرداد الأموال."
          />
        </p>
      </section>

      <div 
        className="gb-card" 
        style={{ 
          background: '#111', 
          borderRadius: '20px', 
          border: '1px solid #1e1e1e', 
          padding: '24px' 
        }}
      >
        {!orders || orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: 64 }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>↩️</div>
            <h3 style={{ color: 'white' }}>
              <T en="No return requests yet" ar="لا توجد طلبات إرجاع بعد" />
            </h3>
            <p style={{ color: "#666" }}>
              <T en="When customers request a return, they will appear here." ar="عندما يطلب العملاء الإرجاع، ستظهر الطلبات هنا." />
            </p>
          </div>
        ) : (
          <div className="gb-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#666', fontSize: '0.8rem', borderBottom: '1px solid #1a1a1a', textAlign: 'start' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="Order ID" ar="رقم الطلب" /></th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="Amount" ar="المبلغ" /></th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="Status" ar="الحالة" /></th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="Date" ar="التاريخ" /></th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="Actions" ar="الإجراءات" /></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <td style={{ padding: '16px' }}>
                      <strong style={{ color: 'white' }}>#{String(order.order_number || order.id).slice(0, 8).toUpperCase()}</strong>
                    </td>
                    <td style={{ padding: '16px', fontWeight: 700 }}>
                      {order.total_amount} {order.currency_code || "SAR"}
                    </td>
                    <td style={{ padding: '16px' }}>
                      {order.status === "return_requested" && (
                        <span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '0.75rem', background: 'rgba(234,179,8,0.1)', color: '#eab308' }}>
                          <T en="Pending" ar="معلق" />
                        </span>
                      )}
                      {order.status === "returned" && (
                        <span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '0.75rem', background: 'rgba(249,115,22,0.1)', color: '#f97316' }}>
                          <T en="Returned" ar="مُرجع" />
                        </span>
                      )}
                      {order.status === "refunded" && (
                        <span style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '0.75rem', background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                          <T en="Refunded" ar="مسترد" />
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px', color: '#666', fontSize: '0.85rem' }}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        {order.status === "return_requested" && (
                          <>
                            <form action={updateStatus}>
                              <input type="hidden" name="orderId" value={order.id} />
                              <input type="hidden" name="nextStatus" value="returned" />
                              <button 
                                type="submit" 
                                style={{ background: '#cfa86e', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                              >
                                <T en="Approve Return" ar="قبول الإرجاع" />
                              </button>
                            </form>
                            <form action={updateStatus}>
                              <input type="hidden" name="orderId" value={order.id} />
                              <input type="hidden" name="nextStatus" value="delivered" />
                              <button 
                                type="submit" 
                                style={{ background: '#222', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                              >
                                <T en="Reject" ar="رفض" />
                              </button>
                            </form>
                          </>
                        )}
                        {order.status === "returned" && (
                          <form action={updateStatus}>
                            <input type="hidden" name="orderId" value={order.id} />
                            <input type="hidden" name="nextStatus" value="refunded" />
                            <button 
                              type="submit" 
                              style={{ background: '#cfa86e', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                            >
                              <T en="Mark Refunded" ar="تم الاسترداد" />
                            </button>
                          </form>
                        )}
                        {order.status === "refunded" && (
                          <span style={{ color: '#666', fontSize: '0.85rem' }}>
                            <T en="Completed" ar="مكتمل" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
