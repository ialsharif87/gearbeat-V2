import Link from "next/link";
import { requireAdminRole } from "../../../lib/admin";
import { createAdminClient } from "../../../lib/supabase/admin";
import T from "../../../components/t";

type StudioRow = {
  name: string | null;
  slug: string | null;
  city: string | null;
  district: string | null;
};

type BookingRow = {
  booking_date: string | null;
  start_time: string | null;
  end_time: string | null;
  payment_status: string | null;
  status: string | null;
};

type ReviewRequestRow = {
  id: string;
  booking_id: string | null;
  studio_id: string | null;
  customer_auth_user_id: string | null;
  review_token: string | null;
  status: string;
  email_sent_at: string | null;
  expires_at: string | null;
  review_submitted_at: string | null;
  created_at: string | null;
  studios: StudioRow | StudioRow[] | null;
  bookings: BookingRow | BookingRow[] | null;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return "—";
  }
}

function requestStatusStyle(status: string) {
  if (status === "submitted") {
    return {
      background: "rgba(30, 215, 96, 0.18)",
      color: "#1ed760",
      border: "1px solid rgba(30, 215, 96, 0.45)"
    };
  }

  if (status === "sent") {
    return {
      background: "rgba(53, 216, 255, 0.16)",
      color: "#35d8ff",
      border: "1px solid rgba(53, 216, 255, 0.4)"
    };
  }

  if (status === "expired" || status === "failed") {
    return {
      background: "rgba(255, 75, 75, 0.18)",
      color: "#ff4b4b",
      border: "1px solid rgba(255, 75, 75, 0.45)"
    };
  }

  return {
    background: "rgba(255, 193, 7, 0.18)",
    color: "#ffc107",
    border: "1px solid rgba(255, 193, 7, 0.45)"
  };
}

function normalizeStudio(studios: StudioRow | StudioRow[] | null) {
  return Array.isArray(studios) ? studios[0] : studios;
}

function normalizeBooking(bookings: BookingRow | BookingRow[] | null) {
  return Array.isArray(bookings) ? bookings[0] : bookings;
}

function isExpired(value: string | null | undefined) {
  if (!value) return false;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return false;

  return date < new Date();
}

