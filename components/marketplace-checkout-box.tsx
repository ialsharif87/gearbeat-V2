"use client";

import { useState } from "react";
import T from "@/components/t";

type CheckoutResult = {
  ok?: boolean;
  orderId?: string;
  orderNumber?: string;
  checkoutSessionId?: string;
  amount?: number;
  currencyCode?: string;
  checkoutStatus?: string;
  expiresAt?: string;
  message?: string;
  error?: string;
};

type PaymentResult = {
  ok?: boolean;
  alreadyConfirmed?: boolean;
  checkoutSessionId?: string;
  paymentTransactionId?: string;
  status?: string;
  amount?: number;
  currencyCode?: string;
  providerReference?: string;
  sourceUpdate?: unknown;
  couponRedemption?: unknown;
  loyaltyAward?: unknown;
  message?: string;
  error?: string;
};

function formatMoney(value: unknown, currency = "SAR") {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return `0.00 ${currency}`;
  }

  return `${numberValue.toFixed(2)} ${currency}`;
}

export default function MarketplaceCheckoutBox() {
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [checkout, setCheckout] = useState<CheckoutResult | null>(null);
  const [payment, setPayment] = useState<PaymentResult | null>(null);

  async function createCheckout() {
    setLoading(true);
    setCheckout(null);
    setPayment(null);

    try {
      const response = await fetch("/api/marketplace/checkout/create-order", {
        method: "POST",
      });

      if (response.status === 401) {
        window.location.href = "/login?account=customer";
        return;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Could not create checkout.");
      }

      setCheckout(data);
    } catch (error) {
      setCheckout({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not create checkout.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function confirmManualPayment() {
    if (!checkout?.checkoutSessionId) {
      setPayment({
        ok: false,
        error: "Checkout session id is missing.",
      });
      return;
    }

    setPaying(true);
    setPayment(null);

    try {
      const response = await fetch("/api/checkout/manual-confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checkoutSessionId: checkout.checkoutSessionId,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Could not confirm manual payment.");
      }

      setPayment(data);
    } catch (error) {
      setPayment({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not confirm manual payment.",
      });
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="card" style={{ display: "grid", gap: 16 }}>
      <div>
        <span className="badge badge-gold">
          <T en="Checkout" ar="الدفع" />
        </span>

        <h2 style={{ marginTop: 10 }}>
          <T en="Create marketplace order" ar="إنشاء طلب المتجر" />
        </h2>

        <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
          <T
            en="Create your marketplace order from the active cart, then confirm manual test payment."
            ar="أنشئ طلب المتجر من السلة الحالية، ثم أكد الدفع اليدوي التجريبي."
          />
        </p>
      </div>

      <button
        type="button"
        className="btn btn-primary btn-large"
        onClick={createCheckout}
        disabled={loading || Boolean(checkout?.ok)}
      >
        {loading ? (
          <T en="Creating order..." ar="جاري إنشاء الطلب..." />
        ) : checkout?.ok ? (
          <T en="Order created" ar="تم إنشاء الطلب" />
        ) : (
          <T en="Create order" ar="إنشاء الطلب" />
        )}
      </button>

      {checkout ? (
        <div
          className="card"
          style={{
            borderColor: checkout.ok
              ? "rgba(0,255,136,0.25)"
              : "rgba(255,77,77,0.25)",
            background: checkout.ok
              ? "rgba(0,255,136,0.06)"
              : "rgba(255,77,77,0.06)",
          }}
        >
          {checkout.ok ? (
            <div style={{ display: "grid", gap: 8 }}>
              <strong style={{ color: "#baffd7" }}>
                {checkout.message || "Order created."}
              </strong>

              <div>
                <T en="Order number" ar="رقم الطلب" />:{" "}
                <strong>{checkout.orderNumber}</strong>
              </div>

              <div>
                <T en="Amount" ar="المبلغ" />:{" "}
                <strong>
                  {formatMoney(checkout.amount, checkout.currencyCode)}
                </strong>
              </div>

              <div>
                <T en="Checkout session" ar="جلسة الدفع" />:{" "}
                <code>{checkout.checkoutSessionId}</code>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={confirmManualPayment}
                disabled={paying || Boolean(payment?.ok)}
                style={{ marginTop: 8 }}
              >
                {paying ? (
                  <T en="Confirming payment..." ar="جاري تأكيد الدفع..." />
                ) : payment?.ok ? (
                  <T en="Payment confirmed" ar="تم تأكيد الدفع" />
                ) : (
                  <T en="Confirm manual test payment" ar="تأكيد الدفع التجريبي" />
                )}
              </button>
            </div>
          ) : (
            <strong style={{ color: "#ffb0b0" }}>
              {checkout.error || "Checkout failed."}
            </strong>
          )}
        </div>
      ) : null}

      {payment ? (
        <div
          className="card"
          style={{
            borderColor: payment.ok
              ? "rgba(0,255,136,0.25)"
              : "rgba(255,77,77,0.25)",
            background: payment.ok
              ? "rgba(0,255,136,0.06)"
              : "rgba(255,77,77,0.06)",
          }}
        >
          {payment.ok ? (
            <div style={{ display: "grid", gap: 8 }}>
              <strong style={{ color: "#baffd7" }}>
                {payment.message || "Payment confirmed."}
              </strong>

              <div>
                <T en="Payment transaction" ar="عملية الدفع" />:{" "}
                <code>{payment.paymentTransactionId || "—"}</code>
              </div>

              <div>
                <T en="Status" ar="الحالة" />:{" "}
                <strong>{payment.status || "paid"}</strong>
              </div>

              <a href="/customer" className="btn">
                <T en="Go to customer dashboard" ar="الذهاب للوحة العميل" />
              </a>
            </div>
          ) : (
            <strong style={{ color: "#ffb0b0" }}>
              {payment.error || "Payment failed."}
            </strong>
          )}
        </div>
      ) : null}
    </div>
  );
}
