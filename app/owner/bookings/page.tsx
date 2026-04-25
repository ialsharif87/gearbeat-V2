import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createClient } from "../../../lib/supabase/server";
import { requireRole } from "../../../lib/auth";
import T from "../../../components/t";

function statusLabel(status: string) {
  if (status === "confirmed") return <T en="Confirmed" ar="مؤكد" />;
  if (status === "cancelled") return <T en="Cancelled" ar="ملغي" />;
  if (status === "completed") return <T en="Completed" ar="مكتمل" />;
  return <T en="Pending" ar="قيد الانتظار" />;
}

function paymentLabel(status: string) {
  if (status === "paid") return <T en="Paid" ar="مدفوع" />;
  if (status === "failed") return <T en="Failed" ar="فشل الدفع" />;
  if (status === "refunded") return <T en="Refunded" ar="مسترد" />;
  return <T en="Unpaid" ar="غير مدفوع" />;
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
        <span className="badge">
          <T en="Error" ar="خطأ" />
        </span>
        <h1>
          <T en="Owner Bookings" ar="حجوزات الاستوديو" />
        </h1>
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
        <span className="badge">
          <T en="Studio Owner" ar="صاحب الاستوديو" />
        </span>

        <h1>
          <T en="Bookings" ar="الحجوزات" />
        </h1>

        <p>
          <T
            en="Review, confirm, or cancel booking requests for your studios."
            ar="راجع طلبات الحجز الخاصة باستوديوهاتك وقم بتأكيدها أو إلغائها."
          />
        </p>
      </div>

      <div className="actions" style={{ marginBottom: 24 }}>
        <Link href="/owner" className="btn btn-secondary">
          <T en="Back to Dashboard" ar="العودة إلى لوحة التحكم" />
        </Link>

        <Link href="/owner/studios" className="btn">
          <T en="My Studios" ar="استوديوهاتي" />
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
                    <T en="Booking:" ar="الحجز:" /> {statusLabel(booking.status)}
                  </span>

                  <span
                    className="badge"
                    style={badgeStyle("payment", booking.payment_status)}
                  >
                    <T en="Payment:" ar="الدفع:" />{" "}
                    {paymentLabel(booking.payment_status)}
                  </span>
                </div>

                <h2>{studio?.name || "Studio booking"}</h2>

                <p>
                  {studio?.city || ""}
                  {studio?.district ? ` · ${studio.district}` : ""}
                </p>

                <p>
                  <T en="Date:" ar="التاريخ:" />{" "}
                  <strong>{booking.booking_date}</strong>
                </p>

                <p>
                  <T en="Time:" ar="الوقت:" />{" "}
                  <strong>{booking.start_time}</strong>{" "}
                  <T en="to" ar="إلى" /> <strong>{booking.end_time}</strong>
                </p>

                <p>
                  <T en="Amount:" ar="المبلغ:" />{" "}
                  <strong>{booking.total_amount} SAR</strong>
                </p>

                {booking.notes ? (
                  <p>
                    <T en="Notes:" ar="ملاحظات:" /> {booking.notes}
                  </p>
                ) : null}

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
                          <T en="Confirm" ar="تأكيد" />
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
                          <T en="Cancel" ar="إلغاء" />
                        </button>
                      </form>
                    </>
                  ) : (
                    <p>
                      <T en="Current status:" ar="الحالة الحالية:" />{" "}
                      <strong>{statusLabel(booking.status)}</strong>
                    </p>
                  )}

                  {studio?.slug ? (
                    <Link
                      href={`/studios/${studio.slug}`}
                      className="btn btn-small"
                    >
                      <T en="View Studio" ar="عرض الاستوديو" />
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })
        ) : (
          <div className="card">
            <h2>
              <T en="No bookings yet" ar="لا توجد حجوزات بعد" />
            </h2>

            <p>
              <T
                en="No customer bookings have been made for your studios yet."
                ar="لا توجد حجوزات من العملاء على استوديوهاتك حتى الآن."
              />
            </p>

            <Link href="/owner/studios" className="btn">
              <T en="My Studios" ar="استوديوهاتي" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
