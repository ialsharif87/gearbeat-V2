"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type FinanceLedgerRow = {
  id: string;
  entryType: string;
  entryGroup: string;
  sourceType: string;
  sourceId: string;
  sourceLabel: string;
  partnerType: string;
  partnerId: string;
  partnerLabel: string;
  amount: number;
  currency: string;
  status: string;
  transactionDate: string;
  createdAt: string;
};

type AdminFinanceLedgerReportProps = {
  rows: FinanceLedgerRow[];
};

function formatMoney(amount: number, currency = "SAR") {
  return `${Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency || "SAR"}`;
}

function escapeCsv(value: string | number) {
  const stringValue = String(value ?? "");
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function downloadCsv(rows: FinanceLedgerRow[]) {
  const headers = [
    "Entry Type",
    "Entry Group",
    "Source Type",
    "Source ID",
    "Source Label",
    "Partner Type",
    "Partner ID",
    "Partner Label",
    "Amount",
    "Currency",
    "Status",
    "Transaction Date",
    "Created At",
  ];

  const lines = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) =>
      [
        row.entryType,
        row.entryGroup,
        row.sourceType,
        row.sourceId,
        row.sourceLabel,
        row.partnerType,
        row.partnerId,
        row.partnerLabel,
        row.amount,
        row.currency,
        row.status,
        row.transactionDate,
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
  link.download = `gearbeat-finance-ledger-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function dateLabel(value: string) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AdminFinanceLedgerReport({
  rows,
}: AdminFinanceLedgerReportProps) {
  const router = useRouter();

  const [entryGroupFilter, setEntryGroupFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const entryGroups = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.entryGroup))).filter(
      Boolean
    );
  }, [rows]);

  const sourceTypes = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.sourceType))).filter(
      Boolean
    );
  }, [rows]);

  const statuses = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.status))).filter(Boolean);
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const groupMatches =
        entryGroupFilter === "all" || row.entryGroup === entryGroupFilter;

      const sourceMatches =
        sourceFilter === "all" || row.sourceType === sourceFilter;

      const statusMatches =
        statusFilter === "all" || row.status === statusFilter;

      return groupMatches && sourceMatches && statusMatches;
    });
  }, [entryGroupFilter, rows, sourceFilter, statusFilter]);

  const summary = useMemo(() => {
    return filteredRows.reduce(
      (total, row) => {
        total.totalAmount += row.amount;
        total.entryCount += 1;

        if (row.entryGroup === "payment") {
          total.paymentAmount += row.amount;
        }

        if (row.entryGroup === "commission") {
          total.commissionAmount += row.amount;
        }

        if (row.entryGroup === "payable") {
          total.payableAmount += row.amount;
        }

        if (row.status === "posted") {
          total.postedAmount += row.amount;
        }

        if (row.status === "pending") {
          total.pendingAmount += row.amount;
        }

        if (row.status === "void") {
          total.voidAmount += row.amount;
        }

        return total;
      },
      {
        totalAmount: 0,
        paymentAmount: 0,
        commissionAmount: 0,
        payableAmount: 0,
        postedAmount: 0,
        pendingAmount: 0,
        voidAmount: 0,
        entryCount: 0,
      }
    );
  }, [filteredRows]);

  async function rebuildLedger() {
    setIsRebuilding(true);
    setMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin/finance-ledger/rebuild", {
        method: "POST",
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(result?.error || "Could not rebuild finance ledger.");
        return;
      }

      setMessage(
        `Ledger rebuild completed. ${Number(
          result?.entryCount || 0
        )} entries synced.`
      );

      router.refresh();
    } catch {
      setErrorMessage("Could not rebuild finance ledger.");
    } finally {
      setIsRebuilding(false);
    }
  }

  return (
    <div className="gb-dashboard-stack">
      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">Finance ledger</p>
            <h2>Ledger summary</h2>
            <p className="gb-muted-text">
              The finance ledger is the internal record of payments,
              commissions, payables, refunds, adjustments, and future payout
              entries.
            </p>
          </div>

          <div className="gb-action-row">
            <button
              type="button"
              className="gb-button"
              onClick={rebuildLedger}
              disabled={isRebuilding}
            >
              {isRebuilding ? "Rebuilding..." : "Rebuild from transactions"}
            </button>

            <button
              type="button"
              className="gb-button gb-button-secondary"
              onClick={() => downloadCsv(filteredRows)}
              disabled={filteredRows.length === 0}
            >
              Export CSV
            </button>
          </div>
        </div>

        {message ? <p className="gb-success-text">{message}</p> : null}
        {errorMessage ? <p className="gb-error-text">{errorMessage}</p> : null}

        <div className="gb-kpi-grid">
          <div className="gb-kpi-card">
            <span>Ledger entries</span>
            <strong>{summary.entryCount}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Payment entries</span>
            <strong>{formatMoney(summary.paymentAmount)}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Commission entries</span>
            <strong>{formatMoney(summary.commissionAmount)}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Payable entries</span>
            <strong>{formatMoney(summary.payableAmount)}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Posted amount</span>
            <strong>{formatMoney(summary.postedAmount)}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Pending amount</span>
            <strong>{formatMoney(summary.pendingAmount)}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Void amount</span>
            <strong>{formatMoney(summary.voidAmount)}</strong>
          </div>
        </div>
      </section>

      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">Filters</p>
            <h2>Ledger filters</h2>
          </div>
        </div>

        <div className="gb-form-grid">
          <label>
            <span>Entry group</span>
            <select
              className="gb-input"
              value={entryGroupFilter}
              onChange={(event) => setEntryGroupFilter(event.target.value)}
            >
              <option value="all">All groups</option>
              {entryGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Source</span>
            <select
              className="gb-input"
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value)}
            >
              <option value="all">All sources</option>
              {sourceTypes.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Status</span>
            <select
              className="gb-input"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">Ledger entries</p>
            <h2>Finance ledger detail</h2>
          </div>
        </div>

        {filteredRows.length === 0 ? (
          <div className="gb-empty-state">
            <h3>No ledger entries found</h3>
            <p>
              Click “Rebuild from transactions” to sync existing orders and
              bookings into the finance ledger.
            </p>
          </div>
        ) : (
          <div className="gb-table-wrap">
            <table className="gb-table">
              <thead>
                <tr>
                  <th>Entry</th>
                  <th>Source</th>
                  <th>Partner</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Transaction date</th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.entryType}</strong>
                      <p className="gb-muted-text">{row.entryGroup}</p>
                    </td>
                    <td>
                      <strong>{row.sourceLabel || row.sourceType}</strong>
                      <p className="gb-muted-text">
                        {row.sourceType} — {row.sourceId}
                      </p>
                    </td>
                    <td>
                      <strong>{row.partnerLabel || row.partnerType}</strong>
                      <p className="gb-muted-text">
                        {row.partnerType} — {row.partnerId || "-"}
                      </p>
                    </td>
                    <td>{formatMoney(row.amount, row.currency)}</td>
                    <td>{row.status}</td>
                    <td>{dateLabel(row.transactionDate)}</td>
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
