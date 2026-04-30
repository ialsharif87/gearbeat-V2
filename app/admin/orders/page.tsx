import { requireAdminLayoutAccess } from "../../../lib/route-guards";
import T from "../../../components/t";
import Link from "next/link";

export default async function AdminOrdersPage() {
  const { supabaseAdmin } = await requireAdminLayoutAccess();

  const { data: orders } = await supabaseAdmin
    .from("marketplace_orders")
    .select(`
      *,
      items:marketplace_order_items(count)
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <span className="badge">
            <T en="Marketplace Operations" ar="عمليات السوق" />
          </span>
          <h1><T en="Global Orders" ar="الطلبات الشاملة" /></h1>
          <p><T en="Track all marketplace product sales and fulfillment status." ar="تتبع كافة مبيعات منتجات السوق وحالة التنفيذ." /></p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 30, padding: 0, overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th><T en="Order #" ar="رقم الطلب" /></th>
              <th><T en="Date" ar="التاريخ" /></th>
              <th><T en="Total Amount" ar="المبلغ الإجمالي" /></th>
              <th><T en="Status" ar="الحالة" /></th>
              <th><T en="Payment" ar="الدفع" /></th>
              <th><T en="Actions" ar="الإجراءات" /></th>
            </tr>
          </thead>
          <tbody>
            {!orders || orders.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>
                  <T en="No marketplace orders found." ar="لا توجد طلبات في السوق بعد." />
                </td>
              </tr>
            ) : (
              orders.map((o: any) => (
                <tr key={o.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>#{o.order_number}</div>
                  </td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>{o.total_amount} SAR</td>
                  <td>
                    <span className={`badge badge-${
                      o.status === 'delivered' ? 'success' : 
                      o.status === 'shipped' ? 'info' : 
                      o.status === 'cancelled' ? 'danger' : 
                      'warning'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${o.payment_status === 'paid' ? 'success' : 'secondary'}`}>
                      {o.payment_status}
                    </span>
                  </td>
                  <td>
                    <Link href={`/admin/orders/${o.id}`} className="btn btn-small">
                      <T en="Review" ar="مراجعة" />
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
