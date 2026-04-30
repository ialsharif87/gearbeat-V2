import { requireVendorLayoutAccess } from "../../lib/route-guards";
import T from "../../components/t";
import Link from "next/link";

export default async function VendorDashboard() {
  const { supabaseAdmin, user } = await requireVendorLayoutAccess();

  // Fetch real stats
  const [salesRes, productsRes, ordersRes] = await Promise.all([
    supabaseAdmin.from("marketplace_order_items").select("total_price").eq("vendor_id", user.id),
    supabaseAdmin.from("marketplace_products").select("id", { count: 'exact' }).eq("vendor_id", user.id),
    supabaseAdmin.from("marketplace_order_items").select("id", { count: 'exact' }).eq("vendor_id", user.id).eq("status", "pending")
  ]);

  const totalSales = salesRes.data?.reduce((sum, i) => sum + (Number(i.total_price) || 0), 0) || 0;
  const productCount = productsRes.count || 0;
  const pendingCount = ordersRes.count || 0;

  const stats = [
    { label_en: "Total Sales", label_ar: "إجمالي المبيعات", value: `${totalSales.toFixed(2)} SAR`, icon: "💰" },
    { label_en: "Active Products", label_ar: "المنتجات النشطة", value: productCount.toString(), icon: "📦" },
    { label_en: "Pending Orders", label_ar: "طلبات معلقة", value: pendingCount.toString(), icon: "🧾" },
    { label_en: "Inventory Health", label_ar: "حالة المخزون", value: "Good", icon: "✅" },
  ];

  // Fetch 5 recent order items
  const { data: recentOrders } = await supabaseAdmin
    .from("marketplace_order_items")
    .select(`
      id, quantity, total_price, status, created_at,
      product:marketplace_products(name_en, name_ar)
    `)
    .eq("vendor_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="dashboard-page">
      {/* ... (header and warning box remain same) */}
      
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="card stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <label><T en={stat.label_en} ar={stat.label_ar} /></label>
              <div className="stat-value">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-2" style={{ marginTop: 30 }}>
        <div className="card">
          <div className="card-head">
            <h3><T en="Quick Actions" ar="إجراءات سريعة" /></h3>
          </div>
          <div className="action-buttons-list" style={{ display: 'grid', gap: 12, marginTop: 15 }}>
            <Link href="/vendor/products/new" className="btn btn-primary w-full">
              <T en="+ Add New Product" ar="+ إضافة منتج جديد" />
            </Link>
            <Link href="/vendor/products" className="btn btn-secondary w-full">
              <T en="Manage Inventory" ar="إدارة المخزون" />
            </Link>
            <Link href="/vendor/finance" className="btn btn-secondary w-full">
              <T en="View Finance Report" ar="عرض التقارير المالية" />
            </Link>
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="card-head" style={{ padding: '20px 20px 10px' }}>
            <h3><T en="Recent Orders" ar="أحدث الطلبات" /></h3>
          </div>
          <div className="recent-orders-list">
            {!recentOrders || recentOrders.length === 0 ? (
              <div className="empty-state" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ color: 'var(--muted)' }}><T en="No orders found yet." ar="لا توجد طلبات بعد." /></p>
              </div>
            ) : (
              recentOrders.map((order: any) => (
                <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{order.product?.name_en}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{new Date(order.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700 }}>{order.total_price} SAR</div>
                    <span className={`badge badge-small badge-${order.status === 'shipped' ? 'success' : 'warning'}`} style={{ fontSize: '0.65rem' }}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          {recentOrders && recentOrders.length > 0 && (
            <div style={{ padding: 15, textAlign: 'center' }}>
               <Link href="/vendor/orders" className="text-link" style={{ fontSize: '0.9rem' }}>
                  <T en="View All Orders" ar="عرض كافة الطلبات" /> →
               </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
