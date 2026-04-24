import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createClient } from "../../../lib/supabase/server";
import { requireRole } from "../../../lib/auth";

function statusLabel(status: string) {
  if (status === "confirmed") return "Confirmed";
  if (status === "cancelled") return "Cancelled";
  if (status === "completed") return "Completed";
  return "Pending";
}

function paymentLabel(status: string) {
  if (status === "paid") return "Paid";
  if (status === "failed") return "Failed";
  if (status === "refunded") return "Refunded";
  return "Unpaid";
}

function badgeStyle(type: "booking" | "payment", status: string) {
  const green = {
    background: "rgba(30, 215, 96, 0.18)",
    color: "#1ed760",
    border: "1px solid rgba(30, 215, 96, 0.45)"
  };

  const yellow = {
    background: "rgba(255, 193, 7, 0.18)",
    color: "#ffc107",
    border: "1px solid rgba(255, 193, 7, 0.45)"
  };

  const red = {
    background: "rgba(255, 75, 75, 0.18)",
    color: "#ff4b4b",
    border: "1px solid rgba(255, 75, 75, 0.45)"
  };

  if (type === "booking") {
    if (status === "confirmed" || status === "completed") return green;
    if (status === "cancelled") return red;
    return yellow;
  }

  if (status === "paid") return green;
  if (status === "unpaid" || status === "failed") return red;
  if (status === "refunded") return yellow;

  return yellow;
}

export default async function OwnerBookingsPage() {
  const { user } = await requireRole("owner");
  const supabase = await createClient();

  async function updateBookingStatus(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    const bookingId = String(formData.get("booking_id"));
    const status = String(formData.get("status"));

    if (!bookingId || !["confirmed", "cancelled"].includes(status)) {
      throw new Error("Invalid booking update");
    }

    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/owner/bookings");
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
        <p>Review, confirm, or cancel booking requests for your studios.</p>
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
                <div className="actions" style={{ marginTop: 0 }}>
                  <span
                    className="badge"
                    style={badgeStyle("booking", booking.status)}
                  >
                    Booking: {statusLabel(booking.status)}
                  </span>

                  <span
                    className="badge"
                    style={badgeStyle("payment", booking.payment_status)}
                  >
                    Payment: {paymentLabel(booking.payment_status)}
                  </span>
                </div>

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

                {booking.notes ? <p>Notes: {booking.notes}</p> : null}

                <div className="actions">
                  {booking.status === "pending" ? (
                    <>
                      <form action={updateBookingStatus}>
                        <input
                          type="hidden"
                          name="booking_id"
                          value={booking.id}
                        />
                        <input type="hidden" name="status" value="confirmed" />
                        <button className="btn" type="submit">
                          Confirm
                        </button>
                      </form>

                      <form action={updateBookingStatus}>
                        <input
                          type="hidden"
                          name="booking_id"
                          value={booking.id}
                        />
                        <input type="hidden" name="status" value="cancelled" />
                        <button className="btn btn-secondary" type="submit">
                          Cancel
                        </button>
                      </form>
                    </>
                  ) : (
                    <p>
                      Current status:{" "}
                      <strong>{statusLabel(booking.status)}</strong>
                    </p>
                  )}

                  {studio?.slug ? (
                    <Link
                      href={`/studios/${studio.slug}`}
                      className="btn btn-small"
                    >
                      View Studio
                    </Link>
                  ) : null}
                </div>
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
