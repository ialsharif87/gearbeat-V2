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
    <main className="gb-dashboard-page">
      {/* Header */}
      <section className="gb-dashboard-header">
        <div className="animate-up">
          <p className="gb-eyebrow"><T en="Admin Command Center" ar="مركز التحكم الإداري" /></p>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, margin: 0, letterSpacing: '-1.5px' }}>
            <T en="Platform Operations" ar="عمليات المنصة" />
          </h1>
          <div style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="badge-gold" style={{ letterSpacing: 1 }}>
              {isSuperAdmin ? "SUPER_ADMIN" : "STAFF"}
            </span>
            <span className="badge" style={{ background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88', border: '1px solid rgba(0, 255, 136, 0.3)', fontSize: '0.65rem' }}>
              LIVE_SYSTEM
            </span>
            <span className="badge" style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--gb-gold)', border: '1px solid rgba(212, 175, 55, 0.3)', fontSize: '0.65rem', fontWeight: 800 }}>
              <T en="PRE-LAUNCH" ar="ما قبل الإطلاق" />
            </span>
            <span className="badge" style={{ background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88', border: '1px solid rgba(0, 255, 136, 0.3)', fontSize: '0.65rem', fontWeight: 800 }}>
              <T en="SAUDI-FIRST COMPLIANCE" ar="الامتثال للأولوية السعودية" />
            </span>
            <span style={{ color: 'var(--gb-text-muted)', fontSize: '0.9rem', borderLeft: '1px solid var(--gb-border)', paddingLeft: 12, marginLeft: 0 }} className="ps-12 ms-0">{adminUserAuth.email}</span>
          </div>
        </div>
        <div className="text-end animate-up">
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--gb-gold)', letterSpacing: -1 }}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <div className="gb-eyebrow" style={{ marginTop: 4 }}>{new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</div>
        </div>
      </section>

      {/* SECTION 1: GLOBAL OVERVIEW */}
      <h2 style={sectionTitleStyle}><T en="Global Overview" ar="نظرة عامة" /></h2>
      <div className="gb-dash-grid animate-up" style={{ marginBottom: 48, animationDelay: '0.1s' }}>
        <MetricCard labelEn="Total Studios" labelAr="إجمالي الاستوديوهات" value={totalStudios.count || 0} icon="🎙️" href="/admin/studios" />
        <MetricCard labelEn="Total Sellers" labelAr="إجمالي التجار" value={totalSellers.count || 0} icon="🏪" href="/admin/sellers" />
        <MetricCard labelEn="Total Customers" labelAr="إجمالي العملاء" value={totalCustomers.count || 0} icon="👥" href="/admin/users" />
        <MetricCard labelEn="Platform Revenue" labelAr="إيرادات المنصة" value="SAR 0" icon="💰" href="/admin/reports" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32, marginBottom: 48 }}>
        {/* SECTION 2: SELLERS MANAGEMENT */}
        <div>
          <h2 style={sectionTitleStyle}><T en="Sellers & Marketplace" ar="إدارة التجار والمتجر" /></h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <QuickActionCard titleEn="Seller Applications" titleAr="طلبات التجار" href="/admin/leads?type=seller" count={pendingLeads.data?.filter(l => l.type === 'seller').length} color="var(--gb-gold)" statusLabel="REVIEW_REQ" />
            <QuickActionCard titleEn="Approved Sellers" titleAr="التجار المعتمدون" href="/admin/sellers" color="var(--gb-teal)" statusLabel="LIVE" />
            <QuickActionCard titleEn="Marketplace Products" titleAr="المنتجات" href="/admin/products" statusLabel="LIVE" />
            <QuickActionCard titleEn="Marketplace Orders" titleAr="الطلبات" href="/admin/marketplace-orders" statusLabel="MANUAL_SETTLEMENT" />
            <QuickActionCard titleEn="Seller Payments" titleAr="مدفوعات التجار" href="/admin/seller-payments" statusLabel="REQ_PAYMENT" />
            <QuickActionCard titleEn="Seller Settlements" titleAr="تسويات التجار" href="/admin/seller-settlements" statusLabel="MANUAL" />
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
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    <T 
                      en={`${activity.full_name || activity.name} applied as ${activity.type}`} 
                      ar={`قام ${activity.full_name || activity.name} بالتقديم كـ ${activity.type === 'seller' ? 'تاجر' : 'استوديو'}`} 
                    />
                  </div>
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
        <QuickActionCard titleEn="Studio Applications" titleAr="طلبات الاستوديوهات" href="/admin/leads?type=studio" count={pendingLeads.data?.filter(l => l.type === 'studio').length} color="var(--gb-gold)" statusLabel="REVIEW_REQ" />
        <QuickActionCard titleEn="Approved Studios" titleAr="الاستوديوهات المعتمدة" href="/admin/studios" color="var(--gb-teal)" statusLabel="LIVE" />
        <QuickActionCard titleEn="Studio Bookings" titleAr="الحجوزات" href="/admin/bookings" statusLabel="MANUAL" />
        <QuickActionCard titleEn="Studio Payments" titleAr="مدفوعات الاستوديوهات" href="/admin/studio-payments" statusLabel="REQ_PAYMENT" />
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
      <div className="gb-dash-card" style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: '2rem' }}>{icon}</span>
          <span className="text-gold" style={{ fontSize: '1.2rem' }}>→</span>
        </div>
        <div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'white', marginBottom: 4 }}>{value}</div>
          <div className="gb-eyebrow" style={{ fontSize: '0.65rem', margin: 0 }}><T en={labelEn} ar={labelAr} /></div>
        </div>
      </div>
    </Link>
  );
}

function QuickActionCard({ titleEn, titleAr, href, count, color, icon, statusLabel }: { titleEn: string, titleAr: string, href: string, count?: number, color?: string, icon?: string, statusLabel?: string }) {
  return (
    <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="gb-card" style={{ 
        padding: '16px 20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        transition: 'all 0.2s',
        cursor: 'pointer',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {icon && <span style={{ fontSize: '1.2rem' }}>{icon}</span>}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}><T en={titleEn} ar={titleAr} /></div>
            {statusLabel && (
              <div style={{ fontSize: '0.6rem', color: 'var(--gb-gold)', letterSpacing: '0.5px', fontWeight: 800, marginTop: 4, opacity: 0.8 }}>
                {statusLabel}
              </div>
            )}
          </div>
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
