import Link from "next/link";
import { requireAdmin, canAccessAdminArea } from "../../lib/admin";
import { createClient } from "../../lib/supabase/server";
import T from "../../components/t";

export default async function AdminDashboardPage() {
  const { admin } = await requireAdmin();
  const supabase = await createClient();

  const canTeam = canAccessAdminArea(admin.admin_role, "team");
  const canStudios = canAccessAdminArea(admin.admin_role, "studios");
  const canBookings = canAccessAdminArea(admin.admin_role, "bookings");
  const canReviews = canAccessAdminArea(admin.admin_role, "reviews");
  const canReviewRequests = canAccessAdminArea(
    admin.admin_role,
    "review_requests"
  );

  const { count: studiosCount } = await supabase
    .from("studios")
    .select("*", { count: "exact", head: true });

  const { count: bookingsCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true });

  const { count: paidBookingsCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("payment_status", "paid");

  const { count: reviewsCount } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true });

  const { count: pendingReviewRequestsCount } = await supabase
    .from("review_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: sentReviewRequestsCount } = await supabase
    .from("review_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "sent");

  const { data: recentBookings } = await supabase
    .from("bookings")
    .select(`
      id,
      booking_date,
      start_time,
      end_time,
      status,
      payment_status,
      total_amount,
      created_at,
      studios (
        name,
        city
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentReviews } = await supabase
    .from("reviews")
    .select(`
      id,
      rating,
      comment,
      created_at,
      studios (
        name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Admin" ar="الإدارة" />
        </span>

        <h1>
          <T en="Admin Dashboard" ar="لوحة تحكم الإدارة" />
        </h1>

        <p>
          <T
            en="Monitor studios, bookings, payments, reviews, and review request emails based on your admin role."
            ar="راقب الاستوديوهات، الحجوزات، المدفوعات، التقييمات، وإيميلات طلب التقييم حسب صلاحيتك."
          />
        </p>
      </div>

      <div className="card">
        <span className="badge">
          <T en="Logged in as" ar="تم تسجيل الدخول كـ" />
        </span>

        <h2>{admin.full_name || admin.email}</h2>

        <p>
          <T en="Role:" ar="الصلاحية:" /> <strong>{admin.admin_role}</strong>
        </p>

        <div className="actions">
          {canTeam ? (
            <Link href="/admin/team" className="btn">
              <T en="Manage Team" ar="إدارة الفريق" />
            </Link>
          ) : null}

          {canStudios ? (
            <Link href="/admin/studios" className="btn btn-secondary">
              <T en="Studios" ar="الاستوديوهات" />
            </Link>
          ) : null}

          {canBookings ? (
            <Link href="/admin/bookings" className="btn btn-secondary">
              <T en="Bookings" ar="الحجوزات" />
            </Link>
          ) : null}

          {canReviews ? (
            <Link href="/admin/reviews" className="btn btn-secondary">
              <T en="Reviews" ar="التقييمات" />
            </Link>
          ) : null}

          {canReviewRequests ? (
            <Link href="/admin/review-requests" className="btn btn-secondary">
              <T en="Review Requests" ar="طلبات التقييم" />
            </Link>
          ) : null}
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="admin-kpi-grid">
        {canStudios ? (
          <div className="card admin-kpi-card">
            <span>
              <T en="Studios" ar="الاستوديوهات" />
            </span>
            <strong>{studiosCount || 0}</strong>
          </div>
        ) : null}

        {canBookings ? (
          <>
            <div className="card admin-kpi-card">
              <span>
                <T en="Bookings" ar="الحجوزات" />
              </span>
              <strong>{bookingsCount || 0}</strong>
            </div>

            <div className="card admin-kpi-card">
              <span>
                <T en="Paid Bookings" ar="الحجوزات المدفوعة" />
              </span>
              <strong>{paidBookingsCount || 0}</strong>
            </div>
          </>
        ) : null}

        {canReviews ? (
          <div className="card admin-kpi-card">
            <span>
              <T en="Reviews" ar="التقييمات" />
            </span>
            <strong>{reviewsCount || 0}</strong>
          </div>
        ) : null}

        {canReviewRequests ? (
          <>
            <div className="card admin-kpi-card">
              <span>
                <T en="Pending Review Requests" ar="طلبات تقييم معلقة" />
              </span>
              <strong>{pendingReviewRequestsCount || 0}</strong>
            </div>

            <div className="card admin-kpi-card">
              <span>
                <T en="Sent Review Requests" ar="طلبات تقييم مرسلة" />
              </span>
              <strong>{sentReviewRequestsCount || 0}</strong>
            </div>
          </>
        ) : null}
      </div>

      <div style={{ height: 24 }} />

      <div className="admin-two-column">
        {canBookings ? (
          <div className="card">
            <span className="badge">
              <T en="Recent Bookings" ar="آخر الحجوزات" />
            </span>

            <h2>
              <T en="Latest activity" ar="آخر النشاطات" />
            </h2>

            <div className="admin-list">
              {recentBookings?.length ? (
                recentBookings.map((booking) => {
                  const studio = Array.isArray(booking.studios)
                    ? booking.studios[0]
                    : booking.studios;

                  return (
                    <div className="admin-list-row" key={booking.id}>
                      <div>
                        <strong>{studio?.name || "Studio"}</strong>
                        <p>
                          {booking.booking_date} · {booking.start_time} -{" "}
                          {booking.end_time}
                        </p>
                        <p>
                          {studio?.city || ""} · {booking.total_amount} SAR
                        </p>
                      </div>

                      <div>
                        <span className="badge">{booking.status}</span>
                        <span className="badge">{booking.payment_status}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>
                  <T en="No bookings yet." ar="لا توجد حجوزات حتى الآن." />
                </p>
              )}
            </div>
          </div>
        ) : null}

        {canReviews ? (
          <div className="card">
            <span className="badge">
              <T en="Recent Reviews" ar="آخر التقييمات" />
            </span>

            <h2>
              <T en="Latest feedback" ar="آخر الآراء" />
            </h2>

            <div className="admin-list">
              {recentReviews?.length ? (
                recentReviews.map((review) => {
                  const studio = Array.isArray(review.studios)
                    ? review.studios[0]
                    : review.studios;

                  return (
                    <div className="admin-list-row" key={review.id}>
                      <div>
                        <strong>{studio?.name || "Studio"}</strong>
                        <p>{review.rating} ★</p>
                        <p>{review.comment || "No written comment"}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>
                  <T en="No reviews yet." ar="لا توجد تقييمات حتى الآن." />
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {!canStudios &&
      !canBookings &&
      !canReviews &&
      !canReviewRequests &&
      !canTeam ? (
        <div className="card">
          <h2>
            <T en="No admin areas available" ar="لا توجد مناطق إدارة متاحة" />
          </h2>
          <p>
            <T
              en="Your account is active, but it has no assigned permissions yet."
              ar="حسابك مفعل، لكن لا توجد صلاحيات مخصصة له حاليًا."
            />
          </p>
        </div>
      ) : null}
    </section>
  );
}
