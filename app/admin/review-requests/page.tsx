import Link from "next/link";
import { requireAdmin } from "../../../lib/admin";
import { createAdminClient } from "../../../lib/supabase/admin";
import T from "../../../components/t";

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

export default async function AdminReviewRequestsPage() {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();

  const { data: requests, error } = await supabaseAdmin
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

  const totalRequests = requests?.length || 0;
  const pendingRequests =
    requests?.filter((item) => item.status === "pending").length || 0;
  const sentRequests =
    requests?.filter((item) => item.status === "sent").length || 0;
  const submittedRequests =
    requests?.filter((item) => item.status === "submitted").length || 0;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

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
              {requests?.length ? (
                requests.map((item) => {
                  const studio = Array.isArray(item.studios)
                    ? item.studios[0]
                    : item.studios;

                  const booking = Array.isArray(item.bookings)
                    ? item.bookings[0]
                    : item.bookings;

                  const reviewUrl = `${siteUrl}/customer/bookings/${item.booking_id}/review?token=${item.review_token}`;

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
                            <strong>{booking.booking_date}</strong>
                            <p className="admin-muted-line">
                              {booking.start_time} - {booking.end_time}
                            </p>
                            <div className="admin-badge-stack">
                              <span className="badge">{booking.status}</span>
                              <span className="badge">
                                {booking.payment_status}
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
                          style={requestStatusStyle(item.status)}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td>{formatDate(item.email_sent_at)}</td>

                      <td>{formatDate(item.expires_at)}</td>

                      <td>{formatDate(item.review_submitted_at)}</td>

                      <td>
                        <div className="actions">
                          {studio?.slug ? (
                            <Link
                              href={`/studios/${studio.slug}`}
                              className="btn btn-small"
                            >
                              <T en="Studio" ar="الاستوديو" />
                            </Link>
                          ) : null}

                          {siteUrl ? (
                            <a
                              href={reviewUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-secondary btn-small"
                            >
                              <T en="Review Link" ar="رابط التقييم" />
                            </a>
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
