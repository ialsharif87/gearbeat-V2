import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireAdminRole } from "../../../lib/admin";
import { createAdminClient } from "../../../lib/supabase/admin";
import T from "../../../components/t";

type StudioRow = {
  id: string;
  name: string | null;
  slug: string | null;
  city: string | null;
  district: string | null;
};

type BookingRow = {
  id: string;
  booking_date: string | null;
  start_time: string | null;
  end_time: string | null;
  payment_status: string | null;
};

type ReviewRow = {
  id: string;
  review_type: string | null;
  rating: number | null;
  cleanliness_rating: number | null;
  equipment_rating: number | null;
  sound_quality_rating: number | null;
  communication_rating: number | null;
  value_rating: number | null;
  comment: string | null;
  status: string;
  created_at: string | null;
  studios: StudioRow | StudioRow[] | null;
  bookings: BookingRow | BookingRow[] | null;
};

function averageReviewScore(review: ReviewRow) {
  const scores = [
    Number(review.rating || 0),
    Number(review.cleanliness_rating || 0),
    Number(review.equipment_rating || 0),
    Number(review.sound_quality_rating || 0),
    Number(review.communication_rating || 0),
    Number(review.value_rating || 0)
  ].filter((score: number) => score >= 1 && score <= 5);

  if (!scores.length) return 0;

  return scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
}

function formatRating(value: number) {
  if (!value) return "—";
  return value.toFixed(1);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "—";
  }
}

function reviewStatusStyle(status: string) {
  if (status === "published") {
    return {
      background: "rgba(30, 215, 96, 0.18)",
      color: "#1ed760",
      border: "1px solid rgba(30, 215, 96, 0.45)"
    };
  }

  if (status === "hidden") {
    return {
      background: "rgba(255, 75, 75, 0.18)",
      color: "#ff4b4b",
      border: "1px solid rgba(255, 75, 75, 0.45)"
    };
  }

  if (status === "flagged") {
    return {
      background: "rgba(255, 193, 7, 0.18)",
      color: "#ffc107",
      border: "1px solid rgba(255, 193, 7, 0.45)"
    };
  }

  return {
    background: "rgba(255, 255, 255, 0.12)",
    color: "#ffffff",
    border: "1px solid rgba(255, 255, 255, 0.22)"
  };
}

function normalizeStudio(studios: StudioRow | StudioRow[] | null) {
  return Array.isArray(studios) ? studios[0] : studios;
}

function normalizeBooking(bookings: BookingRow | BookingRow[] | null) {
  return Array.isArray(bookings) ? bookings[0] : bookings;
}

