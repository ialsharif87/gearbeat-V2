"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type FinanceAdjustmentRow = {
  id: string;
  adjustmentNumber: string;
  adjustmentType: string;
  sourceType: string;
  sourceId: string;
  partnerType: string;
  partnerId: string;
  partnerLabel: string;
  amount: number;
  currency: string;
  reason: string;
  status: string;
  createdAt: string;
};

type Props = {
  rows: FinanceAdjustmentRow[];
};

function money(value: number, currency = "SAR") {
  return `${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

export default function AdminRefundsAdjustmentsManager({ rows }: Props) {
  const router = useRouter();

  const [adjustmentType, setAdjustmentType] = useState("refund");
  const [sourceType, setSourceType] = useState("manual_adjustment");
  const [sourceId, setSourceId] = useState("");
  const [partnerType, setPartnerType] = useState("platform");
  const [partnerId, setPartnerId] = useState("");
  const [partnerLabel, setPartnerLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function createAdjustment() {
    setMessage("");
    setErrorMessage("");

    const parsedAmount = Number(amount);

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Enter a valid amount.");
      return;
    }

    if (!reason.trim()) {
      setErrorMessage("Reason is required.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/refunds/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adjustmentType,
          sourceType,
          sourceId,
          partnerType,
          partnerId,
          partnerLabel,
          amount: parsedAmount,
          reason,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(result?.error || "Could not create adjustment.");
        return;
      }

      setMessage("Adjustment created.");
      setAmount("");
      setReason("");
      setSourceId("");
      router.refresh();
    } catch {
      setErrorMessage("Could not create adjustment.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="gb-dashboard-stack">
      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">Refunds & adjustments</p>
            <h2>Create internal finance adjustment</h2>
            <p className="gb-muted-text">
              This creates internal finance records only. No real refund is processed.
            </p>
          </div>
        </div>

        {message ? <p className="gb-success-text">{message}</p> : null}
        {errorMessage ? <p className="gb-error-text">{errorMessage}</p> : null}

        <div className="gb-form-grid">
          <label>
            <span>Type</span>
            <select className="gb-input" value={adjustmentType} onChange={(e) => setAdjustmentType(e.target.value)}>
              <option value="refund">Refund</option>
              <option value="manual_adjustment">Manual adjustment</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
          </label>

          <label>
            <span>Source type</span>
            <select className="gb-input" value={sourceType} onChange={(e) => setSourceType(e.target.value)}>
              <option value="manual_adjustment">Manual adjustment</option>
              <option value="marketplace_order">Marketplace order</option>
              <option value="studio_booking">Studio booking</option>
              <option value="refund">Refund</option>
              <option value="system">System</option>
            </select>
          </label>

          <label>
            <span>Source ID</span>
            <input className="gb-input" value={sourceId} onChange={(e) => setSourceId(e.target.value)} />
          </label>

          <label>
            <span>Partner type</span>
            <select className="gb-input" value={partnerType} onChange={(e) => setPartnerType(e.target.value)}>
              <option value="platform">Platform</option>
              <option value="customer">Customer</option>
              <option value="vendor">Vendor</option>
              <option value="studio_owner">Studio owner</option>
              <option value="system">System</option>
            </select>
          </label>

          <label>
            <span>Partner ID</span>
            <input className="gb-input" value={partnerId} onChange={(e) => setPartnerId(e.target.value)} />
          </label>

          <label>
            <span>Partner label</span>
            <input className="gb-input" value={partnerLabel} onChange={(e) => setPartnerLabel(e.target.value)} />
          </label>

          <label>
            <span>Amount</span>
            <input className="gb-input" type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>

          <label>
            <span>Reason</span>
            <textarea className="gb-input" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
          </label>
        </div>

        <button className="gb-button" type="button" onClick={createAdjustment} disabled={isSaving}>
          {isSaving ? "Saving..." : "Create adjustment"}
        </button>
      </section>

      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">History</p>
            <h2>Refunds & adjustments</h2>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="gb-empty-state">
            <h3>No records yet</h3>
            <p>Refunds and adjustments will appear here.</p>
          </div>
        ) : (
          <div className="gb-table-wrap">
            <table className="gb-table">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Type</th>
                  <th>Source</th>
                  <th>Partner</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.adjustmentNumber}</td>
                    <td>{row.adjustmentType}</td>
                    <td>{row.sourceType} / {row.sourceId || "-"}</td>
                    <td>{row.partnerLabel || row.partnerType}</td>
                    <td>{money(row.amount, row.currency)}</td>
                    <td>{row.status}</td>
                    <td>{row.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
