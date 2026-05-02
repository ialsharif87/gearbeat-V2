"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">Payout requests</p>
            <h2>Available balance</h2>
            <p className="gb-muted-text">
              Submit payout requests for your available internal payable balance.
              This does not trigger automatic bank transfer.
            </p>
          </div>
        </div>

        <div className="gb-kpi-grid">
          <div className="gb-kpi-card">
            <span>Available balance</span>
            <strong>{money(availableBalance, currency)}</strong>
          </div>
          <div className="gb-kpi-card">
            <span>Requests</span>
            <strong>{requests.length}</strong>
          </div>
        </div>

        {message ? <p className="gb-success-text">{message}</p> : null}
        {errorMessage ? <p className="gb-error-text">{errorMessage}</p> : null}
      </section>

      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">New request</p>
            <h2>Request payout</h2>
          </div>
        </div>

        <div className="gb-form-grid">
          <label>
            <span>Amount</span>
            <input
              className="gb-input"
              type="number"
              min="1"
              max={availableBalance}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </label>

          <label>
            <span>Payout method</span>
            <select
              className="gb-input"
              value={payoutMethod}
              onChange={(event) => setPayoutMethod(event.target.value)}
            >
              <option value="manual_bank_transfer">Manual bank transfer</option>
              <option value="wallet">Wallet</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label>
            <span>Payout details</span>
            <textarea
              className="gb-input"
              rows={3}
              value={payoutDetails}
              onChange={(event) => setPayoutDetails(event.target.value)}
              placeholder="Bank name, IBAN, account name, or internal note"
            />
          </label>

          <label>
            <span>Notes</span>
            <textarea
              className="gb-input"
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>
        </div>

        <button
          type="button"
          className="gb-button"
          onClick={submitRequest}
          disabled={isSaving || availableBalance <= 0}
        >
          {isSaving ? "Submitting..." : "Submit payout request"}
        </button>
      </section>

      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">History</p>
            <h2>Payout requests</h2>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="gb-empty-state">
            <h3>No payout requests yet</h3>
            <p>Your payout requests will appear here.</p>
          </div>
        ) : (
          <div className="gb-table-wrap">
            <table className="gb-table">
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Method</th>
                  <th>Admin notes</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.requestNumber}</td>
                    <td>{money(request.requestedAmount, request.currency)}</td>
                    <td>{request.status}</td>
                    <td>{request.payoutMethod || "-"}</td>
                    <td>{request.adminNotes || "-"}</td>
                    <td>{request.createdAt?.slice(0, 10) || "-"}</td>
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
