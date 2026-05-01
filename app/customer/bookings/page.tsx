import Link from "next/link";
import { redirect } from "next/navigation";
import T from "@/components/t";
import GoogleMapsLink from "@/components/google-maps-link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function formatDate(value: unknown) {
  if (!value) {
    return "—";
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-SA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatMoney(value: unknown, currency = "SAR") {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return `0.00 ${currency}`;
  }

  return `${numberValue.toFixed(2)} ${currency}`;
}

function getStudioFromBooking(booking: any) {
  if (Array.isArray(booking.studio)) {
    return booking.studio[0] || null;
  }

  return booking.studio || null;
}

function getStudioName(studio: any) {
  return studio?.name_en || studio?.name || studio?.name_ar || "Studio";
}

function getStudioHref(studio: any) {
  if (!studio) {
    return "/studios";
  }

  return `/studios/${studio.slug || studio.id}`;
}

function getBookingDateValue(booking: any) {
  return booking.booking_date || booking.date || booking.created_at;
}

function getBookingStatus(booking: any) {
  return String(booking.status || "pending").toLowerCase();
}

function isCancelledBooking(booking: any) {
  const status = getBookingStatus(booking);
  return ["cancelled", "canceled", "refunded"].includes(status);
}

function isPastBooking(booking: any) {
  const status = getBookingStatus(booking);

  if (["completed", "done"].includes(status)) {
    return true;
  }

  const rawDate = getBookingDateValue(booking);

  if (!rawDate) {
    return false;
  }

  const bookingDate = new Date(String(rawDate));
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return !Number.isNaN(bookingDate.getTime()) && bookingDate < today;
}

function isActiveBooking(booking: any) {
  const status = getBookingStatus(booking);

  return ["active", "in_progress", "checked_in"].includes(status);
}

function isUpcomingBooking(booking: any) {
  if (isCancelledBooking(booking) || isPastBooking(booking) || isActiveBooking(booking)) {
    return false;
  }

  const rawDate = getBookingDateValue(booking);

  if (!rawDate) {
    return true;
  }

  const bookingDate = new Date(String(rawDate));
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return Number.isNaN(bookingDate.getTime()) || bookingDate >= today;
}

function BookingCard({
  booking,
  currency,
}: {
  booking: any;
  currency: string;
}) {
  const studio = getStudioFromBooking(booking);
  const studioName = getStudioName(studio);
  const studioHref = getStudioHref(studio);

  const location = [studio?.district, studio?.city_name || studio?.city]
    .filter(Boolean)
    .join(", ");

  const bookingDate = getBookingDateValue(booking);
  const status = getBookingStatus(booking);

  return (
    <article
      className="card"
      style={{
        display: "grid",
        gap: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div>
          <span className="badge">{status}</span>

          <h2 style={{ marginTop: 10 }}>{studioName}</h2>

          <p style={{ color: "var(--muted)", marginTop: 6 }}>
            {formatDate(bookingDate)}
            {booking.start_time ? ` · ${booking.start_time}` : ""}
            {booking.end_time ? ` - ${booking.end_time}` : ""}
          </p>

          {location ? (
            <p style={{ color: "var(--muted)", marginTop: 6 }}>
              {location}
            </p>
          ) : null}
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            <T en="Total" ar="الإجمالي" />
          </div>

          <strong style={{ fontSize: "1.25rem" }}>
            {formatMoney(
              booking.total_amount ||
                booking.total_price ||
                booking.amount ||
                0,
              currency
            )}
          </strong>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <Link href={`/customer/bookings/${booking.id}`} className="btn btn-primary">
          <T en="View details" ar="عرض التفاصيل" />
        </Link>

        <Link href={studioHref} className="btn">
          <T en="View studio" ar="عرض الاستوديو" />
        </Link>

        {studio ? (
          <GoogleMapsLink
            googleMapsUrl={studio.google_maps_url}
            latitude={studio.latitude}
            longitude={studio.longitude}
            cityName={studio.city_name || studio.city}
            district={studio.district}
            addressLine={studio.address_line}
            mode="directions"
            className="btn"
          />
        ) : null}
      </div>
    </article>
  );
}

function BookingSection({
  titleEn,
  titleAr,
  descriptionEn,
  descriptionAr,
  bookings,
  currency,
  emptyEn,
  emptyAr,
}: {
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  bookings: any[];
  currency: string;
  emptyEn: string;
  emptyAr: string;
}) {
  return (
    <section className="card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2>
            <T en={titleEn} ar={titleAr} />
          </h2>

          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            <T en={descriptionEn} ar={descriptionAr} />
          </p>
        </div>

        <span className="badge">{bookings.length}</span>
      </div>

      <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
        {bookings.length === 0 ? (
          <div
            style={{
              padding: 24,
              borderRadius: 16,
              background: "rgba(255,255,255,0.04)",
              textAlign: "center",
              color: "var(--muted)",
            }}
          >
            <T en={emptyEn} ar={emptyAr} />
          </div>
        ) : (
          bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} currency={currency} />
          ))
        )}
      </div>
    </section>
  );
}