export default async function AdminReviewsPage() {
  await requireAdminRole(["super_admin", "support", "content"]);

  const supabaseAdmin = createAdminClient();

  async function updateReviewStatus(formData: FormData) {
    "use server";

    await requireAdminRole(["super_admin", "support", "content"]);

    const supabaseAdmin = createAdminClient();

    const reviewId = String(formData.get("review_id") || "").trim();
    const studioSlug = String(formData.get("studio_slug") || "").trim();
    const status = String(formData.get("status") || "").trim();

    if (!reviewId) {
      throw new Error("Missing review ID.");
    }

    const allowedStatuses = ["published", "hidden", "flagged"];

    if (!allowedStatuses.includes(status)) {
      throw new Error("Invalid review status.");
    }

    const { data: reviewCheck, error: reviewCheckError } = await supabaseAdmin
      .from("reviews")
      .select("id,status")
      .eq("id", reviewId)
      .maybeSingle();

    if (reviewCheckError) {
      throw new Error(reviewCheckError.message);
    }

    if (!reviewCheck) {
      throw new Error("Review not found.");
    }

    const { error } = await supabaseAdmin
      .from("reviews")
      .update({
        status
      })
      .eq("id", reviewId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/reviews");
    revalidatePath("/admin");
    revalidatePath("/admin/bookings");

    if (studioSlug) {
      revalidatePath(`/studios/${studioSlug}`);
    }
  }

  const { data: reviewsData, error } = await supabaseAdmin
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

  const reviews = (reviewsData || []) as ReviewRow[];

  const totalReviews = reviews.length;

  const publishedReviews = reviews.filter(
    (review: ReviewRow) => review.status === "published"
  ).length;

  const hiddenReviews = reviews.filter(
    (review: ReviewRow) => review.status === "hidden"
  ).length;

  const flaggedReviews = reviews.filter(
    (review: ReviewRow) => review.status === "flagged"
  ).length;

  const averageScore = reviews.length
    ? reviews.reduce(
        (sum: number, review: ReviewRow) => sum + averageReviewScore(review),
        0
      ) / reviews.length
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
            en="Monitor, publish, hide, or flag verified GearBeat reviews."
            ar="راقب، انشر، أخفِ، أو علّم تقييمات GearBeat الموثقة."
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
            <T en="Published" ar="منشورة" />
          </span>
          <strong>{publishedReviews}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Hidden" ar="مخفية" />
          </span>
          <strong>{hiddenReviews}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Flagged" ar="معلّمة" />
          </span>
          <strong>{flaggedReviews}</strong>
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

        <p>
          <T
            en="Published reviews appear on public studio pages. Hidden and flagged reviews are kept internally."
            ar="التقييمات المنشورة تظهر في صفحات الاستوديو العامة. التقييمات المخفية أو المعلّمة تبقى داخليًا."
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
              {reviews.length ? (
                reviews.map((review: ReviewRow) => {
                  const studio = normalizeStudio(review.studios);
                  const booking = normalizeBooking(review.bookings);

                  const avg = averageReviewScore(review);
                  const studioSlug = studio?.slug || "";
                  const reviewStatus = review.status || "published";

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
                          <T en="Overall:" ar="العام:" /> {review.rating || "—"}
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
                            <strong>{booking.booking_date || "—"}</strong>
                            <p className="admin-muted-line">
                              {booking.start_time || "—"} - {booking.end_time || "—"}
                            </p>
                            <span className="badge">
                              {booking.payment_status || "—"}
                            </span>
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
                          style={reviewStatusStyle(reviewStatus)}
                        >
                          {reviewStatus}
                        </span>

                        <p className="admin-muted-line">
                          {formatDate(review.created_at)}
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
                                <T en="View Studio" ar="عرض الاستوديو" />
                              </Link>
                            ) : null}
                          </div>

                          <div className="admin-inline-action-grid">
                            {reviewStatus !== "published" ? (
                              <form action={updateReviewStatus}>
                                <input
                                  type="hidden"
                                  name="review_id"
                                  value={review.id}
                                />
                                <input
                                  type="hidden"
                                  name="studio_slug"
                                  value={studioSlug}
                                />
                                <input
                                  type="hidden"
                                  name="status"
                                  value="published"
                                />
                                <button className="btn btn-small" type="submit">
                                  <T en="Publish" ar="نشر" />
                                </button>
                              </form>
                            ) : null}

                            {reviewStatus !== "hidden" ? (
                              <form action={updateReviewStatus}>
                                <input
                                  type="hidden"
                                  name="review_id"
                                  value={review.id}
                                />
                                <input
                                  type="hidden"
                                  name="studio_slug"
                                  value={studioSlug}
                                />
                                <input
                                  type="hidden"
                                  name="status"
                                  value="hidden"
                                />
                                <button
                                  className="btn btn-secondary btn-small"
                                  type="submit"
                                >
                                  <T en="Hide" ar="إخفاء" />
                                </button>
                              </form>
                            ) : null}

                            {reviewStatus !== "flagged" ? (
                              <form action={updateReviewStatus}>
                                <input
                                  type="hidden"
                                  name="review_id"
                                  value={review.id}
                                />
                                <input
                                  type="hidden"
                                  name="studio_slug"
                                  value={studioSlug}
                                />
                                <input
                                  type="hidden"
                                  name="status"
                                  value="flagged"
                                />
                                <button
                                  className="btn btn-secondary btn-small"
                                  type="submit"
                                >
                                  <T en="Flag" ar="تعليم" />
                                </button>
                              </form>
                            ) : null}
                          </div>
                        </div>
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
