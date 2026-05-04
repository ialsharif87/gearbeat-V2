import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import T from "@/components/t";
import { requireAdminLayoutAccess } from "@/lib/route-guards";

export const dynamic = "force-dynamic";

export default async function AdminSellerPaymentsPage() {
  const { supabaseAdmin } = await requireAdminLayoutAccess();

  // Fetch aggregated payments for delivered orders
  const { data: paymentsData } = await supabaseAdmin
    .from("marketplace_orders")
    .select(`
      total_amount,
      profiles!marketplace_orders_vendor_auth_user_id_fkey (full_name, email)
    `)
    .eq("status", "delivered");

  const sellerGroups: Record<string, any> = {};

  (paymentsData || []).forEach(order => {
    const email = order.profiles?.email;
    if (!email) return;
    if (!sellerGroups[email]) {
      sellerGroups[email] = {
        name: order.profiles.full_name,
        email: email,
        orderCount: 0,
        gross: 0,
        commission: 0,
        net: 0
      };
    }
    sellerGroups[email].orderCount += 1;
    sellerGroups[email].gross += order.total_amount || 0;
    sellerGroups[email].commission += (order.total_amount || 0) * 0.15;
    sellerGroups[email].net += (order.total_amount || 0) * 0.85;
  });

  const sellers = Object.values(sellerGroups).sort((a, b) => b.gross - a.gross);

  const totals = {
    gross: sellers.reduce((acc, s) => acc + s.gross, 0),
    commission: sellers.reduce((acc, s) => acc + s.commission, 0),
    net: sellers.reduce((acc, s) => acc + s.net, 0)
  };

  return (
    <main style={{ padding: 32, background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 32 }}>
        <T en="Seller Payments" ar="مدفوعات التجار" />
      </h1>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <SummaryCard labelEn="Total Gross Revenue" labelAr="إجمالي الإيرادات" value={totals.gross} />
        <SummaryCard labelEn="Total Commission" labelAr="إجمالي العمولات" value={totals.commission} color="#cfa86e" />
        <SummaryCard labelEn="Total Net Payable" labelAr="صافي المستحقات" value={totals.net} color="#22c55e" />
      </div>

      {/* Payments Table */}
      <div style={{ background: '#111', borderRadius: 20, border: '1px solid #1e1e1e', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #1e1e1e' }}>
              <th style={thStyle}><T en="Seller" ar="التاجر" /></th>
              <th style={thStyle}><T en="Orders" ar="الطلبات" /></th>
              <th style={thStyle}><T en="Gross" ar="الإجمالي" /></th>
              <th style={thStyle}><T en="Commission (15%)" ar="العمولة (15%)" /></th>
              <th style={thStyle}><T en="Net Payable" ar="الصافي للمورد" /></th>
              <th style={thStyle}><T en="Actions" ar="إجراءات" /></th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((s, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #111' }}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 700 }}>{s.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>{s.email}</div>
                </td>
                <td style={tdStyle}>{s.orderCount}</td>
                <td style={tdStyle}>{s.gross.toLocaleString()} SAR</td>
                <td style={{ ...tdStyle, color: '#cfa86e' }}>{s.commission.toLocaleString()} SAR</td>
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

function SummaryCard({ labelEn, labelAr, value, color }: any) {
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
