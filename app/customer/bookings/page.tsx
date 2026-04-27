import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../../lib/supabase/server";
import T from "../../../components/t";

type ProfileRow = {
  id: string;
  auth_user_id: string;
  role: string | null;
  account_status: string | null;
};

type StudioRow = {
  name: string | null;
  city: string | null;
  district: string | null;
  slug: string | null;
};

type ReviewRow = {
  id: string;
};

type BookingRow = {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_amount: number | null;
  status: string;
  payment_status: string;
  notes: string | null;
  created_at: string | null;
  studios: StudioRow | StudioRow[] | null;
  reviews: ReviewRow[] | null;
};

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

async function requireCustomerAccess() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
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
    user,
    profile: profileRow
  };
}

export default async function CustomerBookingsPage() {
  const { supabase, user } = await requireCustomerAccess();

  async function markBookingAsPaid(formData: FormData) {
    "use server";

    const { supabase, user } = await requireCustomerAccess();

    const bookingId = String(formData.get("booking_id") || "").trim();

    if (!bookingId) {
      throw new Error("Missing booking ID");
    }

    const { data: booking, error: bookingLookupError } = await supabase
      .from("bookings")
      .select("id, customer_auth_user_id, status, payment_status")
      .eq("id", bookingId)
      .eq("customer_auth_user_id", user.id)
      .maybeSingle();

    if (bookingLookupError) {
      throw new Error(bookingLookupError.message);
    }

    if (!booking) {
      throw new Error("Booking not found or not allowed.");
    }

    if (booking.status !== "confirmed") {
      throw new Error("Only confirmed bookings can be paid.");
    }

    if (booking.payment_status !== "unpaid") {
      throw new Error("This booking is not unpaid.");
    }

    const { error } = await supabase
      .from("bookings")
      .update({ payment_status: "paid" })
      .eq("id", bookingId)
      .eq("customer_auth_user_id", user.id)
      .eq("status", "confirmed")
      .eq("payment_status", "unpaid");

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/customer/bookings");
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
      ),
      reviews (
        id
      )
    `)
    .eq("customer_auth_user_id", user.id)
    .order("created_at", { ascending: false });

  const bookingsList = (bookings || []) as BookingRow[];

  if (error) {
    return (
      <div className="card">
        <span className="badge">
          <T en="Error" ar="خطأ" />
        </span>

        <h1>
          <T en="My Bookings" ar="حجوزاتي" />
        </h1>

        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Customer Area" ar="منطقة العميل" />
        </span>

        <h1>
          <T en="My Bookings" ar="حجوزاتي" />
        </h1>

        <p>
          <T
            en="Track your studio booking requests, payment status, and verified reviews."
            ar="تابع طلبات حجز الاستوديو، حالة الدفع، والتقييمات الموثقة."
          />
        </p>
      </div>

      <div className="actions" style={{ marginBottom: 24 }}>
        <Link href="/customer" className="btn btn-secondary">
          <T en="Back to Dashboard" ar="العودة إلى لوحة التحكم" />
        </Link>

        <Link href="/studios" className="btn">
          <T en="Browse Studios" ar="تصفح الاستوديوهات" />
        </Link>
      </div>

      <div className="grid">
        {bookingsList.length ? (
          bookingsList.map((booking: BookingRow) => {
            const studio = Array.isArray(booking.studios)
              ? booking.studios[0]
              : booking.studios;

            const reviews = Array.isArray(booking.reviews)
              ? booking.reviews
              : [];

            const hasReview = reviews.length > 0;

            const canPay =
              booking.status === "confirmed" &&
              booking.payment_status === "unpaid";

            const canReview =
              (booking.status === "confirmed" ||
                booking.status === "completed") &&
              booking.payment_status === "paid" &&
              !hasReview;

            return (
              <article className="card" key={booking.id}>
                <div className="actions" style={{ marginTop: 0 }}>
                  <span
                    className="badge"
                    style={badgeStyle("booking", booking.status)}
                  >
                    <T en="Booking:" ar="الحجز:" />{" "}
                    {statusLabel(booking.status)}
                  </span>

                  <span
                    className="badge"
                    style={badgeStyle("payment", booking.payment_status)}
                  >
                    <T en="Payment:" ar="الدفع:" />{" "}
                    {paymentLabel(booking.payment_status)}
                  </span>

                  {hasReview ? (
                    <span className="badge">
                      <T en="Reviewed" ar="تم التقييم" />
                    </span>
                  ) : null}
                </div>

                <h2>{studio?.name || "Studio"}</h2>

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

                {booking.status === "pending" ? (
                  <p>
                    <T
                      en="Your request is waiting for the studio owner to confirm."
                      ar="طلبك بانتظار تأكيد صاحب الاستوديو."
                    />
                  </p>
                ) : null}

                {booking.status === "confirmed" &&
                booking.payment_status === "unpaid" ? (
                  <p>
                    <T
                      en="Your booking is confirmed. Please complete the payment."
                      ar="تم تأكيد الحجز. يرجى إكمال الدفع."
                    />
                  </p>
                ) : null}

                {booking.status === "confirmed" &&
                booking.payment_status === "paid" ? (
                  <p>
                    <T
                      en="Your booking is confirmed and paid. You can write a verified review after your experience."
                      ar="تم تأكيد الحجز والدفع. يمكنك كتابة تقييم موثق بعد تجربتك."
                    />
                  </p>
                ) : null}

                {booking.status === "cancelled" ? (
                  <p>
                    <T
                      en="This booking was cancelled by the studio owner."
                      ar="تم إلغاء هذا الحجز من قبل صاحب الاستوديو."
                    />
                  </p>
                ) : null}

                {booking.notes ? (
                  <p>
                    <T en="Notes:" ar="ملاحظات:" /> {booking.notes}
                  </p>
                ) : null}

                <div className="actions">
                  {canPay ? (
                    <form action={markBookingAsPaid}>
                      <input
                        type="hidden"
                        name="booking_id"
                        value={booking.id}
                      />
                      <button className="btn" type="submit">
                        <T en="Pay Now" ar="ادفع الآن" />
                      </button>
                    </form>
                  ) : null}

                  {canReview ? (
                    <Link
                      href={`/customer/bookings/${booking.id}/review`}
                      className="btn"
                    >
                      <T en="Write Review" ar="اكتب تقييم" />
                    </Link>
                  ) : null}

                  {hasReview ? (
                    <span className="btn btn-secondary btn-small">
                      <T en="Review submitted" ar="تم إرسال التقييم" />
                    </span>
                  ) : null}

                  {studio?.slug ? (
                    <Link
                      href={`/studios/${studio.slug}`}
                      className="btn btn-secondary"
                    >
                      <T en="View studio" ar="عرض الاستوديو" />
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
                en="You have not created any booking requests yet."
                ar="لم تقم بإنشاء أي طلبات حجز حتى الآن."
              />
            </p>

            <Link href="/studios" className="btn">
              <T en="Browse studios" ar="تصفح الاستوديوهات" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
