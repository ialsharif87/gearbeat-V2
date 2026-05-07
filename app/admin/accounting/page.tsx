import { createAdminClient } from "@/lib/supabase/admin";
import T from "@/components/t";

export const dynamic = "force-dynamic";

export default async function AccountingPage() {
  const supabase = createAdminClient();

  // Fetch summary data from finance_ledger
  const { data: ledger } = await supabase
    .from("finance_ledger")
    .select("*")
    .order("transaction_date", { ascending: false });

  // Calculate Totals
  const totalRevenue = (ledger || [])
    .filter(e => e.entry_type === 'customer_payment' && e.status === 'posted')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const totalCommission = (ledger || [])
    .filter(e => e.entry_type === 'platform_commission' && e.status === 'posted')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const pendingPayouts = (ledger || [])
    .filter(e => ['vendor_payable', 'owner_payable'].includes(e.entry_type) && e.status === 'pending')
    .reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div style={{ padding: 40 }}>
      <header style={{ marginBottom: 40 }}>
        <span className="badge badge-gold">
          <T en="Financial Management" ar="الإدارة المالية" />
        </span>
        <h1 style={{ fontSize: '2.5rem', marginTop: 12 }}>
          <T en="Accounting & Ledger" ar="المحاسبة والدفاتر" />
        </h1>
      </header>

      {/* STATS BAR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40 }}>
        <StatCard 
          labelEn="Total Revenue" 
          labelAr="إجمالي الإيرادات" 
          value={totalRevenue} 
          color="#cfa86e" 
        />
        <StatCard 
          labelEn="GearBeat Commission" 
          labelAr="عمولة جير بيت" 
          value={totalCommission} 
          color="#67c587" 
        />
        <StatCard 
          labelEn="Pending Payouts" 
          labelAr="مستحقات معلقة" 
          value={pendingPayouts} 
          color="#e6b85c" 
        />
        <StatCard 
          labelEn="Active Transactions" 
          labelAr="العمليات النشطة" 
          value={ledger?.length || 0} 
          color="#5e7c88" 
          isCurrency={false}
        />
      </div>

      {/* LEDGER TABLE */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>
            <T en="Transaction Ledger" ar="دفتر العمليات" />
          </h2>
          <button className="btn btn-small btn-secondary">
            <T en="Export CSV" ar="تصدير بيانات" />
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#0f0f0f', color: '#888', textAlign: 'left' }}>
              <th style={thStyle}><T en="Date" ar="التاريخ" /></th>
              <th style={thStyle}><T en="Source" ar="المصدر" /></th>
              <th style={thStyle}><T en="Type" ar="النوع" /></th>
              <th style={thStyle}><T en="Partner" ar="الطرف" /></th>
              <th style={thStyle}><T en="Amount" ar="المبلغ" /></th>
              <th style={thStyle}><T en="Status" ar="الحالة" /></th>
            </tr>
          </thead>
          <tbody>
            {ledger && ledger.length > 0 ? (
              ledger.map((entry) => (
                <tr key={entry.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={tdStyle}>
                    {new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(entry.transaction_date))}
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: '0.75rem', color: '#555' }}>{entry.source_type}</span>
                    <div style={{ fontWeight: 600 }}>{entry.source_id.slice(0, 8)}...</div>
                  </td>
                  <td style={tdStyle}>
                    <span style={getEntryTypeStyle(entry.entry_type)}>
                      <T 
                        en={entry.entry_type === 'platform_commission' ? 'COMMISSION' : entry.entry_type === 'customer_payment' ? 'PAYMENT' : 'PAYABLE'} 
                        ar={entry.entry_type === 'platform_commission' ? 'عمولة' : entry.entry_type === 'customer_payment' ? 'دفعة' : 'مستحق'} 
                      />
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: '0.75rem', color: '#555' }}>{entry.partner_type}</div>
                    {entry.partner_label || entry.partner_id.slice(0, 8)}
                  </td>
                  <td style={tdStyle}>
                    <strong style={{ color: '#fff' }}>{Number(entry.amount).toLocaleString()}</strong>
                    <span style={{ fontSize: '0.7rem', marginLeft: 4, color: '#555' }}>SAR</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={getStatusStyle(entry.status)}>
                      <T 
                        en={entry.status === 'posted' ? 'POSTED' : entry.status === 'pending' ? 'PENDING' : 'VOID'} 
                        ar={entry.status === 'posted' ? 'مرحل' : entry.status === 'pending' ? 'معلق' : 'ملغي'} 
                      />
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#555' }}>
                  <T en="No financial records found." ar="لا توجد سجلات مالية حتى الآن." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface StatCardProps {
  labelEn: string;
  labelAr: string;
  value: number | string;
  color: string;
  isCurrency?: boolean;
}

function StatCard({ labelEn, labelAr, value, color, isCurrency = true }: StatCardProps) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: 8 }}>
        <T en={labelEn} ar={labelAr} />
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>
        {isCurrency ? (
          <>
            {Number(value).toLocaleString()}
            <span style={{ fontSize: '0.9rem', marginLeft: 8, color: '#555', fontWeight: 400 }}>SAR</span>
          </>
        ) : (
          value
        )}
      </div>
      <div style={{ width: '100%', height: 4, background: '#1a1a1a', borderRadius: 2, marginTop: 12 }}>
        <div style={{ width: '40%', height: '100%', background: color, borderRadius: 2 }} />
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: '16px 24px', fontWeight: 600 };
const tdStyle: React.CSSProperties = { padding: '16px 24px' };

function getEntryTypeStyle(type: string): React.CSSProperties {
  const base: React.CSSProperties = { 
    fontSize: '0.7rem', 
    padding: '4px 8px', 
    borderRadius: 6, 
    fontWeight: 700,
    textTransform: 'uppercase'
  };
  
  switch(type) {
    case 'platform_commission': return { ...base, color: '#67c587', background: 'rgba(103, 197, 135, 0.1)' };
    case 'customer_payment': return { ...base, color: '#5e7c88', background: 'rgba(94, 124, 136, 0.1)' };
    case 'vendor_payable':
    case 'owner_payable': return { ...base, color: '#e6b85c', background: 'rgba(230, 184, 92, 0.1)' };
    default: return { ...base, color: '#888', background: 'rgba(255, 255, 255, 0.05)' };
  }
}

function getStatusStyle(status: string): React.CSSProperties {
  const base: React.CSSProperties = { 
    fontSize: '0.7rem', 
    padding: '4px 8px', 
    borderRadius: 6, 
    fontWeight: 700,
  };
  
  switch(status) {
    case 'posted':
    case 'paid': return { ...base, color: '#67c587', border: '1px solid rgba(103, 197, 135, 0.2)' };
    case 'pending': return { ...base, color: '#e6b85c', border: '1px solid rgba(230, 184, 92, 0.2)' };
    case 'void': return { ...base, color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' };
    default: return { ...base, color: '#888', border: '1px solid rgba(255, 255, 255, 0.1)' };
  }
}
