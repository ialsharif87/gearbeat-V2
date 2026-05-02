"use client";

import { useMemo, useState } from "react";

export type FinanceAuditLogRow = {
  id: string;
  actionType: string;
  entityType: string;
  entityId: string;
  entityLabel: string;
  actorUserId: string;
  actorEmail: string;
  reason: string;
  beforeData: Record<string, unknown>;
  afterData: Record<string, unknown>;
  metadata: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
};

type AdminFinanceAuditLogProps = {
  rows: FinanceAuditLogRow[];
};

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

function downloadCsv(rows: FinanceAuditLogRow[]) {
  const headers = [
    "Action Type",
    "Entity Type",
    "Entity ID",
    "Entity Label",
    "Actor Email",
    "Reason",
    "IP Address",
    "Created At",
  ];

  const lines = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) =>
      [
        row.actionType,
        row.entityType,
        row.entityId,
        row.entityLabel,
        row.actorEmail,
        row.reason,
        row.ipAddress,
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
  link.download = `gearbeat-finance-audit-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function JsonBlock({ title, value }: { title: string; value: Record<string, unknown> }) {
  const hasData = value && Object.keys(value).length > 0;

  return (
    <details className="gb-card">
      <summary>{title}</summary>
      <pre style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}>
        {hasData ? JSON.stringify(value, null, 2) : "{}"}
      </pre>
    </details>
  );
}

export default function AdminFinanceAuditLog({
  rows,
}: AdminFinanceAuditLogProps) {
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [selectedRow, setSelectedRow] = useState<FinanceAuditLogRow | null>(
    null
  );

  const actionTypes = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.actionType))).filter(
      Boolean
    );
  }, [rows]);

  const entityTypes = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.entityType))).filter(
      Boolean
    );
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const actionMatches =
        actionFilter === "all" || row.actionType === actionFilter;

      const entityMatches =
        entityFilter === "all" || row.entityType === entityFilter;

      return actionMatches && entityMatches;
    });
  }, [actionFilter, entityFilter, rows]);

  const summary = useMemo(() => {
    return filteredRows.reduce(
      (total, row) => {
        total.total += 1;

        if (row.actionType === "approved") total.approved += 1;
        if (row.actionType === "rejected") total.rejected += 1;
        if (row.actionType === "marked_paid") total.markedPaid += 1;
        if (row.actionType === "ledger_rebuilt") total.ledgerRebuilt += 1;

        return total;
      },
      {
        total: 0,
        approved: 0,
        rejected: 0,
        markedPaid: 0,
        ledgerRebuilt: 0,
      }
    );
  }, [filteredRows]);

  return (
    <div className="gb-dashboard-stack">
      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">Finance audit</p>
            <h2>Audit log summary</h2>
            <p className="gb-muted-text">
              Track key finance actions across ledger, settlements, payout
              requests, refunds, adjustments, and acceleration.
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
            <span>Total audit records</span>
            <strong>{summary.total}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Approved</span>
            <strong>{summary.approved}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Rejected</span>
            <strong>{summary.rejected}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Marked paid</span>
            <strong>{summary.markedPaid}</strong>
          </div>

          <div className="gb-kpi-card">
            <span>Ledger rebuilds</span>
            <strong>{summary.ledgerRebuilt}</strong>
          </div>
        </div>
      </section>

      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">Filters</p>
            <h2>Audit filters</h2>
          </div>
        </div>

        <div className="gb-form-grid">
          <label>
            <span>Action type</span>
            <select
              className="gb-input"
              value={actionFilter}
              onChange={(event) => setActionFilter(event.target.value)}
            >
              <option value="all">All actions</option>
              {actionTypes.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Entity type</span>
            <select
              className="gb-input"
              value={entityFilter}
              onChange={(event) => setEntityFilter(event.target.value)}
            >
              <option value="all">All entities</option>
              {entityTypes.map((entity) => (
                <option key={entity} value={entity}>
                  {entity}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {selectedRow ? (
        <section className="gb-card">
          <div className="gb-card-header">
            <div>
              <p className="gb-eyebrow">Audit detail</p>
              <h2>{selectedRow.actionType}</h2>
              <p className="gb-muted-text">
                {selectedRow.entityType} — {selectedRow.entityId}
              </p>
            </div>

            <button
              type="button"
              className="gb-button gb-button-secondary"
              onClick={() => setSelectedRow(null)}
            >
              Close
            </button>
          </div>

          <div className="gb-detail-grid">
            <div>
              <span className="gb-detail-label">Actor</span>
              <strong>{selectedRow.actorEmail || selectedRow.actorUserId || "-"}</strong>
            </div>

            <div>
              <span className="gb-detail-label">Reason</span>
              <strong>{selectedRow.reason || "-"}</strong>
            </div>

            <div>
              <span className="gb-detail-label">IP address</span>
              <strong>{selectedRow.ipAddress || "-"}</strong>
            </div>

            <div>
              <span className="gb-detail-label">Created</span>
              <strong>{dateLabel(selectedRow.createdAt)}</strong>
            </div>
          </div>

          <JsonBlock title="Before data" value={selectedRow.beforeData} />
          <JsonBlock title="After data" value={selectedRow.afterData} />
          <JsonBlock title="Metadata" value={selectedRow.metadata} />
        </section>
      ) : null}

      <section className="gb-card">
        <div className="gb-card-header">
          <div>
            <p className="gb-eyebrow">Audit records</p>
            <h2>Finance audit log</h2>
          </div>
        </div>

        {filteredRows.length === 0 ? (
          <div className="gb-empty-state">
            <h3>No audit records found</h3>
            <p>Finance actions will appear here once they are logged.</p>
          </div>
        ) : (
          <div className="gb-table-wrap">
            <table className="gb-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Actor</th>
                  <th>Reason</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.actionType}</strong>
                    </td>
                    <td>
                      <strong>{row.entityLabel || row.entityType}</strong>
                      <p className="gb-muted-text">
                        {row.entityType} — {row.entityId || "-"}
                      </p>
                    </td>
                    <td>{row.actorEmail || row.actorUserId || "-"}</td>
                    <td>{row.reason || "-"}</td>
                    <td>{dateLabel(row.createdAt)}</td>
                    <td>
                      <button
                        type="button"
                        className="gb-button gb-button-small"
                        onClick={() => setSelectedRow(row)}
                      >
                        Details
                      </button>
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
