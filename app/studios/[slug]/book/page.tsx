import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";

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

    const priceFrom = Number(studio.price_from || 0);
    const totalAmount = priceFrom;

    const { error: bookingError } = await supabase.from("bookings").insert({
      studio_id: studio.id,
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

    redirect("/customer");
  }

  return (
    <section>
      <div className="card">
        <span className="badge">Booking</span>

        <h1>Book {studio.name}</h1>

        <p>
          {studio.city}
          {studio.district ? ` · ${studio.district}` : ""}
        </p>

        <p>Starting from {studio.price_from ?? 0} SAR / hour</p>

        <form className="form" action={createBooking}>
          <label>Booking date</label>
          <input className="input" type="date" name="booking_date" required />

          <label>Start time</label>
          <input className="input" type="time" name="start_time" required />

          <label>End time</label>
          <input className="input" type="time" name="end_time" required />

          <label>Notes</label>
          <textarea
            className="input"
            name="notes"
            placeholder="Any special request?"
            rows={4}
          />

          <button className="btn" type="submit">
            Create booking request
          </button>
        </form>

        <div className="actions">
          <Link href={`/studios/${studio.slug}`} className="btn btn-secondary">
            Back to studio
          </Link>
        </div>
      </div>
    </section>
  );
}
