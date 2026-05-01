"use client";

import { useState } from "react";
import T from "@/components/t";

type ManualCheckoutConfirmButtonProps = {
  checkoutSessionId: string;
  className?: string;
};

type ManualConfirmResult = {
  ok?: boolean;
  alreadyConfirmed?: boolean;
  checkoutSessionId?: string;
  paymentTransactionId?: string | null;
  status?: string;
  amount?: number;
  currencyCode?: string;
  providerReference?: string | null;
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

export default function ManualCheckoutConfirmButton({
  checkoutSessionId,
  className = "btn btn-primary",
}: ManualCheckoutConfirmButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ManualConfirmResult | null>(null);

  async function confirmManualPayment() {
    if (!checkoutSessionId) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/checkout/manual-confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checkoutSessionId,
        }),
      });

      if (response.status === 401) {
        window.location.href = "/login?account=customer";
        return;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Could not confirm manual payment.");
      }

      setResult(data);
    } catch (error) {
      console.error("Manual payment confirmation failed:", error);

      setResult({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not confirm manual payment.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        marginTop: 14,
        padding: 14,
        borderRadius: 14,
        background: "rgba(207,167,98,0.08)",
        border: "1px solid rgba(207,167,98,0.18)",
        display: "grid",
        gap: 10,
      }}
    >
      <div>
        <strong>
          <T en="Manual testing payment" ar="دفع يدوي للاختبار" />
        </strong>

        <p style={{ color: "var(--muted)", marginTop: 6, lineHeight: 1.7 }}>
          <T
            en="Use this only for testing. It confirms the checkout session without a real payment provider."
            ar="استخدم هذا للاختبار فقط. سيؤكد جلسة الدفع بدون مزود دفع حقيقي."
          />
        </p>
      </div>

      <button
        type="button"
        className={className}
        onClick={confirmManualPayment}
        disabled={loading || Boolean(result?.ok)}
      >
        {loading ? (
          <T en="Confirming..." ar="جاري التأكيد..." />
        ) : result?.ok ? (
          <T en="Confirmed" ar="تم التأكيد" />
        ) : (
          <T en="Confirm manual payment" ar="تأكيد الدفع اليدوي" />
        )}
      </button>

      {result ? (
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            background: result.ok
              ? "rgba(0,255,136,0.08)"
              : "rgba(255,77,77,0.08)",
            border: result.ok
              ? "1px solid rgba(0,255,136,0.18)"
              : "1px solid rgba(255,77,77,0.18)",
            color: result.ok ? "#baffd7" : "#ffb0b0",
            lineHeight: 1.7,
          }}
        >
          {result.ok ? (
            <div>
              <strong>{result.message}</strong>

              <div style={{ marginTop: 8 }}>
                <T en="Transaction:" ar="رقم العملية:" />{" "}
                {result.paymentTransactionId || "—"}
              </div>

              <div>
                <T en="Amount:" ar="المبلغ:" />{" "}
                {formatMoney(result.amount, result.currencyCode || "SAR")}
              </div>

              <div>
                <T en="Reference:" ar="المرجع:" />{" "}
                {result.providerReference || "—"}
              </div>
            </div>
          ) : (
            <div>{result.error}</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
