import { requireVendorLayoutAccess } from "@/lib/route-guards";
import T from "@/components/t";
import Link from "next/link";

export default async function VendorOrdersPage() {
  const { supabaseAdmin, user } = await requireVendorLayoutAccess();

  // Fetch order items belonging to this vendor
  // We join with marketplace_orders to get order metadata
  const { data: orderItems } = await supabaseAdmin
    .from("marketplace_order_items")
    .select(`
      id,
      quantity,
      unit_price,
      total_price,
      status,
      created_at,
      order:marketplace_orders(
        id,
        order_number,
        status,
        customer_auth_user_id
      ),
      product:marketplace_products(name_en, name_ar)
    `)
    .eq("vendor_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <span className="badge">
            <T en="Order Fulfillment" ar="تنفيذ الطلبات" />
          </span>
          <h1><T en="My Orders" ar="طلباتي" /></h1>
          <p><T en="Manage and process your product sales." ar="إدارة ومعالجة مبيعات منتجاتك." /></p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 30, padding: 0, overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th><T en="Order #" ar="رقم الطلب" /></th>
              <th><T en="Product" ar="المنتج" /></th>
              <th><T en="Date" ar="التاريخ" /></th>
              <th><T en="Amount" ar="المبلغ" /></th>
              <th><T en="Status" ar="الحالة" /></th>
              <th><T en="Actions" ar="الإجراءات" /></th>
            </tr>
          </thead>
          <tbody>
            {!orderItems || orderItems.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>
                  <T en="No orders found yet." ar="لا توجد طلبات بعد." />
                </td>
              </tr>
            ) : (
              orderItems.map((item: any) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>#{item.order?.order_number || "—"}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.product?.name_en}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>x{item.quantity}</div>
                  </td>
                  <td>{new Date(item.created_at).toLocaleDateString()}</td>
                  <td>{item.total_price} SAR</td>
                  <td>
                    <span className={`badge badge-${
                      item.status === 'shipped' ? 'success' : 
                      item.status === 'confirmed' ? 'info' : 
                      'warning'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <Link href={`/vendor/orders/${item.order?.id}`} className="btn btn-small">
                      <T en="Details" ar="التفاصيل" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
