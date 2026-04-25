import Link from "next/link";
import { requireAdmin } from "../../../lib/admin";
import { createAdminClient } from "../../../lib/supabase/admin";
import T from "../../../components/t";

function badgeStyle(type: "booking" | "payment", status: string) {
  const green = {
    background: "rgba(30, 215, 96, 0.18)",
    color: "#1ed760",
    border: "1px solid rgba(30, 215, 96, 0.45)"
  };

  const yellow = {
    background: "rgba(255, 193, 7, 0.18)",
    color: "#ffc107",
    border: "1px solid rgba(255, 193, 7, 0.45)"
  };

  const red = {
    background: "rgba(255, 75, 75, 0.18)",
    color: "#ff4b4b",
    border: "1px solid rgba(255, 75, 75, 0.45)"
  };

  if (type === "booking") {
    if (status === "confirmed" || status === "completed") return green;
    if (status === "cancelled") return red;
    return yellow;
  }

  if (status === "paid") return green;
  if (status === "unpaid" || status === "failed") return red;
  if (status === "refunded") return yellow;

  return yellow;
}

export default async function AdminBookingsPage() {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();

  const { data: bookings, error } = await supabaseAdmin
    .from("bookings")
    .select(`
      id,
      customer_auth_user_id,
      booking_date,
      start_time,
      end_time,
      total_amount,
      status,
      payment_status,
      notes,
      created_at,
      studios (
        id,
        name,
        slug,
        city,
        district,
        owner_auth_user_id
      ),
      reviews (
        id
      ),
      review_requests (
        id,
        status,
        email_sent_at
      )
    `)
    .order("created_at", { ascending: false });

  const totalBookings = bookings?.length || 0;
  const paidBookings =
    bookings?.filter((booking) => booking.payment_status === "paid").length || 0;
  const pendingBookings =
    bookings?.filter((booking) => booking.status === "pending").length || 0;
  const cancelledBookings =
    bookings?.filter((booking) => booking.status === "cancelled").length || 0;

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Admin" ar="الإدارة" />
        </span>

        <h1>
          <T en="Bookings Monitoring" ar="مراقبة الحجوزات" />
        </h1>

        <p>
          <T
            en="Track all bookings, booking status, payment status, review requests, and customer feedback activity."
            ar="تابع كل الحجوزات، حالة الحجز، حالة الدفع، طلبات التقييم، ونشاط آراء العملاء."
          />
        </p>
      </div>

      <div className="actions" style={{ marginBottom: 24 }}>
        <Link href="/admin" className="btn btn-secondary">
          <T en="Back to Admin Dashboard" ar="العودة إلى لوحة الإدارة" />
        </Link>

        <Link href="/admin/studios" className="btn btn-secondary">
          <T en="Studios" ar="الاستوديوهات" />
        </Link>

        <Link href="/admin/reviews" className="btn btn-secondary">
          <T en="Reviews" ar="التقييمات" />
        </Link>
      </div>

      <div className="admin-kpi-grid">
        <div className="card admin-kpi-card">
          <span>
            <T en="Total Bookings" ar="إجمالي الحجوزات" />
          </span>
          <strong>{totalBookings}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Paid Bookings" ar="الحجوزات المدفوعة" />
          </span>
          <strong>{paidBookings}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Pending Bookings" ar="الحجوزات المعلقة" />
          </span>
          <strong>{pendingBookings}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Cancelled Bookings" ar="الحجوزات الملغية" />
          </span>
          <strong>{cancelledBookings}</strong>
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
          <T en="All Bookings" ar="كل الحجوزات" />
        </span>

        <h2>
          <T en="Booking list" ar="قائمة الحجوزات" />
        </h2>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <T en="Studio" ar="الاستوديو" />
                </th>
                <th>
                  <T en="Date / Time" ar="التاريخ / الوقت" />
                </th>
                <th>
                  <T en="Amount" ar="المبلغ" />
                </th>
                <th>
                  <T en="Status" ar="الحالة" />
                </th>
                <th>
                  <T en="Review" ar="التقييم" />
                </th>
                <th>
                  <T en="Notes" ar="ملاحظات" />
                </th>
                <th>
                  <T en="Actions" ar="الإجراءات" />
                </th>
              </tr>
            </thead>

            <tbody>
              {bookings?.length ? (
                bookings.map((booking) => {
                  const studio = Array.isArray(booking.studios)
                    ? booking.studios[0]
                    : booking.studios;

                  const reviews = Array.isArray(booking.reviews)
                    ? booking.reviews
                    : [];

                  const reviewRequests = Array.isArray(booking.review_requests)
                    ? booking.review_requests
                    : [];

                  return (
                    <tr key={booking.id}>
                      <td>
                        <strong>{studio?.name || "Studio"}</strong>
                        <p className="admin-muted-line">
                          {studio?.city || ""}
                          {studio?.district ? ` · ${studio.district}` : ""}
                        </p>
                      </td>

                      <td>
                        <strong>{booking.booking_date}</strong>
                        <p className="admin-muted-line">
                          {booking.start_time} - {booking.end_time}
                        </p>
                      </td>

                      <td>{booking.total_amount} SAR</td>

                      <td>
                        <div className="admin-badge-stack">
                          <span
                            className="badge"
                            style={badgeStyle("booking", booking.status)}
                          >
                            {booking.status}
                          </span>

                          <span
                            className="badge"
                            style={badgeStyle(
                              "payment",
                              booking.payment_status
                            )}
                          >
                            {booking.payment_status}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="admin-badge-stack">
                          {reviews.length ? (
                            <span className="badge">
                              <T en="Reviewed" ar="تم التقييم" />
                            </span>
                          ) : (
                            <span className="badge">
                              <T en="No review" ar="لا يوجد تقييم" />
                            </span>
                          )}

                          {reviewRequests.length ? (
                            <span className="badge">
                              <T en="Request:" ar="طلب:" />{" "}
                              {reviewRequests[0].status}
                            </span>
                          ) : (
                            <span className="badge">
                              <T en="No request" ar="لا يوجد طلب" />
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <p className="admin-muted-line">
                          {booking.notes || "-"}
                        </p>
                      </td>

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

                          {booking.payment_status === "paid" &&
                          !reviews.length ? (
                            <Link
                              href={`/customer/bookings/${booking.id}/review`}
                              className="btn btn-secondary btn-small"
                            >
                              <T en="Review Link" ar="رابط التقييم" />
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
                    <T en="No bookings found." ar="لا توجد حجوزات." />
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
