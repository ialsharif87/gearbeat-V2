"use client";

import { type FormEvent, useState } from "react";
import T from "@/components/t";
import CouponApplyBox from "@/components/coupon-apply-box";
import PaymentMethodSelector from "@/components/payment-method-selector";
import ManualCheckoutConfirmButton from "@/components/manual-checkout-confirm-button";

type CheckoutSourceType =
  | "studio_booking"
  | "marketplace_order"
  | "booking"
  | "order"
  | "cart"
  | "marketplace";

type CheckoutSessionBoxProps = {
  sourceType: CheckoutSourceType;
  sourceId?: string | null;
  subtotalAmount: number;
  currencyCode?: string;
  countryCode?: string | null;
  cityId?: string | null;
  tierCode?: string | null;
  successUrl?: string;
  cancelUrl?: string;
  returnUrl?: string;
  showCoupon?: boolean;
  showPaymentSelector?: boolean;
  buttonLabelEn?: string;
  buttonLabelAr?: string;
  compact?: boolean;
};

type CheckoutSessionResult = {
  ok?: boolean;
  checkoutSessionId?: string;
  status?: string;
  providerCode?: string;
  paymentMethod?: string;
  installmentProvider?: string | null;
  subtotalAmount?: number;
  couponCode?: string | null;
  couponDiscountAmount?: number;
  walletCreditUsed?: number;
  loyaltyPointsRedeemed?: number;
  payableAmount?: number;
  currencyCode?: string;
  checkoutUrl?: string | null;
  message?: string;
  error?: string;
};

function formatMoney(value: number, currencyCode = "SAR") {
  const safeValue = Number(value || 0);

  if (!Number.isFinite(safeValue)) {
    return `0.00 ${currencyCode}`;
  }

  return `${safeValue.toFixed(2)} ${currencyCode}`;
}

export default function CheckoutSessionBox({
  sourceType,
  sourceId,
  subtotalAmount,
  currencyCode = "SAR",
  countryCode,
  cityId,
  tierCode,
  successUrl,
  cancelUrl,
  returnUrl,
  showCoupon = true,
  showPaymentSelector = true,
  buttonLabelEn = "Create checkout session",
  buttonLabelAr = "إنشاء جلسة الدفع",
  compact = false,
}: CheckoutSessionBoxProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckoutSessionResult | null>(null);

  async function createCheckoutSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setResult(null);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceType,
          sourceId,
          subtotalAmount,
          currencyCode,
          countryCode,
          cityId,
          tierCode,
          successUrl,
          cancelUrl,
          returnUrl,
          couponCode: String(formData.get("coupon_code") || ""),
          couponId: String(formData.get("coupon_id") || ""),
          couponDiscountAmount: String(
            formData.get("coupon_discount_amount") || "0"
          ),
          paymentProvider: String(formData.get("payment_provider") || "manual"),
          paymentMethod: String(formData.get("payment_method") || "manual"),
          installmentProvider: String(
            formData.get("installment_provider") || ""
          ),
          walletCreditUsed: String(formData.get("wallet_credit_used") || "0"),
          loyaltyPointsRedeemed: String(
            formData.get("loyalty_points_redeemed") || "0"
          ),
        }),
      });

      if (response.status === 401) {
        window.location.href = "/login?account=customer";
        return;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Could not create checkout session.");
      }

      setResult(data);

      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error("Create checkout session failed:", error);

      setResult({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not create checkout session.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={createCheckoutSession}
      className="card"
      style={{
        padding: compact ? 16 : 24,
        display: "grid",
        gap: 18,
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <input type="hidden" name="wallet_credit_used" value="0" readOnly />
      <input type="hidden" name="loyalty_points_redeemed" value="0" readOnly />

      <div>
        <span className="badge badge-gold">
          <T en="Checkout" ar="الدفع" />
        </span>

        <h3 style={{ marginTop: 10 }}>
          <T en="Checkout session" ar="جلسة الدفع" />
        </h3>

        {!compact ? (
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            <T
              en="This creates a checkout session only. Real payment capture will be connected later."
              ar="هذه الخطوة تنشئ جلسة دفع فقط. سيتم ربط الدفع الحقيقي لاحقًا."
            />
          </p>
        ) : null}
      </div>

      <div
        style={{
          padding: 16,
          borderRadius: 16,
          background: "rgba(255,255,255,0.04)",
          display: "grid",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--muted)" }}>
            <T en="Subtotal" ar="الإجمالي قبل الخصم" />
          </span>
          <strong>{formatMoney(subtotalAmount, currencyCode)}</strong>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--muted)" }}>
            <T en="Currency" ar="العملة" />
          </span>
          <strong>{currencyCode}</strong>
        </div>
      </div>

      {showCoupon ? (
        <CouponApplyBox
          appliesTo={sourceType === "marketplace_order" ? "marketplace_order" : "studio_booking"}
          subtotalAmount={subtotalAmount}
          countryCode={countryCode}
          cityId={cityId}
          tierCode={tierCode}
          currencyCode={currencyCode}
          compact={compact}
        />
      ) : null}

      {showPaymentSelector ? (
        <PaymentMethodSelector
          currencyCode={currencyCode}
          defaultProviderCode="manual"
          compact={compact}
        />
      ) : null}

      <button
        type="submit"
        className="btn btn-primary btn-large"
        disabled={loading || subtotalAmount <= 0}
      >
        {loading ? (
          <T en="Creating session..." ar="جاري إنشاء الجلسة..." />
        ) : (
          <T en={buttonLabelEn} ar={buttonLabelAr} />
        )}
      </button>

      {result ? (
        <div
          style={{
            padding: 16,
            borderRadius: 16,
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
              <strong>
                <T en="Checkout session created." ar="تم إنشاء جلسة الدفع." />
              </strong>

              <div style={{ marginTop: 8 }}>
                <T en="Session ID:" ar="رقم الجلسة:" />{" "}
                {result.checkoutSessionId}
              </div>

              <div>
                <T en="Payable amount:" ar="المبلغ المطلوب:" />{" "}
                {formatMoney(
                  Number(result.payableAmount || 0),
                  result.currencyCode || currencyCode
                )}
              </div>

              <p style={{ marginTop: 8, marginBottom: 0 }}>
                {result.message}
              </p>

              {result.providerCode === "manual" && result.checkoutSessionId ? (
                <ManualCheckoutConfirmButton
                  checkoutSessionId={result.checkoutSessionId}
                />
              ) : null}
            </div>
          ) : (
            <div>{result.error}</div>
          )}
        </div>
      ) : null}
    </form>
  );
}
