import T from "@/components/t";
import { requireAdminLayoutAccess } from "@/lib/route-guards";

export const dynamic = "force-dynamic";

export default async function AdminStudioPaymentsPage() {
  const { supabaseAdmin } = await requireAdminLayoutAccess();

  // Fetch aggregated payments for completed bookings
  const { data: paymentsData } = await supabaseAdmin
    .from("bookings")
    .select(`
      total_amount,
      studios (
        id, name,
        profiles!studios_owner_auth_user_id_fkey (full_name, email)
      )
    `)
    .eq("status", "completed")
    .eq("payment_status", "paid");

  const studioGroups: Record<string, { name: string, owner: string, email: string, bookingCount: number, gross: number, commission: number, net: number }> = {};

  (paymentsData || []).forEach((booking: any) => {
    const studioId = booking.studios?.id;
    if (!studioId) return;
    if (!studioGroups[studioId]) {
      studioGroups[studioId] = {
        name: booking.studios.name,
        owner: booking.studios.profiles?.full_name || "Unknown",
        email: booking.studios.profiles?.email || "—",
        bookingCount: 0,
        gross: 0,
        commission: 0,
        net: 0
      };
    }
    studioGroups[studioId].bookingCount += 1;
    studioGroups[studioId].gross += booking.total_amount || 0;
    studioGroups[studioId].commission += (booking.total_amount || 0) * 0.15;
    studioGroups[studioId].net += (booking.total_amount || 0) * 0.85;
  });

  const studios = Object.values(studioGroups).sort((a, b) => b.gross - a.gross);

  const totals = {
    gross: studios.reduce((acc, s) => acc + s.gross, 0),
    commission: studios.reduce((acc, s) => acc + s.commission, 0),
    net: studios.reduce((acc, s) => acc + s.net, 0)
  };

  return (
    <main style={{ padding: 32, background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 32 }}>
        <T en="Studio Payments" ar="مدفوعات الاستوديوهات" />
      </h1>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <SummaryCard labelEn="Total Gross Bookings" labelAr="إجمالي إيرادات الحجوزات" value={totals.gross} />
        <SummaryCard labelEn="Platform Commission" labelAr="عمولة المنصة" value={totals.commission} color="#3b82f6" />
        <SummaryCard labelEn="Net to Owners" labelAr="صافي أصحاب الاستوديوهات" value={totals.net} color="#22c55e" />
      </div>

      {/* Payments Table */}
      <div style={{ background: '#111', borderRadius: 20, border: '1px solid #1e1e1e', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #1e1e1e' }}>
              <th style={thStyle}><T en="Studio" ar="الاستوديو" /></th>
              <th style={thStyle}><T en="Owner" ar="المالك" /></th>
              <th style={thStyle}><T en="Bookings" ar="الحجوزات" /></th>
              <th style={thStyle}><T en="Gross" ar="الإجمالي" /></th>
              <th style={thStyle}><T en="Commission (15%)" ar="العمولة" /></th>
              <th style={thStyle}><T en="Net" ar="الصافي" /></th>
              <th style={thStyle}><T en="Actions" ar="إجراءات" /></th>
            </tr>
          </thead>
          <tbody>
            {studios.map((s, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #111' }}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 700 }}>{s.name}</div>
                </td>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 500 }}>{s.owner}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>{s.email}</div>
                </td>
                <td style={tdStyle}>{s.bookingCount}</td>
                <td style={tdStyle}>{s.gross.toLocaleString()} SAR</td>
                <td style={{ ...tdStyle, color: '#3b82f6' }}>{s.commission.toLocaleString()} SAR</td>
                <td style={{ ...tdStyle, color: '#22c55e', fontWeight: 700 }}>{s.net.toLocaleString()} SAR</td>
                <td style={tdStyle}>
                  <button disabled style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #333', background: 'transparent', color: '#666', fontSize: '0.75rem', cursor: 'not-allowed' }}>
                    <T en="Mark Settled" ar="تسوية" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function SummaryCard({ labelEn, labelAr, value, color }: { labelEn: string, labelAr: string, value: number, color?: string }) {
  return (
    <div style={{ background: '#111', padding: 24, borderRadius: 16, border: '1px solid #1e1e1e' }}>
      <div style={{ color: '#666', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}><T en={labelEn} ar={labelAr} /></div>
      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: color || '#fff' }}>
        {value.toLocaleString()} <span style={{ fontSize: '0.8rem' }}>SAR</span>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: '16px 24px', fontSize: '0.8rem', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' };
const tdStyle: React.CSSProperties = { padding: '16px 24px', fontSize: '0.9rem' };
