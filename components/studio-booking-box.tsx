"use client";

import { useMemo, useState } from "react";
import T from "@/components/t";

type StudioBookingBoxProps = {
  studioId: string;
  studioName: string;
  hourlyPrice: number;
  currencyCode?: string;
};

type BookingResult = {
  ok?: boolean;
  bookingId?: string;
  bookingNumber?: string;
  checkoutSessionId?: string;
  amount?: number;
  currencyCode?: string;
  bookingDate?: string;
  startTime?: string;
  endTime?: string;
  durationHours?: number;
  message?: string;
  error?: string;
};

type PaymentResult = {
  ok?: boolean;
  checkoutSessionId?: string;
  paymentTransactionId?: string;
  status?: string;
  amount?: number;
  currencyCode?: string;
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

function getTodayValue() {
  return new Date().toISOString().slice(0, 10);
}

export default function StudioBookingBox({
  studioId,
  studioName,
  hourlyPrice,
  currencyCode = "SAR",
}: StudioBookingBoxProps) {
  const [bookingDate, setBookingDate] = useState(getTodayValue());
  const [startTime, setStartTime] = useState("10:00");
  const [durationHours, setDurationHours] = useState(1);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [booking, setBooking] = useState<BookingResult | null>(null);
  const [payment, setPayment] = useState<PaymentResult | null>(null);

  const estimatedTotal = useMemo(() => {
    const price = Number(hourlyPrice || 0);
    const duration = Number(durationHours || 0);

    if (!Number.isFinite(price) || !Number.isFinite(duration)) {
      return 0;
    }

    return price * duration;
  }, [hourlyPrice, durationHours]);

  async function createBooking() {
    setLoading(true);
    setBooking(null);
    setPayment(null);

    try {
      const response = await fetch("/api/studios/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studioId,
          bookingDate,
          startTime,
          durationHours,
          notes,
        }),
      });

      if (response.status === 401) {
        window.location.href = "/login?account=customer";
        return;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Could not create booking.");
      }

      setBooking(data);
    } catch (error) {
      setBooking({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not create booking.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function confirmManualPayment() {
    if (!booking?.checkoutSessionId) {
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
          checkoutSessionId: booking.checkoutSessionId,
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
          <T en="Studio Booking" ar="حجز الاستوديو" />
        </span>

        <h2 style={{ marginTop: 10 }}>{studioName}</h2>

        <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
          <T
            en="Select your booking date, start time, and duration."
            ar="اختر تاريخ الحجز ووقت البداية والمدة."
          />
        </p>
      </div>

      <div className="grid grid-2">
        <div>
          <label>
            <T en="Booking date" ar="تاريخ الحجز" />
          </label>
          <input
            className="input"
            type="date"
            min={getTodayValue()}
            value={bookingDate}
            onChange={(event) => setBookingDate(event.target.value)}
            disabled={Boolean(booking?.ok)}
          />
        </div>

        <div>
          <label>
            <T en="Start time" ar="وقت البداية" />
          </label>
          <input
            className="input"
            type="time"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            disabled={Boolean(booking?.ok)}
          />
        </div>
      </div>

      <div className="grid grid-2">
        <div>
          <label>
            <T en="Duration hours" ar="عدد الساعات" />
          </label>
          <select
            className="input"
            value={durationHours}
            onChange={(event) => setDurationHours(Number(event.target.value))}
            disabled={Boolean(booking?.ok)}
          >
            {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((hour) => (
              <option key={hour} value={hour}>
                {hour}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>
            <T en="Estimated total" ar="الإجمالي المتوقع" />
          </label>
          <div
            className="input"
            style={{
              display: "flex",
              alignItems: "center",
              fontWeight: 900,
            }}
          >
            {formatMoney(estimatedTotal, currencyCode)}
          </div>
        </div>
      </div>

      <div>
        <label>
          <T en="Notes" ar="ملاحظات" />
        </label>
        <textarea
          className="input"
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          disabled={Boolean(booking?.ok)}
          placeholder="Session notes, setup requests, or special requirements"
        />
      </div>

      <button
        type="button"
        className="btn btn-primary btn-large"
        onClick={createBooking}
        disabled={loading || Boolean(booking?.ok) || estimatedTotal <= 0}
      >
        {loading ? (
          <T en="Creating booking..." ar="جاري إنشاء الحجز..." />
        ) : booking?.ok ? (
          <T en="Booking created" ar="تم إنشاء الحجز" />
        ) : (
          <T en="Create booking" ar="إنشاء الحجز" />
        )}
      </button>

      {booking ? (
        <div
          className="card"
          style={{
            borderColor: booking.ok
              ? "rgba(0,255,136,0.25)"
              : "rgba(255,77,77,0.25)",
            background: booking.ok
              ? "rgba(0,255,136,0.06)"
              : "rgba(255,77,77,0.06)",
          }}
        >
          {booking.ok ? (
            <div style={{ display: "grid", gap: 8 }}>
              <strong style={{ color: "#baffd7" }}>
                {booking.message || "Booking created."}
              </strong>

              <div>
                <T en="Booking number" ar="رقم الحجز" />:{" "}
                <strong>{booking.bookingNumber}</strong>
              </div>

              <div>
                <T en="Date" ar="التاريخ" />: {booking.bookingDate}
              </div>

              <div>
                <T en="Time" ar="الوقت" />: {booking.startTime} -{" "}
                {booking.endTime}
              </div>

              <div>
                <T en="Amount" ar="المبلغ" />:{" "}
                <strong>
                  {formatMoney(booking.amount, booking.currencyCode)}
                </strong>
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
              {booking.error || "Booking failed."}
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
