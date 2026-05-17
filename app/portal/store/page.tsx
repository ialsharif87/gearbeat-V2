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

  // 1. Fetch Vendor Profile & User Profile for naming
  const { data: vendorProfile } = await supabase
    .from("vendor_profiles")
    .select("business_name_en, business_name_ar, store_name")
    .or(`id.eq.${user.id},auth_user_id.eq.${user.id}`)
    .maybeSingle();

  const { data: userProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const businessNameEn = vendorProfile?.business_name_en || vendorProfile?.store_name || userProfile?.full_name || "Vendor";
  const businessNameAr = vendorProfile?.business_name_ar || vendorProfile?.store_name || userProfile?.full_name || "التاجر";

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
      <section className="gb-dashboard-header">
        <div className="animate-up">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
            <p className="gb-eyebrow" style={{ margin: 0 }}><T en="Seller Portal" ar="بوابة التاجر" /></p>
            <span className="badge" style={{ background: 'rgba(212, 175, 55, 0.05)', color: 'var(--gb-gold)', border: '1px solid rgba(212, 175, 55, 0.3)', fontSize: '0.65rem', fontWeight: 800 }}>
              <T en="PRE-LAUNCH PARTNER PORTAL" ar="بوابة الشركاء ما قبل الإطلاق" />
            </span>
            <span className="badge" style={{ background: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', border: '1px solid rgba(255, 77, 77, 0.3)', fontSize: '0.65rem', fontWeight: 800 }}>
              <T en="PAYMENT ACTIVATION PENDING" ar="معلق تنشيط المدفوعات" />
            </span>
            <span className="badge" style={{ background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88', border: '1px solid rgba(0, 255, 136, 0.3)', fontSize: '0.65rem', fontWeight: 800 }}>
              <T en="SAUDI-FIRST COMPLIANCE" ar="الامتثال للأولوية السعودية" />
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, margin: '8px 0 0', letterSpacing: '-1.5px', color: 'white' }}>
            <T en={`Welcome, ${businessNameEn}`} ar={`مرحباً، ${businessNameAr}`} />
          </h1>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 }}>
            <p className="text-muted" style={{ fontSize: '1.1rem', margin: 0 }}>
              {new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <span className="badge" style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--gb-gold)', border: '1px solid rgba(212, 175, 55, 0.3)', fontSize: '0.6rem', fontWeight: 800 }}>
              REQUIRES_ADMIN_VERIFICATION
            </span>
          </div>
        </div>

        <div className="flex gap-12" style={{ flexWrap: 'wrap' }}>
          <Link 
            href="/portal/store/products/new"
            className="btn btn-primary shadow-gold"
          >
            <span>➕</span>
            <T en="Add Product" ar="إضافة منتج" />
          </Link>
          <Link 
            href="/portal/store/orders"
            className="btn btn-outline"
          >
            <span>🧾</span>
            <T en="View Orders" ar="عرض الطلبات" />
          </Link>
        </div>
      </section>

      {/* Pre-launch compliance warning banner */}
      <div style={{
        background: "rgba(212, 175, 55, 0.03)",
        border: "1px dashed rgba(212, 175, 55, 0.2)",
        borderRadius: 16,
        padding: "20px 24px",
        marginBottom: 32,
        textAlign: "left"
      }} className="animate-up">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: "1.2rem" }}>🛡️</span>
          <span style={{ color: "var(--gb-gold)", fontWeight: 800, fontSize: "0.9rem", letterSpacing: "0.5px" }}>
            <T en="VENDOR SANDBOX COMPLIANCE & PRE-LAUNCH BOUNDARIES" ar="حدود متجر البائع والامتثال ما قبل الإطلاق" />
          </span>
        </div>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "#aaa", lineHeight: 1.6 }}>
          <T
            en="Welcome to the GearBeat V2 Seller Extranet Sandbox. Please be advised that automated product approvals, live buyer transactions, checkout payment flows, and financial banking payout transfers are currently simulated. To ensure strict compliance with Saudi PDPL data residency mandates, corporate document upload remains completely deactivated. Sensitive business information will be safely requested only after local sovereign storage provisioning is finalized in Google Cloud Dammam region."
            ar="مرحباً بك في البيئة التجريبية لإكسترانت التجار لـ GearBeat V2. يرجى العلم أن اعتمادات المنتجات التلقائية، ومعاملات المشتري الحية، وتدفقات مدفوعات الخروج، وعمليات تسوية المدفوعات المالية هي حالياً قيد المحاكاة. لضمان الامتثال الصارم لمتطلبات نظام حماية البيانات الشخصية السعودي (PDPL)، لا يزال تحميل المستندات المؤسسية معطلاً بالكامل. سيتم طلب البيانات الحساسة بأمان فقط بعد إكمال تهيئة التخزين السيادي المحلي في منطقة Google Cloud الدمام."
          />
        </p>
        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span style={{ background: "rgba(255, 77, 77, 0.15)", color: "#ff4d4d", padding: "4px 10px", borderRadius: 6, fontSize: "0.7rem", fontWeight: 800 }}>
            DOCUMENT COLLECTION DISABLED
          </span>
          <span style={{ background: "rgba(255, 176, 32, 0.15)", color: "#ffb020", padding: "4px 10px", borderRadius: 6, fontSize: "0.7rem", fontWeight: 800 }}>
            MANUAL REVIEW REQUIRED
          </span>
          <span style={{ background: "rgba(212, 175, 55, 0.15)", color: "var(--gb-gold)", padding: "4px 10px", borderRadius: 6, fontSize: "0.7rem", fontWeight: 800 }}>
            SENSITIVE DATA BLOCKED
          </span>
          <span style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", padding: "4px 10px", borderRadius: 6, fontSize: "0.7rem", fontWeight: 800 }}>
            COMMERCIAL VERIFICATION PENDING
          </span>
        </div>
      </div>

      {/* SECTION 2: KPI Cards */}
      <section className="gb-dash-grid animate-up" style={{ animationDelay: '0.1s', marginBottom: '32px' }}>
        {/* Revenue Card */}
        <div className="gb-dash-card" style={{ borderTop: '3px solid var(--gb-gold)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
            <p className="gb-eyebrow" style={{ fontSize: '0.7rem' }}>
              <T en="Revenue This Month" ar="إيراد هذا الشهر" />
            </p>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '8px' }}>
            {totalRevenue.toLocaleString()} <small style={{ fontSize: '1rem', fontWeight: 400, color: '#888' }}>SAR</small>
          </div>
          <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>
            <T en="From completed orders" ar="من الطلبات المكتملة" />
          </p>
        </div>

        {/* Orders Card */}
        <div className="gb-dash-card" style={{ borderTop: '3px solid var(--gb-teal)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
            <p className="gb-eyebrow" style={{ fontSize: '0.7rem' }}>
              <T en="Orders This Month" ar="طلبات هذا الشهر" />
            </p>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '8px' }}>{totalOrders}</div>
          <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>
            {pendingOrders} <T en="pending" ar="معلقة" />
          </p>
        </div>

        {/* Products Card */}
        <div className="gb-dash-card" style={{ borderTop: '3px solid #22c55e' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
            <p className="gb-eyebrow" style={{ fontSize: '0.7rem' }}>
              <T en="Active Products" ar="منتجات نشطة" />
            </p>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '8px' }}>{activeProducts}</div>
          <p style={{ color: outOfStock > 0 ? '#f97316' : 'var(--gb-text-muted)', fontSize: '0.8rem', margin: 0 }}>
            {outOfStock} <T en="out of stock" ar="نفد مخزونها" />
          </p>
        </div>

        {/* Rating Card */}
        <div className="gb-dash-card" style={{ borderTop: '3px solid #a855f7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
            <p className="gb-eyebrow" style={{ fontSize: '0.7rem' }}>
              <T en="Avg Rating" ar="متوسط التقييم" />
            </p>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '8px' }}>{avgRating || "—"}</div>
          <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>
            <T en="out of 5" ar="من 5" />
          </p>
        </div>
      </section>

      {/* SECTION 3: Summary Strip */}
      <section 
        className="animate-up"
        style={{ 
          background: 'rgba(255,255,255,0.02)', 
          borderRadius: 'var(--gb-radius-md)',
          border: '1px solid var(--gb-border)', 
          padding: '24px', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '24px', 
          marginBottom: '32px',
          animationDelay: '0.2s'
        }}
      >
        <div style={{ textAlign: 'center', borderInlineEnd: '1px solid var(--gb-border)' }} className="pe-24">
          <div className="gb-eyebrow" style={{ fontSize: '0.65rem', marginBottom: '8px' }}>
            <T en="Avg Order Value" ar="متوسط قيمة الطلب" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white' }}>
            {totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0} <small style={{ fontSize: '0.9rem', color: 'var(--gb-text-muted)' }}>SAR</small>
          </div>
        </div>
        <div style={{ textAlign: 'center', borderInlineEnd: '1px solid var(--gb-border)' }} className="pe-24">
          <div className="gb-eyebrow" style={{ fontSize: '0.65rem', marginBottom: '8px' }}>
            <T en="Completion Rate" ar="معدل الإكمال" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white' }}>
            {totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}%
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="gb-eyebrow" style={{ fontSize: '0.65rem', marginBottom: '8px' }}>
            <T en="Total Products" ar="إجمالي المنتجات" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white' }}>
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
            <Link href="/portal/store/orders" style={{ color: 'var(--gb-gold)', fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge" style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--gb-gold)', border: '1px solid rgba(212, 175, 55, 0.3)', fontSize: '0.6rem', fontWeight: 800 }}>
                MANUAL_FULFILLMENT
              </span>
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
                              order.status === 'delivered' ? 'rgba(15, 160, 138, 0.1)' :
                              order.status === 'cancelled' ? 'rgba(239, 68, 68, 0.1)' :
                              'rgba(212, 175, 55, 0.1)',
                            color:
                              order.status === 'delivered' ? 'var(--gb-teal)' :
                              order.status === 'cancelled' ? '#ef4444' :
                              'var(--gb-gold)'
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

          <section 
            className="gb-card" 
            style={{ 
              background: '#111', 
              borderRadius: '20px', 
              border: '1px solid #1e1e1e', 
              padding: '24px',
              marginTop: '24px'
            }}
          >
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px' }}>
              <T en="Rewards & Kits" ar="الجوائز والحقائب" />
            </h2>
            <div className="kit-progress">
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem' }}>
                 <span style={{ color: '#888' }}><T en="Vendor Welcome Kit" ar="حقيبة ترحيب البائع" /></span>
                 <span style={{ color: 'var(--gb-gold)' }}>50%</span>
               </div>
               <div style={{ height: 6, background: '#222', borderRadius: 3, overflow: 'hidden' }}>
                 <div style={{ width: '50%', height: '100%', background: 'var(--gb-gold)' }} />
               </div>
               
               <ul style={{ marginTop: 20, listStyle: 'none', padding: 0, fontSize: '0.8rem', color: '#666' }}>
                 <li style={{ display: 'flex', gap: 8, marginBottom: 8 }}>✅ <T en="Agreement Signed" ar="توقيع الاتفاقية" /></li>
                 <li style={{ display: 'flex', gap: 8 }}>⏳ <T en="First 3 Products Approved" ar="اعتماد أول 3 منتجات" /></li>
               </ul>
            </div>
          </section>

          <section 
            className="gb-card" 
            style={{ 
              background: '#111', 
              borderRadius: '20px', 
              border: '1px solid #1e1e1e', 
              padding: '24px',
              marginTop: '24px'
            }}
          >
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '24px' }}>
              <T en="Portal Readiness" ar="جاهزية البوابة" />
            </h2>
            <div className="readiness-list">
              {[
                { label: 'Store Profile', status: '✅' },
                { label: 'Products', status: '✅' },
                { label: 'Orders', status: '✅' },
                { label: 'Document Collection', status: '🚫 DISABLED' },
                { label: 'Trusted Seller', status: '⏳ PENDING' },
                { label: 'Rewards/Kits', status: '⏳ PENDING' },
                { label: 'Payouts & Banking', status: '⏳ DEFERRED' },
                { label: 'Support Track', status: '⏳ PENDING' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #1a1a1a', fontSize: '0.85rem' }}>
                  <span style={{ color: '#888' }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: item.status.includes('✅') ? '#10b981' : item.status.includes('🚫') ? '#ff4d4d' : '#ffb020' }}>{item.status}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, padding: 12, background: 'rgba(212, 175, 55, 0.05)', borderRadius: 12, border: '1px solid rgba(212, 175, 55, 0.1)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--gb-gold)', fontWeight: 800, letterSpacing: 1 }}>
                <T en="EXTRANET ALIGNMENT: READY" ar="محاذاة الإكسترانت: جاهز" />
              </span>
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
