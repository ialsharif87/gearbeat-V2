"use client";

import { useMemo, useState } from "react";

export type VendorFinanceRow = {
  id: string;
  orderLabel: string;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  netPayable: number;
  currency: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
};

type VendorFinanceReportProps = {
  rows: VendorFinanceRow[];
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

function downloadCsv(rows: VendorFinanceRow[]) {
  const headers = [
    "Order",
    "Gross Amount",
    "Commission Rate",
    "Commission Amount",
    "Net Payable",
    "Currency",
    "Payment Status",
    "Order Status",
    "Created At",
  ];

  const lines = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) =>
      [
        row.orderLabel,
        row.grossAmount,
        row.commissionRate,
        row.commissionAmount,
        row.netPayable,
        row.currency,
        row.paymentStatus,
        row.orderStatus,
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
  link.download = `gearbeat-vendor-finance-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function isPaidStatus(status: string) {
  const s = String(status || "").toLowerCase();
  return (
    s === "paid" ||
    s === "manual_paid" ||
    s === "confirmed" ||
    s === "captured"
  );
}

function isCancelledStatus(status: string) {
  const s = String(status || "").toLowerCase();
  return (
    s === "cancelled" ||
    s === "canceled" ||
    s === "refunded" ||
    s === "failed"
  );
}

export default function VendorFinanceReport({ rows }: VendorFinanceReportProps) {
  const [paymentFilter, setPaymentFilter] = useState("all");

  const paymentStatuses = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.paymentStatus))).filter(
      Boolean
    );
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (paymentFilter === "all") {
      return rows;
    }

    return rows.filter((row) => row.paymentStatus === paymentFilter);
  }, [paymentFilter, rows]);

  const summary = useMemo(() => {
    return filteredRows.reduce(
      (total, row) => {
        total.grossAmount += row.grossAmount;
        total.commissionAmount += row.commissionAmount;
        total.netPayable += row.netPayable;
        total.orderCount += 1;

        if (isPaidStatus(row.paymentStatus)) {
          total.paidOrders += 1;
        } else if (
          isCancelledStatus(row.paymentStatus) ||
          isCancelledStatus(row.orderStatus)
        ) {
          total.cancelledOrders += 1;
        } else {
          total.pendingOrders += 1;
        }

        return total;
      },
      {
        grossAmount: 0,
        commissionAmount: 0,
        netPayable: 0,
        orderCount: 0,
        paidOrders: 0,
        pendingOrders: 0,
        cancelledOrders: 0,
      }
    );
  }, [filteredRows]);

  return (
    <div className="gb-dashboard-stack">
      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">Vendor finance</p>
            <h2>Finance summary</h2>
            <p className="gb-muted-text">
              Review your marketplace sales, GearBeat commission, and estimated
              net payable balance.
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
            <span>Gross sales</span>
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
            <span>Total orders</span>
            <strong>{summary.orderCount}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Paid orders</span>
            <strong>{summary.paidOrders}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Pending orders</span>
            <strong>{summary.pendingOrders}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Cancelled/refunded</span>
            <strong>{summary.cancelledOrders}</strong>
          </div>
        </div>
      </section>

      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">Filters</p>
            <h2>Payment filter</h2>
          </div>
        </div>

        <div className="gb-form-grid">
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
            <p className="gb-eyebrow">Order finance</p>
            <h2>Order-level breakdown</h2>
            <p className="gb-muted-text">
              This report is estimated from marketplace orders and commission
              settings. Actual payout processing will be handled in a later
              settlement patch.
            </p>
          </div>
        </div>

        {filteredRows.length === 0 ? (
          <div className="gb-empty-state">
            <h3>No finance records found</h3>
            <p>Your marketplace order finance records will appear here.</p>
          </div>
        ) : (
          <div className="gb-table-wrap">
            <table className="gb-table">
              <thead>
                <tr>
                  <th>Order</th>
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
                  <tr key={row.id}>
                    <td>
                      <strong>{row.orderLabel}</strong>
                      <p className="gb-muted-text">{row.id}</p>
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
                    <td>{row.orderStatus}</td>
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
