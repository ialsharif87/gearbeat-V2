import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import T from "../../../components/t";

type ProfileRow = {
  id: string;
  auth_user_id: string;
  role: string | null;
  account_status: string | null;
};

type StudioRow = {
  id?: string | null;
  name: string | null;
  city: string | null;
  district: string | null;
  slug: string | null;
  owner_auth_user_id?: string | null;
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
  settlement_status: string | null;
  payout_status: string | null;
  platform_payment_id: string | null;
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
  if (status === "payment_required") return <T en="Payment Required" ar="الدفع مطلوب" />;
  if (status === "paid") return <T en="Paid" ar="مدفوع" />;
  if (status === "failed") return <T en="Failed" ar="فشل الدفع" />;
  if (status === "refunded") return <T en="Refunded" ar="مسترد" />;
  if (status === "partially_refunded") return <T en="Partially Refunded" ar="مسترد جزئيًا" />;
  return <T en="Unpaid" ar="غير مدفوع" />;
}

function badgeStyle(type: "booking" | "payment" | "settlement", status: string | null | undefined) {
  const green = {
    background: "rgba(103, 197, 135, 0.18)",
    color: "var(--gb-success)",
    border: "1px solid rgba(103, 197, 135, 0.45)"
  };

  const yellow = {
    background: "rgba(255, 193, 7, 0.18)",
    color: "var(--gb-warning)",
    border: "1px solid rgba(255, 193, 7, 0.45)"
  };

  const red = {
    background: "rgba(226, 109, 90, 0.18)",
    color: "var(--gb-danger)",
    border: "1px solid rgba(226, 109, 90, 0.45)"
  };

  const muted = {
    background: "rgba(255, 255, 255, 0.12)",
    color: "rgba(255, 255, 255, 0.78)",
    border: "1px solid rgba(255, 255, 255, 0.22)"
  };

  if (type === "booking") {
    if (status === "confirmed" || status === "completed") return green;
    if (status === "cancelled") return red;
    return yellow;
  }

  if (type === "payment") {
    if (status === "paid") return green;
    if (status === "unpaid" || status === "payment_required" || status === "failed") return red;
    if (status === "refunded" || status === "partially_refunded") return yellow;
    return muted;
  }

  if (status === "eligible" || status === "paid_out") return green;
  if (status === "cancelled" || status === "on_hold") return red;
  if (status === "pending" || status === "not_ready" || status === "included_in_payout") return yellow;

  return muted;
}

