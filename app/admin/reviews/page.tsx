import Link from "next/link";
import { requireAdmin } from "../../../lib/admin";
import { createAdminClient } from "../../../lib/supabase/admin";
import T from "../../../components/t";

function averageReviewScore(review: any) {
  const scores = [
    Number(review.rating || 0),
    Number(review.cleanliness_rating || 0),
    Number(review.equipment_rating || 0),
    Number(review.sound_quality_rating || 0),
    Number(review.communication_rating || 0),
    Number(review.value_rating || 0)
  ].filter((score) => score >= 1 && score <= 5);

  if (!scores.length) return 0;

  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

function formatRating(value: number) {
  if (!value) return "—";
  return value.toFixed(1);
}

export default async function AdminReviewsPage() {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();

  const { data: reviews, error } = await supabaseAdmin
    .from("reviews")
    .select(`
      id,
      review_type,
      rating,
      cleanliness_rating,
      equipment_rating,
      sound_quality_rating,
      communication_rating,
      value_rating,
      comment,
      status,
      created_at,
      studios (
        id,
        name,
        slug,
        city,
        district
      ),
      bookings (
        id,
        booking_date,
        start_time,
        end_time,
        payment_status
      )
    `)
    .order("created_at", { ascending: false });

  const totalReviews = reviews?.length || 0;
  const publishedReviews =
    reviews?.filter((review) => review.status === "published").length || 0;

  const averageScore =
    reviews?.length
      ? reviews.reduce((sum, review) => sum + averageReviewScore(review), 0) /
        reviews.length
      : 0;

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Admin" ar="الإدارة" />
        </span>

        <h1>
          <T en="Reviews Monitoring" ar="مراقبة التقييمات" />
        </h1>

        <p>
          <T
            en="Monitor verified GearBeat reviews, review quality, comments, and booking links."
            ar="راقب تقييمات GearBeat الموثقة، جودة التقييمات، التعليقات، وربطها بالحجوزات."
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

        <Link href="/admin/studios" className="btn btn-secondary">
          <T en="Studios" ar="الاستوديوهات" />
        </Link>

        <Link href="/admin/review-requests" className="btn btn-secondary">
          <T en="Review Requests" ar="طلبات التقييم" />
        </Link>
      </div>

      <div className="admin-kpi-grid">
        <div className="card admin-kpi-card">
          <span>
            <T en="Total Reviews" ar="إجمالي التقييمات" />
          </span>
          <strong>{totalReviews}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Published Reviews" ar="التقييمات المنشورة" />
          </span>
          <strong>{publishedReviews}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Average Score" ar="متوسط التقييم" />
          </span>
          <strong>{formatRating(averageScore)}</strong>
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
          <T en="All Reviews" ar="كل التقييمات" />
        </span>

        <h2>
          <T en="Review list" ar="قائمة التقييمات" />
        </h2>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <T en="Studio" ar="الاستوديو" />
                </th>
                <th>
                  <T en="Score" ar="التقييم" />
                </th>
                <th>
                  <T en="Breakdown" ar="التفاصيل" />
                </th>
                <th>
                  <T en="Comment" ar="التعليق" />
                </th>
                <th>
                  <T en="Booking" ar="الحجز" />
                </th>
                <th>
                  <T en="Status" ar="الحالة" />
                </th>
                <th>
                  <T en="Actions" ar="الإجراءات" />
                </th>
              </tr>
            </thead>

            <tbody>
              {reviews?.length ? (
                reviews.map((review) => {
                  const studio = Array.isArray(review.studios)
                    ? review.studios[0]
                    : review.studios;

                  const booking = Array.isArray(review.bookings)
                    ? review.bookings[0]
                    : review.bookings;

                  const avg = averageReviewScore(review);

                  return (
                    <tr key={review.id}>
                      <td>
                        <strong>{studio?.name || "Studio"}</strong>
                        <p className="admin-muted-line">
                          {studio?.city || ""}
                          {studio?.district ? ` · ${studio.district}` : ""}
                        </p>
                      </td>

                      <td>
                        <strong>{formatRating(avg)} ★</strong>
                        <p className="admin-muted-line">
                          <T en="Overall:" ar="العام:" /> {review.rating}
                        </p>
                      </td>

                      <td>
                        <div className="admin-badge-stack">
                          <small>
                            <T en="Clean:" ar="النظافة:" />{" "}
                            {review.cleanliness_rating || "—"}
                          </small>
                          <small>
                            <T en="Equipment:" ar="المعدات:" />{" "}
                            {review.equipment_rating || "—"}
                          </small>
                          <small>
                            <T en="Sound:" ar="الصوت:" />{" "}
                            {review.sound_quality_rating || "—"}
                          </small>
                          <small>
                            <T en="Communication:" ar="التواصل:" />{" "}
                            {review.communication_rating || "—"}
                          </small>
                          <small>
                            <T en="Value:" ar="القيمة:" />{" "}
                            {review.value_rating || "—"}
                          </small>
                        </div>
                      </td>

                      <td>
                        <p className="admin-muted-line">
                          {review.comment || "No written comment"}
                        </p>
                      </td>

                      <td>
                        {booking ? (
                          <>
                            <strong>{booking.booking_date}</strong>
                            <p className="admin-muted-line">
                              {booking.start_time} - {booking.end_time}
                            </p>
                            <span className="badge">
                              {booking.payment_status}
                            </span>
                          </>
                        ) : (
                          <span className="badge">
                            <T en="No booking" ar="لا يوجد حجز" />
                          </span>
                        )}
                      </td>

                      <td>
                        <span className="badge">{review.status}</span>
                        <p className="admin-muted-line">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </td>

                      <td>
                        {studio?.slug ? (
                          <Link
                            href={`/studios/${studio.slug}`}
                            className="btn btn-small"
                          >
                            <T en="View Studio" ar="عرض الاستوديو" />
                          </Link>
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7}>
                    <T en="No reviews found." ar="لا توجد تقييمات." />
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
