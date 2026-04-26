import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import T from "../../../../components/t";

function getBookingBlockReason(studio: any) {
  if (studio.status !== "approved") {
    return {
      en: "This studio is still pending approval.",
      ar: "هذا الاستوديو لا يزال بانتظار الاعتماد."
    };
  }

  if (!studio.verified) {
    return {
      en: "This studio is not verified yet.",
      ar: "هذا الاستوديو غير موثق حتى الآن."
    };
  }

  if (studio.owner_compliance_status !== "approved") {
    return {
      en: "The studio owner has not completed business verification yet.",
      ar: "مالك الاستوديو لم يكمل التحقق التجاري حتى الآن."
    };
  }

  if (!studio.booking_enabled) {
    return {
      en: "Booking is currently disabled for this studio.",
      ar: "الحجز غير مفعل حاليًا لهذا الاستوديو."
    };
  }

  return {
    en: "This studio is not available for booking yet.",
    ar: "هذا الاستوديو غير متاح للحجز حاليًا."
  };
}

export default async function BookStudioPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/studios/${slug}/book`);
  }

  const { data: studio, error } = await supabase
    .from("studios")
    .select(
      "id,name,slug,city,district,price_from,status,verified,booking_enabled,owner_compliance_status"
    )
    .eq("slug", slug)
    .single();

  if (error || !studio) {
    notFound();
  }

  const isBookable =
    studio.status === "approved" &&
    studio.verified === true &&
    studio.booking_enabled === true &&
    studio.owner_compliance_status === "approved";

  const blockReason = getBookingBlockReason(studio);

  const studioId = studio.id;
  const studioSlug = studio.slug;
  const studioName = studio.name;
  const studioCity = studio.city;
  const studioDistrict = studio.district;
  const studioPriceFrom = Number(studio.price_from || 0);

  async function createBooking(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      redirect(`/login?next=/studios/${studioSlug}/book`);
    }

    const { data: latestStudio, error: latestStudioError } = await supabase
      .from("studios")
      .select(
        "id,slug,status,verified,booking_enabled,owner_compliance_status,price_from"
      )
      .eq("id", studioId)
      .single();

    if (latestStudioError || !latestStudio) {
      throw new Error("Studio not found.");
    }

    const latestIsBookable =
      latestStudio.status === "approved" &&
      latestStudio.verified === true &&
      latestStudio.booking_enabled === true &&
      latestStudio.owner_compliance_status === "approved";

    if (!latestIsBookable) {
      redirect(`/studios/${studioSlug}`);
    }

    const bookingDate = String(formData.get("booking_date") || "");
    const startTime = String(formData.get("start_time") || "");
    const endTime = String(formData.get("end_time") || "");
    const notes = String(formData.get("notes") || "").trim();

    if (!bookingDate) {
      throw new Error("Booking date is required.");
    }

    if (!startTime) {
      throw new Error("Start time is required.");
    }

    if (!endTime) {
      throw new Error("End time is required.");
    }

    if (startTime >= endTime) {
      throw new Error("End time must be after start time.");
    }

    const totalAmount = Number(latestStudio.price_from || studioPriceFrom || 0);

    const { error: bookingError } = await supabase.from("bookings").insert({
      studio_id: studioId,
      customer_auth_user_id: user.id,
      booking_date: bookingDate,
      start_time: startTime,
      end_time: endTime,
      hours: 1,
      total_amount: totalAmount,
      status: "pending",
      payment_status: "unpaid",
      notes
    });

    if (bookingError) {
      throw new Error(bookingError.message);
    }

    redirect("/customer/bookings");
  }

  if (!isBookable) {
    return (
      <section>
        <div className="section-head">
          <span className="badge">
            <T en="Booking unavailable" ar="الحجز غير متاح" />
          </span>

          <h1>
            <T en="This studio is not ready for bookings yet." ar="هذا الاستوديو غير جاهز للحجز بعد." />
          </h1>

          <p>
            <T en={blockReason.en} ar={blockReason.ar} />
          </p>
        </div>

        <div className="card studio-booking-blocked-box">
          <strong>
            <T en="Booking is blocked" ar="تم إيقاف الحجز" />
          </strong>

          <p>
            <T
              en="For customer safety and platform compliance, bookings are only available after studio approval, verification, owner business approval, and booking activation."
              ar="لحماية العميل وضمان امتثال المنصة، لا يتم تفعيل الحجز إلا بعد اعتماد الاستوديو، توثيقه، اعتماد بيانات المالك التجارية، وتفعيل الحجز."
            />
          </p>

          <div className="admin-badge-stack">
            <span className="badge">
              <T en="Studio status:" ar="حالة الاستوديو:" /> {studio.status}
            </span>

            <span className="badge">
              <T en="Verified:" ar="التوثيق:" /> {studio.verified ? "Yes" : "No"}
            </span>

            <span className="badge">
              <T en="Owner compliance:" ar="امتثال المالك:" />{" "}
              {studio.owner_compliance_status || "incomplete"}
            </span>

            <span className="badge">
              <T en="Booking enabled:" ar="تفعيل الحجز:" />{" "}
              {studio.booking_enabled ? "Yes" : "No"}
            </span>
          </div>

          <div className="actions">
            <Link href={`/studios/${studioSlug}`} className="btn btn-secondary">
              <T en="Back to Studio" ar="العودة إلى الاستوديو" />
            </Link>

            <Link href="/studios" className="btn btn-secondary">
              <T en="Browse Studios" ar="تصفح الاستوديوهات" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Booking" ar="الحجز" />
        </span>

        <h1>
          <T en="Book" ar="احجز" /> {studioName}
        </h1>

        <p>
          <T
            en="Choose your preferred date and time. The studio owner will review and confirm your request."
            ar="اختر التاريخ والوقت المناسبين لك. سيقوم صاحب الاستوديو بمراجعة طلبك وتأكيده."
          />
        </p>
      </div>

      <div className="studio-booking-layout">
        <form className="card form" action={createBooking}>
          <label>
            <T en="Booking date" ar="تاريخ الحجز" />
          </label>
          <input className="input" type="date" name="booking_date" required />

          <label>
            <T en="Start time" ar="وقت البداية" />
          </label>
          <input className="input" type="time" name="start_time" required />

          <label>
            <T en="End time" ar="وقت النهاية" />
          </label>
          <input className="input" type="time" name="end_time" required />

          <label>
            <T en="Notes" ar="ملاحظات" />
          </label>
          <textarea
            className="input"
            name="notes"
            placeholder="Any special request?"
            rows={4}
          />

          <button className="btn" type="submit">
            <T en="Create booking request" ar="إرسال طلب الحجز" />
          </button>
        </form>

        <aside className="card booking-summary-card">
          <span className="badge">
            <T en="Booking Summary" ar="ملخص الحجز" />
          </span>

          <h2>{studioName}</h2>

          <p>
            {studioCity}
            {studioDistrict ? ` · ${studioDistrict}` : ""}
          </p>

          <div className="studio-price-box">
            <span>
              <T en="Starting from" ar="يبدأ من" />
            </span>
            <strong>{studioPriceFrom} SAR / hour</strong>
          </div>

          <p>
            <T
              en="Your request will be sent as pending first. After the owner confirms it, you can complete payment from My Bookings."
              ar="سيتم إرسال طلبك أولًا بحالة انتظار. بعد تأكيد صاحب الاستوديو، يمكنك إكمال الدفع من صفحة حجوزاتي."
            />
          </p>

          <div className="actions">
            <Link href={`/studios/${studioSlug}`} className="btn btn-secondary">
              <T en="Back to Studio" ar="العودة إلى الاستوديو" />
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
