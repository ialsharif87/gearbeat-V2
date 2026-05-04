import { requireAdminLayoutAccess } from "@/lib/route-guards";
import T from "@/components/t";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const { supabaseAdmin } = await requireAdminLayoutAccess();

  // 1. Revenue Summary
  const [bookingsRevenueData, ordersRevenueData] = await Promise.all([
    supabaseAdmin.from("bookings").select("total_amount").eq("payment_status", "paid"),
    supabaseAdmin.from("marketplace_orders").select("total_amount").eq("status", "delivered")
  ]);

  const totalBookingRev = bookingsRevenueData.data?.reduce((acc, b) => acc + (b.total_amount || 0), 0) || 0;
  const totalOrderRev = ordersRevenueData.data?.reduce((acc, o) => acc + (o.total_amount || 0), 0) || 0;
  const platformCommission = (totalBookingRev + totalOrderRev) * 0.15;
  const netTotal = (totalBookingRev + totalOrderRev) * 0.85;

  // 2. Growth This Month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [newStudios, newSellers, newCustomers, newBookings, newOrders] = await Promise.all([
    supabaseAdmin.from("studios").select("id", { count: "exact", head: true }).gte("created_at", startOfMonth),
    supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "vendor").gte("created_at", startOfMonth),
    supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer").gte("created_at", startOfMonth),
    supabaseAdmin.from("bookings").select("id", { count: "exact", head: true }).gte("created_at", startOfMonth),
    supabaseAdmin.from("marketplace_orders").select("id", { count: "exact", head: true }).gte("created_at", startOfMonth),
  ]);

  // 3. Top Performers (Studios by revenue)
  const { data: topStudios } = await supabaseAdmin
    .from("studios")
    .select(`
      id, name,
      bookings (id, total_amount)
    `)
    .limit(10);
    
  const aggregatedStudios = (topStudios || []).map(s => ({
    name: s.name,
    count: s.bookings?.length || 0,
    rev: (s.bookings as any[])?.reduce((acc: number, b: any) => acc + (b.total_amount || 0), 0) || 0
  })).sort((a, b) => b.rev - a.rev).slice(0, 5);

  // Top Performers (Sellers by revenue)
  const { data: topSellers } = await supabaseAdmin
    .from("profiles")
    .select(`
      id, full_name,
      marketplace_orders (id, total_amount)
    `)
    .eq("role", "vendor")
    .limit(10);

  const aggregatedSellers = (topSellers || []).map(s => ({
    name: s.full_name,
    count: s.marketplace_orders?.length || 0,
    rev: (s.marketplace_orders as any[])?.reduce((acc: number, o: any) => acc + (o.total_amount || 0), 0) || 0
  })).sort((a, b) => b.rev - a.rev).slice(0, 5);

  return (
    <main style={{ padding: 32, background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>
          <T en="Platform Reports" ar="تقارير المنصة" />
        </h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <ExportButton labelEn="Export Bookings" labelAr="تصدير الحجوزات" />
          <ExportButton labelEn="Export Orders" labelAr="تصدير المبيعات" />
        </div>
      </div>

      {/* SECTION 1: Revenue Summary */}
      <h3 style={sectionTitleStyle}><T en="Revenue Summary" ar="ملخص الإيرادات" /></h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40 }}>
        <ReportCard labelEn="Total Booking Revenue" labelAr="إجمالي إيراد الحجوزات" value={totalBookingRev} />
        <ReportCard labelEn="Total Sales Revenue" labelAr="إجمالي إيراد المبيعات" value={totalOrderRev} />
        <ReportCard labelEn="GearBeat Commission" labelAr="عمولة GearBeat" value={platformCommission} color="#cfa86e" />
        <ReportCard labelEn="Net Platform Revenue" labelAr="إجمالي الإيراد الصافي" value={netTotal} color="#22c55e" />
      </div>

      {/* SECTION 2: Growth */}
      <h3 style={sectionTitleStyle}><T en="Growth This Month" ar="نمو الشهر الحالي" /></h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 40 }}>
        <GrowthCard labelEn="New Studios" labelAr="استوديوهات جديدة" value={newStudios.count || 0} />
        <GrowthCard labelEn="New Sellers" labelAr="تجار جدد" value={newSellers.count || 0} />
        <GrowthCard labelEn="New Customers" labelAr="عملاء جدد" value={newCustomers.count || 0} />
        <GrowthCard labelEn="New Bookings" labelAr="حجوزات" value={newBookings.count || 0} />
        <GrowthCard labelEn="New Orders" labelAr="طلبات" value={newOrders.count || 0} />
      </div>

      {/* SECTION 3: Top Performers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div>
          <h3 style={sectionTitleStyle}><T en="Top 5 Studios" ar="أفضل 5 استوديوهات" /></h3>
          <div style={tableContainerStyle}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={thRowStyle}><th style={thStyle}>Studio</th><th style={thStyle}>Bookings</th><th style={thStyle}>Revenue</th></tr></thead>
              <tbody>
                {aggregatedStudios.map((s, i) => (
                  <tr key={i} style={trStyle}><td style={tdStyle}>{s.name}</td><td style={tdStyle}>{s.count}</td><td style={tdStyle}>{s.rev.toLocaleString()} SAR</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h3 style={sectionTitleStyle}><T en="Top 5 Sellers" ar="أفضل 5 تجار" /></h3>
          <div style={tableContainerStyle}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={thRowStyle}><th style={thStyle}>Seller</th><th style={thStyle}>Orders</th><th style={thStyle}>Revenue</th></tr></thead>
              <tbody>
                {aggregatedSellers.map((s, i) => (
                  <tr key={i} style={trStyle}><td style={tdStyle}>{s.name}</td><td style={tdStyle}>{s.count}</td><td style={tdStyle}>{s.rev.toLocaleString()} SAR</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

function ReportCard({ labelEn, labelAr, value, color }: { labelEn: string, labelAr: string, value: number, color?: string }) {
  return (
    <div style={{ background: '#111', padding: 24, borderRadius: 16, border: '1px solid #1e1e1e' }}>
      <div style={{ color: '#666', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}><T en={labelEn} ar={labelAr} /></div>
      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: color || '#fff' }}>{value.toLocaleString()} <span style={{ fontSize: '0.7rem' }}>SAR</span></div>
    </div>
  );
}

function GrowthCard({ labelEn, labelAr, value }: { labelEn: string, labelAr: string, value: number }) {
  return (
    <div style={{ background: '#111', padding: '16px 20px', borderRadius: 12, border: '1px solid #1e1e1e', textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>{value}</div>
      <div style={{ color: '#666', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}><T en={labelEn} ar={labelAr} /></div>
    </div>
  );
}

function ExportButton({ labelEn, labelAr }: { labelEn: string, labelAr: string }) {
  return (
    <button style={{ background: '#111', border: '1px solid #333', color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
      📥 <T en={labelEn} ar={labelAr} />
    </button>
  );
}

const sectionTitleStyle: React.CSSProperties = { fontSize: '1rem', fontWeight: 700, color: '#cfa86e', textTransform: 'uppercase', marginBottom: 20, letterSpacing: '1px' };
const tableContainerStyle: React.CSSProperties = { background: '#111', borderRadius: 16, border: '1px solid #1e1e1e', padding: 12 };
const thRowStyle: React.CSSProperties = { borderBottom: '1px solid #1e1e1e', textAlign: 'left' };
const thStyle: React.CSSProperties = { padding: '12px 16px', fontSize: '0.75rem', color: '#666' };
const trStyle: React.CSSProperties = { borderBottom: '1px solid #0d0d0d' };
const tdStyle: React.CSSProperties = { padding: '12px 16px', fontSize: '0.85rem' };
