import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

export default async function CustomerBookingsPage() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      id,
      booking_date,
      start_time,
      end_time,
      total_amount,
      status,
      payment_status,
      notes,
      created_at,
      studios (
        name,
        city,
        district,
        slug
      )
    `)
    .eq("customer_auth_user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="card">
        <span className="badge">Error</span>
        <h1>My Bookings</h1>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <section>
      <div className="section-head">
        <span className="badge">Customer Area</span>
        <h1>My Bookings</h1>
        <p>Your studio booking requests and status.</p>
      </div>

      <div className="grid">
        {bookings?.length ? (
          bookings.map((booking) => {
            const studio = Array.isArray(booking.studios)
              ? booking.studios[0]
              : booking.studios;

            return (
              <article className="card" key={booking.id}>
                <span className="badge">{booking.status}</span>

                <h2>{studio?.name || "Studio"}</h2>

                <p>
                  {studio?.city || ""}
                  {studio?.district ? ` · ${studio.district}` : ""}
                </p>

                <p>
                  Date: <strong>{booking.booking_date}</strong>
                </p>

                <p>
                  Time: <strong>{booking.start_time}</strong> to{" "}
                  <strong>{booking.end_time}</strong>
                </p>

                <p>
                  Amount: <strong>{booking.total_amount} SAR</strong>
                </p>

                <p>
                  Payment: <strong>{booking.payment_status}</strong>
                </p>

                {booking.notes ? <p>Notes: {booking.notes}</p> : null}

                {studio?.slug ? (
                  <Link
                    href={`/studios/${studio.slug}`}
                    className="btn btn-secondary"
                  >
                    View studio
                  </Link>
                ) : null}
              </article>
            );
          })
        ) : (
          <div className="card">
            <h2>No bookings yet</h2>
            <p>You have not created any booking requests yet.</p>

            <Link href="/studios" className="btn">
              Browse studios
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
