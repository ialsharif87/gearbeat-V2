"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type CustomerPaymentRow = {
  id: string;
  receiptNumber: string;
  sourceType: "marketplace_order" | "studio_booking";
  sourceLabel: string;
  description: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
  actionUrl: string;
};

type CustomerPaymentsReportProps = {
  rows: CustomerPaymentRow[];
};

function formatMoney(amount: number, currency = "SAR") {
  return `${Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency || "SAR"}`;
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

function escapeCsv(value: string | number) {
  const stringValue = String(value ?? "");
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function downloadCsv(rows: CustomerPaymentRow[]) {
  const headers = [
    "Receipt Number",
    "Source Type",
    "Source",
    "Description",
    "Amount",
    "Currency",
    "Payment Status",
    "Status",
    "Created At",
  ];

  const lines = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) =>
      [
        row.receiptNumber,
        row.sourceType,
        row.sourceLabel,
        row.description,
        row.amount,
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
  link.download = `gearbeat-customer-payments-${new Date()
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

function paymentStatusLabel(status: string) {
  if (!status) return "pending";

  return status.replace(/_/g, " ");
}

export default function CustomerPaymentsReport({
  rows,
}: CustomerPaymentsReportProps) {
  const [sourceFilter, setSourceFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedReceipt, setSelectedReceipt] =
    useState<CustomerPaymentRow | null>(null);

  const paymentStatuses = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.paymentStatus))).filter(
      Boolean
    );
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const sourceMatches =
        sourceFilter === "all" || row.sourceType === sourceFilter;

      const paymentMatches =
        paymentFilter === "all" || row.paymentStatus === paymentFilter;

      return sourceMatches && paymentMatches;
    });
  }, [paymentFilter, rows, sourceFilter]);

  const summary = useMemo(() => {
    return filteredRows.reduce(
      (total, row) => {
        total.totalAmount += row.amount;
        total.recordCount += 1;

        if (isPaidStatus(row.paymentStatus)) {
          total.paidAmount += row.amount;
          total.paidCount += 1;
        } else if (
          isCancelledStatus(row.paymentStatus) ||
          isCancelledStatus(row.status)
        ) {
          total.cancelledAmount += row.amount;
          total.cancelledCount += 1;
        } else {
          total.pendingAmount += row.amount;
          total.pendingCount += 1;
        }

        if (row.sourceType === "marketplace_order") {
          total.marketplaceAmount += row.amount;
          total.marketplaceCount += 1;
        }

        if (row.sourceType === "studio_booking") {
          total.bookingAmount += row.amount;
          total.bookingCount += 1;
        }

        return total;
      },
      {
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        cancelledAmount: 0,
        marketplaceAmount: 0,
        bookingAmount: 0,
        recordCount: 0,
        paidCount: 0,
        pendingCount: 0,
        cancelledCount: 0,
        marketplaceCount: 0,
        bookingCount: 0,
      }
    );
  }, [filteredRows]);

  function printReceipt() {
    window.print();
  }

  return (
    <div className="gb-dashboard-stack">
      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">Customer payments</p>
            <h2>Payment history</h2>
            <p className="gb-muted-text">
              View your GearBeat marketplace payments and studio booking
              payments. Receipts here are internal customer receipts only.
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
            <span>Total records</span>
            <strong>{summary.recordCount}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Total amount</span>
            <strong>{formatMoney(summary.totalAmount)}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Paid amount</span>
            <strong>{formatMoney(summary.paidAmount)}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Pending amount</span>
            <strong>{formatMoney(summary.pendingAmount)}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Cancelled/refunded</span>
            <strong>{formatMoney(summary.cancelledAmount)}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Marketplace orders</span>
            <strong>{summary.marketplaceCount}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Studio bookings</span>
            <strong>{summary.bookingCount}</strong>
          </div>
        </div>
      </section>

      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">Filters</p>
            <h2>Payment filters</h2>
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
              <option value="marketplace_order">Marketplace orders</option>
              <option value="studio_booking">Studio bookings</option>
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
                  {paymentStatusLabel(status)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {selectedReceipt ? (
        <section className="gb-card">
          <div className="gb-card-header">
            <div>
              <p className="gb-eyebrow">Internal receipt</p>
              <h2>{selectedReceipt.receiptNumber}</h2>
              <p className="gb-muted-text">
                This is an internal GearBeat customer receipt. It is not an
                official tax invoice.
              </p>
            </div>

            <div className="gb-action-row">
              <button
                type="button"
                className="gb-button"
                onClick={printReceipt}
              >
                Print receipt
              </button>

              <button
                type="button"
                className="gb-button gb-button-secondary"
                onClick={() => setSelectedReceipt(null)}
              >
                Close
              </button>
            </div>
          </div>

          <div className="gb-detail-grid">
            <div>
              <span className="gb-detail-label">Receipt number</span>
              <strong>{selectedReceipt.receiptNumber}</strong>
            </div>

            <div>
              <span className="gb-detail-label">Source</span>
              <strong>{selectedReceipt.sourceLabel}</strong>
            </div>

            <div>
              <span className="gb-detail-label">Description</span>
              <strong>{selectedReceipt.description}</strong>
            </div>

            <div>
              <span className="gb-detail-label">Amount</span>
              <strong>
                {formatMoney(selectedReceipt.amount, selectedReceipt.currency)}
              </strong>
            </div>

            <div>
              <span className="gb-detail-label">Payment status</span>
              <strong>{paymentStatusLabel(selectedReceipt.paymentStatus)}</strong>
            </div>

            <div>
              <span className="gb-detail-label">Record status</span>
              <strong>{selectedReceipt.status}</strong>
            </div>

            <div>
              <span className="gb-detail-label">Date</span>
              <strong>{dateLabel(selectedReceipt.createdAt)}</strong>
            </div>
          </div>
        </section>
      ) : null}

      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">Transactions</p>
            <h2>Payment records</h2>
          </div>
        </div>

        {filteredRows.length === 0 ? (
          <div className="gb-empty-state">
            <h3>No payment records found</h3>
            <p>Your marketplace orders and studio booking payments will appear here.</p>
          </div>
        ) : (
          <div className="gb-table-wrap">
            <table className="gb-table">
              <thead>
                <tr>
                  <th>Receipt</th>
                  <th>Source</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row) => (
                  <tr key={`${row.sourceType}-${row.id}`}>
                    <td>
                      <strong>{row.receiptNumber}</strong>
                      <p className="gb-muted-text">{row.id}</p>
                    </td>
                    <td>{row.sourceLabel}</td>
                    <td>{row.description}</td>
                    <td>{formatMoney(row.amount, row.currency)}</td>
                    <td>{paymentStatusLabel(row.paymentStatus)}</td>
                    <td>{row.status}</td>
                    <td>{dateLabel(row.createdAt)}</td>
                    <td>
                      <div className="gb-action-row">
                        <button
                          type="button"
                          className="gb-button gb-button-small"
                          onClick={() => setSelectedReceipt(row)}
                        >
                          Receipt
                        </button>

                        {row.actionUrl ? (
                          <Link
                            href={row.actionUrl}
                            className="gb-button gb-button-small gb-button-secondary"
                          >
                            Open
                          </Link>
                        ) : null}
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
