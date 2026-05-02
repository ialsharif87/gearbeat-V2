"use client";

import { useMemo, useState } from "react";

export type AdminFinanceRow = {
  id: string;
  sourceType: "marketplace_order" | "studio_booking";
  sourceLabel: string;
  partnerType: "vendor" | "studio_owner" | "platform";
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

type AdminFinanceCenterProps = {
  rows: AdminFinanceRow[];
};

function formatMoney(amount: number, currency = "SAR") {
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

function downloadCsv(rows: AdminFinanceRow[]) {
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
  link.download = `gearbeat-admin-finance-${new Date()
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

export default function AdminFinanceCenter({ rows }: AdminFinanceCenterProps) {
  const [sourceFilter, setSourceFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [partnerFilter, setPartnerFilter] = useState("all");

  const paymentStatuses = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.paymentStatus))).filter(
      Boolean
    );
  }, [rows]);

  const partnerTypes = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.partnerType))).filter(
      Boolean
    );
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const sourceMatches =
        sourceFilter === "all" || row.sourceType === sourceFilter;

      const paymentMatches =
        paymentFilter === "all" || row.paymentStatus === paymentFilter;

      const partnerMatches =
        partnerFilter === "all" || row.partnerType === partnerFilter;

      return sourceMatches && paymentMatches && partnerMatches;
    });
  }, [partnerFilter, paymentFilter, rows, sourceFilter]);

  const summary = useMemo(() => {
    return filteredRows.reduce(
      (total, row) => {
        total.totalGmv += row.grossAmount;
        total.totalCommission += row.commissionAmount;
        total.totalNetPayable += row.netPayable;
        total.transactionCount += 1;

        if (row.sourceType === "marketplace_order") {
          total.marketplaceGmv += row.grossAmount;
          total.marketplaceCommission += row.commissionAmount;
          total.vendorPayable += row.netPayable;
          total.marketplaceCount += 1;
        }

        if (row.sourceType === "studio_booking") {
          total.studioGmv += row.grossAmount;
          total.studioCommission += row.commissionAmount;
          total.ownerPayable += row.netPayable;
          total.studioCount += 1;
        }

        if (isPaidStatus(row.paymentStatus)) {
          total.paidRevenue += row.grossAmount;
          total.paidCount += 1;
        } else if (
          isCancelledStatus(row.paymentStatus) ||
          isCancelledStatus(row.status)
        ) {
          total.cancelledRevenue += row.grossAmount;
          total.cancelledCount += 1;
        } else {
          total.pendingRevenue += row.grossAmount;
          total.pendingCount += 1;
        }

        return total;
      },
      {
        totalGmv: 0,
        marketplaceGmv: 0,
        studioGmv: 0,
        totalCommission: 0,
        marketplaceCommission: 0,
        studioCommission: 0,
        totalNetPayable: 0,
        vendorPayable: 0,
        ownerPayable: 0,
        paidRevenue: 0,
        pendingRevenue: 0,
        cancelledRevenue: 0,
        transactionCount: 0,
        marketplaceCount: 0,
        studioCount: 0,
        paidCount: 0,
        pendingCount: 0,
        cancelledCount: 0,
      }
    );
  }, [filteredRows]);

  const partnerSummary = useMemo(() => {
    const map = new Map<
      string,
      {
        key: string;
        partnerName: string;
        partnerType: string;
        grossAmount: number;
        commissionAmount: number;
        netPayable: number;
        count: number;
        currency: string;
      }
    >();

    for (const row of filteredRows) {
      const key = `${row.partnerType}-${row.partnerId || row.partnerName}`;

      const current =
        map.get(key) ||
        {
          key,
          partnerName: row.partnerName || "Partner",
          partnerType: row.partnerType,
          grossAmount: 0,
          commissionAmount: 0,
          netPayable: 0,
          count: 0,
          currency: row.currency || "SAR",
        };

      current.grossAmount += row.grossAmount;
      current.commissionAmount += row.commissionAmount;
      current.netPayable += row.netPayable;
      current.count += 1;

      map.set(key, current);
    }

    return Array.from(map.values()).sort(
      (a, b) => b.grossAmount - a.grossAmount
    );
  }, [filteredRows]);

  return (
    <div className="gb-dashboard-stack">
      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">Admin finance</p>
            <h2>Finance control center</h2>
            <p className="gb-muted-text">
              Monitor total GMV, commission revenue, payable balances, and
              payment status across marketplace orders and studio bookings.
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
            <span>Total GMV</span>
            <strong>{formatMoney(summary.totalGmv)}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>GearBeat commission</span>
            <strong>{formatMoney(summary.totalCommission)}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Total net payable</span>
            <strong>{formatMoney(summary.totalNetPayable)}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Transactions</span>
            <strong>{summary.transactionCount}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Marketplace GMV</span>
            <strong>{formatMoney(summary.marketplaceGmv)}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Studio booking GMV</span>
            <strong>{formatMoney(summary.studioGmv)}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Vendor payable</span>
            <strong>{formatMoney(summary.vendorPayable)}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Owner payable</span>
            <strong>{formatMoney(summary.ownerPayable)}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Paid revenue</span>
            <strong>{formatMoney(summary.paidRevenue)}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Pending revenue</span>
            <strong>{formatMoney(summary.pendingRevenue)}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Cancelled/refunded</span>
            <strong>{formatMoney(summary.cancelledRevenue)}</strong>
          </div>
        </div>
      </section>

      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">Breakdown</p>
            <h2>Marketplace vs studio bookings</h2>
          </div>
        </div>

        <div className="gb-table-wrap">
          <table className="gb-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Transactions</th>
                <th>GMV</th>
                <th>Commission</th>
                <th>Net payable</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Marketplace orders</td>
                <td>{summary.marketplaceCount}</td>
                <td>{formatMoney(summary.marketplaceGmv)}</td>
                <td>{formatMoney(summary.marketplaceCommission)}</td>
                <td>{formatMoney(summary.vendorPayable)}</td>
              </tr>

              <tr>
                <td>Studio bookings</td>
                <td>{summary.studioCount}</td>
                <td>{formatMoney(summary.studioGmv)}</td>
                <td>{formatMoney(summary.studioCommission)}</td>
                <td>{formatMoney(summary.ownerPayable)}</td>
              </tr>
            </tbody>
          </table>
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
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Partner type</span>
            <select
              className="gb-input"
              value={partnerFilter}
              onChange={(event) => setPartnerFilter(event.target.value)}
            >
              <option value="all">All partner types</option>
              {partnerTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">Partner summary</p>
            <h2>Payable by partner</h2>
          </div>
        </div>

        {partnerSummary.length === 0 ? (
          <div className="gb-empty-state">
            <h3>No partner finance records found</h3>
            <p>Finance records will appear here once transactions exist.</p>
          </div>
        ) : (
          <div className="gb-table-wrap">
            <table className="gb-table">
              <thead>
                <tr>
                  <th>Partner</th>
                  <th>Type</th>
                  <th>Transactions</th>
                  <th>Gross</th>
                  <th>Commission</th>
                  <th>Net payable</th>
                </tr>
              </thead>

              <tbody>
                {partnerSummary.map((partner) => (
                  <tr key={partner.key}>
                    <td>{partner.partnerName}</td>
                    <td>{partner.partnerType}</td>
                    <td>{partner.count}</td>
                    <td>{formatMoney(partner.grossAmount, partner.currency)}</td>
                    <td>
                      {formatMoney(partner.commissionAmount, partner.currency)}
                    </td>
                    <td>{formatMoney(partner.netPayable, partner.currency)}</td>
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
            <p className="gb-eyebrow">Finance rows</p>
            <h2>Transaction-level finance</h2>
            <p className="gb-muted-text">
              This center is reporting-only. Real payout processing, settlement
              batches, and payment reconciliation will be handled in later
              finance patches.
            </p>
          </div>
        </div>

        {filteredRows.length === 0 ? (
          <div className="gb-empty-state">
            <h3>No finance records found</h3>
            <p>No marketplace orders or studio bookings are available yet.</p>
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
                    <td>{dateLabel(row.createdAt)}</td>
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
