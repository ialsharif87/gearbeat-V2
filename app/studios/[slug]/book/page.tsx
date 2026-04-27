import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import T from "../../../../components/t";

function cleanText(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

function isStudioBookable(studio: any) {
  return (
    studio.status === "approved" &&
    studio.verified === true &&
    studio.booking_enabled === true &&
    studio.owner_compliance_status === "approved"
  );
}

async function requireCustomerAccess(nextUrl: string) {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextUrl)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, auth_user_id, role, account_status")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const role = profile?.role || user.user_metadata?.role || "customer";

  if (role === "admin") {
    redirect("/admin");
  }

  if (role === "owner") {
    redirect("/owner");
  }

  if (role !== "customer") {
    redirect("/login");
  }

  if (profile?.account_status && profile.account_status !== "active") {
    redirect("/login");
  }

  return {
    supabase,
    user,
    profile
  };
}

export default async function BookStudioPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { supabase } = await requireCustomerAccess(`/studios/${slug}/book`);

  const { data: studio, error } = await supabase
    .from("studios")
    .select(
      "id,name,slug,city,district,price_from,status,verified,booking_enabled,owner_compliance_status"
    )
    .eq("slug", slug)
    .eq("status", "approved")
    .eq("verified", true)
    .eq("booking_enabled", true)
    .eq("owner_compliance_status", "approved")
    .single();

  if (error || !studio) {
    notFound();
  }

  if (!isStudioBookable(studio)) {
    notFound();
  }

  const studioId = studio.id;
  const studioSlug = studio.slug;
  const studioName = studio.name;
  const studioCity = studio.city;
  const studioDistrict = studio.district;
  const studioPriceFrom = Number(studio.price_from || 0);

  async function createBooking(formData: FormData) {
    "use server";

    const { supabase, user } = await requireCustomerAccess(
      `/studios/${studioSlug}/book`
    );

    const { data: latestStudio, error: latestStudioError } = await supabase
      .from("studios")
      .select(
        "id,slug,status,verified,booking_enabled,owner_compliance_status,price_from"
      )
      .eq("id", studioId)
      .single();

    if (latestStudioError || !latestStudio) {
      notFound();
    }

    if (!isStudioBookable(latestStudio)) {
      notFound();
    }

    const bookingDate = cleanText(formData.get("booking_date"));
    const startTime = cleanText(formData.get("start_time"));
    const endTime = cleanText(formData.get("end_time"));
    const notes = cleanText(formData.get("notes"));

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

    const selectedDate = new Date(`${bookingDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      throw new Error("Booking date cannot be in the past.");
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
