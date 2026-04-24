import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";
import { requireRole } from "../../../lib/auth";

export default async function OwnerBookingsPage() {
  const { user } = await requireRole("owner");
  const supabase = await createClient();

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
        id,
        name,
        slug,
        city,
        district,
        owner_auth_user_id
      )
    `)
    .eq("studios.owner_auth_user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="card">
        <span className="badge">Error</span>
        <h1>Owner Bookings</h1>
        <p>{error.message}</p>
      </div>
    );
  }

  const ownerBookings =
    bookings?.filter((booking) => {
      const studio = Array.isArray(booking.studios)
        ? booking.studios[0]
        : booking.studios;

      return studio?.owner_auth_user_id === user.id;
    }) || [];

  return (
    <section>
      <div className="section-head">
        <span className="badge">Studio Owner</span>
        <h1>Bookings</h1>
        <p>Review booking requests for your studios.</p>
      </div>

      <div className="actions" style={{ marginBottom: 24 }}>
        <Link href="/owner" className="btn btn-secondary">
          Back to Dashboard
        </Link>

        <Link href="/owner/studios" className="btn">
          My Studios
        </Link>
      </div>

      <div className="grid">
        {ownerBookings.length ? (
          ownerBookings.map((booking) => {
            const studio = Array.isArray(booking.studios)
              ? booking.studios[0]
              : booking.studios;

            return (
              <article className="card" key={booking.id}>
                <span className="badge">{booking.status}</span>

                <h2>{studio?.name || "Studio booking"}</h2>

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
                    className="btn btn-small"
                  >
                    View Studio
                  </Link>
                ) : null}
              </article>
            );
          })
        ) : (
          <div className="card">
            <h2>No bookings yet</h2>
            <p>No customer bookings have been made for your studios yet.</p>

            <Link href="/owner/studios" className="btn">
              My Studios
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
