"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import T from "@/components/t";

interface PayoutRequest {
  id: string;
  request_number: string;
  requested_amount: number;
  status: string;
  created_at: string;
  payout_method: string;
  admin_notes?: string;
}

interface TransactionRow {
  id: string;
  label: string;
  gross_amount: number;
  commission_amount: number;
  net_amount: number;
  status: string;
  created_at: string;
}

interface PremiumFinanceDashboardProps {
  partnerType: "vendor" | "studio_owner";
  availableBalance: number;
  currency: string;
  payoutRequests: PayoutRequest[];
  transactions: TransactionRow[];
}

export default function PremiumFinanceDashboard({
  partnerType,
  availableBalance,
  currency = "SAR",
  payoutRequests,
  transactions,
}: PremiumFinanceDashboardProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("manual_bank_transfer");
  const [payoutDetails, setPayoutDetails] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val) + " " + currency;
  };

  async function submitPayoutRequest() {
    setMessage("");
    setErrorMessage("");

    const requestedAmount = Number(amount);

    if (isNaN(requestedAmount) || requestedAmount <= 0) {
      setErrorMessage("Please enter a valid amount.");
      return;
    }

    if (requestedAmount > availableBalance) {
      setErrorMessage("Requested amount exceeds available balance.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/payout-requests/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerType,
          requestedAmount,
          payoutMethod,
          payoutDetails,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to submit request");
      }

      setMessage("Payout request submitted successfully.");
      setAmount("");
      setPayoutDetails("");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: '32px' }}>
      {/* Top Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Balance Card */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ color: '#888', fontSize: '0.9rem', fontWeight: 500 }}>
              <T en="Available for Withdrawal" ar="المتاح للسحب" />
            </span>
            <span style={{ fontSize: '1.5rem' }}>💰</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--gb-gold)' }}>
            {formatMoney(availableBalance)}
          </div>
          <div style={{ marginTop: '16px', fontSize: '0.85rem', color: '#666', borderTop: '1px solid #222', paddingTop: '12px' }}>
            <T en="Confirmed funds ready to be moved to your bank account." ar="الأرصدة المؤكدة الجاهزة للتحويل إلى حسابك البنكي." />
          </div>
        </div>

        {/* Quick Request Card */}
        <div style={{ ...cardStyle, border: '1px solid rgba(207,168,110,0.2)', background: 'rgba(207,168,110,0.02)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem' }}>
            <T en="Withdraw Funds" ar="سحب الأرباح" />
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type="number" 
                placeholder="Amount" 
                className="input" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ background: '#0a0a0a', border: '1px solid #333' }}
              />
              <span style={{ position: 'absolute', right: '12px', top: '10px', color: '#555' }}>SAR</span>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={submitPayoutRequest}
              disabled={isSaving || availableBalance <= 0}
              style={{ width: '100%', padding: '12px' }}
            >
              {isSaving ? <T en="Processing..." ar="جاري المعالجة..." /> : <T en="Request Payout" ar="طلب تحويل" />}
            </button>
          </div>
          {message && <p style={{ color: '#22c55e', fontSize: '0.8rem', marginTop: '12px', margin: '12px 0 0' }}>{message}</p>}
          {errorMessage && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '12px', margin: '12px 0 0' }}>{errorMessage}</p>}
        </div>
      </div>

      {/* Main Content: Tabs/Two Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }}>
        {/* Left: Transaction List */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              <T en="Recent Transactions" ar="آخر العمليات" />
            </h2>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #222' }}>
                  <th style={thStyle}><T en="Source" ar="المصدر" /></th>
                  <th style={thStyle}><T en="Gross" ar="الإجمالي" /></th>
                  <th style={thStyle}><T en="Commission" ar="العمولة" /></th>
                  <th style={thStyle}><T en="Net" ar="الصافي" /></th>
                  <th style={thStyle}><T en="Date" ar="التاريخ" /></th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#555' }}>
                      <T en="No transactions found." ar="لا توجد عمليات مسجلة." />
                    </td>
                  </tr>
                ) : (
                  transactions.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600 }}>{t.label}</div>
                        <div style={{ fontSize: '0.75rem', color: '#555' }}>#{t.id.slice(0, 8)}</div>
                      </td>
                      <td style={tdStyle}>{formatMoney(t.gross_amount)}</td>
                      <td style={{ ...tdStyle, color: '#ef4444' }}>-{formatMoney(t.commission_amount)}</td>
                      <td style={{ ...tdStyle, color: '#22c55e', fontWeight: 700 }}>{formatMoney(t.net_amount)}</td>
                      <td style={{ ...tdStyle, color: '#555', fontSize: '0.85rem' }}>{new Date(t.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Payout Request History */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '20px' }}>
            <T en="Request History" ar="سجل الطلبات" />
          </h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {payoutRequests.length === 0 ? (
              <p style={{ color: '#555', textAlign: 'center', padding: '20px' }}>
                <T en="No requests yet." ar="لا توجد طلبات سابقة." />
              </p>
            ) : (
              payoutRequests.map(r => (
                <div key={r.id} style={{ padding: '16px', background: '#0a0a0a', border: '1px solid #222', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>{r.request_number}</span>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      background: r.status === 'paid' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
                      color: r.status === 'paid' ? '#22c55e' : '#eab308'
                    }}>
                      {r.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{formatMoney(r.requested_amount)}</div>
                  <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '4px' }}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: '#111',
  border: '1px solid #1e1e1e',
  borderRadius: '24px',
  padding: '32px',
};

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  color: '#555',
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  padding: '16px',
  fontSize: '0.95rem',
};