function normalizeStudio(studios: StudioRow | StudioRow[] | null) {
  return Array.isArray(studios) ? studios[0] : studios;
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

export default async function CustomerBookingsPage() {
  const { supabase, user } = await requireCustomerAccess();

  async function markBookingAsPaid(formData: FormData) {
    "use server";

    const { supabaseAdmin, user } = await requireCustomerAccess();

    const bookingId = String(formData.get("booking_id") || "").trim();

    if (!bookingId) {
      throw new Error("Missing booking ID.");
    }

    const { data: bookingData, error: bookingLookupError } = await supabaseAdmin
      .from("bookings")
      .select(`
        id,
        studio_id,
        customer_auth_user_id,
        booking_date,
        start_time,
        end_time,
        total_amount,
        status,
        payment_status,
        settlement_status,
        payout_status,
        platform_payment_id,
        paid_at,
        studios (
          id,
          name,
          slug,
          owner_auth_user_id
        )
      `)
      .eq("id", bookingId)
      .eq("customer_auth_user_id", user.id)
      .maybeSingle();

    if (bookingLookupError) {
      throw new Error(bookingLookupError.message);
    }

    if (!bookingData) {
      throw new Error("Booking not found or not allowed.");
    }

    const booking = bookingData as {
      id: string;
      studio_id: string;
      customer_auth_user_id: string;
      booking_date: string | null;
      start_time: string | null;
      end_time: string | null;
      total_amount: number | null;
      status: string;
      payment_status: string;
      settlement_status: string | null;
      payout_status: string | null;
      platform_payment_id: string | null;
      paid_at: string | null;
      studios: StudioRow | StudioRow[] | null;
    };

    const studio = normalizeStudio(booking.studios);

    if (!studio?.owner_auth_user_id) {
      throw new Error("Studio owner is missing.");
    }

    if (booking.status !== "confirmed") {
      throw new Error("Only confirmed bookings can be paid.");
    }

    if (!["unpaid", "payment_required", "failed"].includes(booking.payment_status)) {
      throw new Error("This booking is not ready for payment.");
    }

    const totalAmount = Number(booking.total_amount || 0);

    if (totalAmount <= 0) {
      throw new Error("Booking amount must be greater than zero.");
    }

    const now = new Date().toISOString();

    let paymentId = booking.platform_payment_id;

    if (paymentId) {
      const { data: existingPayment, error: existingPaymentError } =
        await supabaseAdmin
          .from("platform_payments")
          .select("id, payment_status")
          .eq("id", paymentId)
          .maybeSingle();

      if (existingPaymentError) {
        throw new Error(existingPaymentError.message);
      }

      if (existingPayment?.payment_status === "paid") {
        throw new Error("This booking is already paid.");
      }

      const { error: paymentUpdateError } = await supabaseAdmin
        .from("platform_payments")
        .update({
          payment_status: "paid",
          amount: totalAmount,
          tax_amount: 0,
          total_amount: totalAmount,
          currency: "SAR",
          gateway: "manual",
          gateway_reference: `manual-customer-payment-${booking.id}`,
          paid_at: now,
          failed_at: null,
          updated_at: now
        })
        .eq("id", paymentId);

      if (paymentUpdateError) {
        throw new Error(paymentUpdateError.message);
      }
    } else {
      const { data: newPayment, error: paymentInsertError } = await supabaseAdmin
        .from("platform_payments")
        .insert({
          source_type: "studio_booking",
          source_id: booking.id,
          customer_auth_user_id: user.id,
          provider_type: "studio_owner",
          provider_id: studio.owner_auth_user_id,
          amount: totalAmount,
          tax_amount: 0,
          total_amount: totalAmount,
          currency: "SAR",
          payment_status: "paid",
          gateway: "manual",
          gateway_reference: `manual-customer-payment-${booking.id}`,
          paid_at: now,
          metadata: {
            created_from: "customer_pay_now",
            booking_id: booking.id,
            studio_id: booking.studio_id
          }
        })
        .select("id")
        .single();

      if (paymentInsertError) {
        throw new Error(paymentInsertError.message);
      }

      paymentId = newPayment.id;
    }

    const { error: transactionError } = await supabaseAdmin
      .from("platform_payment_transactions")
      .insert({
        payment_id: paymentId,
        transaction_type: "payment",
        amount: totalAmount,
        status: "succeeded",
        gateway_reference: `manual-customer-payment-${booking.id}`,
        raw_response: {
          source: "manual_customer_pay_now",
          booking_id: booking.id
        }
      });

    if (transactionError) {
      throw new Error(transactionError.message);
    }

    const { error: bookingUpdateError } = await supabaseAdmin
      .from("bookings")
      .update({
        payment_status: "paid",
        platform_payment_id: paymentId,
        paid_at: now,
        settlement_status: "pending",
        payout_status: "not_started",
        updated_at: now
      })
      .eq("id", booking.id)
      .eq("customer_auth_user_id", user.id)
      .eq("status", "confirmed");

    if (bookingUpdateError) {
      throw new Error(bookingUpdateError.message);
    }

    // --- COMMISSION CALCULATION ---
    // 1. Get default commission rate
    const { data: globalSettings } = await supabaseAdmin
      .from("commission_settings")
      .select("default_percentage")
      .limit(1)
      .maybeSingle();

    const defaultCommission = globalSettings?.default_percentage || 15;

    // 2. Check for custom studio commission rate
    const { data: customCommission } = await supabaseAdmin
      .from("studio_commissions")
      .select("commission_percentage")
      .eq("studio_id", booking.studio_id)
      .maybeSingle();

    const commissionPercentage = customCommission?.commission_percentage ?? defaultCommission;

    // 3. Calculate amounts
    const commissionAmount = Number(((totalAmount * commissionPercentage) / 100).toFixed(2));
    const studioNetAmount = Number((totalAmount - commissionAmount).toFixed(2));

    // 4. Record commission in booking_commissions table
    await supabaseAdmin
      .from("booking_commissions")
      .insert({
        booking_id: booking.id,
        studio_id: booking.studio_id,
        booking_subtotal: totalAmount,
        commission_percentage: commissionPercentage,
        commission_amount: commissionAmount,
        studio_net_amount: studioNetAmount
      });
    // --- END COMMISSION CALCULATION ---

    revalidatePath("/customer/bookings");
    revalidatePath("/owner/bookings");
    revalidatePath("/owner/finance");
    revalidatePath("/owner/payouts");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/studio-payments");
    revalidatePath("/admin/studio-payouts");
    revalidatePath("/owner/commission");

    if (studio.slug) {
      revalidatePath(`/studios/${studio.slug}`);
    }
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
      settlement_status,
      payout_status,
      platform_payment_id,
      notes,
      created_at,
      studios (
        id,
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
            const studio = normalizeStudio(booking.studios);

            const reviews = Array.isArray(booking.reviews)
              ? booking.reviews
              : [];

            const hasReview = reviews.length > 0;

            const canPay =
              booking.status === "confirmed" &&
              ["unpaid", "payment_required", "failed"].includes(
                booking.payment_status
              );

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

                  {booking.payment_status === "paid" ? (
                    <span
                      className="badge"
                      style={badgeStyle(
                        "settlement",
                        booking.settlement_status || "pending"
                      )}
                    >
                      <T en="Settlement:" ar="التسوية:" />{" "}
                      {booking.settlement_status || "pending"}
                    </span>
                  ) : null}

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
                booking.payment_status !== "paid" ? (
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

                {booking.status === "completed" &&
                booking.payment_status === "paid" ? (
                  <p>
                    <T
                      en="Your booking is completed and paid."
                      ar="تم إكمال الحجز والدفع."
                    />
                  </p>
                ) : null}

                {booking.status === "cancelled" ? (
                  <p>
                    <T
                      en="This booking was cancelled."
                      ar="تم إلغاء هذا الحجز."
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
