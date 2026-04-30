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
    { label_en: "Total Sales", label_ar: "إجمالي المبيعات", value: `${totalSales.toFixed(2)} SAR`, icon: "💰", color: "var(--gb-gold)" },
    { label_en: "Active Products", label_ar: "المنتجات النشطة", value: productCount.toString(), icon: "📦", color: "var(--gb-blue)" },
    { label_en: "Pending Orders", label_ar: "طلبات معلقة", value: pendingCount.toString(), icon: "🧾", color: "var(--gb-warning)" },
    { label_en: "Average Rating", label_ar: "متوسط التقييم", value: "4.8 ⭐", icon: "🌟", color: "#ffcc00" },
  ];

  // Fetch 5 recent order items
  const { data: recentOrders } = await supabaseAdmin
    .from("marketplace_order_items")
    .select(`
      id, quantity, total_price, status, created_at,
      product:marketplace_products(name_en, name_ar, slug)
    `)
    .eq("vendor_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="dashboard-page">
      <div className="page-header" style={{ marginBottom: 40 }}>
        <div>
          <span className="badge badge-gold"><T en="Vendor Hub" ar="مركز التاجر" /></span>
          <h1 style={{ fontSize: '2.5rem', marginTop: 10 }}>
             <T en="Welcome back," ar="أهلاً بك مجدداً،" /> {user.email?.split('@')[0]}
          </h1>
        </div>
      </div>
      
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className="card stat-card" style={{ borderLeft: `4px solid ${stat.color}` }}>
            <div className="stat-content">
              <label><T en={stat.label_en} ar={stat.label_ar} /></label>
              <div className="stat-value">{stat.value}</div>
            </div>
            <div className="stat-icon" style={{ opacity: 0.2, fontSize: '2.5rem' }}>{stat.icon}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-3" style={{ marginTop: 30, gap: 25 }}>
        {/* QUICK ACTIONS */}
        <div className="card">
          <div className="card-head"><h3><T en="Quick Actions" ar="إجراءات سريعة" /></h3></div>
          <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
            <Link href="/vendor/products/new" className="btn btn-primary w-full"><T en="+ Add Product" ar="+ إضافة منتج" /></Link>
            <Link href="/vendor/products" className="btn btn-secondary w-full"><T en="Manage Inventory" ar="إدارة المخزون" /></Link>
            <Link href="/vendor/reviews" className="btn btn-secondary w-full"><T en="Customer Feedback" ar="آراء العملاء" /></Link>
          </div>
        </div>

        {/* RECENT ORDERS */}
        <div className="card col-span-2" style={{ padding: 0 }}>
          <div className="card-head" style={{ padding: '25px 25px 10px' }}>
            <h3><T en="Recent Sales" ar="أحدث المبيعات" /></h3>
          </div>
          <div className="recent-orders-list">
            {!recentOrders || recentOrders.length === 0 ? (
              <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ color: 'var(--muted)' }}><T en="No orders yet." ar="لا توجد طلبات بعد." /></p>
              </div>
            ) : (
              recentOrders.map((order: any) => (
                <div key={order.id} className="list-item-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '18px 25px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{order.product?.name_en}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>#{order.id.slice(0,8)} • {new Date(order.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--gb-gold)' }}>{order.total_price} SAR</div>
                    <span className={`badge badge-small badge-${order.status === 'delivered' ? 'success' : 'warning'}`} style={{ fontSize: '0.65rem' }}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div style={{ padding: 20, textAlign: 'center' }}>
             <Link href="/vendor/orders" className="text-link" style={{ fontSize: '0.9rem' }}>
                <T en="View All Orders" ar="عرض كافة الطلبات" /> →
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
