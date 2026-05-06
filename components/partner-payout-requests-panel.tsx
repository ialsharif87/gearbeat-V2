"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import T from "./t";

export type PayoutRequestRow = {
  id: string;
  requestNumber: string;
  partnerType: string;
  requestedAmount: number;
  currency: string;
  status: string;
  payoutMethod: string;
  requesterNotes: string;
  adminNotes: string;
  createdAt: string;
};

type Props = {
  partnerType: "vendor" | "studio_owner";
  availableBalance: number;
  currency: string;
  requests: PayoutRequestRow[];
};

function money(value: number, currency = "SAR") {
  return `${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function statusBadgeStyle(status: string) {
  switch (status.toLowerCase()) {
    case 'approved':
    case 'paid':
      return { background: 'rgba(15, 160, 138, 0.1)', color: 'var(--gb-teal)', border: '1px solid var(--gb-teal)' };
    case 'rejected':
    case 'cancelled':
      return { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' };
    case 'pending':
    default:
      return { background: 'rgba(212, 175, 55, 0.1)', color: 'var(--gb-gold)', border: '1px solid var(--gb-gold)' };
  }
}

export default function PartnerPayoutRequestsPanel({
  partnerType,
  availableBalance,
  currency,
  requests,
}: Props) {
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("manual_bank_transfer");
  const [payoutDetails, setPayoutDetails] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function submitRequest() {
    setMessage("");
    setErrorMessage("");

    const requestedAmount = Number(amount);

    if (Number.isNaN(requestedAmount) || requestedAmount <= 0) {
      setErrorMessage("Enter a valid amount.");
      return;
    }

    if (requestedAmount > availableBalance) {
      setErrorMessage("Requested amount is higher than available balance.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/payout-requests/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          partnerType,
          requestedAmount,
          payoutMethod,
          payoutDetails,
          requesterNotes: notes,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(result?.error || "Could not submit payout request.");
        return;
      }

      setAmount("");
      setPayoutDetails("");
      setNotes("");
      setMessage("Payout request submitted.");
      router.refresh();
    } catch {
      setErrorMessage("Could not submit payout request.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="gb-dashboard-stack">
      <section className="gb-card" style={{ padding: '32px' }}>
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow"><T en="Payout Requests" ar="طلبات البياوت" /></p>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white' }}><T en="Available Balance" ar="الرصيد المتاح" /></h2>
            <p className="gb-muted-text" style={{ maxWidth: '600px' }}>
              <T 
                en="Submit payout requests for your available internal payable balance. This does not trigger automatic bank transfer." 
                ar="أرسل طلبات تحويل للرصيد المتاح في حسابك. هذا الإجراء لا ينفذ تحويلاً بنكياً تلقائياً."
              />
            </p>
          </div>
        </div>

        <div className="gb-kpi-grid" style={{ marginTop: '24px' }}>
          <div className="gb-kpi-card" style={{ background: 'rgba(212, 175, 55, 0.05)', border: '1px solid var(--gb-border)' }}>
            <span className="gb-detail-label"><T en="Available Balance" ar="الرصيد المتاح" /></span>
            <strong style={{ color: 'var(--gb-gold)', fontSize: '2rem' }}>{money(availableBalance, currency)}</strong>
          </div>
          <div className="gb-kpi-card">
            <span className="gb-detail-label"><T en="Total Requests" ar="إجمالي الطلبات" /></span>
            <strong style={{ color: 'white', fontSize: '2rem' }}>{requests.length}</strong>
          </div>
        </div>

        {message && (
          <div style={{ marginTop: 24, padding: 16, background: 'rgba(15, 160, 138, 0.1)', borderRadius: 12, border: '1px solid var(--gb-teal)' }}>
            <p style={{ margin: 0, color: 'var(--gb-teal)', fontWeight: 800 }}>{message}</p>
          </div>
        )}
        {errorMessage && (
          <div style={{ marginTop: 24, padding: 16, background: 'rgba(239, 68, 68, 0.1)', borderRadius: 12, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <p style={{ margin: 0, color: '#ef4444', fontWeight: 800 }}>{errorMessage}</p>
          </div>
        )}
      </section>

      <div className="gb-dash-grid-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', alignItems: 'start' }}>
        <section className="gb-card" style={{ padding: '32px' }}>
          <div className="gb-card-header">
            <div>
              <p className="gb-eyebrow"><T en="New Request" ar="طلب جديد" /></p>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}><T en="Request Payout" ar="طلب سحب" /></h2>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '20px', marginTop: '24px' }}>
            <div className="gb-input-group">
              <label className="gb-detail-label"><T en="Amount" ar="المبلغ" /></label>
              <input
                className="gb-input"
                type="number"
                min="1"
                max={availableBalance}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="gb-input-group">
              <label className="gb-detail-label"><T en="Payout Method" ar="طريقة السحب" /></label>
              <select
                className="gb-input"
                value={payoutMethod}
                onChange={(event) => setPayoutMethod(event.target.value)}
              >
                <option value="manual_bank_transfer">Manual bank transfer</option>
                <option value="wallet">Wallet</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="gb-input-group">
              <label className="gb-detail-label"><T en="Payout Details" ar="تفاصيل السحب" /></label>
              <textarea
                className="gb-input"
                rows={3}
                value={payoutDetails}
                onChange={(event) => setPayoutDetails(event.target.value)}
                placeholder="Bank name, IBAN, account name..."
                style={{ height: 'auto' }}
              />
            </div>

            <div className="gb-input-group">
              <label className="gb-detail-label"><T en="Notes" ar="ملاحظات" /></label>
              <textarea
                className="gb-input"
                rows={2}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                style={{ height: 'auto' }}
              />
            </div>

            <button
              type="button"
              className="gb-button gb-button-primary"
              onClick={submitRequest}
              disabled={isSaving || availableBalance <= 0}
              style={{ width: '100%', justifyContent: 'center', height: '52px', fontSize: '1.1rem' }}
            >
              {isSaving ? <T en="Submitting..." ar="جاري الإرسال..." /> : <T en="Submit Payout Request" ar="إرسال طلب السحب" />}
            </button>
          </div>
        </section>

        <section className="gb-card" style={{ padding: '32px' }}>
          <div className="gb-card-header">
            <div>
              <p className="gb-eyebrow"><T en="History" ar="السجل" /></p>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}><T en="Recent Requests" ar="الطلبات الأخيرة" /></h2>
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="gb-empty-state" style={{ padding: '40px 0' }}>
              <p className="gb-muted-text"><T en="No payout requests yet" ar="لا توجد طلبات سحب بعد" /></p>
            </div>
          ) : (
            <div className="gb-table-wrap" style={{ marginTop: '24px' }}>
              <table className="gb-table">
                <thead>
                  <tr>
                    <th><T en="Request" ar="الطلب" /></th>
                    <th><T en="Amount" ar="المبلغ" /></th>
                    <th><T en="Status" ar="الحالة" /></th>
                    <th><T en="Date" ar="التاريخ" /></th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td style={{ fontWeight: 700, color: 'white' }}>#{request.requestNumber}</td>
                      <td style={{ color: 'var(--gb-gold)', fontWeight: 800 }}>{money(request.requestedAmount, request.currency)}</td>
                      <td>
                        <span className="gb-dash-badge" style={statusBadgeStyle(request.status)}>
                          {request.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="gb-muted-text">{request.createdAt?.slice(0, 10) || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
