import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireAdminRole } from "../../../lib/admin";
import { createAdminClient } from "../../../lib/supabase/admin";
import T from "../../../components/t";

type AdminRole = "super_admin" | "operations" | "support" | "finance";

type StudioRow = {
  id: string;
  name: string | null;
  slug: string | null;
  city: string | null;
  district: string | null;
  owner_auth_user_id: string | null;
};

type ReviewRow = {
  id: string;
};

type ReviewRequestRow = {
  id: string;
  status: string | null;
  email_sent_at: string | null;
};

type BookingRow = {
  id: string;
  customer_auth_user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_amount: number | null;
  status: string;
  payment_status: string;
  notes: string | null;
  created_at: string | null;
  studios: StudioRow | StudioRow[] | null;
  reviews: ReviewRow[] | null;
  review_requests: ReviewRequestRow[] | null;
};

type CustomerProfileRow = {
  auth_user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: string | null;
  identity_type: string | null;
  identity_number: string | null;
  identity_locked: boolean | null;
};

type CustomerRecord = {
  user: {
    email?: string | null;
    phone?: string | null;
    user_metadata?: Record<string, any>;
  } | null;
  profile: CustomerProfileRow | null;
};

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

function getIdentityLabel(identityType: string | null | undefined) {
  if (identityType === "national_id") return "National ID / هوية وطنية";
  if (identityType === "iqama") return "Iqama / إقامة";
  if (identityType === "passport") return "Passport / جواز سفر";
  if (identityType === "gcc_id") return "GCC ID / هوية خليجية";
  return "—";
}

function getCustomerName(
  user: CustomerRecord["user"],
  profile: CustomerProfileRow | null
) {
  const metadata = user?.user_metadata || {};

  return (
    profile?.full_name ||
    metadata.full_name ||
    metadata.name ||
    metadata.display_name ||
    metadata.first_name ||
    user?.email ||
    "Customer"
  );
}

function getCustomerPhone(
  user: CustomerRecord["user"],
  profile: CustomerProfileRow | null
) {
  const metadata = user?.user_metadata || {};

  return (
    profile?.phone ||
    user?.phone ||
    metadata.phone ||
    metadata.phone_number ||
    metadata.mobile ||
    metadata.mobile_number ||
    metadata.whatsapp ||
    "—"
  );
}

function getCustomerIdentityType(
  user: CustomerRecord["user"],
  profile: CustomerProfileRow | null
) {
  const metadata = user?.user_metadata || {};

  return profile?.identity_type || metadata.identity_type || "";
}

function getCustomerIdentityNumber(
  user: CustomerRecord["user"],
  profile: CustomerProfileRow | null
) {
  const metadata = user?.user_metadata || {};

  return profile?.identity_number || metadata.identity_number || "—";
}

function normalizeStudio(studios: StudioRow | StudioRow[] | null) {
  return Array.isArray(studios) ? studios[0] : studios;
}

function normalizeReviews(reviews: ReviewRow[] | null) {
  return Array.isArray(reviews) ? reviews : [];
}

function normalizeReviewRequests(reviewRequests: ReviewRequestRow[] | null) {
  return Array.isArray(reviewRequests) ? reviewRequests : [];
}

