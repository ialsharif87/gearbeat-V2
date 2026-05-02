"use client";

import { useMemo, useState } from "react";

export type PayoutReportRow = {
  id: string;
  sourceType: "studio_booking" | "marketplace_order";
  sourceLabel: string;
  partnerType: "studio_owner" | "vendor" | "platform";
  partnerId: string;
  partnerName: string;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  netPayable: number;
  currency: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
};

type AdminPayoutsReportProps = {
  rows: PayoutReportRow[];
};

function formatMoney(amount: number, currency: string) {
  return `${Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency || "SAR"}`;
}

function formatRate(rate: number) {
  return `${Number(rate || 0).toFixed(2)}%`;
}

function escapeCsv(value: string | number) {
  const stringValue = String(value ?? "");
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function downloadCsv(rows: PayoutReportRow[]) {
  const headers = [
    "Source Type",
    "Source",
    "Partner Type",
    "Partner ID",
    "Partner Name",
    "Gross Amount",
    "Commission Rate",
    "Commission Amount",
    "Net Payable",
    "Currency",
    "Payment Status",
    "Status",
    "Created At",
  ];

  const lines = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) =>
      [
        row.sourceType,
        row.sourceLabel,
        row.partnerType,
        row.partnerId,
        row.partnerName,
        row.grossAmount,
        row.commissionRate,
        row.commissionAmount,
        row.netPayable,
        row.currency,
        row.paymentStatus,
        row.status,
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
  link.download = `gearbeat-payout-report-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export default function AdminPayoutsReport({ rows }: AdminPayoutsReportProps) {
  const [sourceFilter, setSourceFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const sourceMatches =
        sourceFilter === "all" || row.sourceType === sourceFilter;

      const paymentMatches =
        paymentFilter === "all" || row.paymentStatus === paymentFilter;

      return sourceMatches && paymentMatches;
    });
  }, [rows, sourceFilter, paymentFilter]);

  const summary = useMemo(() => {
    return filteredRows.reduce(
      (total, row) => {
        total.grossAmount += row.grossAmount;
        total.commissionAmount += row.commissionAmount;
        total.netPayable += row.netPayable;

        return total;
      },
      {
        grossAmount: 0,
        commissionAmount: 0,
        netPayable: 0,
      }
    );
  }, [filteredRows]);

  const paymentStatuses = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.paymentStatus))).filter(
      Boolean
    );
  }, [rows]);

  return (
    <div className="gb-dashboard-stack">
      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">Settlement overview</p>
            <h2>Payout summary</h2>
            <p className="gb-muted-text">
              Review gross revenue, GearBeat commission, and net payable amounts
              for bookings and marketplace orders.
            </p>
          </div>

          <button
            type="button"
            className="gb-button"
            onClick={() => downloadCsv(filteredRows)}
            disabled={filteredRows.length === 0}
          >
            Export CSV
          </button>
        </div>

        <div className="gb-kpi-grid">
          <div className="gb-kpi-card">
            <span>Gross revenue</span>
            <strong>{formatMoney(summary.grossAmount, "SAR")}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>GearBeat commission</span>
            <strong>{formatMoney(summary.commissionAmount, "SAR")}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Net payable</span>
            <strong>{formatMoney(summary.netPayable, "SAR")}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Transactions</span>
            <strong>{filteredRows.length}</strong>
          </div>
        </div>
      </section>

      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">Filters</p>
            <h2>Report filters</h2>
          </div>
        </div>

        <div className="gb-form-grid">
          <label>
            <span>Source</span>
            <select
              className="gb-input"
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value)}
            >
              <option value="all">All sources</option>
              <option value="studio_booking">Studio bookings</option>
              <option value="marketplace_order">Marketplace orders</option>
            </select>
          </label>

          <label>
            <span>Payment status</span>
            <select
              className="gb-input"
              value={paymentFilter}
              onChange={(event) => setPaymentFilter(event.target.value)}
            >
              <option value="all">All payment statuses</option>
              {paymentStatuses.map((status) => (
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
            <p className="gb-eyebrow">Settlement rows</p>
            <h2>Payout details</h2>
          </div>
        </div>

        {filteredRows.length === 0 ? (
          <div className="gb-empty-state">
            <h3>No payout rows found</h3>
            <p>No completed or payable records are available yet.</p>
          </div>
        ) : (
          <div className="gb-table-wrap">
            <table className="gb-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Partner</th>
                  <th>Gross</th>
                  <th>Commission</th>
                  <th>Net payable</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row) => (
                  <tr key={`${row.sourceType}-${row.id}`}>
                    <td>
                      <strong>{row.sourceLabel}</strong>
                      <p className="gb-muted-text">{row.sourceType}</p>
                    </td>
                    <td>
                      <strong>{row.partnerName}</strong>
                      <p className="gb-muted-text">{row.partnerType}</p>
                    </td>
                    <td>{formatMoney(row.grossAmount, row.currency)}</td>
                    <td>
                      {formatMoney(row.commissionAmount, row.currency)}
                      <p className="gb-muted-text">
                        {formatRate(row.commissionRate)}
                      </p>
                    </td>
                    <td>{formatMoney(row.netPayable, row.currency)}</td>
                    <td>{row.paymentStatus}</td>
                    <td>{row.status}</td>
                    <td>{row.createdAt ? row.createdAt.slice(0, 10) : "-"}</td>
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
