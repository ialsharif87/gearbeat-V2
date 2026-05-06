import { requireAdminLayoutAccess } from "@/lib/route-guards";
import T from "@/components/t";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const { supabaseAdmin, user: adminUserAuth } = await requireAdminLayoutAccess();

  // Fetch admin role
  const { data: adminData } = await supabaseAdmin
    .from("admin_users")
    .select("admin_role")
    .eq("auth_user_id", adminUserAuth.id)
    .maybeSingle();

  const isSuperAdmin = adminData?.admin_role === "super_admin";

  // Fetch Stats
  const [
    totalStudios, 
    totalSellers, 
    totalCustomers,
    pendingLeads,
    recentActivity
  ] = await Promise.all([
    supabaseAdmin.from("studios").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "vendor"),
    supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
    supabaseAdmin.from("provider_leads").select("*").neq("status", "approved").order("created_at", { ascending: false }).limit(5),
    supabaseAdmin.from("provider_leads").select("*").order("created_at", { ascending: false }).limit(5)
  ]);

  return (
    <main className="gb-dashboard-page container" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="gb-dashboard-header" style={{ marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>
            <T en="GearBeat Command Center" ar="مركز تحكم GearBeat" />
          </h1>
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <span className="badge-gold">
              {isSuperAdmin ? "SUPER_ADMIN" : "STAFF"}
            </span>
            <span style={{ color: 'var(--gb-text-muted)', fontSize: '0.85rem' }}>{adminUserAuth.email}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gb-gold)' }}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gb-text-muted)' }}>{new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })}</div>
        </div>
      </div>

      {/* SECTION 1: GLOBAL OVERVIEW */}
      <h2 style={sectionTitleStyle}><T en="Global Overview" ar="نظرة عامة" /></h2>
      <div className="stats-row" style={{ marginBottom: 48 }}>
        <MetricCard labelEn="Total Studios" labelAr="إجمالي الاستوديوهات" value={totalStudios.count || 0} icon="🎙️" href="/admin/studios" />
        <MetricCard labelEn="Total Sellers" labelAr="إجمالي التجار" value={totalSellers.count || 0} icon="🏪" href="/admin/sellers" />
        <MetricCard labelEn="Total Customers" labelAr="إجمالي العملاء" value={totalCustomers.count || 0} icon="👥" href="/admin/customers" />
        <MetricCard labelEn="Platform Revenue" labelAr="إيرادات المنصة" value="SAR 0" icon="💰" href="/admin/reports" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32, marginBottom: 48 }}>
        {/* SECTION 2: SELLERS MANAGEMENT */}
        <div>
          <h2 style={sectionTitleStyle}><T en="Sellers & Marketplace" ar="إدارة التجار والمتجر" /></h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <QuickActionCard titleEn="Seller Applications" titleAr="طلبات التجار" href="/admin/leads?type=seller" count={pendingLeads.data?.filter(l => l.type === 'seller').length} color="var(--gb-gold)" />
            <QuickActionCard titleEn="Approved Sellers" titleAr="التجار المعتمدون" href="/admin/sellers" color="var(--gb-teal)" />
            <QuickActionCard titleEn="Marketplace Products" titleAr="المنتجات" href="/admin/products" />
            <QuickActionCard titleEn="Marketplace Orders" titleAr="الطلبات" href="/admin/marketplace-orders" />
            <QuickActionCard titleEn="Seller Payments" titleAr="مدفوعات التجار" href="/admin/seller-payments" />
            <QuickActionCard titleEn="Seller Settlements" titleAr="تسويات التجار" href="/admin/seller-settlements" />
          </div>
        </div>

        {/* SECTION 3: RECENT ACTIVITY */}
        <div>
          <h2 style={sectionTitleStyle}><T en="Recent Activity" ar="أحدث النشاطات" /></h2>
          <div className="gb-card" style={{ padding: 20 }}>
            {recentActivity.data?.map((activity: any) => (
              <div key={activity.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--gb-border)' }}>
                <div style={{ background: activity.type === 'seller' ? 'var(--gb-gold)' : 'var(--gb-teal)', width: 4, borderRadius: 2 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{activity.name} applied as {activity.type}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--gb-text-muted)' }}>{new Date(activity.created_at).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
            <Link href="/admin/leads" className="gb-text-link" style={{ display: 'block', textAlign: 'center', marginTop: 16 }}>
              <T en="View all activity" ar="عرض كل النشاطات" /> →
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION 4: STUDIOS MANAGEMENT */}
      <h2 style={sectionTitleStyle}><T en="Studios & Bookings" ar="إدارة الاستوديوهات والحجوزات" /></h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 48 }}>
        <QuickActionCard titleEn="Studio Applications" titleAr="طلبات الاستوديوهات" href="/admin/leads?type=studio" count={pendingLeads.data?.filter(l => l.type === 'studio').length} color="var(--gb-gold)" />
        <QuickActionCard titleEn="Approved Studios" titleAr="الاستوديوهات المعتمدة" href="/admin/studios" color="var(--gb-teal)" />
        <QuickActionCard titleEn="Studio Bookings" titleAr="الحجوزات" href="/admin/bookings" />
        <QuickActionCard titleEn="Studio Payments" titleAr="مدفوعات الاستوديوهات" href="/admin/studio-payments" />
      </div>

      {/* SECTION 5: PLATFORM TOOLS */}
      <h2 style={sectionTitleStyle}><T en="Platform Configuration" ar="إعدادات المنصة" /></h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <QuickActionCard titleEn="Reviews Management" titleAr="إدارة التقييمات" href="/admin/reviews" icon="⭐" />
        <QuickActionCard titleEn="Platform Reports" titleAr="التقارير المالية" href="/admin/reports" icon="📊" />
        <QuickActionCard titleEn="System Settings" titleAr="إعدادات النظام" href="/admin/settings" icon="⚙️" />
      </div>
    </main>
  );
}

function MetricCard({ labelEn, labelAr, value, icon, href }: { labelEn: string, labelAr: string, value: string | number, icon: string, href: string }) {
  return (
    <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="stat-card" style={{ cursor: 'pointer' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, width: '100%' }}>
          <span className="stat-icon">{icon}</span>
          <span className="gb-text-link">→</span>
        </div>
        <div>
          <div className="stat-number">{value}</div>
          <div className="stat-label"><T en={labelEn} ar={labelAr} /></div>
        </div>
      </div>
    </Link>
  );
}

function QuickActionCard({ titleEn, titleAr, href, count, color, icon }: { titleEn: string, titleAr: string, href: string, count?: number, color?: string, icon?: string }) {
  return (
    <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="gb-card" style={{ 
        padding: '16px 20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        transition: 'all 0.2s',
        cursor: 'pointer'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {icon && <span style={{ fontSize: '1.2rem' }}>{icon}</span>}
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}><T en={titleEn} ar={titleAr} /></div>
        </div>
        {count !== undefined && count > 0 && (
          <span style={{ background: color || 'var(--gb-gold)', color: '#000', fontSize: '0.75rem', fontWeight: 900, padding: '4px 10px', borderRadius: 20 }}>
            {count}
          </span>
        )}
      </div>
    </Link>
  );
}

const sectionTitleStyle: React.CSSProperties = { 
  fontSize: '0.75rem', 
  fontWeight: 800, 
  color: 'var(--gb-text-muted)', 
  textTransform: 'uppercase', 
  marginBottom: 20, 
  letterSpacing: '2px',
  borderBottom: '1px solid var(--gb-border)',
  paddingBottom: 12
};