export default async function AdminReviewRequestsPage() {
  await requireAdminRole(["super_admin", "operations", "support", "content"]);

  const supabaseAdmin = createAdminClient();

  const { data: requestsData, error } = await supabaseAdmin
    .from("review_requests")
    .select(`
      id,
      booking_id,
      studio_id,
      customer_auth_user_id,
      review_token,
      status,
      email_sent_at,
      expires_at,
      review_submitted_at,
      created_at,
      studios (
        name,
        slug,
        city,
        district
      ),
      bookings (
        booking_date,
        start_time,
        end_time,
        payment_status,
        status
      )
    `)
    .order("created_at", { ascending: false });

  const requests = (requestsData || []) as ReviewRequestRow[];

  const totalRequests = requests.length;

  const pendingRequests = requests.filter(
    (item: ReviewRequestRow) => item.status === "pending"
  ).length;

  const sentRequests = requests.filter(
    (item: ReviewRequestRow) => item.status === "sent"
  ).length;

  const submittedRequests = requests.filter(
    (item: ReviewRequestRow) => item.status === "submitted"
  ).length;

  const expiredRequests = requests.filter(
    (item: ReviewRequestRow) =>
      item.status === "expired" || isExpired(item.expires_at)
  ).length;

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Admin" ar="الإدارة" />
        </span>

        <h1>
          <T en="Review Requests Monitoring" ar="مراقبة طلبات التقييم" />
        </h1>

        <p>
          <T
            en="Track review request creation, email status, expiry, and submitted reviews."
            ar="تابع إنشاء طلبات التقييم، حالة الإيميل، انتهاء الرابط، والتقييمات المرسلة."
          />
        </p>
      </div>

      <div className="actions" style={{ marginBottom: 24 }}>
        <Link href="/admin" className="btn btn-secondary">
          <T en="Back to Admin Dashboard" ar="العودة إلى لوحة الإدارة" />
        </Link>

        <Link href="/admin/bookings" className="btn btn-secondary">
          <T en="Bookings" ar="الحجوزات" />
        </Link>

        <Link href="/admin/reviews" className="btn btn-secondary">
          <T en="Reviews" ar="التقييمات" />
        </Link>
      </div>

      <div className="admin-kpi-grid">
        <div className="card admin-kpi-card">
          <span>
            <T en="Total Requests" ar="إجمالي الطلبات" />
          </span>
          <strong>{totalRequests}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Pending" ar="معلقة" />
          </span>
          <strong>{pendingRequests}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Sent" ar="مرسلة" />
          </span>
          <strong>{sentRequests}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Submitted" ar="تم التقييم" />
          </span>
          <strong>{submittedRequests}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Expired" ar="منتهية" />
          </span>
          <strong>{expiredRequests}</strong>
        </div>
      </div>

      <div style={{ height: 24 }} />

      {error ? (
        <div className="card">
          <span className="badge">
            <T en="Error" ar="خطأ" />
          </span>
          <p>{error.message}</p>
        </div>
      ) : null}

      <div className="card">
        <span className="badge">
          <T en="All Review Requests" ar="كل طلبات التقييم" />
        </span>

        <h2>
          <T en="Request list" ar="قائمة الطلبات" />
        </h2>

        <p>
          <T
            en="Review links are customer-only. Admins can monitor request status here and open the related booking details."
            ar="روابط التقييم مخصصة للعملاء فقط. يمكن للإدارة متابعة حالة الطلب هنا وفتح تفاصيل الحجز المرتبط."
          />
        </p>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <T en="Studio" ar="الاستوديو" />
                </th>
                <th>
                  <T en="Booking" ar="الحجز" />
                </th>
                <th>
                  <T en="Status" ar="الحالة" />
                </th>
                <th>
                  <T en="Email Sent" ar="تاريخ إرسال الإيميل" />
                </th>
                <th>
                  <T en="Expires" ar="ينتهي" />
                </th>
                <th>
                  <T en="Submitted" ar="تم الإرسال" />
                </th>
                <th>
                  <T en="Actions" ar="الإجراءات" />
                </th>
              </tr>
            </thead>

            <tbody>
              {requests.length ? (
                requests.map((item: ReviewRequestRow) => {
                  const studio = normalizeStudio(item.studios);
                  const booking = normalizeBooking(item.bookings);

                  const requestStatus =
                    item.status === "sent" && isExpired(item.expires_at)
                      ? "expired"
                      : item.status;

                  return (
                    <tr key={item.id}>
                      <td>
                        <strong>{studio?.name || "Studio"}</strong>
                        <p className="admin-muted-line">
                          {studio?.city || ""}
                          {studio?.district ? ` · ${studio.district}` : ""}
                        </p>
                      </td>

                      <td>
                        {booking ? (
                          <>
                            <strong>{booking.booking_date || "—"}</strong>
                            <p className="admin-muted-line">
                              {booking.start_time || "—"} -{" "}
                              {booking.end_time || "—"}
                            </p>
                            <div className="admin-badge-stack">
                              <span className="badge">
                                {booking.status || "—"}
                              </span>
                              <span className="badge">
                                {booking.payment_status || "—"}
                              </span>
                            </div>
                          </>
                        ) : (
                          <span className="badge">
                            <T en="No booking" ar="لا يوجد حجز" />
                          </span>
                        )}
                      </td>

                      <td>
                        <span
                          className="badge"
                          style={requestStatusStyle(requestStatus)}
                        >
                          {requestStatus}
                        </span>
                      </td>

                      <td>{formatDate(item.email_sent_at)}</td>

                      <td>{formatDate(item.expires_at)}</td>

                      <td>{formatDate(item.review_submitted_at)}</td>

                      <td>
                        <div className="actions">
                          {item.booking_id ? (
                            <Link
                              href={`/admin/bookings/${item.booking_id}`}
                              className="btn btn-small"
                            >
                              <T en="Booking Details" ar="تفاصيل الحجز" />
                            </Link>
                          ) : null}

                          {studio?.slug ? (
                            <Link
                              href={`/studios/${studio.slug}`}
                              className="btn btn-secondary btn-small"
                            >
                              <T en="Studio" ar="الاستوديو" />
                            </Link>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7}>
                    <T
                      en="No review requests found."
                      ar="لا توجد طلبات تقييم."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
