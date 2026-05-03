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
    case "pending":
    case "pending_review":
    case "pending_owner_review":
      return <T en="Pending" ar="معلق" />;
    case "confirmed":
    case "accepted":
      return <T en="Confirmed" ar="مؤكد" />;
    case "cancelled":
    case "declined":
    case "rejected":
      return <T en="Cancelled" ar="ملغي" />;
    case "completed":
      return <T en="Completed" ar="مكتمل" />;
    default:
      return status || <T en="Unknown" ar="غير معروف" />;
  }
}

function getPaymentLabel(status: string) {
  switch (status) {
    case "pending":
    case "unpaid":
      return <T en="Pending" ar="معلق" />;
    case "paid":
    case "manual_paid":
      return <T en="Paid" ar="مدفوع" />;
    case "refunded":
      return <T en="Refunded" ar="مسترد" />;
    case "cancelled":
    case "failed":
      return <T en="Cancelled" ar="ملغي" />;
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
    <main className="gb-dashboard-page">
      <section className="gb-dashboard-header">
        <div>
          <p className="gb-eyebrow">
            <T en="Owner Portal" ar="بوابة المالك" />
          </p>
          <h1>
            <T en="Studio Bookings" ar="حجوزات الاستوديو" />
          </h1>
          <p className="gb-muted-text">
            <T
              en="Manage incoming studio bookings, review payment status, and update each booking status."
              ar="أدر الحجوزات الواردة وراجع حالة الدفع وحدّث حالة كل حجز."
            />
          </p>
        </div>

        <Link href="/portal/studio" className="gb-button gb-button-secondary">
          <T en="Back" ar="رجوع" />
        </Link>
      </section>

      {ownedStudioIds.length === 0 ? (
        <section className="gb-empty-state">
          <h2>
            <T en="No studios found" ar="لا توجد استوديوهات" />
          </h2>
          <p>
            <T
              en="No studios linked to this account yet."
              ar="لا توجد استوديوهات مرتبطة بهذا الحساب بعد."
            />
          </p>
        </section>
      ) : null}

      {ownedStudioIds.length > 0 && bookings.length === 0 ? (
        <section className="gb-empty-state">
          <h2>
            <T en="No bookings found" ar="لا توجد حجوزات" />
          </h2>
          <p>
            <T
              en="Your studio bookings will appear here once customers book."
              ar="ستظهر حجوزات استوديوك هنا بمجرد قيام العملاء بالحجز."
            />
          </p>
        </section>
      ) : null}

      {bookings.length > 0 ? (
        <section className="gb-card-grid">
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
              <article key={bookingId} className="gb-card">
                <div className="gb-card-header">
                  <div>
                    <p className="gb-eyebrow">Booking</p>
                    <h2>{studioName}</h2>
                  </div>

                  <span className="gb-status-pill">
                    {getStatusLabel(status)}
                  </span>
                </div>

                <div className="gb-detail-grid">
                  <div>
                    <span className="gb-detail-label">Customer</span>
                    <strong>{customerName}</strong>
                    {customerEmail ? <p>{customerEmail}</p> : null}
                  </div>

                  <div>
                    <span className="gb-detail-label">Start</span>
                    <strong>{formatDateTime(startTime)}</strong>
                  </div>

                  <div>
                    <span className="gb-detail-label">End</span>
                    <strong>{formatDateTime(endTime)}</strong>
                  </div>

                  <div>
                    <span className="gb-detail-label">Amount</span>
                    <strong>{formatMoney(amount, currency)}</strong>
                  </div>

                  <div>
                    <span className="gb-detail-label">Payment</span>
                    <strong>{getPaymentLabel(paymentStatus)}</strong>
                  </div>
                </div>

                {ownerNotes ? (
                  <div className="gb-note-box">
                    <span className="gb-detail-label">Owner note</span>
                    <p>{ownerNotes}</p>
                  </div>
                ) : null}

                <div className="gb-card-footer">
                  <OwnerBookingStatusActions
                    bookingId={bookingId}
                    currentStatus={status}
                  />

                  {studioSlug ? (
                    <Link
                      href={`/studios/${studioSlug}`}
                      className="gb-text-link"
                    >
                      View studio
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </section>
      ) : null}
    </main>
  );
}
