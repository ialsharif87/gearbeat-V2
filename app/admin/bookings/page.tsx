import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireAdminRole } from "../../../lib/admin";
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
  const { admin } = await requireAdminRole(["operations", "support", "finance"]);

  const supabaseAdmin = createAdminClient();

  const canManageBookingStatus =
    admin.admin_role === "super_admin" ||
    admin.admin_role === "operations" ||
    admin.admin_role === "support";

  const canManagePaymentStatus =
    admin.admin_role === "super_admin" ||
    admin.admin_role === "operations" ||
    admin.admin_role === "finance";

  async function updateBookingStatus(formData: FormData) {
    "use server";

    await requireAdminRole(["operations", "support"]);

    const supabaseAdmin = createAdminClient();

    const bookingId = String(formData.get("booking_id") || "");
    const status = String(formData.get("status") || "");
    const studioSlug = String(formData.get("studio_slug") || "");

    const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];

    if (!bookingId) {
      throw new Error("Missing booking ID.");
    }

    if (!allowedStatuses.includes(status)) {
      throw new Error("Invalid booking status.");
    }

    const { error } = await supabaseAdmin
      .from("bookings")
      .update({ status })
      .eq("id", bookingId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
    revalidatePath("/customer/bookings");

    if (studioSlug) {
      revalidatePath(`/studios/${studioSlug}`);
    }
  }

  async function updatePaymentStatus(formData: FormData) {
    "use server";

    await requireAdminRole(["operations", "finance"]);

    const supabaseAdmin = createAdminClient();

    const bookingId = String(formData.get("booking_id") || "");
    const paymentStatus = String(formData.get("payment_status") || "");
    const studioSlug = String(formData.get("studio_slug") || "");

    const allowedPaymentStatuses = ["unpaid", "paid", "failed", "refunded"];

    if (!bookingId) {
      throw new Error("Missing booking ID.");
    }

    if (!allowedPaymentStatuses.includes(paymentStatus)) {
      throw new Error("Invalid payment status.");
    }

    const { error } = await supabaseAdmin
      .from("bookings")
      .update({ payment_status: paymentStatus })
      .eq("id", bookingId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
    revalidatePath("/customer/bookings");

    if (studioSlug) {
      revalidatePath(`/studios/${studioSlug}`);
    }
  }

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
    bookings?.filter((booking) => booking.payment_status === "paid").length ||
    0;
  const pendingBookings =
    bookings?.filter((booking) => booking.status === "pending").length || 0;
  const confirmedBookings =
    bookings?.filter((booking) => booking.status === "confirmed").length || 0;
  const completedBookings =
    bookings?.filter((booking) => booking.status === "completed").length || 0;
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
            en="Track and manage booking status, payment status, review requests, and customer feedback activity."
            ar="تابع وأدر حالة الحجز، حالة الدفع، طلبات التقييم، ونشاط آراء العملاء."
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
            <T en="Pending" ar="معلقة" />
          </span>
          <strong>{pendingBookings}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Confirmed" ar="مؤكدة" />
          </span>
          <strong>{confirmedBookings}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Completed" ar="مكتملة" />
          </span>
          <strong>{completedBookings}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Cancelled" ar="ملغية" />
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

        <p>
          <T
            en="Operations and Support can manage booking status. Operations and Finance can manage payment status."
            ar="فريق العمليات والدعم يمكنهم إدارة حالة الحجز. فريق العمليات والمالية يمكنهم إدارة حالة الدفع."
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

                  const studioSlug = studio?.slug || "";

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
                        <div className="admin-studio-actions">
                          <div className="actions">
                            {studioSlug ? (
                              <Link
                                href={`/studios/${studioSlug}`}
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

                          {canManageBookingStatus ? (
                            <div className="admin-inline-action-grid">
                              {booking.status !== "confirmed" ? (
                                <form action={updateBookingStatus}>
                                  <input
                                    type="hidden"
                                    name="booking_id"
                                    value={booking.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="studio_slug"
                                    value={studioSlug}
                                  />
                                  <input
                                    type="hidden"
                                    name="status"
                                    value="confirmed"
                                  />
                                  <button
                                    className="btn btn-small"
                                    type="submit"
                                  >
                                    <T en="Confirm" ar="تأكيد" />
                                  </button>
                                </form>
                              ) : null}

                              {booking.status !== "completed" ? (
                                <form action={updateBookingStatus}>
                                  <input
                                    type="hidden"
                                    name="booking_id"
                                    value={booking.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="studio_slug"
                                    value={studioSlug}
                                  />
                                  <input
                                    type="hidden"
                                    name="status"
                                    value="completed"
                                  />
                                  <button
                                    className="btn btn-small"
                                    type="submit"
                                  >
                                    <T en="Complete" ar="إكمال" />
                                  </button>
                                </form>
                              ) : null}

                              {booking.status !== "pending" ? (
                                <form action={updateBookingStatus}>
                                  <input
                                    type="hidden"
                                    name="booking_id"
                                    value={booking.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="studio_slug"
                                    value={studioSlug}
                                  />
                                  <input
                                    type="hidden"
                                    name="status"
                                    value="pending"
                                  />
                                  <button
                                    className="btn btn-secondary btn-small"
                                    type="submit"
                                  >
                                    <T en="Pending" ar="تعليق" />
                                  </button>
                                </form>
                              ) : null}

                              {booking.status !== "cancelled" ? (
                                <form action={updateBookingStatus}>
                                  <input
                                    type="hidden"
                                    name="booking_id"
                                    value={booking.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="studio_slug"
                                    value={studioSlug}
                                  />
                                  <input
                                    type="hidden"
                                    name="status"
                                    value="cancelled"
                                  />
                                  <button
                                    className="btn btn-secondary btn-small"
                                    type="submit"
                                  >
                                    <T en="Cancel" ar="إلغاء" />
                                  </button>
                                </form>
                              ) : null}
                            </div>
                          ) : null}

                          {canManagePaymentStatus ? (
                            <div className="admin-inline-action-grid">
                              {booking.payment_status !== "paid" ? (
                                <form action={updatePaymentStatus}>
                                  <input
                                    type="hidden"
                                    name="booking_id"
                                    value={booking.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="studio_slug"
                                    value={studioSlug}
                                  />
                                  <input
                                    type="hidden"
                                    name="payment_status"
                                    value="paid"
                                  />
                                  <button
                                    className="btn btn-small"
                                    type="submit"
                                  >
                                    <T en="Mark Paid" ar="تحديد مدفوع" />
                                  </button>
                                </form>
                              ) : null}

                              {booking.payment_status !== "unpaid" ? (
                                <form action={updatePaymentStatus}>
                                  <input
                                    type="hidden"
                                    name="booking_id"
                                    value={booking.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="studio_slug"
                                    value={studioSlug}
                                  />
                                  <input
                                    type="hidden"
                                    name="payment_status"
                                    value="unpaid"
                                  />
                                  <button
                                    className="btn btn-secondary btn-small"
                                    type="submit"
                                  >
                                    <T en="Unpaid" ar="غير مدفوع" />
                                  </button>
                                </form>
                              ) : null}

                              {booking.payment_status !== "refunded" ? (
                                <form action={updatePaymentStatus}>
                                  <input
                                    type="hidden"
                                    name="booking_id"
                                    value={booking.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="studio_slug"
                                    value={studioSlug}
                                  />
                                  <input
                                    type="hidden"
                                    name="payment_status"
                                    value="refunded"
                                  />
                                  <button
                                    className="btn btn-secondary btn-small"
                                    type="submit"
                                  >
                                    <T en="Refunded" ar="مسترد" />
                                  </button>
                                </form>
                              ) : null}

                              {booking.payment_status !== "failed" ? (
                                <form action={updatePaymentStatus}>
                                  <input
                                    type="hidden"
                                    name="booking_id"
                                    value={booking.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="studio_slug"
                                    value={studioSlug}
                                  />
                                  <input
                                    type="hidden"
                                    name="payment_status"
                                    value="failed"
                                  />
                                  <button
                                    className="btn btn-secondary btn-small"
                                    type="submit"
                                  >
                                    <T en="Failed" ar="فشل الدفع" />
                                  </button>
                                </form>
                              ) : null}
                            </div>
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
