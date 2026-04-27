import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../../../../lib/supabase/server";
import { createAdminClient } from "../../../../../lib/supabase/admin";
import T from "../../../../../components/t";

type ProfileRow = {
  id: string;
  auth_user_id: string;
  role: string | null;
  account_status: string | null;
};

type StudioRow = {
  id: string;
  name: string | null;
  slug: string | null;
  city: string | null;
  district: string | null;
};

type BookingRow = {
  id: string;
  studio_id: string;
  customer_auth_user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  payment_status: string;
  studios: StudioRow | StudioRow[] | null;
};

type ReviewRequestRow = {
  id: string;
  status: string | null;
  review_token: string | null;
  expires_at: string | null;
  customer_auth_user_id?: string | null;
};

function cleanText(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

function isReviewAllowed(booking: {
  status: string | null;
  payment_status: string | null;
}) {
  return (
    (booking.status === "confirmed" || booking.status === "completed") &&
    booking.payment_status === "paid"
  );
}

function isExpired(value: string | null | undefined) {
  if (!value) return false;

  const expiryDate = new Date(value);
  const now = new Date();

  if (Number.isNaN(expiryDate.getTime())) return false;

  return expiryDate < now;
}

async function requireCustomerAccess() {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: adminUser } = await supabaseAdmin
    .from("admin_users")
    .select("id")
    .eq("auth_user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (adminUser) {
    redirect("/admin");
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, auth_user_id, role, account_status")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const profileRow = profile as ProfileRow | null;
  const role = profileRow?.role || user.user_metadata?.role || "customer";

  if (role === "admin") {
    redirect("/admin");
  }

  if (role === "owner") {
    redirect("/owner");
  }

  if (role !== "customer") {
    redirect("/login");
  }

  if (profileRow?.account_status && profileRow.account_status !== "active") {
    redirect("/login");
  }

  return {
    supabase,
    supabaseAdmin,
    user,
    profile: profileRow
  };
}

function RatingSelect({
  name,
  labelEn,
  labelAr
}: {
  name: string;
  labelEn: string;
  labelAr: string;
}) {
  return (
    <div className="rating-row">
      <div>
        <strong>
          <T en={labelEn} ar={labelAr} />
        </strong>
        <p>
          <T en="Rate from 1 to 5 stars." ar="قيّم من 1 إلى 5 نجوم." />
        </p>
      </div>

      <select className="input rating-select" name={name} required defaultValue="">
        <option value="" disabled>
          Select rating
        </option>
        <option value="5">★★★★★ 5</option>
        <option value="4">★★★★☆ 4</option>
        <option value="3">★★★☆☆ 3</option>
        <option value="2">★★☆☆☆ 2</option>
        <option value="1">★☆☆☆☆ 1</option>
      </select>
    </div>
  );
}

export default async function ReviewBookingPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const token = String(query.token || "").trim();

  const { supabase, user } = await requireCustomerAccess();

  const { data: bookingData, error: bookingError } = await supabase
    .from("bookings")
    .select(`
      id,
      studio_id,
      customer_auth_user_id,
      booking_date,
      start_time,
      end_time,
      status,
      payment_status,
      studios (
        id,
        name,
        slug,
        city,
        district
      )
    `)
    .eq("id", id)
    .eq("customer_auth_user_id", user.id)
    .single();

  if (bookingError || !bookingData) {
    notFound();
  }

  const booking = bookingData as BookingRow;

  const studio = Array.isArray(booking.studios)
    ? booking.studios[0]
    : booking.studios;

  if (!studio) {
    notFound();
  }

  const canReview = isReviewAllowed(booking);

  if (!canReview) {
    return (
      <section>
        <div className="card">
          <span className="badge">
            <T en="Review Not Available" ar="التقييم غير متاح" />
          </span>

          <h1>
            <T en="You cannot review this booking yet." ar="لا يمكنك تقييم هذا الحجز الآن." />
          </h1>

          <p>
            <T
              en="Reviews are available only after a confirmed and paid booking."
              ar="التقييم متاح فقط بعد حجز مؤكد ومدفوع."
            />
          </p>

          <Link href="/customer/bookings" className="btn">
            <T en="Back to My Bookings" ar="العودة إلى حجوزاتي" />
          </Link>
        </div>
      </section>
    );
  }

  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("booking_id", booking.id)
    .eq("customer_auth_user_id", user.id)
    .maybeSingle();

  if (existingReview) {
    return (
      <section>
        <div className="card">
          <span className="badge">
            <T en="Review Submitted" ar="تم إرسال التقييم" />
          </span>

          <h1>
            <T en="You already reviewed this booking." ar="لقد قمت بتقييم هذا الحجز مسبقًا." />
          </h1>

          <p>
            <T
              en="Thank you for sharing your experience with GearBeat."
              ar="شكرًا لمشاركة تجربتك مع GearBeat."
            />
          </p>

          <div className="actions">
            <Link href="/customer/bookings" className="btn btn-secondary">
              <T en="Back to My Bookings" ar="العودة إلى حجوزاتي" />
            </Link>

            {studio.slug ? (
              <Link href={`/studios/${studio.slug}`} className="btn">
                <T en="View Studio" ar="عرض الاستوديو" />
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  const { data: reviewRequestData } = token
    ? await supabase
        .from("review_requests")
        .select("id,status,review_token,expires_at,customer_auth_user_id")
        .eq("booking_id", booking.id)
        .eq("customer_auth_user_id", user.id)
        .eq("review_token", token)
        .maybeSingle()
    : await supabase
        .from("review_requests")
        .select("id,status,review_token,expires_at,customer_auth_user_id")
        .eq("booking_id", booking.id)
        .eq("customer_auth_user_id", user.id)
        .maybeSingle();

  const reviewRequest = reviewRequestData as ReviewRequestRow | null;

  const validReviewRequest =
    reviewRequest &&
    reviewRequest.status !== "submitted" &&
    !isExpired(reviewRequest.expires_at);

  async function submitReview(formData: FormData) {
    "use server";

    const { supabase, user } = await requireCustomerAccess();

    const bookingId = cleanText(formData.get("booking_id"));
    const studioId = cleanText(formData.get("studio_id"));
    const reviewRequestId = cleanText(formData.get("review_request_id")) || null;

    const rating = Number(formData.get("rating") || 0);
    const cleanlinessRating = Number(formData.get("cleanliness_rating") || 0);
    const equipmentRating = Number(formData.get("equipment_rating") || 0);
    const soundQualityRating = Number(formData.get("sound_quality_rating") || 0);
    const communicationRating = Number(formData.get("communication_rating") || 0);
    const valueRating = Number(formData.get("value_rating") || 0);
    const comment = cleanText(formData.get("comment"));

    const ratings = [
      rating,
      cleanlinessRating,
      equipmentRating,
      soundQualityRating,
      communicationRating,
      valueRating
    ];

    if (!bookingId || !studioId || ratings.some((item) => item < 1 || item > 5)) {
      throw new Error("Please complete all ratings.");
    }

    const { data: bookingCheckData, error: bookingCheckError } = await supabase
      .from("bookings")
      .select(`
        id,
        studio_id,
        customer_auth_user_id,
        status,
        payment_status,
        studios (
          slug
        )
      `)
      .eq("id", bookingId)
      .eq("customer_auth_user_id", user.id)
      .single();

    if (bookingCheckError || !bookingCheckData) {
      throw new Error("Booking not found.");
    }

    const bookingCheck = bookingCheckData as {
      id: string;
      studio_id: string;
      customer_auth_user_id: string;
      status: string;
      payment_status: string;
      studios: { slug: string | null } | { slug: string | null }[] | null;
    };

    if (bookingCheck.studio_id !== studioId) {
      throw new Error("Invalid studio for this booking.");
    }

    if (!isReviewAllowed(bookingCheck)) {
      throw new Error("This booking cannot be reviewed yet.");
    }

    const { data: duplicateReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("booking_id", bookingId)
      .eq("customer_auth_user_id", user.id)
      .maybeSingle();

    if (duplicateReview) {
      throw new Error("You already reviewed this booking.");
    }

    if (reviewRequestId) {
      const { data: requestCheck } = await supabase
        .from("review_requests")
        .select("id,status,expires_at,customer_auth_user_id")
        .eq("id", reviewRequestId)
        .eq("booking_id", bookingId)
        .eq("customer_auth_user_id", user.id)
        .maybeSingle();

      if (!requestCheck) {
        throw new Error("Invalid review request.");
      }

      if (requestCheck.status === "submitted") {
        throw new Error("This review request was already submitted.");
      }

      if (isExpired(requestCheck.expires_at)) {
        throw new Error("This review request has expired.");
      }
    }

    const { error: reviewError } = await supabase.from("reviews").insert({
      review_type: "studio",
      studio_id: studioId,
      booking_id: bookingId,
      review_request_id: reviewRequestId,
      customer_auth_user_id: user.id,
      rating,
      cleanliness_rating: cleanlinessRating,
      equipment_rating: equipmentRating,
      sound_quality_rating: soundQualityRating,
      communication_rating: communicationRating,
      value_rating: valueRating,
      comment,
      status: "published"
    });

    if (reviewError) {
      throw new Error(reviewError.message);
    }

    if (reviewRequestId) {
      await supabase
        .from("review_requests")
        .update({
          status: "submitted",
          review_submitted_at: new Date().toISOString()
        })
        .eq("id", reviewRequestId)
        .eq("customer_auth_user_id", user.id);
    }

    const studioFromBooking = Array.isArray(bookingCheck.studios)
      ? bookingCheck.studios[0]
      : bookingCheck.studios;

    const studioSlug = studioFromBooking?.slug || "";

    revalidatePath("/customer/bookings");

    if (studioSlug) {
      revalidatePath(`/studios/${studioSlug}`);
      redirect(`/studios/${studioSlug}`);
    }

    redirect("/customer/bookings");
  }

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Verified GearBeat Review" ar="تقييم موثق من GearBeat" />
        </span>

        <h1>
          <T en="How was your studio experience?" ar="كيف كانت تجربتك في الاستوديو؟" />
        </h1>

        <p>
          <T
            en="Your review is linked to a paid booking, so it helps other creators trust this studio."
            ar="تقييمك مرتبط بحجز مدفوع، لذلك يساعد المبدعين الآخرين على الوثوق بهذا الاستوديو."
          />
        </p>
      </div>

      <div className="review-layout">
        <div className="card">
          <span className="badge">
            <T en="Studio" ar="الاستوديو" />
          </span>

          <h2>{studio.name}</h2>

          <p>
            {studio.city}
            {studio.district ? ` · ${studio.district}` : ""}
          </p>

          <p>
            <T en="Booking date:" ar="تاريخ الحجز:" />{" "}
            <strong>{booking.booking_date}</strong>
          </p>

          <p>
            <T en="Time:" ar="الوقت:" />{" "}
            <strong>{booking.start_time}</strong>{" "}
            <T en="to" ar="إلى" /> <strong>{booking.end_time}</strong>
          </p>

          {validReviewRequest ? (
            <p className="success">
              <T
                en="This review link is connected to your booking."
                ar="رابط التقييم هذا مرتبط بحجزك."
              />
            </p>
          ) : (
            <p>
              <T
                en="You can review this booking because it is confirmed and paid."
                ar="يمكنك تقييم هذا الحجز لأنه مؤكد ومدفوع."
              />
            </p>
          )}
        </div>

        <form className="card form" action={submitReview}>
          <input type="hidden" name="booking_id" value={booking.id} />
          <input type="hidden" name="studio_id" value={studio.id} />
          <input
            type="hidden"
            name="review_request_id"
            value={validReviewRequest?.id || ""}
          />

          <RatingSelect
            name="rating"
            labelEn="Overall Experience"
            labelAr="التجربة العامة"
          />

          <RatingSelect
            name="cleanliness_rating"
            labelEn="Cleanliness"
            labelAr="النظافة"
          />

          <RatingSelect
            name="equipment_rating"
            labelEn="Equipment Quality"
            labelAr="جودة المعدات"
          />

          <RatingSelect
            name="sound_quality_rating"
            labelEn="Sound Quality"
            labelAr="جودة الصوت"
          />

          <RatingSelect
            name="communication_rating"
            labelEn="Owner / Staff Communication"
            labelAr="التواصل مع صاحب الاستوديو أو الفريق"
          />

          <RatingSelect
            name="value_rating"
            labelEn="Value for Money"
            labelAr="القيمة مقابل السعر"
          />

          <label>
            <T en="Write your review" ar="اكتب رأيك في الاستوديو" />
          </label>

          <textarea
            className="input"
            name="comment"
            rows={5}
            placeholder="Tell other creators about your experience..."
          />

          <button className="btn" type="submit">
            <T en="Submit Review" ar="إرسال التقييم" />
          </button>
        </form>
      </div>
    </section>
  );
}
