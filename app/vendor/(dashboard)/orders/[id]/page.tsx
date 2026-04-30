import { requireVendorLayoutAccess } from "@/lib/route-guards";
import T from "@/components/t";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function VendorOrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabaseAdmin, user } = await requireVendorLayoutAccess();

  // Fetch the order and the items belonging to this vendor
  const { data: order } = await supabaseAdmin
    .from("marketplace_orders")
    .select(`
      *,
      items:marketplace_order_items(
        *,
        product:marketplace_products(name_en, name_ar)
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  // Filter items for this vendor only
  const vendorItems = order.items.filter((i: any) => i.vendor_id === user.id);

  async function updateItemStatus(formData: FormData) {
    "use server";
    const itemId = formData.get("item_id") as string;
    const status = formData.get("status") as string;

    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();

    await admin
      .from("marketplace_order_items")
      .update({ status })
      .eq("id", itemId);

    revalidatePath(`/vendor/orders/${id}`);
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <span className="badge">
            <T en="Order Details" ar="تفاصيل الطلب" />
          </span>
          <h1><T en="Order" ar="طلب" /> #{order.order_number}</h1>
          <p><T en="Review items and update fulfillment status." ar="مراجعة العناصر وتحديث حالة التنفيذ." /></p>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 30 }}>
        {/* ITEMS LIST */}
        <div className="card">
          <div className="card-head">
            <h3><T en="My Items" ar="عناصري في هذا الطلب" /></h3>
          </div>
          <div style={{ marginTop: 20, display: 'grid', gap: 20 }}>
            {vendorItems.map((item: any) => (
              <div key={item.id} className="item-fulfillment-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.product?.name_en}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Qty: {item.quantity} · {item.total_price} SAR</div>
                </div>
                
                <div style={{ display: 'flex', gap: 10 }}>
                  <span className={`badge badge-${item.status === 'shipped' ? 'success' : 'warning'}`}>
                    {item.status}
                  </span>
                  
                  <form action={updateItemStatus}>
                    <input type="hidden" name="item_id" value={item.id} />
                    <select name="status" className="input input-small" style={{ width: 120, height: 34 }} onChange={(e) => e.target.form?.requestSubmit()}>
                      <option value="pending" disabled={item.status !== 'pending'}>Pending</option>
                      <option value="confirmed" selected={item.status === 'confirmed'}>Confirmed</option>
                      <option value="processing" selected={item.status === 'processing'}>Processing</option>
                      <option value="shipped" selected={item.status === 'shipped'}>Shipped</option>
                      <option value="delivered" selected={item.status === 'delivered'}>Delivered</option>
                    </select>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CUSTOMER & SHIPPING */}
        <div className="card">
          <div className="card-head">
            <h3><T en="Customer & Shipping" ar="العميل والشحن" /></h3>
          </div>
          <div style={{ marginTop: 20, display: 'grid', gap: 15 }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--muted)' }}><T en="Order Status" ar="حالة الطلب العامة" /></label>
              <div style={{ fontWeight: 700, color: 'var(--gb-gold)' }}>{order.status.toUpperCase()}</div>
            </div>
            <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.05)' }} />
            <p>
              <T en="Shipping address and customer contact details will appear here once the order is confirmed." ar="ستظهر تفاصيل عنوان الشحن والاتصال بالعميل هنا بمجرد تأكيد الطلب." />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
