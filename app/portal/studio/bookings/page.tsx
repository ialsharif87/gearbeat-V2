import Link from "next/link";
import { redirect } from "next/navigation";
import OwnerBookingStatusActions from "@/components/owner-booking-status-actions";
import { createClient } from "@/lib/supabase/server";
import T from "@/components/t";

export const dynamic = "force-dynamic";

type DbRow = Record<string, unknown>;

function readText(row: DbRow | null | undefined, keys: string[], fallback = "") {
  if (!row) return fallback;

  for (const key of keys) {
    const value = row[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return fallback;
}

function readNumber(row: DbRow | null | undefined, keys: string[]) {
  if (!row) return 0;

  for (const key of keys) {
    const value = row[key];

    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);

      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  return 0;
}

function formatDateTime(value: string) {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatMoney(amount: number, currency: string) {
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ${currency || "SAR"}`;
}

function getStatusLabel(status: string) {
  switch (status) {
    case "draft":
      return <T en="Draft" ar="مسودة" />;
    case "pending":
    case "pending_payment":
    case "pending_review":
    case "pending_owner_review":
      return <T en="Awaiting Payment" ar="بانتظار الدفع" />;
    case "payment_review":
      return <T en="Payment Review" ar="مراجعة الدفع" />;
    case "confirmed":
    case "accepted":
      return <T en="Confirmed" ar="مؤكد" />;
    case "in_progress":
    case "active":
      return <T en="In Progress" ar="قيد التنفيذ" />;
    case "completed":
      return <T en="Completed" ar="مكتمل" />;
    case "cancelled":
    case "canceled":
    case "declined":
    case "rejected":
    case "failed":
      return <T en="Cancelled" ar="ملغى" />;
    case "refunded":
      return <T en="Refunded" ar="تم الاسترداد" />;
    case "disputed":
      return <T en="Disputed" ar="قيد النزاع" />;
    default:
      return status || <T en="Unknown" ar="غير معروف" />;
  }
}

function getPaymentLabel(status: string) {
  switch (status) {
    case "pending":
    case "unpaid":
    case "pending_payment":
      return <T en="Pending" ar="معلق" />;
    case "paid":
    case "manual_paid":
      return <T en="Paid" ar="مدفوع" />;
    case "refunded":
      return <T en="Refunded" ar="مسترد" />;
    case "cancelled":
    case "failed":
      return <T en="Voided/Failed" ar="ملغى/فشل" />;
    default:
      return status || <T en="Pending" ar="معلق" />;
  }
}

async function fetchOwnedStudios(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const { data, error } = await supabase
    .from("studios")
    .select("*")
    .eq("owner_auth_user_id", userId);

  if (!error && data) {
    return data as DbRow[];
  }

  return [];
}

export default async function OwnerBookingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login");
  }

  const ownedStudios = await fetchOwnedStudios(supabase, user.id);
  const ownedStudioIds = ownedStudios
    .map((studio) => readText(studio, ["id"]))
    .filter(Boolean);

  const studiosById = new Map<string, DbRow>();

  for (const studio of ownedStudios) {
    const studioId = readText(studio, ["id"]);

    if (studioId) {
      studiosById.set(studioId, studio);
    }
  }

  let bookings: DbRow[] = [];

  if (ownedStudioIds.length > 0) {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .in("studio_id", ownedStudioIds)
      .order("created_at", { ascending: false });

    bookings = (data || []) as DbRow[];
  }

  const customerIds = Array.from(
    new Set(
      bookings
        .map((booking) =>
          readText(booking, ["customer_id", "user_id", "client_id"])
        )
        .filter(Boolean)
    )
  );

  const customersById = new Map<string, DbRow>();

  if (customerIds.length > 0) {
    const { data: customers } = await supabase
      .from("profiles")
      .select("*")
      .in("id", customerIds);

    for (const customer of (customers || []) as DbRow[]) {
      const customerId = readText(customer, ["id", "user_id"]);

      if (customerId) {
        customersById.set(customerId, customer);
      }
    }
  }

  const bookingIds = bookings
    .map((booking) => readText(booking, ["id"]))
    .filter(Boolean);

  const paymentSessionsByBookingId = new Map<string, DbRow>();

  if (bookingIds.length > 0) {
    const { data: paymentSessions } = await supabase
      .from("checkout_payment_sessions")
      .select("*")
      .in("booking_id", bookingIds);

    for (const session of (paymentSessions || []) as DbRow[]) {
      const bookingId = readText(session, ["booking_id"]);

      if (bookingId) {
        paymentSessionsByBookingId.set(bookingId, session);
      }
    }
  }

  return (
    <main className="gb-dashboard-page container">
      <section className="gb-dashboard-header">
        <div>
          <p className="gb-eyebrow">
            <T en="Owner Portal" ar="بوابة المالك" />
          </p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, color: 'white' }}>
            <T en="Studio Bookings" ar="حجوزات الاستوديو" />
          </h1>
          <p className="gb-muted-text" style={{ marginTop: '8px' }}>
            <T
              en="Manage incoming studio bookings, review payment status, and update each booking status."
              ar="أدر الحجوزات الواردة وراجع حالة الدفع وحدّث حالة كل حجز."
            />
          </p>
        </div>

        <Link href="/portal/studio" className="gb-button gb-button-outline">
          <T en="Back to Dashboard" ar="العودة للوحة التحكم" />
        </Link>
      </section>

      {ownedStudioIds.length === 0 ? (
        <section className="gb-card gb-empty-state" style={{ padding: '80px 40px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
            <T en="No studios found" ar="لا توجد استوديوهات" />
          </h2>
          <p className="gb-muted-text">
            <T
              en="No studios linked to this account yet."
              ar="لا توجد استوديوهات مرتبطة بهذا الحساب بعد."
            />
          </p>
        </section>
      ) : bookings.length === 0 ? (
        <section className="gb-card gb-empty-state" style={{ padding: '80px 40px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '24px', opacity: 0.2 }}>📅</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
            <T en="No bookings found" ar="لا توجد حجوزات" />
          </h2>
          <p className="gb-muted-text">
            <T
              en="Your studio bookings will appear here once customers book."
              ar="ستظهر حجوزات استوديوك هنا بمجرد قيام العملاء بالحجز."
            />
          </p>
        </section>
      ) : (
        <section className="gb-card-grid gb-dash-grid-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))' }}>
          {bookings.map((booking) => {
            const bookingId = readText(booking, ["id"]);
            const studioId = readText(booking, ["studio_id"]);
            const customerId = readText(booking, [
              "customer_id",
              "user_id",
              "client_id",
            ]);

            const studio = studiosById.get(studioId);
            const customer = customersById.get(customerId);
            const paymentSession = paymentSessionsByBookingId.get(bookingId);

            const studioName = readText(
              studio,
              ["name", "title", "studio_name"],
              "Studio"
            );

            const studioSlug = readText(studio, ["slug"]);

            const customerName = readText(
              customer,
              ["full_name", "name", "display_name"],
              "Customer"
            );

            const customerEmail = readText(
              customer,
              ["email", "contact_email"],
              ""
            );

            const startTime = readText(booking, [
              "start_time",
              "starts_at",
              "booking_start",
              "date",
            ]);

            const endTime = readText(booking, [
              "end_time",
              "ends_at",
              "booking_end",
            ]);

            const status = readText(
              booking,
              ["status"],
              "pending_owner_review"
            );

            const bookingPaymentStatus = readText(
              booking,
              ["payment_status"],
              ""
            );

            const sessionPaymentStatus = readText(
              paymentSession,
              ["status", "payment_status"],
              ""
            );

            const paymentStatus =
              bookingPaymentStatus || sessionPaymentStatus || "pending";

            const amount = readNumber(booking, [
              "total_amount",
              "total_price",
              "amount",
              "price",
              "total_amount"
            ]);

            const currency = readText(booking, ["currency", "currency_code"], "SAR");
            const ownerNotes = readText(booking, ["owner_notes"], "");

            return (
              <article key={bookingId} className="gb-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div className="gb-card-header" style={{ padding: '24px', borderBottom: '1px solid var(--gb-border)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <p className="gb-eyebrow" style={{ margin: 0 }}>#{bookingId.slice(0, 8)}</p>
                      <span className="gb-dash-badge" style={{ 
                        background: status === 'confirmed' || status === 'completed' ? 'rgba(15, 160, 138, 0.1)' : 'rgba(212, 175, 55, 0.1)',
                        color: status === 'confirmed' || status === 'completed' ? 'var(--gb-teal)' : 'var(--gb-gold)'
                      }}>
                        {getStatusLabel(status)}
                      </span>
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white', margin: 0 }}>{studioName}</h2>
                  </div>
                </div>

                <div style={{ padding: '24px', flex: 1 }}>
                  <div className="gb-detail-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <span className="gb-detail-label"><T en="Customer" ar="العميل" /></span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>👤</div>
                        <div>
                          <strong style={{ color: 'white', display: 'block' }}>{customerName}</strong>
                          {customerEmail && <span className="gb-muted-text" style={{ fontSize: '0.8rem' }}>{customerEmail}</span>}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="gb-detail-label"><T en="Schedule" ar="الجدول" /></span>
                      <div style={{ marginTop: '4px' }}>
                        <div style={{ fontSize: '0.85rem', color: 'white', fontWeight: 700 }}>{formatDateTime(startTime).split(',')[0]}</div>
                        <div className="gb-muted-text" style={{ fontSize: '0.8rem' }}>{formatDateTime(startTime).split(',')[1]} - {formatDateTime(endTime).split(',')[1]}</div>
                      </div>
                    </div>

                    <div>
                      <span className="gb-detail-label"><T en="Total Amount" ar="المبلغ الإجمالي" /></span>
                      <div style={{ marginTop: '4px' }}>
                        <strong style={{ color: 'var(--gb-gold)', fontSize: '1.1rem', fontWeight: 900 }}>{formatMoney(amount, currency)}</strong>
                        <div style={{ marginTop: '4px' }}>
                          <span className="gb-dash-badge" style={{ 
                            fontSize: '0.65rem',
                            padding: '2px 8px',
                            background: paymentStatus === 'paid' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: paymentStatus === 'paid' ? '#22c55e' : '#ef4444'
                          }}>
                            {getPaymentLabel(paymentStatus)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {ownerNotes && (
                    <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(212, 175, 55, 0.03)', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.1)' }}>
                      <span className="gb-detail-label" style={{ color: 'var(--gb-gold)' }}><T en="Owner Note" ar="ملاحظة المالك" /></span>
                      <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'white', lineHeight: 1.5 }}>{ownerNotes}</p>
                    </div>
                  )}
                </div>

                <div style={{ padding: '24px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--gb-border)' }}>
                  <OwnerBookingStatusActions
                    bookingId={bookingId}
                    currentStatus={status}
                  />

                  {studioSlug && (
                    <Link
                      href={`/studios/${studioSlug}`}
                      className="gb-button gb-button-outline"
                      style={{ width: '100%', justifyContent: 'center', marginTop: '12px', fontSize: '0.85rem' }}
                    >
                      <T en="View Studio Page" ar="عرض صفحة الاستوديو" />
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
