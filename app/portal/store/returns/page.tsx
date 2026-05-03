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

  const { data: orders, error } = await supabaseAdmin
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
    <div className="dashboard-page">
      <div className="page-header">
        <span className="badge badge-gold">
          <T en="Returns Management" ar="إدارة الإرجاعات" />
        </span>
        <h1 style={{ marginTop: 12 }}>
          <T en="Returns" ar="الإرجاعات" />
        </h1>
        <p style={{ color: "var(--muted)", maxWidth: 600 }}>
          <T
            en="Manage and track customer return requests, approval, and refund processing."
            ar="إدارة وتتبع طلبات إرجاع العملاء، والاعتماد، ومعالجة استرداد الأموال."
          />
        </p>
      </div>

      <div style={{ marginTop: 32 }}>
        {!orders || orders.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 64 }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>↩️</div>
            <h3>
              <T en="No return requests yet" ar="لا توجد طلبات إرجاع بعد" />
            </h3>
            <p style={{ color: "var(--muted)" }}>
              <T en="When customers request a return, they will appear here." ar="عندما يطلب العملاء الإرجاع، ستظهر الطلبات هنا." />
            </p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="table-responsive">
              <table className="portal-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "start", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <th style={{ padding: 16 }}><T en="Order ID" ar="رقم الطلب" /></th>
                    <th style={{ padding: 16 }}><T en="Products" ar="المنتجات" /></th>
                    <th style={{ padding: 16 }}><T en="Amount" ar="المبلغ" /></th>
                    <th style={{ padding: 16 }}><T en="Status" ar="الحالة" /></th>
                    <th style={{ padding: 16 }}><T en="Date" ar="التاريخ" /></th>
                    <th style={{ padding: 16 }}><T en="Actions" ar="الإجراءات" /></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: 16 }}>
                        <strong style={{ fontSize: "0.9rem" }}>
                          #{String(order.order_number || order.id).slice(0, 8).toUpperCase()}
                        </strong>
                      </td>
                      <td style={{ padding: 16 }}>
                        <div style={{ fontSize: "0.85rem" }}>
                          {order.items?.map((item: any) => (
                            <div key={item.id}>
                              {item.product?.name_en} (x{item.quantity})
                            </div>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: 16 }}>
                        <strong>{order.total_amount} {order.currency_code || "SAR"}</strong>
                      </td>
                      <td style={{ padding: 16 }}>
                        {order.status === "return_requested" && (
                          <span className="badge badge-warning">
                            <T en="Pending" ar="معلق" />
                          </span>
                        )}
                        {order.status === "returned" && (
                          <span className="badge badge-orange" style={{ background: "rgba(255,165,0,0.15)", color: "#ffa500" }}>
                            <T en="Returned" ar="مرجع" />
                          </span>
                        )}
                        {order.status === "refunded" && (
                          <span className="badge badge-success">
                            <T en="Refunded" ar="مسترجع" />
                          </span>
                        )}
                      </td>
                      <td style={{ padding: 16, color: "var(--muted)", fontSize: "0.85rem" }}>
                        {new Date(order.created_at).toLocaleDateString("en-SA")}
                      </td>
                      <td style={{ padding: 16 }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          {order.status === "return_requested" && (
                            <>
                              <form action={updateStatus}>
                                <input type="hidden" name="orderId" value={order.id} />
                                <input type="hidden" name="nextStatus" value="returned" />
                                <button type="submit" className="btn btn-small">
                                  <T en="Approve" ar="اعتماد" />
                                </button>
                              </form>
                              <form action={updateStatus}>
                                <input type="hidden" name="orderId" value={order.id} />
                                <input type="hidden" name="nextStatus" value="delivered" />
                                <button type="submit" className="btn btn-secondary btn-small">
                                  <T en="Reject" ar="رفض" />
                                </button>
                              </form>
                            </>
                          )}
                          {order.status === "returned" && (
                            <form action={updateStatus}>
                              <input type="hidden" name="orderId" value={order.id} />
                              <input type="hidden" name="nextStatus" value="refunded" />
                              <button type="submit" className="btn btn-gold btn-small">
                                <T en="Mark Refunded" ar="تحديد كمسترجع" />
                              </button>
                            </form>
                          )}
                          {order.status === "refunded" && (
                            <span className="badge" style={{ opacity: 0.7 }}>
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
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .portal-table th { font-weight: 600; font-size: 0.8rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .badge-orange { padding: 4px 10px; border-radius: 99px; font-size: 0.75rem; font-weight: 700; }
        .btn-gold { background: var(--gb-gold); color: var(--gb-dark); }
        .btn-gold:hover { opacity: 0.9; }
      `}} />
    </div>
  );
}
