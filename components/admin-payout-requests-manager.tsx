"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PayoutRequestRow } from "./partner-payout-requests-panel";

type Props = {
  requests: PayoutRequestRow[];
};

function money(value: number, currency = "SAR") {
  return `${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

export default function AdminPayoutRequestsManager({ requests }: Props) {
  const router = useRouter();
  const [adminNotes, setAdminNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function updateStatus(requestId: string, status: string) {
    setIsSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/payout-requests/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          status,
          adminNotes,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(result?.error || "Could not update payout request.");
        return;
      }

      setMessage("Payout request updated.");
      setAdminNotes("");
      router.refresh();
    } catch {
      setErrorMessage("Could not update payout request.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="gb-dashboard-stack">
      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">Admin payout requests</p>
            <h2>Review payout requests</h2>
            <p className="gb-muted-text">
              Approving or marking paid is internal only. No real transfer happens.
            </p>
          </div>
        </div>

        {message ? <p className="gb-success-text">{message}</p> : null}
        {errorMessage ? <p className="gb-error-text">{errorMessage}</p> : null}

        <label>
          <span>Admin notes</span>
          <textarea
            className="gb-input"
            rows={3}
            value={adminNotes}
            onChange={(event) => setAdminNotes(event.target.value)}
            placeholder="Add internal notes before updating status"
          />
        </label>
      </section>

      <section className="gb-card">
        {requests.length === 0 ? (
          <div className="gb-empty-state">
            <h3>No payout requests</h3>
            <p>Payout requests from vendors and owners will appear here.</p>
          </div>
        ) : (
          <div className="gb-table-wrap">
            <table className="gb-table">
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Partner</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <strong>{request.requestNumber}</strong>
                    </td>
                    <td>{request.partnerType}</td>
                    <td>{money(request.requestedAmount, request.currency)}</td>
                    <td>{request.status}</td>
                    <td>{request.payoutMethod || "-"}</td>
                    <td>{request.createdAt?.slice(0, 10) || "-"}</td>
                    <td>
                      <div className="gb-action-row">
                        {["reviewed", "approved", "rejected", "paid"].map(
                          (status) => (
                            <button
                              key={status}
                              type="button"
                              className="gb-button gb-button-small gb-button-secondary"
                              disabled={isSaving || request.status === status}
                              onClick={() => updateStatus(request.id, status)}
                            >
                              {status}
                            </button>
                          )
                        )}
                      </div>
                    </td>
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
