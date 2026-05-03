import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import T from "@/components/t";

export default async function VendorDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login");
  }

  // Fetch data
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    profileResult,
    ordersMonthResult,
    pendingOrdersResult,
    revenueResult,
    productsResult,
    recentOrdersResult,
    topProductResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle(),

    supabase
      .from("marketplace_order_items")
      .select("id", { count: "exact", head: true })
      .eq("vendor_id", user.id)
      .gte("created_at", firstDayOfMonth.toISOString()),

    supabase
      .from("marketplace_order_items")
      .select("id", { count: "exact", head: true })
      .eq("vendor_id", user.id)
      .in("status", ["pending", "paid"]),

    supabase
      .from("marketplace_order_items")
      .select("total_price")
      .eq("vendor_id", user.id)
      .gte("created_at", firstDayOfMonth.toISOString()),

    supabase
      .from("marketplace_products")
      .select("id", { count: "exact", head: true })
      .eq("vendor_id", user.id),

    supabase
      .from("marketplace_order_items")
      .select(`
        id, 
        created_at, 
        total_price, 
        status, 
        quantity,
        product:marketplace_products(name_en, name_ar)
      `)
      .eq("vendor_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("marketplace_order_items")
      .select(`
        product_id,
        quantity,
        total_price,
        product:marketplace_products(name_en, name_ar)
      `)
      .eq("vendor_id", user.id)
      .gte("created_at", firstDayOfMonth.toISOString())
  ]);

  const vendorName = profileResult.data?.full_name || user.email?.split("@")[0] || "Vendor";
  const totalOrdersMonth = ordersMonthResult.count || 0;
  const pendingOrders = pendingOrdersResult.count || 0;
  const totalProducts = productsResult.count || 0;
  
  const totalRevenue = (revenueResult.data || []).reduce(
    (acc, item) => acc + (Number(item.total_price) || 0), 
    0
  );

  const recentOrders = recentOrdersResult.data || [];

  // Calculate top product
  const productStats: Record<string, { name: string, units: number, revenue: number }> = {};
  (topProductResult.data || []).forEach((item: any) => {
    const pid = item.product_id;
    if (!productStats[pid]) {
      productStats[pid] = { 
        name: item.product?.name_en || "Unknown Product", 
        units: 0, 
        revenue: 0 
      };
    }
    productStats[pid].units += item.quantity || 0;
    productStats[pid].revenue += Number(item.total_price) || 0;
  });

  const topProduct = Object.values(productStats).sort((a, b) => b.revenue - a.revenue)[0];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <div className="dashboard-container">
      {/* SECTION 1: Welcome Bar */}
      <div className="welcome-bar">
        <div className="welcome-text">
          <h1>
            <T 
              en={`Welcome, ${vendorName}`} 
              ar={`مرحباً، ${vendorName}`} 
            />
          </h1>
          <p className="date-display">
            {new Date().toLocaleDateString("en-GB", { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="welcome-badge">
          <span className="badge-gold">
            <T en="Seller Portal" ar="بوابة التاجر" />
          </span>
        </div>
      </div>

      {/* SECTION 2: Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-number">{totalOrdersMonth}</div>
            <div className="stat-label">
              <T en="Orders this month" ar="طلبات هذا الشهر" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-number">{pendingOrders}</div>
            <div className="stat-label">
              <T en="Pending orders" ar="طلبات معلقة" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-number">{totalRevenue.toLocaleString()} <span className="currency">SAR</span></div>
            <div className="stat-label">
              <T en="Revenue this month" ar="أرباح هذا الشهر" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏭</div>
          <div className="stat-content">
            <div className="stat-number">{totalProducts}</div>
            <div className="stat-label">
              <T en="Total products" ar="إجمالي المنتجات" />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Two Columns */}
      <div className="dashboard-grid">
        {/* LEFT COLUMN: Recent Orders */}
        <div className="grid-left">
          <div className="content-card">
            <div className="card-header">
              <h2><T en="Recent Orders" ar="أحدث الطلبات" /></h2>
              <Link href="/portal/store/orders" className="view-all">
                <T en="View all orders" ar="عرض كل الطلبات" />
              </Link>
            </div>
            <div className="table-wrapper">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th><T en="Order ID" ar="رقم الطلب" /></th>
                    <th><T en="Product" ar="المنتج" /></th>
                    <th><T en="Amount" ar="المبلغ" /></th>
                    <th><T en="Status" ar="الحالة" /></th>
                    <th><T en="Date" ar="التاريخ" /></th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order: any) => (
                      <tr key={order.id}>
                        <td className="mono">#{order.id.slice(0, 8)}</td>
                        <td>{order.product?.name_en}</td>
                        <td>{order.total_price} SAR</td>
                        <td>
                          <span className={`status-pill ${order.status}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>{formatDate(order.created_at)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                        <T en="No recent orders found" ar="لا توجد طلبات حديثة" />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Quick Actions */}
        <div className="grid-right">
          <div className="content-card actions-card">
            <h2><T en="Quick Actions" ar="إجراءات سريعة" /></h2>
            <div className="actions-list">
              <Link href="/portal/store/products" className="action-btn">
                <span>📦</span> <T en="Products" ar="المنتجات" />
              </Link>
              <Link href="/portal/store/orders" className="action-btn">
                <span>🧾</span> <T en="Orders" ar="الطلبات" />
              </Link>
              <Link href="/portal/store/inventory" className="action-btn">
                <span>🏭</span> <T en="Inventory" ar="المخزون" />
              </Link>
              <Link href="/portal/store/payouts" className="action-btn">
                <span>💰</span> <T en="Payouts" ar="التحويلات" />
              </Link>
              <Link href="/portal/store/returns" className="action-btn">
                <span>↩️</span> <T en="Returns" ar="المرتجعات" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Bottom Strip - Top Product */}
      <div className="bottom-strip">
        <div className="top-product-card">
          <div className="top-product-header">
            <h3><T en="Top Product This Month" ar="أفضل منتج هذا الشهر" /></h3>
          </div>
          {topProduct ? (
            <div className="top-product-content">
              <div className="tp-main">
                <div className="tp-icon">🏆</div>
                <div className="tp-info">
                  <h4>{topProduct.name}</h4>
                  <p><T en="Most revenue generated this month" ar="الأعلى تحقيقاً للأرباح هذا الشهر" /></p>
                </div>
              </div>
              <div className="tp-stats">
                <div className="tp-stat">
                  <span className="tp-label"><T en="Units Sold" ar="الوحدات المباعة" /></span>
                  <span className="tp-val">{topProduct.units}</span>
                </div>
                <div className="tp-stat">
                  <span className="tp-label"><T en="Total Revenue" ar="إجمالي الأرباح" /></span>
                  <span className="tp-val gold">{topProduct.revenue.toLocaleString()} SAR</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-sales">
              <T en="No sales yet this month" ar="لا توجد مبيعات هذا الشهر بعد" />
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-container {
          padding: 20px 0;
          color: var(--gb-text, #fff);
          background: var(--gb-bg, #0a0a0a);
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .welcome-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .welcome-text h1 {
          font-size: 1.8rem;
          margin: 0 0 4px;
        }

        .date-display {
          color: var(--gb-muted, #888);
          font-size: 0.9rem;
        }

        .badge-gold {
          background: rgba(207, 168, 110, 0.1);
          border: 1px solid var(--gb-gold, #cfa86e);
          color: var(--gb-gold, #cfa86e);
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .stat-card {
          background: var(--gb-surface, #111);
          border: 1px solid #222;
          padding: 24px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 20px;
          transition: transform 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          border-color: var(--gb-gold, #cfa86e);
        }

        .stat-icon {
          font-size: 2rem;
          opacity: 0.8;
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--gb-gold, #cfa86e);
          margin-bottom: 4px;
        }

        .stat-number .currency {
          font-size: 0.8rem;
          opacity: 0.6;
        }

        .stat-label {
          font-size: 0.85rem;
          color: var(--gb-muted, #888);
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 7fr 3fr;
          gap: 32px;
        }

        .content-card {
          background: var(--gb-surface, #111);
          border: 1px solid #222;
          border-radius: 20px;
          padding: 24px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .card-header h2 {
          font-size: 1.2rem;
          margin: 0;
        }

        .view-all {
          color: var(--gb-gold, #cfa86e);
          font-size: 0.9rem;
          text-decoration: none;
        }

        .view-all:hover {
          text-decoration: underline;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .dashboard-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        .dashboard-table th {
          text-align: left;
          padding: 12px;
          border-bottom: 1px solid #222;
          color: var(--gb-muted, #888);
          font-weight: 600;
        }

        [dir="rtl"] .dashboard-table th {
          text-align: right;
        }

        .dashboard-table td {
          padding: 16px 12px;
          border-bottom: 1px solid #1a1a1a;
        }

        .mono {
          font-family: monospace;
          color: var(--gb-muted, #888);
        }

        .status-pill {
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-pill.pending { background: rgba(255, 193, 7, 0.15); color: #ffc107; }
        .status-pill.paid { background: rgba(0, 123, 255, 0.15); color: #007bff; }
        .status-pill.processing { background: rgba(0, 123, 255, 0.15); color: #007bff; }
        .status-pill.shipped { background: rgba(111, 66, 193, 0.15); color: #6f42c1; }
        .status-pill.delivered { background: rgba(40, 167, 69, 0.15); color: #28a745; }
        .status-pill.returned { background: rgba(253, 126, 20, 0.15); color: #fd7e14; }

        .actions-card h2 {
          font-size: 1.2rem;
          margin: 0 0 24px;
        }

        .actions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid #222;
          border-radius: 12px;
          color: #fff;
          text-decoration: none;
          transition: all 0.2s;
          font-weight: 600;
        }

        .action-btn:hover {
          background: rgba(207, 168, 110, 0.1);
          border-color: var(--gb-gold, #cfa86e);
          color: var(--gb-gold, #cfa86e);
        }

        .bottom-strip {
          margin-top: 10px;
        }

        .top-product-card {
          background: var(--gb-surface, #111);
          border: 1px solid #222;
          border-radius: 20px;
          padding: 24px;
        }

        .top-product-header h3 {
          font-size: 1.1rem;
          margin: 0 0 20px;
          color: var(--gb-muted, #888);
        }

        .top-product-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .tp-main {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .tp-icon {
          font-size: 2.5rem;
        }

        .tp-info h4 {
          font-size: 1.3rem;
          margin: 0 0 4px;
        }

        .tp-info p {
          color: var(--gb-muted, #888);
          font-size: 0.9rem;
          margin: 0;
        }

        .tp-stats {
          display: flex;
          gap: 40px;
        }

        .tp-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .tp-label {
          font-size: 0.8rem;
          color: var(--gb-muted, #888);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .tp-val {
          font-size: 1.2rem;
          font-weight: 700;
        }

        .tp-val.gold {
          color: var(--gb-gold, #cfa86e);
        }

        .no-sales {
          padding: 40px;
          text-align: center;
          color: var(--gb-muted, #888);
          font-style: italic;
        }

        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
          .tp-stats {
            gap: 20px;
          }
        }

        @media (max-width: 600px) {
          .stats-row {
            grid-template-columns: 1fr;
          }
          .welcome-bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .top-product-content {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      ` }} />
    </div>
  );
}
