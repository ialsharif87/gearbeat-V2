"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import T from "@/components/t";

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

function SourceLabel({ sourceType }: { sourceType: CustomerPaymentRow["sourceType"] }) {
  if (sourceType === "marketplace_order") {
    return <T en="Marketplace order" ar="طلب متجر" />;
  }

  return <T en="Studio booking" ar="حجز استوديو" />;
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
            <p className="gb-eyebrow">
              <T en="Customer payments" ar="مدفوعات العميل" />
            </p>
            <h2>
              <T en="Payment history" ar="سجل المدفوعات" />
            </h2>
            <p className="gb-muted-text">
              <T
                en="View your GearBeat marketplace payments and studio booking payments. Receipts here are internal customer receipts only."
                ar="راجع مدفوعات المتجر وحجوزات الاستوديو الخاصة بك. الإيصالات هنا داخلية لحساب العميل فقط."
              />
            </p>
          </div>

          <button
            type="button"
            className="gb-button"
            onClick={() => downloadCsv(filteredRows)}
            disabled={filteredRows.length === 0}
          >
            <T en="Export CSV" ar="تصدير CSV" />
          </button>
        </div>

        <div className="gb-kpi-grid">
          <div className="gb-kpi-card">
            <span><T en="Total records" ar="إجمالي السجلات" /></span>
            <strong>{summary.recordCount}</strong>
          </div>

          <div className="gb-kpi-card">
            <span><T en="Total amount" ar="إجمالي المبلغ" /></span>
            <strong>{formatMoney(summary.totalAmount)}</strong>
          </div>

          <div className="gb-kpi-card">
            <span><T en="Paid amount" ar="المبلغ المدفوع" /></span>
            <strong>{formatMoney(summary.paidAmount)}</strong>
          </div>

          <div className="gb-kpi-card">
            <span><T en="Pending amount" ar="المبلغ المعلّق" /></span>
            <strong>{formatMoney(summary.pendingAmount)}</strong>
          </div>

          <div className="gb-kpi-card">
            <span><T en="Cancelled/refunded" ar="الملغي/المسترد" /></span>
            <strong>{formatMoney(summary.cancelledAmount)}</strong>
          </div>

          <div className="gb-kpi-card">
            <span><T en="Marketplace orders" ar="طلبات المتجر" /></span>
            <strong>{summary.marketplaceCount}</strong>
          </div>

          <div className="gb-kpi-card">
            <span><T en="Studio bookings" ar="حجوزات الاستوديو" /></span>
            <strong>{summary.bookingCount}</strong>
          </div>
        </div>
      </section>

      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">
              <T en="Filters" ar="الفلاتر" />
            </p>
            <h2>
              <T en="Payment filters" ar="تصفية المدفوعات" />
            </h2>
          </div>
        </div>

        <div className="gb-form-grid">
          <label>
            <span><T en="Source" ar="المصدر" /></span>
            <select
              className="gb-input"
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value)}
            >
              <option value="all">All sources / كل المصادر</option>
              <option value="marketplace_order">Marketplace orders / طلبات المتجر</option>
              <option value="studio_booking">Studio bookings / حجوزات الاستوديو</option>
            </select>
          </label>

          <label>
            <span><T en="Payment status" ar="حالة الدفع" /></span>
            <select
              className="gb-input"
              value={paymentFilter}
              onChange={(event) => setPaymentFilter(event.target.value)}
            >
              <option value="all">All payment statuses / كل حالات الدفع</option>
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
              <p className="gb-eyebrow">
                <T en="Internal receipt" ar="إيصال داخلي" />
              </p>
              <h2>{selectedReceipt.receiptNumber}</h2>
              <p className="gb-muted-text">
                <T
                  en="This is an internal GearBeat customer receipt. It is not an official tax invoice."
                  ar="هذا إيصال داخلي لحساب العميل في GearBeat وليس فاتورة ضريبية رسمية."
                />
              </p>
            </div>

            <div className="gb-action-row">
              <button
                type="button"
                className="gb-button"
                onClick={printReceipt}
              >
                <T en="Print receipt" ar="طباعة الإيصال" />
              </button>

              <button
                type="button"
                className="gb-button gb-button-secondary"
                onClick={() => setSelectedReceipt(null)}
              >
                <T en="Close" ar="إغلاق" />
              </button>
            </div>
          </div>

          <div className="gb-detail-grid">
            <div>
              <span className="gb-detail-label">
                <T en="Receipt number" ar="رقم الإيصال" />
              </span>
              <strong>{selectedReceipt.receiptNumber}</strong>
            </div>

            <div>
              <span className="gb-detail-label">
                <T en="Source" ar="المصدر" />
              </span>
              <strong><SourceLabel sourceType={selectedReceipt.sourceType} /></strong>
            </div>

            <div>
              <span className="gb-detail-label">
                <T en="Description" ar="الوصف" />
              </span>
              <strong>{selectedReceipt.description}</strong>
            </div>

            <div>
              <span className="gb-detail-label">
                <T en="Amount" ar="المبلغ" />
              </span>
              <strong>
                {formatMoney(selectedReceipt.amount, selectedReceipt.currency)}
              </strong>
            </div>

            <div>
              <span className="gb-detail-label">
                <T en="Payment status" ar="حالة الدفع" />
              </span>
              <strong>{paymentStatusLabel(selectedReceipt.paymentStatus)}</strong>
            </div>

            <div>
              <span className="gb-detail-label">
                <T en="Record status" ar="حالة السجل" />
              </span>
              <strong>{selectedReceipt.status}</strong>
            </div>

            <div>
              <span className="gb-detail-label">
                <T en="Date" ar="التاريخ" />
              </span>
              <strong>{dateLabel(selectedReceipt.createdAt)}</strong>
            </div>
          </div>
        </section>
      ) : null}

      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">
              <T en="Transactions" ar="العمليات" />
            </p>
            <h2>
              <T en="Payment records" ar="سجلات الدفع" />
            </h2>
          </div>
        </div>

        {filteredRows.length === 0 ? (
          <div className="gb-empty-state">
            <h3><T en="No payment records found" ar="لا توجد سجلات دفع" /></h3>
            <p>
              <T
                en="Your marketplace orders and studio booking payments will appear here."
                ar="ستظهر هنا مدفوعات طلبات المتجر وحجوزات الاستوديو الخاصة بك."
              />
            </p>
          </div>
        ) : (
          <div className="gb-table-wrap">
            <table className="gb-table">
              <thead>
                <tr>
                  <th><T en="Receipt" ar="الإيصال" /></th>
                  <th><T en="Source" ar="المصدر" /></th>
                  <th><T en="Description" ar="الوصف" /></th>
                  <th><T en="Amount" ar="المبلغ" /></th>
                  <th><T en="Payment" ar="الدفع" /></th>
                  <th><T en="Status" ar="الحالة" /></th>
                  <th><T en="Date" ar="التاريخ" /></th>
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
                    <td><SourceLabel sourceType={row.sourceType} /></td>
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
                          <T en="Receipt" ar="إيصال" />
                        </button>

                        {row.actionUrl ? (
                          <Link
                            href={row.actionUrl}
                            className="gb-button gb-button-small gb-button-secondary"
                          >
                            <T en="Open" ar="فتح" />
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
