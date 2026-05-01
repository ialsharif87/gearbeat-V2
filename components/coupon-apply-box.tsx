"use client";

import { useMemo, useState } from "react";
import T from "@/components/t";

type CouponAppliesTo = "all" | "studio_booking" | "marketplace_order";

type CouponApplyBoxProps = {
  appliesTo?: CouponAppliesTo;
  subtotalAmount: number;
  countryCode?: string | null;
  cityId?: string | null;
  tierCode?: string | null;
  currencyCode?: string;
  defaultCode?: string;
  disabled?: boolean;
  compact?: boolean;
};

type CouponValidationResult = {
  valid: boolean;
  couponId?: string | null;
  code?: string | null;
  discountAmount?: number;
  errorCode?: string | null;
  message?: string | null;
};

function formatMoney(value: number, currencyCode = "SAR") {
  const safeValue = Number(value || 0);

  if (!Number.isFinite(safeValue)) {
    return `0.00 ${currencyCode}`;
  }

  return `${safeValue.toFixed(2)} ${currencyCode}`;
}

export default function CouponApplyBox({
  appliesTo = "all",
  subtotalAmount,
  countryCode,
  cityId,
  tierCode,
  currencyCode = "SAR",
  defaultCode = "",
  disabled = false,
  compact = false,
}: CouponApplyBoxProps) {
  const [couponCode, setCouponCode] = useState(defaultCode);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CouponValidationResult | null>(null);

  const validDiscount = Number(result?.discountAmount || 0);
  const isValid = Boolean(result?.valid && validDiscount > 0);

  const finalTotal = useMemo(() => {
    const subtotal = Number(subtotalAmount || 0);

    if (!Number.isFinite(subtotal)) {
      return 0;
    }

    return Math.max(subtotal - validDiscount, 0);
  }, [subtotalAmount, validDiscount]);

  async function validateCoupon() {
    const cleanCode = couponCode.trim();

    if (!cleanCode) {
      setResult({
        valid: false,
        errorCode: "missing_code",
        message: "Please enter a coupon code.",
        discountAmount: 0,
      });
      return;
    }

    if (!subtotalAmount || subtotalAmount <= 0) {
      setResult({
        valid: false,
        errorCode: "invalid_subtotal",
        message: "Subtotal amount must be greater than zero.",
        discountAmount: 0,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: cleanCode,
          appliesTo,
          subtotalAmount,
          countryCode,
          cityId,
          tierCode,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Could not validate coupon.");
      }

      setResult({
        valid: Boolean(data?.valid),
        couponId: data?.couponId || null,
        code: data?.code || cleanCode.toUpperCase(),
        discountAmount: Number(data?.discountAmount || 0),
        errorCode: data?.errorCode || null,
        message: data?.message || null,
      });
    } catch (error) {
      console.error("Coupon apply failed:", error);

      setResult({
        valid: false,
        errorCode: "request_failed",
        message: "Could not validate coupon. Please try again.",
        discountAmount: 0,
      });
    } finally {
      setLoading(false);
    }
  }

  function clearCoupon() {
    setCouponCode("");
    setResult(null);
  }

  return (
    <div
      className="card"
      style={{
        padding: compact ? 16 : 22,
        borderColor: isValid
          ? "rgba(0,255,136,0.28)"
          : "rgba(255,255,255,0.08)",
        background: isValid
          ? "rgba(0,255,136,0.04)"
          : "rgba(255,255,255,0.035)",
      }}
    >
      <input
        type="hidden"
        name="coupon_code"
        value={isValid ? result?.code || "" : ""}
        readOnly
      />

      <input
        type="hidden"
        name="coupon_id"
        value={isValid ? result?.couponId || "" : ""}
        readOnly
      />

      <input
        type="hidden"
        name="coupon_discount_amount"
        value={isValid ? String(validDiscount) : "0"}
        readOnly
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 14,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div>
          <span className="badge badge-gold">
            <T en="Coupon" ar="قسيمة خصم" />
          </span>

          <h3 style={{ marginTop: 10 }}>
            <T en="Apply coupon code" ar="استخدم كود الخصم" />
          </h3>

          {!compact ? (
            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              <T
                en="Enter a valid coupon code to preview your discount."
                ar="أدخل كود خصم صحيح لمعرفة قيمة الخصم."
              />
            </p>
          ) : null}
        </div>

        {isValid ? (
          <span className="badge badge-success">
            <T en="Applied" ar="تم التطبيق" />
          </span>
        ) : null}
      </div>

      <div
        style={{
          marginTop: 16,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <input
          className="input"
          value={couponCode}
          onChange={(event) => {
            setCouponCode(event.target.value.toUpperCase());
            setResult(null);
          }}
          placeholder="WELCOME10"
          disabled={disabled || loading}
          style={{ flex: "1 1 220px" }}
        />

        <button
          type="button"
          className="btn btn-primary"
          onClick={validateCoupon}
          disabled={disabled || loading || !couponCode.trim()}
        >
          {loading ? (
            <T en="Checking..." ar="جاري التحقق..." />
          ) : (
            <T en="Apply" ar="تطبيق" />
          )}
        </button>

        {result ? (
          <button type="button" className="btn" onClick={clearCoupon}>
            <T en="Clear" ar="إزالة" />
          </button>
        ) : null}
      </div>

      {result ? (
        <div
          style={{
            marginTop: 14,
            padding: 14,
            borderRadius: 14,
            background: isValid
              ? "rgba(0,255,136,0.08)"
              : "rgba(255,77,77,0.08)",
            border: isValid
              ? "1px solid rgba(0,255,136,0.18)"
              : "1px solid rgba(255,77,77,0.18)",
            color: isValid ? "#baffd7" : "#ffb0b0",
          }}
        >
          {result.message || (isValid ? "Coupon applied." : "Coupon is invalid.")}
        </div>
      ) : null}

      {isValid ? (
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gap: 8,
            color: "var(--muted)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>
              <T en="Subtotal" ar="الإجمالي قبل الخصم" />
            </span>
            <strong>{formatMoney(subtotalAmount, currencyCode)}</strong>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>
              <T en="Coupon discount" ar="خصم القسيمة" />
            </span>
            <strong style={{ color: "#00ff88" }}>
              -{formatMoney(validDiscount, currencyCode)}
            </strong>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: 8,
              marginTop: 4,
              color: "white",
            }}
          >
            <span>
              <T en="Estimated total" ar="الإجمالي المتوقع" />
            </span>
            <strong>{formatMoney(finalTotal, currencyCode)}</strong>
          </div>
        </div>
      ) : null}

      {!compact ? (
        <p style={{ marginTop: 14, color: "var(--muted)", fontSize: "0.85rem" }}>
          <T
            en="Coupon redemption will be finalized during checkout."
            ar="سيتم تثبيت استخدام القسيمة عند إتمام الدفع."
          />
        </p>
      ) : null}
    </div>
  );
}