export default async function AdminBookingsPage() {
  const { admin } = await requireAdminRole([
    "super_admin",
    "operations",
    "support",
    "finance"
  ]);

  const supabaseAdmin = createAdminClient();

  const adminRole = admin.admin_role as AdminRole;

  const canManageBookingStatus =
    adminRole === "super_admin" ||
    adminRole === "operations" ||
    adminRole === "support";

  const canManagePaymentStatus =
    adminRole === "super_admin" ||
    adminRole === "operations" ||
    adminRole === "finance";

  async function updateBookingStatus(formData: FormData) {
    "use server";

    await requireAdminRole(["super_admin", "operations", "support"]);

    const supabaseAdmin = createAdminClient();

    const bookingId = String(formData.get("booking_id") || "").trim();
    const status = String(formData.get("status") || "").trim();
    const studioSlug = String(formData.get("studio_slug") || "").trim();

    const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];

    if (!bookingId) {
      throw new Error("Missing booking ID.");
    }

    if (!allowedStatuses.includes(status)) {
      throw new Error("Invalid booking status.");
    }

    const { data: bookingCheck, error: bookingCheckError } = await supabaseAdmin
      .from("bookings")
      .select("id, status, payment_status")
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingCheckError) {
      throw new Error(bookingCheckError.message);
    }

    if (!bookingCheck) {
      throw new Error("Booking not found.");
    }

    const { error } = await supabaseAdmin
      .from("bookings")
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", bookingId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath("/admin");
    revalidatePath("/customer/bookings");
    revalidatePath("/owner/bookings");

    if (studioSlug) {
      revalidatePath(`/studios/${studioSlug}`);
    }
  }

  async function updatePaymentStatus(formData: FormData) {
    "use server";

    await requireAdminRole(["super_admin", "operations", "finance"]);

    const supabaseAdmin = createAdminClient();

    const bookingId = String(formData.get("booking_id") || "").trim();
    const paymentStatus = String(formData.get("payment_status") || "").trim();
    const studioSlug = String(formData.get("studio_slug") || "").trim();

    const allowedPaymentStatuses = ["unpaid", "paid", "failed", "refunded"];

    if (!bookingId) {
      throw new Error("Missing booking ID.");
    }

    if (!allowedPaymentStatuses.includes(paymentStatus)) {
      throw new Error("Invalid payment status.");
    }

    const { data: bookingCheck, error: bookingCheckError } = await supabaseAdmin
      .from("bookings")
      .select("id, status, payment_status")
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingCheckError) {
      throw new Error(bookingCheckError.message);
    }

    if (!bookingCheck) {
      throw new Error("Booking not found.");
    }

    const { error } = await supabaseAdmin
      .from("bookings")
      .update({
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", bookingId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath("/admin");
    revalidatePath("/customer/bookings");
    revalidatePath("/owner/bookings");

    if (studioSlug) {
      revalidatePath(`/studios/${studioSlug}`);
    }
  }

  const { data: bookingsData, error } = await supabaseAdmin
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

  const bookings = (bookingsData || []) as BookingRow[];

  const customerIds = Array.from(
    new Set(
      bookings
        .map((booking: BookingRow) => booking.customer_auth_user_id)
        .filter((customerId: string | null | undefined) => Boolean(customerId))
    )
  );

  const customerResults = await Promise.all(
    customerIds.map(async (customerId: string) => {
      const [{ data: userData }, { data: profileData }] = await Promise.all([
        supabaseAdmin.auth.admin.getUserById(customerId),
        supabaseAdmin
          .from("profiles")
          .select(
            "auth_user_id,email,full_name,phone,role,identity_type,identity_number,identity_locked"
          )
          .eq("auth_user_id", customerId)
          .maybeSingle()
      ]);

      return {
        id: customerId,
        user: userData?.user || null,
        profile: (profileData || null) as CustomerProfileRow | null
      };
    })
  );

  const customerMap = new Map<string, CustomerRecord>(
    customerResults.map((item) => [
      item.id,
      {
        user: item.user,
        profile: item.profile
      }
    ])
  );

  const totalBookings = bookings.length;
  const paidBookings = bookings.filter(
    (booking: BookingRow) => booking.payment_status === "paid"
  ).length;
  const pendingBookings = bookings.filter(
    (booking: BookingRow) => booking.status === "pending"
  ).length;
  const confirmedBookings = bookings.filter(
    (booking: BookingRow) => booking.status === "confirmed"
  ).length;
  const completedBookings = bookings.filter(
    (booking: BookingRow) => booking.status === "completed"
  ).length;
  const cancelledBookings = bookings.filter(
    (booking: BookingRow) => booking.status === "cancelled"
  ).length;

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
            en="Track and manage booking status, payment status, customer details, identity details, review requests, and feedback activity."
            ar="تابع وأدر حالة الحجز، حالة الدفع، بيانات العميل، بيانات الهوية، طلبات التقييم، ونشاط الآراء."
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
            en="Customer name, email, phone, and identity details are shown to make each booking clear for operations."
            ar="يظهر اسم العميل، الإيميل، الجوال، وبيانات الهوية حتى يكون كل حجز واضحًا للعمليات."
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
                  <T en="Customer" ar="العميل" />
                </th>
                <th>
                  <T en="Identity" ar="الهوية" />
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
              {bookings.length ? (
                bookings.map((booking: BookingRow) => {
                  const studio = normalizeStudio(booking.studios);
                  const reviews = normalizeReviews(booking.reviews);
                  const reviewRequests = normalizeReviewRequests(
                    booking.review_requests
                  );

                  const studioSlug = studio?.slug || "";
                  const customerRecord = customerMap.get(
                    booking.customer_auth_user_id
                  );

                  const customer = customerRecord?.user || null;
                  const profile = customerRecord?.profile || null;

                  const customerName = getCustomerName(customer, profile);
                  const customerPhone = getCustomerPhone(customer, profile);
                  const customerEmail = profile?.email || customer?.email || "—";
                  const identityType = getCustomerIdentityType(
                    customer,
                    profile
                  );
                  const identityNumber = getCustomerIdentityNumber(
                    customer,
                    profile
                  );

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
                        <strong>{customerName}</strong>
                        <p className="admin-muted-line">{customerEmail}</p>
                        <p className="admin-muted-line">
                          <T en="Phone:" ar="الجوال:" /> {customerPhone}
                        </p>
                      </td>

                      <td>
                        <strong>{getIdentityLabel(identityType)}</strong>
                        <p className="admin-muted-line">
                          <T en="No:" ar="رقم:" /> {identityNumber}
                        </p>
                        {profile?.identity_locked ? (
                          <span className="badge">
                            <T en="Locked" ar="مقفلة" />
                          </span>
                        ) : (
                          <span className="badge">
                            <T en="Not locked" ar="غير مقفلة" />
                          </span>
                        )}
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
                            <Link
                              href={`/admin/bookings/${booking.id}`}
                              className="btn btn-small"
                            >
                              <T en="Details" ar="التفاصيل" />
                            </Link>

                            {studioSlug ? (
                              <Link
                                href={`/studios/${studioSlug}`}
                                className="btn btn-secondary btn-small"
                              >
                                <T en="Studio" ar="الاستوديو" />
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
                  <td colSpan={9}>
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
