"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type SettlementBatch = {
  id: string;
  batchNumber: string;
  title: string;
  description: string;
  status: string;
  currency: string;
  grossAmount: number;
  commissionAmount: number;
  netPayableAmount: number;
  itemCount: number;
  createdAt: string;
};

export type PayableLedgerEntry = {
  id: string;
  partnerType: string;
  partnerId: string;
  partnerLabel: string;
  sourceType: string;
  sourceId: string;
  sourceLabel: string;
  amount: number;
  currency: string;
  status: string;
  transactionDate: string;
};

type Props = {
  batches: SettlementBatch[];
  payableEntries: PayableLedgerEntry[];
};

function money(value: number, currency = "SAR") {
  return `${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function escapeCsv(value: string | number) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function downloadCsv(rows: SettlementBatch[]) {
  const headers = [
    "Batch Number",
    "Title",
    "Status",
    "Gross",
    "Commission",
    "Net Payable",
    "Items",
    "Currency",
    "Created At",
  ];

  const lines = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) =>
      [
        row.batchNumber,
        row.title,
        row.status,
        row.grossAmount,
        row.commissionAmount,
        row.netPayableAmount,
        row.itemCount,
        row.currency,
        row.createdAt,
      ]
        .map(escapeCsv)
        .join(",")
    ),
  ];

  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `gearbeat-settlements-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AdminSettlementsManager({
  batches,
  payableEntries,
}: Props) {
  const router = useRouter();

  const [selectedEntryIds, setSelectedEntryIds] = useState<string[]>([]);
  const [title, setTitle] = useState(
    `Settlement Batch ${new Date().toISOString().slice(0, 10)}`
  );
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedEntries = useMemo(() => {
    return payableEntries.filter((entry) => selectedEntryIds.includes(entry.id));
  }, [payableEntries, selectedEntryIds]);

  const selectedTotal = useMemo(() => {
    return selectedEntries.reduce((sum, entry) => sum + entry.amount, 0);
  }, [selectedEntries]);

  const summary = useMemo(() => {
    return batches.reduce(
      (total, batch) => {
        total.count += 1;
        total.netPayable += batch.netPayableAmount;
        if (batch.status === "paid") total.paid += batch.netPayableAmount;
        if (batch.status !== "paid" && batch.status !== "cancelled") {
          total.open += batch.netPayableAmount;
        }
        return total;
      },
      { count: 0, netPayable: 0, paid: 0, open: 0 }
    );
  }, [batches]);

  function toggleEntry(id: string) {
    setSelectedEntryIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  async function createBatch() {
    setMessage("");
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("Batch title is required.");
      return;
    }

    if (selectedEntryIds.length === 0) {
      setErrorMessage("Select at least one payable entry.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/settlements/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          ledgerEntryIds: selectedEntryIds,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(result?.error || "Could not create settlement batch.");
        return;
      }

      setMessage("Settlement batch created.");
      setSelectedEntryIds([]);
      router.refresh();
    } catch {
      setErrorMessage("Could not create settlement batch.");
    } finally {
      setIsSaving(false);
    }
  }

  async function updateStatus(batchId: string, status: string) {
    setMessage("");
    setErrorMessage("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/settlements/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ batchId, status }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(result?.error || "Could not update batch status.");
        return;
      }

      setMessage("Settlement status updated.");
      router.refresh();
    } catch {
      setErrorMessage("Could not update batch status.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="gb-dashboard-stack">
      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">Settlement batches</p>
            <h2>Settlement overview</h2>
            <p className="gb-muted-text">
              Group payable ledger entries into internal settlement batches.
              This does not move real money.
            </p>
          </div>

          <button
            className="gb-button"
            type="button"
            onClick={() => downloadCsv(batches)}
            disabled={batches.length === 0}
          >
            Export CSV
          </button>
        </div>

        <div className="gb-kpi-grid">
          <div className="gb-kpi-card">
            <span>Batches</span>
            <strong>{summary.count}</strong>
          </div>
          <div className="gb-kpi-card">
            <span>Total net payable</span>
            <strong>{money(summary.netPayable)}</strong>
          </div>
          <div className="gb-kpi-card">
            <span>Open payable</span>
            <strong>{money(summary.open)}</strong>
          </div>
          <div className="gb-kpi-card">
            <span>Paid</span>
            <strong>{money(summary.paid)}</strong>
          </div>
        </div>

        {message ? <p className="gb-success-text">{message}</p> : null}
        {errorMessage ? <p className="gb-error-text">{errorMessage}</p> : null}
      </section>

      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">Create batch</p>
            <h2>New settlement batch</h2>
          </div>
        </div>

        <div className="gb-form-grid">
          <label>
            <span>Title</span>
            <input
              className="gb-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>

          <label>
            <span>Description</span>
            <textarea
              className="gb-input"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
        </div>

        <p className="gb-muted-text">
          Selected entries: {selectedEntryIds.length} — Total:{" "}
          {money(selectedTotal)}
        </p>

        <button
          type="button"
          className="gb-button"
          onClick={createBatch}
          disabled={isSaving || selectedEntryIds.length === 0}
        >
          {isSaving ? "Creating..." : "Create settlement batch"}
        </button>
      </section>

      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">Payable entries</p>
            <h2>Available entries</h2>
          </div>
        </div>

        {payableEntries.length === 0 ? (
          <div className="gb-empty-state">
            <h3>No payable entries available</h3>
            <p>Rebuild the finance ledger first, or all entries are already batched.</p>
          </div>
        ) : (
          <div className="gb-table-wrap">
            <table className="gb-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Partner</th>
                  <th>Source</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payableEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedEntryIds.includes(entry.id)}
                        onChange={() => toggleEntry(entry.id)}
                      />
                    </td>
                    <td>
                      <strong>{entry.partnerLabel || entry.partnerType}</strong>
                      <p className="gb-muted-text">{entry.partnerType}</p>
                    </td>
                    <td>
                      <strong>{entry.sourceLabel || entry.sourceType}</strong>
                      <p className="gb-muted-text">{entry.sourceId}</p>
                    </td>
                    <td>{money(entry.amount, entry.currency)}</td>
                    <td>{entry.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">Existing batches</p>
            <h2>Settlement batches</h2>
          </div>
        </div>

        {batches.length === 0 ? (
          <div className="gb-empty-state">
            <h3>No settlement batches yet</h3>
            <p>Create the first settlement batch from payable entries.</p>
          </div>
        ) : (
          <div className="gb-table-wrap">
            <table className="gb-table">
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Net payable</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => (
                  <tr key={batch.id}>
                    <td>
                      <strong>{batch.batchNumber}</strong>
                      <p className="gb-muted-text">{batch.title}</p>
                    </td>
                    <td>{batch.status}</td>
                    <td>{batch.itemCount}</td>
                    <td>{money(batch.netPayableAmount, batch.currency)}</td>
                    <td>{batch.createdAt?.slice(0, 10) || "-"}</td>
                    <td>
                      <div className="gb-action-row">
                        {["reviewed", "approved", "paid", "cancelled"].map(
                          (status) => (
                            <button
                              key={status}
                              type="button"
                              className="gb-button gb-button-small gb-button-secondary"
                              disabled={isSaving || batch.status === status}
                              onClick={() => updateStatus(batch.id, status)}
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
