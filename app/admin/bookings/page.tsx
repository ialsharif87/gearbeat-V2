import { createAdminClient } from "@/lib/supabase/admin";
import T from "@/components/t";
import { requireAdminLayoutAccess } from "@/lib/route-guards";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const { supabaseAdmin } = await requireAdminLayoutAccess();

  const { data: bookings } = await supabaseAdmin
    .from("bookings")
    .select(`
      *,
      studios (name)
    `)
    .order("created_at", { ascending: false });

  return (
    <main style={{ padding: 32, background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 32 }}>
        <T en="Studio Bookings" ar="حجوزات الاستوديوهات" />
      </h1>

      <div style={{ background: '#111', borderRadius: 20, border: '1px solid #1e1e1e', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #1e1e1e' }}>
              <th style={thStyle}><T en="Booking ID" ar="رقم الحجز" /></th>
              <th style={thStyle}><T en="Studio" ar="الاستوديو" /></th>
              <th style={thStyle}><T en="Total" ar="الإجمالي" /></th>
              <th style={thStyle}><T en="Status" ar="الحالة" /></th>
              <th style={thStyle}><T en="Date" ar="التاريخ" /></th>
            </tr>
          </thead>
          <tbody>
            {bookings?.map((b) => (
              <tr key={b.id} style={{ borderBottom: '1px solid #111' }}>
                <td style={tdStyle}>#{b.id.slice(0, 8)}</td>
                <td style={tdStyle}>{b.studios?.name || "Unknown"}</td>
                <td style={tdStyle}>{b.total_amount} SAR</td>
                <td style={tdStyle}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: 6, 
                    fontSize: '0.75rem', 
                    background: b.status === 'confirmed' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
                    color: b.status === 'confirmed' ? '#22c55e' : '#eab308'
                  }}>
                    {b.status?.toUpperCase()}
                  </span>
                </td>
                <td style={tdStyle}>{new Date(b.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!bookings || bookings.length === 0) && (
          <div style={{ padding: 60, textAlign: 'center', color: '#555' }}>
            <T en="No bookings found." ar="لا توجد حجوزات." />
          </div>
        )}
      </div>
    </main>
  );
}

const thStyle: React.CSSProperties = { padding: '16px 24px', fontSize: '0.8rem', color: '#666', fontWeight: 600 };
const tdStyle: React.CSSProperties = { padding: '16px 24px', fontSize: '0.9rem' };
