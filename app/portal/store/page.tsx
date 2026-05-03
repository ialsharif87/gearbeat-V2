import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import T from "@/components/t";

export default async function VendorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login");
  }

  // Calculate current month range
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // 1. Fetch Vendor Profile
  const { data: vendorProfile } = await supabase
    .from("vendor_profiles")
    .select("*")
    .or(`id.eq.${user.id},auth_user_id.eq.${user.id}`)
    .maybeSingle();

  // 2. Fetch Orders Stats for current month
  const { data: monthlyOrders } = await supabase
    .from("marketplace_orders")
    .select("total_amount, status")
    .eq("vendor_auth_user_id", user.id)
    .gte("created_at", firstDayOfMonth);

  const totalRevenue = monthlyOrders
    ?.filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0) || 0;
  
  const totalOrders = monthlyOrders?.length || 0;
  const pendingOrders = monthlyOrders?.filter(o => ['pending', 'paid', 'processing'].includes(o.status)).length || 0;
  const completedOrders = monthlyOrders?.filter(o => o.status === 'delivered').length || 0;

  // 3. Fetch Products Stats
  const { data: products } = await supabase
    .from("marketplace_products")
    .select("status")
    .eq("vendor_auth_user_id", user.id);

  const totalProducts = products?.length || 0;
  const activeProducts = products?.filter(p => p.status === 'active').length || 0;
  const outOfStock = products?.filter(p => p.status === 'out_of_stock').length || 0;

  // 4. Average Rating
  const { data: reviews } = await supabase
    .from("marketplace_product_reviews")
    .select(`
      rating,
      product:marketplace_products!inner(vendor_auth_user_id)
    `)
    .eq("marketplace_products.vendor_auth_user_id", user.id);

  const avgRating = reviews?.length 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  // 5. Recent Orders (last 5)
  // We need to join with order_items to get product name
  const { data: recentOrders } = await supabase
    .from("marketplace_orders")
    .select(`
      id,
      total_amount,
      status,
      created_at,
      items:marketplace_order_items(
        product:marketplace_products(name)
      )
    `)
    .eq("vendor_auth_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const vendorName = vendorProfile?.store_name || user.email?.split("@")[0] || "Vendor";

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <main 
      className="gb-dashboard-page" 
      style={{ 
        background: 'linear-gradient(180deg, #0d0d0d 0%, #0a0a0a 100%)', 
        minHeight: '100vh',
        padding: '32px',
        color: '#fff'
      }}
    >
      {/* SECTION 1: Welcome Header */}
      <section 
        className="gb-dashboard-header" 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '40px' 
        }}
      >
        <div>
          <span className="gb-dash-badge" style={{ background: 'rgba(207, 168, 110, 0.1)', color: 'var(--gb-gold)', border: '1px solid var(--gb-gold)', marginBottom: '12px' }}>
            <T en="Seller Portal" ar="بوابة التاجر" />
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '8px 0 0', color: 'white' }}>
            <T en={`Welcome, ${vendorName}`} ar={`مرحباً، ${vendorName}`} />
          </h1>
          <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '4px' }}>
            {new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link 
            href="/portal/store/products/new"
            style={{ 
              background: 'linear-gradient(135deg, #cfa86e, #b8923a)', 
              color: '#000', 
              border: 'none',
              borderRadius: '10px',
              padding: '12px 24px',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(207, 168, 110, 0.2)'
            }}
          >
            <span>➕</span>
            <T en="Add Product" ar="إضافة منتج" />
          </Link>
          <Link 
            href="/portal/store/orders"
            style={{ 
              background: '#111', 
              color: '#fff', 
              border: '1px solid #222',
              borderRadius: '10px',
              padding: '12px 24px',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>🧾</span>
            <T en="View Orders" ar="عرض الطلبات" />
          </Link>
        </div>
      </section>

      {/* SECTION 2: KPI Cards */}
      <section className="gb-dash-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {/* Revenue Card */}
        <div 
          className="gb-card" 
          style={{ 
            background: 'linear-gradient(135deg, #111 0%, #0d0d0d 100%)', 
            border: '1px solid #1e1e1e', 
            borderRadius: '20px', 
            padding: '24px', 
            position: 'relative', 
            overflow: 'hidden',
            borderTop: '3px solid #cfa86e'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 500 }}>
              <T en="Revenue This Month" ar="إيراد هذا الشهر" />
            </span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
            {totalRevenue.toLocaleString()} <small style={{ fontSize: '1rem', fontWeight: 400, color: '#888' }}>SAR</small>
          </div>
          <p style={{ color: '#666', fontSize: '0.75rem', margin: 0 }}>
            <T en="From completed orders" ar="من الطلبات المكتملة" />
          </p>
          <span style={{ position: 'absolute', bottom: '-10px', right: '-10px', fontSize: '5rem', opacity: 0.05 }}>💰</span>
        </div>

        {/* Orders Card */}
        <div 
          className="gb-card" 
          style={{ 
            background: 'linear-gradient(135deg, #111 0%, #0d0d0d 100%)', 
            border: '1px solid #1e1e1e', 
            borderRadius: '20px', 
            padding: '24px', 
            position: 'relative', 
            overflow: 'hidden',
            borderTop: '3px solid #3b82f6'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 500 }}>
              <T en="Orders This Month" ar="طلبات هذا الشهر" />
            </span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '8px' }}>{totalOrders}</div>
          <p style={{ color: '#666', fontSize: '0.75rem', margin: 0 }}>
            {pendingOrders} <T en="pending" ar="معلقة" />
          </p>
          <span style={{ position: 'absolute', bottom: '-10px', right: '-10px', fontSize: '5rem', opacity: 0.05 }}>🧾</span>
        </div>

        {/* Products Card */}
        <div 
          className="gb-card" 
          style={{ 
            background: 'linear-gradient(135deg, #111 0%, #0d0d0d 100%)', 
            border: '1px solid #1e1e1e', 
            borderRadius: '20px', 
            padding: '24px', 
            position: 'relative', 
            overflow: 'hidden',
            borderTop: '3px solid #22c55e'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 500 }}>
              <T en="Active Products" ar="منتجات نشطة" />
            </span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '8px' }}>{activeProducts}</div>
          <p style={{ color: outOfStock > 0 ? '#f97316' : '#666', fontSize: '0.75rem', margin: 0 }}>
            {outOfStock} <T en="out of stock" ar="نفد مخزونها" />
          </p>
          <span style={{ position: 'absolute', bottom: '-10px', right: '-10px', fontSize: '5rem', opacity: 0.05 }}>📦</span>
        </div>

        {/* Rating Card */}
        <div 
          className="gb-card" 
          style={{ 
            background: 'linear-gradient(135deg, #111 0%, #0d0d0d 100%)', 
            border: '1px solid #1e1e1e', 
            borderRadius: '20px', 
            padding: '24px', 
            position: 'relative', 
            overflow: 'hidden',
            borderTop: '3px solid #a855f7'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 500 }}>
              <T en="Avg Rating" ar="متوسط التقييم" />
            </span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '8px' }}>{avgRating || "—"}</div>
          <p style={{ color: '#666', fontSize: '0.75rem', margin: 0 }}>
            <T en="out of 5" ar="من 5" />
          </p>
          <span style={{ position: 'absolute', bottom: '-10px', right: '-10px', fontSize: '5rem', opacity: 0.05 }}>⭐</span>
        </div>
      </section>

      {/* SECTION 3: Summary Strip */}
      <section 
        style={{ 
          background: '#111', 
          borderRadius: '16px',
          border: '1px solid #1e1e1e', 
          padding: '20px 28px', 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr', 
          gap: '0', 
          marginBottom: '32px'
        }}
      >
        <div style={{ textAlign: 'center', borderRight: '1px solid #222' }}>
          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>
            <T en="Avg Order Value" ar="متوسط قيمة الطلب" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#cfa86e' }}>
            {totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0} <small style={{ fontSize: '0.8rem' }}>SAR</small>
          </div>
        </div>
        <div style={{ textAlign: 'center', borderRight: '1px solid #222' }}>
          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>
            <T en="Completion Rate" ar="معدل الإكمال" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#cfa86e' }}>
            {totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}%
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>
            <T en="Total Products" ar="إجمالي المنتجات" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#cfa86e' }}>
            {totalProducts}
          </div>
        </div>
      </section>

      {/* SECTION 4: Two Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', marginBottom: '32px' }}>
        {/* Left: Recent Orders */}
        <section 
          className="gb-card" 
          style={{ 
            background: '#111', 
            borderRadius: '20px', 
            border: '1px solid #1e1e1e', 
            padding: '24px' 
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
              <T en="Recent Orders" ar="آخر الطلبات" />
            </h2>
            <Link href="/portal/store/orders" style={{ color: 'var(--gb-gold)', fontSize: '0.9rem', textDecoration: 'none' }}>
              <T en="View all" ar="عرض الكل" /> →
            </Link>
          </div>
          
          <div className="gb-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0d0d0d', color: '#666', fontSize: '0.8rem', textAlign: 'start' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="Order ID" ar="رقم الطلب" /></th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="Product" ar="المنتج" /></th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="Amount" ar="المبلغ" /></th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="Status" ar="الحالة" /></th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}><T en="Date" ar="التاريخ" /></th>
                </tr>
              </thead>
              <tbody>
                {recentOrders && recentOrders.length > 0 ? (
                  recentOrders.map((order: any) => (
                    <tr key={order.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                      <td style={{ padding: '16px', fontFamily: 'monospace', color: '#888' }}>
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td style={{ padding: '16px' }}>
                        {order.items?.[0]?.product?.name || "Multiple items"}
                      </td>
                      <td style={{ padding: '16px', fontWeight: 700 }}>
                        {order.total_amount} SAR
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span 
                          style={{ 
                            padding: '4px 12px', 
                            borderRadius: '99px', 
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: 
                              order.status === 'delivered' ? 'rgba(34, 197, 94, 0.1)' :
                              order.status === 'cancelled' ? 'rgba(239, 68, 68, 0.1)' :
                              order.status === 'pending' ? 'rgba(234, 179, 8, 0.1)' :
                              'rgba(59, 130, 246, 0.1)',
                            color:
                              order.status === 'delivered' ? '#22c55e' :
                              order.status === 'cancelled' ? '#ef4444' :
                              order.status === 'pending' ? '#eab308' :
                              '#3b82f6'
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: '#666', fontSize: '0.85rem' }}>
                        {formatDate(order.created_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '48px', color: '#666' }}>
                      <T en="No orders yet. Share your products to get started." ar="لا توجد طلبات بعد. شارك منتجاتك للبدء." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right: Quick Actions */}
        <section 
          className="gb-card" 
          style={{ 
            background: '#111', 
            borderRadius: '20px', 
            border: '1px solid #1e1e1e', 
            padding: '24px' 
          }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px' }}>
            <T en="Quick Actions" ar="إجراءات سريعة" />
          </h2>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            {[
              { href: "/portal/store/products", icon: "📦", label: "Products", label_ar: "المنتجات" },
              { href: "/portal/store/orders", icon: "🧾", label: "Orders", label_ar: "الطلبات" },
              { href: "/portal/store/inventory", icon: "🏭", label: "Inventory", label_ar: "المخزون" },
              { href: "/portal/store/payouts", icon: "💰", label: "Payouts", label_ar: "المستحقات" },
              { href: "/portal/store/returns", icon: "↩️", label: "Returns", label_ar: "الإرجاعات" },
              { href: "/portal/store/reviews", icon: "⭐", label: "Reviews", label_ar: "التقييمات" },
            ].map(btn => (
              <Link 
                key={btn.href}
                href={btn.href}
                className="gb-dash-quick-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid #222',
                  borderRadius: '12px',
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{btn.icon}</span>
                <T en={btn.label} ar={btn.label_ar} />
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* SECTION 5: Stock Alert */}
      {outOfStock > 0 && (
        <section 
          style={{ 
            background: 'rgba(249, 115, 22, 0.08)',
            border: '1px solid rgba(249, 115, 22, 0.3)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '24px'
          }}
        >
          <div style={{ fontSize: '2.5rem' }}>⚠️</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px', color: '#f97316' }}>
              <T en="Stock Alert" ar="تنبيه المخزون" />
            </h3>
            <p style={{ margin: 0, color: 'rgba(249, 115, 22, 0.8)' }}>
              <T 
                en={`${outOfStock} products are out of stock. Update your inventory to avoid missing orders.`}
                ar={`${outOfStock} منتجات نفد مخزونها. حدّث مخزونك لتجنب فقدان الطلبات.`} 
              />
            </p>
          </div>
          <Link 
            href="/portal/store/inventory"
            style={{
              background: '#f97316',
              color: '#000',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            <T en="Manage Inventory" ar="إدارة المخزون" />
          </Link>
        </section>
      )}
    </main>
  );
}
