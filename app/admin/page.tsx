import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import T from "@/components/t";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch admin role and name
  const { data: adminData } = await supabaseAdmin
    .from("admin_users")
    .select("admin_role, email")
    .eq("auth_user_id", user?.id)
    .maybeSingle();

  // Fetch Stats
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    studiosCount,
    vendorsCount,
    customersCount,
    bookingsCount,
    ordersCount,
    bookingsRevenue,
    ordersRevenue,
    pendingStudios,
    pendingVendors,
    pendingLeads,
    openDisputes,
    recentBookings,
    recentOrders,
    recentLeads,
  ] = await Promise.all([
    supabaseAdmin.from("studios").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabaseAdmin.from("vendor_profiles").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
    supabaseAdmin.from("bookings").select("id", { count: "exact", head: true }).gte("created_at", firstDayOfMonth),
    supabaseAdmin.from("marketplace_orders").select("id", { count: "exact", head: true }).gte("created_at", firstDayOfMonth),
    supabaseAdmin.from("bookings").select("total_amount").gte("created_at", firstDayOfMonth),
    supabaseAdmin.from("marketplace_orders").select("total_amount").gte("created_at", firstDayOfMonth),
    
    supabaseAdmin.from("studios").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabaseAdmin.from("vendor_profiles").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabaseAdmin.from("provider_leads").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabaseAdmin.from("marketplace_disputes").select("id", { count: "exact", head: true }).eq("status", "open"),

    supabaseAdmin.from("bookings").select("id, created_at, total_amount").order("created_at", { ascending: false }).limit(5),
    supabaseAdmin.from("marketplace_orders").select("id, created_at, total_amount").order("created_at", { ascending: false }).limit(5),
    supabaseAdmin.from("provider_leads").select("id, created_at, name, type").order("created_at", { ascending: false }).limit(5),
  ]);

  const totalRevenue = 
    (bookingsRevenue.data || []).reduce((acc, b) => acc + (b.total_amount || 0), 0) +
    (ordersRevenue.data || []).reduce((acc, o) => acc + (o.total_amount || 0), 0);

  // Merge activity
  const activityItems = [
    ...(recentBookings.data || []).map(b => ({ ...b, actType: 'booking' })),
    ...(recentOrders.data || []).map(o => ({ ...o, actType: 'order' })),
    ...(recentLeads.data || []).map(l => ({ ...l, actType: 'lead' })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);

  const formatTimeAgo = (dateStr: string) => {
    const d = new Date(dateStr);
    const diff = Math.floor((new Date().getTime() - d.getTime()) / 60000); // minutes
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div className="admin-container">
      {/* SECTION 1: Top Bar */}
      <div className="top-bar">
        <div className="top-left">
          <h1><T en="GearBeat Control Center" ar="مركز تحكم GearBeat" /></h1>
          <div className="admin-meta">
            <span className="admin-name">{adminData?.email?.split('@')[0]}</span>
            <span className="admin-role-badge">{adminData?.admin_role || "Administrator"}</span>
          </div>
        </div>
        <div className="top-right">
          <p className="current-time">{now.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' })}</p>
          <p className="current-date">{now.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}</p>
        </div>
      </div>

      {/* SECTION 2: Platform Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎹</div>
          <div className="stat-content">
            <div className="stat-number">{studiosCount.count || 0}</div>
            <div className="stat-label"><T en="Total Studios" ar="إجمالي الاستوديوهات" /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏪</div>
          <div className="stat-content">
            <div className="stat-number">{vendorsCount.count || 0}</div>
            <div className="stat-label"><T en="Total Vendors" ar="إجمالي التجار" /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{customersCount.count || 0}</div>
            <div className="stat-label"><T en="Total Customers" ar="إجمالي العملاء" /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-number">{bookingsCount.count || 0}</div>
            <div className="stat-label"><T en="Bookings this month" ar="حجوزات الشهر" /></div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-number">{ordersCount.count || 0}</div>
            <div className="stat-label"><T en="Orders this month" ar="طلبات الشهر" /></div>
          </div>
        </div>
        <div className="stat-card gold-border">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-number">{totalRevenue.toLocaleString()} <span className="currency">SAR</span></div>
            <div className="stat-label"><T en="Total Revenue" ar="إجمالي الأرباح" /></div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Two Columns */}
      <div className="dashboard-columns">
        {/* LEFT: Recent Activity */}
        <div className="col-left">
          <div className="content-card">
            <h2><T en="Recent Platform Activity" ar="أحدث نشاط للمنصة" /></h2>
            <div className="activity-feed">
              {activityItems.map((item: any, idx) => (
                <div key={idx} className="activity-item">
                  <span className={`act-badge ${item.actType}`}>
                    {item.actType}
                  </span>
                  <div className="act-info">
                    {item.actType === 'booking' && `New studio booking #${item.id?.slice(0, 8)} - ${item.total_amount} SAR`}
                    {item.actType === 'order' && `Marketplace order #${item.id?.slice(0, 8)} - ${item.total_amount} SAR`}
                    {item.actType === 'lead' && `New provider lead: ${item.name} (${item.type})`}
                  </div>
                  <span className="act-time">{formatTimeAgo(item.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Platform Health */}
        <div className="col-right">
          <div className="health-grid">
            <div className="health-card">
              <div className="health-val">
                {(pendingStudios.count || 0) > 0 && <span className="red-dot" />}
                {pendingStudios.count || 0}
              </div>
              <div className="health-label"><T en="Pending Studios" ar="استوديوهات معلقة" /></div>
              <Link href="/admin/studios" className="review-btn"><T en="Review" ar="مراجعة" /></Link>
            </div>
            <div className="health-card">
              <div className="health-val">
                {(pendingVendors.count || 0) > 0 && <span className="red-dot" />}
                {pendingVendors.count || 0}
              </div>
              <div className="health-label"><T en="Pending Vendors" ar="تجار معلقون" /></div>
              <Link href="/admin/vendors" className="review-btn"><T en="Review" ar="مراجعة" /></Link>
            </div>
            <div className="health-card">
              <div className="health-val">
                {(pendingLeads.count || 0) > 0 && <span className="red-dot" />}
                {pendingLeads.count || 0}
              </div>
              <div className="health-label"><T en="Provider Leads" ar="طلبات الانضمام" /></div>
              <Link href="/admin/leads" className="review-btn"><T en="Review" ar="مراجعة" /></Link>
            </div>
            <div className="health-card">
              <div className="health-val">
                {(openDisputes.count || 0) > 0 && <span className="red-dot" />}
                {openDisputes.count || 0}
              </div>
              <div className="health-label"><T en="Open Disputes" ar="نزاعات مفتوحة" /></div>
              <Link href="/admin/disputes" className="review-btn"><T en="Review" ar="مراجعة" /></Link>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Quick Nav Grid */}
      <div className="quick-nav">
        <div className="nav-row">
          <Link href="/admin/studios" className="nav-btn"><T en="Studios" ar="الاستوديوهات" /></Link>
          <Link href="/admin/vendors" className="nav-btn"><T en="Vendors" ar="التجار" /></Link>
          <Link href="/admin/bookings" className="nav-btn"><T en="Bookings" ar="الحجوزات" /></Link>
        </div>
        <div className="nav-row">
          <Link href="/admin/orders" className="nav-btn"><T en="Orders" ar="الطلبات" /></Link>
          <Link href="/admin/payments" className="nav-btn"><T en="Payments" ar="المدفوعات" /></Link>
          <Link href="/admin/settlements" className="nav-btn"><T en="Settlements" ar="التسويات" /></Link>
        </div>
        <div className="nav-row">
          <Link href="/admin/leads" className="nav-btn"><T en="Leads" ar="الطلبات" /></Link>
          <Link href="/admin/reviews" className="nav-btn"><T en="Reviews" ar="التقييمات" /></Link>
          <Link href="/admin/reports" className="nav-btn"><T en="Reports" ar="التقارير" /></Link>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .admin-container {
          display: flex;
          flex-direction: column;
          gap: 32px;
          background: #0a0a0a;
          color: #fff;
          padding: 20px 0;
        }

        .top-bar {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-bottom: 20px;
          border-bottom: 1px solid #222;
        }

        .top-bar h1 {
          font-size: 1.8rem;
          margin: 0 0 8px;
        }

        .admin-meta {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .admin-name {
          font-weight: 700;
          color: var(--gb-gold, #cfa86e);
        }

        .admin-role-badge {
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #888;
        }

        .top-right {
          text-align: right;
        }

        .current-time {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0;
        }

        .current-date {
          color: #888;
          font-size: 0.9rem;
          margin: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .stat-card {
          background: #111;
          border: 1px solid #222;
          padding: 24px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .stat-card.gold-border {
          border-color: var(--gb-gold, #cfa86e);
        }

        .stat-icon {
          font-size: 2rem;
          opacity: 0.5;
        }

        .stat-number {
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--gb-gold, #cfa86e);
        }

        .stat-label {
          color: #888;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dashboard-columns {
          display: grid;
          grid-template-columns: 6fr 4fr;
          gap: 32px;
        }

        .content-card {
          background: #111;
          border: 1px solid #222;
          border-radius: 20px;
          padding: 24px;
        }

        .content-card h2 {
          font-size: 1.2rem;
          margin: 0 0 24px;
        }

        .activity-feed {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid #1a1a1a;
        }

        .activity-item:last-child { border-bottom: none; }

        .act-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .act-badge.booking { background: rgba(207, 168, 110, 0.15); color: #cfa86e; }
        .act-badge.order { background: rgba(0, 123, 255, 0.15); color: #007bff; }
        .act-badge.lead { background: rgba(40, 167, 69, 0.15); color: #28a745; }

        .act-info {
          flex: 1;
          font-size: 0.9rem;
        }

        .act-time {
          font-size: 0.75rem;
          color: #555;
        }

        .health-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .health-card {
          background: #111;
          border: 1px solid #222;
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          position: relative;
        }

        .health-val {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 4px;
          position: relative;
          display: inline-block;
        }

        .red-dot {
          width: 10px;
          height: 10px;
          background: #e53e3e;
          border-radius: 50%;
          position: absolute;
          top: 8px;
          right: -12px;
          box-shadow: 0 0 10px rgba(229, 62, 62, 0.5);
        }

        .health-label {
          font-size: 0.85rem;
          color: #888;
          margin-bottom: 16px;
        }

        .review-btn {
          display: block;
          width: 100%;
          padding: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid #333;
          border-radius: 8px;
          color: #fff;
          text-decoration: none;
          font-size: 0.8rem;
          font-weight: 700;
          transition: all 0.2s;
        }

        .review-btn:hover {
          background: #fff;
          color: #000;
        }

        .quick-nav {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .nav-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .nav-btn {
          padding: 16px;
          background: #111;
          border: 1px solid #222;
          border-radius: 12px;
          color: #fff;
          text-decoration: none;
          text-align: center;
          font-weight: 600;
          transition: all 0.2s;
        }

        .nav-btn:hover {
          border-color: var(--gb-gold, #cfa86e);
          color: var(--gb-gold, #cfa86e);
          background: rgba(207, 168, 110, 0.05);
        }

        @media (max-width: 1024px) {
          .dashboard-columns { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: 1fr; }
          .top-bar { flex-direction: column; align-items: flex-start; gap: 20px; }
          .top-right { text-align: left; }
          .nav-row { grid-template-columns: 1fr; }
        }
      ` }} />
    </div>
  );
}