export default async function CustomerBookingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?account=customer");
  }

  const supabaseAdmin = createAdminClient();

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("auth_user_id, full_name, email, role, preferred_currency")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (!profile) {
    redirect("/login?account=customer");
  }

  if (profile.role !== "customer") {
    redirect("/forbidden");
  }

  const { data: bookings, error: bookingsError } = await supabaseAdmin
    .from("bookings")
    .select(`
      id,
      status,
      booking_date,
      date,
      start_time,
      end_time,
      total_amount,
      total_price,
      amount,
      created_at,
      studio:studios(
        id,
        slug,
        name,
        name_en,
        name_ar,
        city,
        city_name,
        district,
        address_line,
        google_maps_url,
        latitude,
        longitude,
        cover_image_url
      )
    `)
    .eq("customer_auth_user_id", user.id)
    .order("booking_date", { ascending: false })
    .limit(100);

  if (bookingsError) {
    throw new Error(bookingsError.message);
  }

  const bookingRows = bookings || [];
  const currency = profile.preferred_currency || "SAR";

  const activeBookings = bookingRows.filter(isActiveBooking);
  const upcomingBookings = bookingRows.filter(isUpcomingBooking);
  const pastBookings = bookingRows.filter(
    (booking: any) => isPastBooking(booking) && !isCancelledBooking(booking)
  );
  const cancelledBookings = bookingRows.filter(isCancelledBooking);

  return (
    <main className="dashboard-page" style={{ maxWidth: 1180, margin: "0 auto" }}>
      <section
        style={{
          marginTop: 24,
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <div>
          <span className="badge badge-gold">
            <T en="My Bookings" ar="حجوزاتي" />
          </span>

          <h1 style={{ marginTop: 10 }}>
            <T en="Studio booking history" ar="سجل حجوزات الاستوديو" />
          </h1>

          <p style={{ color: "var(--muted)", lineHeight: 1.8, maxWidth: 760 }}>
            <T
              en="Track your active, upcoming, past, and cancelled studio bookings."
              ar="تابع حجوزاتك الحالية والقادمة والسابقة والملغاة."
            />
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/studios" className="btn btn-primary">
            <T en="Book a studio" ar="احجز استوديو" />
          </Link>

          <Link href="/customer" className="btn">
            <T en="Dashboard" ar="لوحة العميل" />
          </Link>
        </div>
      </section>

      <section className="stats-grid" style={{ marginTop: 28 }}>
        <div className="card stat-card">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <label>
              <T en="Active" ar="حالية" />
            </label>
            <div className="stat-value">{activeBookings.length}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <label>
              <T en="Upcoming" ar="قادمة" />
            </label>
            <div className="stat-value">{upcomingBookings.length}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">🎧</div>
          <div className="stat-content">
            <label>
              <T en="Past" ar="سابقة" />
            </label>
            <div className="stat-value">{pastBookings.length}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">✕</div>
          <div className="stat-content">
            <label>
              <T en="Cancelled" ar="ملغاة" />
            </label>
            <div className="stat-value">{cancelledBookings.length}</div>
          </div>
        </div>
      </section>

      <div style={{ marginTop: 28, display: "grid", gap: 24 }}>
        <BookingSection
          titleEn="Active bookings"
          titleAr="الحجوزات الحالية"
          descriptionEn="Bookings currently in progress or checked in."
          descriptionAr="الحجوزات النشطة حاليًا أو التي تم تسجيل الدخول لها."
          bookings={activeBookings}
          currency={currency}
          emptyEn="No active bookings right now."
          emptyAr="لا توجد حجوزات حالية الآن."
        />

        <BookingSection
          titleEn="Upcoming bookings"
          titleAr="الحجوزات القادمة"
          descriptionEn="Your confirmed and pending future studio sessions."
          descriptionAr="جلسات الاستوديو القادمة المؤكدة أو المعلقة."
          bookings={upcomingBookings}
          currency={currency}
          emptyEn="No upcoming bookings yet."
          emptyAr="لا توجد حجوزات قادمة بعد."
        />

        <BookingSection
          titleEn="Past bookings"
          titleAr="الحجوزات السابقة"
          descriptionEn="Your completed studio sessions."
          descriptionAr="جلسات الاستوديو المكتملة."
          bookings={pastBookings}
          currency={currency}
          emptyEn="No past bookings yet."
          emptyAr="لا توجد حجوزات سابقة بعد."
        />

        <BookingSection
          titleEn="Cancelled bookings"
          titleAr="الحجوزات الملغاة"
          descriptionEn="Cancelled or refunded bookings."
          descriptionAr="الحجوزات الملغاة أو المستردة."
          bookings={cancelledBookings}
          currency={currency}
          emptyEn="No cancelled bookings."
          emptyAr="لا توجد حجوزات ملغاة."
        />
      </div>
    </main>
  );
}
