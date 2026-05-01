"use client";

import { useState } from "react";
import T from "@/components/t";

type AdminLoyaltyAdjustButtonProps = {
  authUserId: string;
  customerName?: string | null;
  currentPoints?: number | null;
  className?: string;
};

type AdjustmentResult = {
  ok?: boolean;
  ledgerId?: string | null;
  message?: string;
  error?: string;
  adjustment?: {
    points?: number;
    reason?: string;
  };
  walletAfter?: {
    points_balance?: number;
    tier_code?: string;
  };
};

function formatPoints(value: unknown) {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return "0";
  }

  return numberValue.toLocaleString();
}

export default function AdminLoyaltyAdjustButton({
  authUserId,
  customerName,
  currentPoints,
  className = "btn btn-small",
}: AdminLoyaltyAdjustButtonProps) {
  const [open, setOpen] = useState(false);
  const [points, setPoints] = useState("");
  const [reason, setReason] = useState("Admin loyalty adjustment");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdjustmentResult | null>(null);

  async function submitAdjustment() {
    const pointValue = Number(points || 0);

    if (!authUserId || !Number.isFinite(pointValue) || pointValue === 0) {
      setResult({
        ok: false,
        error: "Enter a non-zero points adjustment.",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/loyalty/adjust-points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authUserId,
          points: Math.trunc(pointValue),
          reason,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Could not adjust points.");
      }

      setResult(data);
    } catch (error) {
      console.error("Loyalty adjustment failed:", error);

      setResult({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not adjust points.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <button
        type="button"
        className={className}
        onClick={() => setOpen((value) => !value)}
      >
        <T en="Adjust points" ar="تعديل النقاط" />
      </button>

      {open ? (
        <div
          className="card"
          style={{
            padding: 12,
            minWidth: 280,
            display: "grid",
            gap: 10,
            background: "rgba(20,20,20,0.98)",
            border: "1px solid rgba(207,167,98,0.2)",
          }}
        >
          <div>
            <strong>
              <T en="Manual points adjustment" ar="تعديل يدوي للنقاط" />
            </strong>

            <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
              {customerName || "Customer"} ·{" "}
              <T en="Current:" ar="الحالي:" />{" "}
              {formatPoints(currentPoints)}
            </p>
          </div>

          <input
            className="input"
            type="number"
            step="1"
            value={points}
            onChange={(event) => setPoints(event.target.value)}
            placeholder="Example: 100 or -50"
          />

          <textarea
            className="input"
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Reason"
          />

          <button
            type="button"
            className="btn btn-primary"
            onClick={submitAdjustment}
            disabled={loading || !points}
          >
            {loading ? (
              <T en="Saving..." ar="جاري الحفظ..." />
            ) : (
              <T en="Save adjustment" ar="حفظ التعديل" />
            )}
          </button>

          {result ? (
            <div
              style={{
                padding: 10,
                borderRadius: 10,
                background: result.ok
                  ? "rgba(0,255,136,0.08)"
                  : "rgba(255,77,77,0.08)",
                color: result.ok ? "#baffd7" : "#ffb0b0",
                fontSize: "0.85rem",
                lineHeight: 1.6,
              }}
            >
              {result.ok ? (
                <div>
                  <strong>{result.message}</strong>
                  <div>
                    <T en="Ledger:" ar="السجل:" /> {result.ledgerId || "—"}
                  </div>
                  <div>
                    <T en="New balance:" ar="الرصيد الجديد:" />{" "}
                    {formatPoints(result.walletAfter?.points_balance)}
                  </div>
                  <div>
                    <T en="Tier:" ar="المستوى:" />{" "}
                    {result.walletAfter?.tier_code || "—"}
                  </div>
                </div>
              ) : (
                result.error
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
