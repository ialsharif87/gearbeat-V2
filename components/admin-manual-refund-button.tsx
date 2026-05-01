"use client";

import { useState } from "react";
import T from "@/components/t";

type AdminManualRefundButtonProps = {
  paymentTransactionId: string;
  maxRefundAmount: number;
  currencyCode?: string;
  className?: string;
};

type RefundResult = {
  ok?: boolean;
  refundId?: string;
  providerRefundId?: string;
  paymentTransactionId?: string;
  refundedAmount?: number;
  totalRefundedAmount?: number;
  refundableRemaining?: number;
  currencyCode?: string;
  transactionStatus?: string;
  loyaltyReversal?: {
    reversed?: boolean;
    alreadyReversed?: boolean;
    points?: number;
    ledgerId?: string;
    message?: string;
    reason?: string;
    error?: string;
  };
  couponReversal?: {
    reversed?: boolean;
    alreadyReversed?: boolean;
    redemptionId?: string;
    couponCode?: string | null;
    discountAmount?: number;
    status?: string;
    message?: string;
    reason?: string;
    error?: string;
  };
  message?: string;
  error?: string;
};

function formatMoney(value: unknown, currencyCode = "SAR") {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return `0.00 ${currencyCode}`;
  }

  return `${numberValue.toFixed(2)} ${currencyCode}`;
}

export default function AdminManualRefundButton({
  paymentTransactionId,
  maxRefundAmount,
  currencyCode = "SAR",
  className = "btn btn-small btn-danger",
}: AdminManualRefundButtonProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(maxRefundAmount || ""));
  const [reason, setReason] = useState("Manual admin refund");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RefundResult | null>(null);

  async function submitRefund() {
    const refundAmount = Number(amount || 0);

    if (!paymentTransactionId || !Number.isFinite(refundAmount) || refundAmount <= 0) {
      setResult({
        ok: false,
        error: "Enter a valid refund amount.",
      });
      return;
    }

    if (refundAmount > maxRefundAmount) {
      setResult({
        ok: false,
        error: "Refund amount is higher than refundable balance.",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/payments/manual-refund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentTransactionId,
          amount: refundAmount,
          reason,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Could not create refund.");
      }

      setResult(data);
    } catch (error) {
      console.error("Manual refund failed:", error);

      setResult({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not create refund.",
      });
    } finally {
      setLoading(false);
    }
  }

  if (maxRefundAmount <= 0) {
    return (
      <span className="badge">
        <T en="No balance" ar="لا يوجد رصيد" />
      </span>
    );
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <button
        type="button"
        className={className}
        onClick={() => setOpen((value) => !value)}
      >
        <T en="Manual refund" ar="استرداد يدوي" />
      </button>

      {open ? (
        <div
          className="card"
          style={{
            padding: 12,
            minWidth: 260,
            display: "grid",
            gap: 10,
            background: "rgba(20,20,20,0.98)",
            border: "1px solid rgba(255,77,77,0.2)",
          }}
        >
          <div>
            <strong>
              <T en="Refund amount" ar="مبلغ الاسترداد" />
            </strong>

            <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
              <T en="Max:" ar="الحد الأقصى:" />{" "}
              {formatMoney(maxRefundAmount, currencyCode)}
            </p>
          </div>

          <input
            className="input"
            type="number"
            step="0.01"
            min="0"
            max={maxRefundAmount}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />

          <textarea
            className="input"
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Refund reason"
          />

          <button
            type="button"
            className="btn btn-danger"
            onClick={submitRefund}
            disabled={loading || Boolean(result?.ok)}
          >
            {loading ? (
              <T en="Refunding..." ar="جاري الاسترداد..." />
            ) : result?.ok ? (
              <T en="Refunded" ar="تم الاسترداد" />
            ) : (
              <T en="Confirm refund" ar="تأكيد الاسترداد" />
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
                    <T en="Refund:" ar="الاسترداد:" />{" "}
                    {formatMoney(result.refundedAmount, result.currencyCode)}
                  </div>
                  <div>
                    <T en="Remaining:" ar="المتبقي:" />{" "}
                    {formatMoney(result.refundableRemaining, result.currencyCode)}
                  </div>

                  {result.loyaltyReversal ? (
                    <div>
                      <T en="Loyalty:" ar="الولاء:" />{" "}
                      {result.loyaltyReversal.reversed
                        ? `${result.loyaltyReversal.points || 0} points reversed`
                        : result.loyaltyReversal.reason ||
                          result.loyaltyReversal.message ||
                          "No reversal"}
                    </div>
                  ) : null}

                  {result.couponReversal ? (
                    <div>
                      <T en="Coupon:" ar="القسيمة:" />{" "}
                      {result.couponReversal.reversed
                        ? result.couponReversal.couponCode
                          ? `${result.couponReversal.couponCode} reversed`
                          : "Coupon reversed"
                        : result.couponReversal.reason ||
                          result.couponReversal.message ||
                          "No coupon reversal"}
                    </div>
                  ) : null}
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
