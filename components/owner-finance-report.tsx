"use client";

import { useMemo, useState } from "react";

export type OwnerFinanceRow = {
  id: string;
  studioId: string;
  studioName: string;
  bookingLabel: string;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  netPayable: number;
  currency: string;
  paymentStatus: string;
  bookingStatus: string;
  startTime: string;
  endTime: string;
  createdAt: string;
};

type OwnerFinanceReportProps = {
  rows: OwnerFinanceRow[];
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

function downloadCsv(rows: OwnerFinanceRow[]) {
  const headers = [
    "Booking",
    "Studio",
    "Gross Amount",
    "Commission Rate",
    "Commission Amount",
    "Net Payable",
    "Currency",
    "Payment Status",
    "Booking Status",
    "Start Time",
    "End Time",
    "Created At",
  ];

  const lines = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) =>
      [
        row.bookingLabel,
        row.studioName,
        row.grossAmount,
        row.commissionRate,
        row.commissionAmount,
        row.netPayable,
        row.currency,
        row.paymentStatus,
        row.bookingStatus,
        row.startTime,
        row.endTime,
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
  link.download = `gearbeat-owner-finance-${new Date()
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
    s === "failed" ||
    s === "rejected" ||
    s === "declined"
  );
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

export default function OwnerFinanceReport({ rows }: OwnerFinanceReportProps) {
  const [studioFilter, setStudioFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const studios = useMemo(() => {
    const map = new Map<string, string>();

    for (const row of rows) {
      if (row.studioId) {
        map.set(row.studioId, row.studioName || "Studio");
      }
    }

    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [rows]);

  const paymentStatuses = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.paymentStatus))).filter(
      Boolean
    );
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const studioMatches =
        studioFilter === "all" || row.studioId === studioFilter;

      const paymentMatches =
        paymentFilter === "all" || row.paymentStatus === paymentFilter;

      return studioMatches && paymentMatches;
    });
  }, [paymentFilter, rows, studioFilter]);

  const summary = useMemo(() => {
    return filteredRows.reduce(
      (total, row) => {
        total.grossAmount += row.grossAmount;
        total.commissionAmount += row.commissionAmount;
        total.netPayable += row.netPayable;
        total.bookingCount += 1;

        if (isPaidStatus(row.paymentStatus)) {
          total.paidBookings += 1;
        } else if (
          isCancelledStatus(row.paymentStatus) ||
          isCancelledStatus(row.bookingStatus)
        ) {
          total.cancelledBookings += 1;
        } else {
          total.pendingBookings += 1;
        }

        return total;
      },
      {
        grossAmount: 0,
        commissionAmount: 0,
        netPayable: 0,
        bookingCount: 0,
        paidBookings: 0,
        pendingBookings: 0,
        cancelledBookings: 0,
      }
    );
  }, [filteredRows]);

  const studioSummary = useMemo(() => {
    const map = new Map<
      string,
      {
        studioId: string;
        studioName: string;
        grossAmount: number;
        commissionAmount: number;
        netPayable: number;
        bookingCount: number;
        currency: string;
      }
    >();

    for (const row of filteredRows) {
      const current =
        map.get(row.studioId) ||
        {
          studioId: row.studioId,
          studioName: row.studioName,
          grossAmount: 0,
          commissionAmount: 0,
          netPayable: 0,
          bookingCount: 0,
          currency: row.currency || "SAR",
        };

      current.grossAmount += row.grossAmount;
      current.commissionAmount += row.commissionAmount;
      current.netPayable += row.netPayable;
      current.bookingCount += 1;

      map.set(row.studioId, current);
    }

    return Array.from(map.values());
  }, [filteredRows]);

  return (
    <div className="gb-dashboard-stack">
      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">Owner finance</p>
            <h2>Studio booking finance summary</h2>
            <p className="gb-muted-text">
              Review your studio booking revenue, GearBeat commission, and
              estimated net payable balance.
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
            <span>Gross booking revenue</span>
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
            <span>Total bookings</span>
            <strong>{summary.bookingCount}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Paid bookings</span>
            <strong>{summary.paidBookings}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Pending bookings</span>
            <strong>{summary.pendingBookings}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Cancelled/refunded</span>
            <strong>{summary.cancelledBookings}</strong>
          </div>
        </div>
      </section>

      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">Filters</p>
            <h2>Finance filters</h2>
          </div>
        </div>

        <div className="gb-form-grid">
          <label>
            <span>Studio</span>
            <select
              className="gb-input"
              value={studioFilter}
              onChange={(event) => setStudioFilter(event.target.value)}
            >
              <option value="all">All studios</option>
              {studios.map((studio) => (
                <option key={studio.id} value={studio.id}>
                  {studio.name}
                </option>
              ))}
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
            <p className="gb-eyebrow">Studio summary</p>
            <h2>Finance by studio</h2>
          </div>
        </div>

        {studioSummary.length === 0 ? (
          <div className="gb-empty-state">
            <h3>No studio finance records found</h3>
            <p>Your studio booking finance records will appear here.</p>
          </div>
        ) : (
          <div className="gb-table-wrap">
            <table className="gb-table">
              <thead>
                <tr>
                  <th>Studio</th>
                  <th>Bookings</th>
                  <th>Gross</th>
                  <th>Commission</th>
                  <th>Net payable</th>
                </tr>
              </thead>

              <tbody>
                {studioSummary.map((studio) => (
                  <tr key={studio.studioId}>
                    <td>{studio.studioName}</td>
                    <td>{studio.bookingCount}</td>
                    <td>{formatMoney(studio.grossAmount, studio.currency)}</td>
                    <td>
                      {formatMoney(studio.commissionAmount, studio.currency)}
                    </td>
                    <td>{formatMoney(studio.netPayable, studio.currency)}</td>
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
            <p className="gb-eyebrow">Booking finance</p>
            <h2>Booking-level breakdown</h2>
            <p className="gb-muted-text">
              This report is estimated from bookings and commission settings.
              Actual payout processing will be handled in a later settlement
              patch.
            </p>
          </div>
        </div>

        {filteredRows.length === 0 ? (
          <div className="gb-empty-state">
            <h3>No booking finance records found</h3>
            <p>Your studio booking finance records will appear here.</p>
          </div>
        ) : (
          <div className="gb-table-wrap">
            <table className="gb-table">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Studio</th>
                  <th>Gross</th>
                  <th>Commission</th>
                  <th>Net payable</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Start</th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.bookingLabel}</strong>
                      <p className="gb-muted-text">{row.id}</p>
                    </td>
                    <td>{row.studioName}</td>
                    <td>{formatMoney(row.grossAmount, row.currency)}</td>
                    <td>
                      {formatMoney(row.commissionAmount, row.currency)}
                      <p className="gb-muted-text">
                        {formatRate(row.commissionRate)}
                      </p>
                    </td>
                    <td>{formatMoney(row.netPayable, row.currency)}</td>
                    <td>{row.paymentStatus}</td>
                    <td>{row.bookingStatus}</td>
                    <td>{dateLabel(row.startTime)}</td>
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
