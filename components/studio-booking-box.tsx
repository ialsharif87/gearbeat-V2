"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
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
  amount?: number;
  currencyCode?: string;
  bookingDate?: string;
  startTime?: string;
  endTime?: string;
  durationHours?: number;
  error?: string;
};

function formatMoney(value: unknown, currency = "SAR") {
  const amount = Number(value || 0);
  return `${Number.isFinite(amount) ? amount.toFixed(2) : "0.00"} ${currency}`;
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
  const pathname = usePathname();
  const studioSlug = pathname.split("/")[2] || "";
  const [bookingDate, setBookingDate] = useState(getTodayValue());
  const [startTime, setStartTime] = useState("10:00");
  const [durationHours, setDurationHours] = useState(1);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<BookingResult | null>(null);

  const estimatedTotal = useMemo(() => {
    const price = Number(hourlyPrice || 0);
    return Number.isFinite(price) ? price * durationHours : 0;
  }, [hourlyPrice, durationHours]);

  async function createBookingRequest() {
    setLoading(true);
    setBooking(null);

    try {
      const response = await fetch("/api/studios/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },        body: JSON.stringify({
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
        throw new Error(data?.error || "Could not send booking request.");
      }

      setBooking(data);
    } catch (error) {
      setBooking({
        ok: false,
        error: error instanceof Error ? error.message : "Could not send booking request.",
      });
    } finally {
      setLoading(false);
    }
  }

  if (booking?.ok) {
    return (
      <div className="card booking-request-success">
        <span className="badge badge-gold"><T en="Pending" ar="معلق" /></span>
        <h2><T en="Booking request sent" ar="تم إرسال طلب الحجز" /></h2>        <p className="booking-request-copy">
          <T
            en="The studio will review your preferred date and time. No payment has been collected."
            ar="سيقوم الاستوديو بمراجعة التاريخ والوقت المطلوبين. لم يتم تحصيل أي دفعة."
          />
        </p>
        <div className="booking-request-summary">
          <div><span><T en="Reference" ar="المرجع" /></span><strong>{booking.bookingNumber || "—"}</strong></div>
          <div><span><T en="Date" ar="التاريخ" /></span><strong>{booking.bookingDate || bookingDate}</strong></div>
          <div><span><T en="Time" ar="الوقت" /></span><strong>{booking.startTime || startTime} – {booking.endTime || "—"}</strong></div>
          <div><span><T en="Estimated total" ar="الإجمالي المتوقع" /></span><strong>{formatMoney(booking.amount ?? estimatedTotal, booking.currencyCode || currencyCode)}</strong></div>
        </div>
        <div className="booking-request-actions">
          <Link href="/customer/bookings" className="btn btn-primary">
            <T en="View my bookings" ar="عرض حجوزاتي" />
          </Link>
          <Link href={`/studios/${studioSlug}`} className="btn btn-outline">
            <T en="Back to studio" ar="العودة للاستوديو" />
          </Link>
        </div>
        <style jsx>{`
          .booking-request-success { display: grid; gap: 16px; }
          .booking-request-copy { color: var(--gb-text-muted); line-height: 1.7; margin: 0; }
          .booking-request-summary { display: grid; gap: 10px; }
          .booking-request-summary div { display: flex; justify-content: space-between; gap: 16px; padding: 12px; border-radius: 10px; background: rgba(255,255,255,.035); }
          .booking-request-summary span { color: var(--gb-text-muted); }
          .booking-request-actions { display: flex; gap: 10px; flex-wrap: wrap; }
          @media (max-width: 600px) { .booking-request-summary div { flex-direction: column; gap: 4px; } .booking-request-actions .btn { width: 100%; } }
        `}</style>
      </div>
    );
  }
  return (
    <div className="card booking-request-card">
      <div>
        <span className="badge badge-gold"><T en="Booking request" ar="طلب حجز" /></span>
        <h2>{studioName}</h2>
        <p className="booking-request-copy">
          <T
            en="Choose your preferred session details. The studio will review the request before it is confirmed."
            ar="اختر تفاصيل الجلسة المفضلة. سيقوم الاستوديو بمراجعة الطلب قبل تأكيده."
          />
        </p>
      </div>

      <div className="booking-request-grid">
        <div>
          <label><T en="Preferred date" ar="التاريخ المفضل" /></label>
          <input className="input" type="date" min={getTodayValue()} value={bookingDate} onChange={(event) => setBookingDate(event.target.value)} />
        </div>
        <div>
          <label><T en="Preferred start time" ar="وقت البداية المفضل" /></label>
          <input className="input" type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
        </div>
        <div>
          <label><T en="Duration" ar="المدة" /></label>
          <select className="input" value={durationHours} onChange={(event) => setDurationHours(Number(event.target.value))}>
            {[1, 2, 3, 4, 5, 6, 8].map((hour) => <option key={hour} value={hour}>{hour} h</option>)}
          </select>
        </div>        <div>
          <label><T en="Estimated total" ar="الإجمالي المتوقع" /></label>
          <div className="input booking-request-total">{formatMoney(estimatedTotal, currencyCode)}</div>
        </div>
      </div>

      <div>
        <label><T en="Notes" ar="ملاحظات" /></label>
        <textarea
          className="input"
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Session setup or special requirements"
        />
      </div>

      <div className="booking-request-notice">
        <strong><T en="Request only" ar="طلب فقط" /></strong>
        <span>
          <T
            en="Submitting this form does not confirm the session and does not collect payment."
            ar="إرسال هذا النموذج لا يؤكد الجلسة ولا يقوم بتحصيل أي دفعة."
          />
        </span>
      </div>

      <button type="button" className="btn btn-primary btn-large" onClick={createBookingRequest} disabled={loading || estimatedTotal <= 0}>
        {loading ? <T en="Sending request..." ar="جاري إرسال الطلب..." /> : <T en="Send booking request" ar="إرسال طلب الحجز" />}
      </button>
      {booking && !booking.ok ? (
        <div className="booking-request-error">
          {booking.error || <T en="Could not send booking request." ar="تعذر إرسال طلب الحجز." />}
        </div>
      ) : null}

      <style jsx>{`
        .booking-request-card { display: grid; gap: 18px; }
        .booking-request-card h2 { margin-top: 10px; }
        .booking-request-copy { color: var(--gb-text-muted); line-height: 1.7; margin: 8px 0 0; }
        .booking-request-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .booking-request-total { display: flex; align-items: center; font-weight: 900; }
        .booking-request-notice { display: grid; gap: 4px; padding: 14px; border-radius: 12px; border: 1px solid rgba(212,175,55,.2); background: rgba(212,175,55,.06); }
        .booking-request-notice strong { color: var(--gb-gold-light); }
        .booking-request-notice span { color: var(--gb-text-muted); font-size: .88rem; line-height: 1.6; }
        .booking-request-error { padding: 14px; border-radius: 12px; color: #ffb0b0; background: rgba(255,77,77,.07); border: 1px solid rgba(255,77,77,.2); }
        @media (max-width: 600px) { .booking-request-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
