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
    <main style={{ padding: 32, background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>
            <T en="GearBeat Command Center" ar="مركز تحكم GearBeat" />
          </h1>
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <span style={{ background: 'rgba(207,168,110,0.1)', color: '#cfa86e', padding: '2px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>
              {isSuperAdmin ? "SUPER_ADMIN" : "STAFF"}
            </span>
            <span style={{ color: '#555', fontSize: '0.8rem' }}>{adminUserAuth.email}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>{new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })}</div>
        </div>
      </div>

      {/* SECTION 1: GLOBAL OVERVIEW */}
      <h2 style={sectionTitleStyle}><T en="Global Overview" ar="نظرة عامة" /></h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 48 }}>
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
            <QuickActionCard titleEn="Seller Applications" titleAr="طلبات التجار" href="/admin/leads?type=seller" count={pendingLeads.data?.filter(l => l.type === 'seller').length} color="#cfa86e" />
            <QuickActionCard titleEn="Approved Sellers" titleAr="التجار المعتمدون" href="/admin/sellers" color="#22c55e" />
            <QuickActionCard titleEn="Marketplace Products" titleAr="المنتجات" href="/admin/products" />
            <QuickActionCard titleEn="Marketplace Orders" titleAr="الطلبات" href="/admin/marketplace-orders" />
            <QuickActionCard titleEn="Seller Payments" titleAr="مدفوعات التجار" href="/admin/seller-payments" />
            <QuickActionCard titleEn="Seller Settlements" titleAr="تسويات التجار" href="/admin/seller-settlements" />
          </div>
        </div>

        {/* SECTION 3: RECENT ACTIVITY */}
        <div>
          <h2 style={sectionTitleStyle}><T en="Recent Activity" ar="أحدث النشاطات" /></h2>
          <div style={{ background: '#111', borderRadius: 20, border: '1px solid #1e1e1e', padding: 20 }}>
            {recentActivity.data?.map((activity: any) => (
              <div key={activity.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid #1a1a1a' }}>
                <div style={{ background: activity.type === 'seller' ? '#cfa86e' : '#3b82f6', width: 4, borderRadius: 2 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{activity.name} applied as {activity.type}</div>
                  <div style={{ fontSize: '0.7rem', color: '#555' }}>{new Date(activity.created_at).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
            <Link href="/admin/leads" style={{ display: 'block', textAlign: 'center', fontSize: '0.8rem', color: '#cfa86e', textDecoration: 'none', marginTop: 16 }}>
              <T en="View all activity" ar="عرض كل النشاطات" /> →
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION 4: STUDIOS MANAGEMENT */}
      <h2 style={sectionTitleStyle}><T en="Studios & Bookings" ar="إدارة الاستوديوهات والحجوزات" /></h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 48 }}>
        <QuickActionCard titleEn="Studio Applications" titleAr="طلبات الاستوديوهات" href="/admin/leads?type=studio" count={pendingLeads.data?.filter(l => l.type === 'studio').length} color="#cfa86e" />
        <QuickActionCard titleEn="Approved Studios" titleAr="الاستوديوهات المعتمدة" href="/admin/studios" color="#22c55e" />
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
      <div style={{ background: '#111', padding: 24, borderRadius: 20, border: '1px solid #1e1e1e', transition: 'transform 0.2s, border-color 0.2s', cursor: 'pointer' }} className="metric-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: '1.5rem' }}>{icon}</span>
          <span style={{ color: '#cfa86e', fontSize: '0.8rem' }}>→</span>
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 4 }}>{value}</div>
        <div style={{ color: '#666', fontSize: '0.8rem', fontWeight: 600 }}><T en={labelEn} ar={labelAr} /></div>
      </div>
    </Link>
  );
}

function QuickActionCard({ titleEn, titleAr, href, count, color, icon }: { titleEn: string, titleAr: string, href: string, count?: number, color?: string, icon?: string }) {
  return (
    <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{ 
        background: '#111', 
        padding: '20px 24px', 
        borderRadius: 16, 
        border: '1px solid #1e1e1e', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        transition: 'all 0.2s',
        cursor: 'pointer'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {icon && <span style={{ fontSize: '1.2rem' }}>{icon}</span>}
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}><T en={titleEn} ar={titleAr} /></div>
        </div>
        {count !== undefined && count > 0 && (
          <span style={{ background: color || '#cfa86e', color: '#000', fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: 20 }}>
            {count}
          </span>
        )}
      </div>
    </Link>
  );
}

const sectionTitleStyle: React.CSSProperties = { 
  fontSize: '0.9rem', 
  fontWeight: 700, 
  color: '#444', 
  textTransform: 'uppercase', 
  marginBottom: 20, 
  letterSpacing: '1px',
  borderBottom: '1px solid #111',
  paddingBottom: 8
};
