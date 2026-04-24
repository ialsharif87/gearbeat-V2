import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import T from "../../../../components/t";

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
    redirect("/login");
  }

  const { data: studio, error } = await supabase
    .from("studios")
    .select("id,name,slug,city,district,price_from,status")
    .eq("slug", slug)
    .eq("status", "approved")
    .single();

  if (error || !studio) {
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

    const supabase = await createClient();

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const bookingDate = String(formData.get("booking_date"));
    const startTime = String(formData.get("start_time"));
    const endTime = String(formData.get("end_time"));
    const notes = String(formData.get("notes") || "");

    const totalAmount = studioPriceFrom;

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
