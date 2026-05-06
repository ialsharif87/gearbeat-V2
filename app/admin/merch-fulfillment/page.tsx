import { createClient } from "@/lib/supabase/server";
import T from "@/components/t";

export default async function AdminMerchFulfillmentPage() {
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from("merch_fulfillment_orders")
    .select(`
      id,
      status,
      created_at,
      shipping_details,
      merch_kits(
        name_en,
        kit_type
      ),
      profiles:user_id(
        full_name,
        email
      ),
      studios:studio_id(
        name
      )
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1><T en="Merch & Kit Fulfillment" ar="تنفيذ الهدايا والمنتجات" /></h1>
      </header>

      <div className="admin-content">
        <div className="card">
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th><T en="Recipient" ar="المستلم" /></th>
                  <th><T en="Kit Type" ar="نوع الهدية" /></th>
                  <th><T en="Status" ar="الحالة" /></th>
                  <th><T en="Date" ar="التاريخ" /></th>
                  <th><T en="Actions" ar="الإجراءات" /></th>
                </tr>
              </thead>
              <tbody>
                {orders && orders.length > 0 ? (
                  orders.map((order: any) => (
                    <tr key={order.id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <strong>{order.studios?.name || order.profiles?.full_name}</strong>
                          <span style={{ fontSize: '0.8rem', color: '#666' }}>{order.profiles?.email}</span>
                        </div>
                      </td>
                      <td>{order.merch_kits?.name_en}</td>
                      <td>
                        <span className={`status-pill ${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>
                        <button className="btn-gold-small"><T en="Manage" ar="إدارة" /></button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 40 }}>
                      <T en="No fulfillment orders found" ar="لا توجد طلبات تنفيذ" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .admin-page { padding: 30px; }
        .admin-header { margin-bottom: 30px; }
        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th { text-align: left; padding: 12px; border-bottom: 2px solid #222; color: #888; }
        .admin-table td { padding: 16px 12px; border-bottom: 1px solid #1a1a1a; }
        
        .status-pill { padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
        .status-pill.pending { background: rgba(255, 193, 7, 0.1); color: #ffc107; }
        .status-pill.shipped { background: rgba(0, 123, 255, 0.1); color: #007bff; }
        .status-pill.delivered { background: rgba(40, 167, 69, 0.1); color: #28a745; }

        .btn-gold-small {
          background: var(--gb-gold, #d4af37); color: #000; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 700;
        }
      ` }} />
    </div>
  );
}
