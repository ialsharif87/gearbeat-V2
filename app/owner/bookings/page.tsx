import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import T from "../../../components/t";

type ProfileRow = {
  id: string;
  auth_user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: string | null;
  account_status: string | null;
};

type OwnerStudioIdRow = {
  id: string;
};

type StudioRow = {
  id: string;
  name: string | null;
  slug: string | null;
  city: string | null;
  district: string | null;
  owner_auth_user_id: string | null;
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
  payment_required_at: string | null;
  paid_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  refund_status: string | null;
  notes: string | null;
  created_at: string | null;
  studio_id: string;
  studios: StudioRow | StudioRow[] | null;
};

function statusLabel(status: string) {
  if (status === "confirmed") return <T en="Confirmed" ar="مؤكد" />;
  if (status === "cancelled") return <T en="Cancelled" ar="ملغي" />;
  if (status === "completed") return <T en="Completed" ar="مكتمل" />;
  return <T en="Pending" ar="قيد الانتظار" />;
}

function paymentLabel(status: string) {
  if (status === "payment_required") {
    return <T en="Payment Required" ar="الدفع مطلوب" />;
  }

  if (status === "paid") return <T en="Paid" ar="مدفوع" />;
  if (status === "failed") return <T en="Failed" ar="فشل الدفع" />;
  if (status === "refunded") return <T en="Refunded" ar="مسترد" />;
  if (status === "partially_refunded") {
    return <T en="Partially Refunded" ar="مسترد جزئيًا" />;
  }

  return <T en="Unpaid" ar="غير مدفوع" />;
}

function badgeStyle(
  type: "booking" | "payment" | "settlement" | "payout",
  status: string | null | undefined
) {
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

    if (
      status === "unpaid" ||
      status === "payment_required" ||
      status === "failed"
    ) {
      return red;
    }

    if (status === "refunded" || status === "partially_refunded") return yellow;

    return muted;
  }

  if (type === "settlement") {
    if (status === "eligible" || status === "paid_out") return green;
    if (status === "cancelled" || status === "on_hold") return red;

    if (
      status === "pending" ||
      status === "not_ready" ||
      status === "included_in_payout"
    ) {
      return yellow;
    }

    return muted;
  }

  if (type === "payout") {
    if (status === "paid") return green;
    if (status === "failed" || status === "cancelled") return red;

    if (
      status === "pending" ||
      status === "included_in_payout" ||
      status === "not_started"
    ) {
      return yellow;
    }

    return muted;
  }

  return muted;
}

function normalizeStudio(studios: StudioRow | StudioRow[] | null) {
  return Array.isArray(studios) ? studios[0] : studios;
}

async function requireOwnerOnly() {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?account=owner");
  }

  const { data: adminUser } = await supabaseAdmin
    .from("admin_users")
    .select("id, auth_user_id, status")
    .eq("auth_user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (adminUser) {
    redirect("/admin");
  }

  const { data: profileData, error } = await supabaseAdmin
    .from("profiles")
    .select("id, auth_user_id, email, full_name, phone, role, account_status")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const profile = profileData as ProfileRow | null;

  if (!profile) {
    redirect("/login?account=owner");
  }

  if (profile.account_status === "deleted") {
    redirect("/forbidden");
  }

  if (profile.account_status === "pending_deletion") {
    redirect("/account/delete");
  }

  if (profile.account_status && profile.account_status !== "active") {
    redirect("/login?account=owner");
  }

  if (profile.role === "admin") {
    redirect("/admin");
  }

  if (profile.role === "customer") {
    redirect("/customer");
  }

  if (profile.role !== "owner") {
    redirect("/forbidden");
  }

  return {
    user,
    profile,
    supabaseAdmin
  };
}

export default async function OwnerBookingsPage() {
  const { user, supabaseAdmin } = await requireOwnerOnly();

  async function updateBookingStatus(formData: FormData) {
    "use server";

    const { user, supabaseAdmin } = await requireOwnerOnly();

    const bookingId = String(formData.get("booking_id") || "").trim();
    const status = String(formData.get("status") || "").trim();

    if (!bookingId || !["confirmed", "cancelled"].includes(status)) {
      throw new Error("Invalid booking update.");
    }

    const { data: bookingData, error: bookingReadError } = await supabaseAdmin
      .from("bookings")
      .select(`
        id,
        status,
        payment_status,
        settlement_status,
        payout_status,
        platform_payment_id,
        studio_id,
        studios (
          id,
          slug,
          owner_auth_user_id
        )
      `)
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingReadError) {
      throw new Error(bookingReadError.message);
    }

    if (!bookingData) {
      throw new Error("Booking not found.");
    }

    const booking = bookingData as {
      id: string;
      status: string;
      payment_status: string;
      settlement_status: string | null;
      payout_status: string | null;
      platform_payment_id: string | null;
      studio_id: string;
      studios: StudioRow | StudioRow[] | null;
    };

    const studio = normalizeStudio(booking.studios);

    if (!studio || studio.owner_auth_user_id !== user.id) {
      throw new Error("You do not have permission to update this booking.");
    }

    if (booking.status !== "pending") {
      throw new Error("Only pending bookings can be confirmed or cancelled by the owner.");
    }

    if (booking.platform_payment_id) {
      throw new Error("This booking already has a payment record and cannot be updated from here.");
    }

    const now = new Date().toISOString();

    if (status === "confirmed") {
      const { error } = await supabaseAdmin
        .from("bookings")
        .update({
          status: "confirmed",
          payment_status: "payment_required",
          payment_required_at: now,
          settlement_status: "not_ready",
          payout_status: "not_started",
          updated_at: now
        })
        .eq("id", bookingId)
        .eq("studio_id", booking.studio_id)
        .eq("status", "pending");

      if (error) {
        throw new Error(error.message);
      }
    }

    if (status === "cancelled") {
      const { error } = await supabaseAdmin
        .from("bookings")
        .update({
          status: "cancelled",
          cancelled_at: now,
          settlement_status: "cancelled",
          payout_status: "cancelled",
          updated_at: now
        })
        .eq("id", bookingId)
        .eq("studio_id", booking.studio_id)
        .eq("status", "pending");

      if (error) {
        throw new Error(error.message);
      }
    }

    revalidatePath("/owner/bookings");
    revalidatePath("/owner/finance");
    revalidatePath("/owner/payouts");
    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath("/admin/studio-payments");
    revalidatePath("/admin/studio-payouts");
    revalidatePath("/customer/bookings");

    if (studio.slug) {
      revalidatePath(`/studios/${studio.slug}`);
    }
  }

  const { data: ownerStudioRows, error: ownerStudiosError } = await supabaseAdmin
    .from("studios")
    .select("id")
    .eq("owner_auth_user_id", user.id);

  if (ownerStudiosError) {
    return (
      <div className="card">
        <span className="badge">
          <T en="Error" ar="خطأ" />
        </span>
        <h1>
          <T en="Owner Bookings" ar="حجوزات الاستوديو" />
        </h1>
        <p>{ownerStudiosError.message}</p>
      </div>
    );
  }

  const ownerStudios = (ownerStudioRows || []) as OwnerStudioIdRow[];
  const ownerStudioIds = ownerStudios.map(
    (studio: OwnerStudioIdRow) => studio.id
  );

  let bookingsList: BookingRow[] = [];
  let bookingsErrorMessage = "";

  if (ownerStudioIds.length > 0) {
    const { data: bookingsData, error: bookingsError } = await supabaseAdmin
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
        payment_required_at,
        paid_at,
        completed_at,
        cancelled_at,
        refund_status,
        notes,
        created_at,
        studio_id,
        studios (
          id,
          name,
          slug,
          city,
          district,
          owner_auth_user_id
        )
      `)
      .in("studio_id", ownerStudioIds)
      .order("created_at", { ascending: false });

    if (bookingsError) {
      bookingsErrorMessage = bookingsError.message;
    } else {
      bookingsList = (bookingsData || []) as BookingRow[];
    }
  }

  if (bookingsErrorMessage) {
    return (
      <div className="card">
        <span className="badge">
          <T en="Error" ar="خطأ" />
        </span>
        <h1>
          <T en="Owner Bookings" ar="حجوزات الاستوديو" />
        </h1>
        <p>{bookingsErrorMessage}</p>
      </div>
    );
  }

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Studio Owner" ar="مالك الاستوديو" />
        </span>

        <h1>
          <T en="Bookings" ar="الحجوزات" />
        </h1>

        <p>
          <T
            en="Review, confirm, or cancel booking requests for your studios only."
            ar="راجع طلبات الحجز الخاصة باستوديوهاتك فقط وقم بتأكيدها أو إلغائها."
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

        <Link href="/owner/onboarding" className="btn btn-secondary">
          <T en="Business Onboarding" ar="بيانات النشاط" />
        </Link>

        <Link href="/owner/finance" className="btn btn-secondary">
          <T en="Finance" ar="المالية" />
        </Link>

        <Link href="/owner/payouts" className="btn btn-secondary">
          <T en="Payouts" ar="البياوت" />
        </Link>
      </div>

      <div className="grid">
        {bookingsList.length ? (
          bookingsList.map((booking: BookingRow) => {
            const studio = normalizeStudio(booking.studios);

            if (!studio || studio.owner_auth_user_id !== user.id) {
              return null;
            }

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

                  <span
                    className="badge"
                    style={badgeStyle(
                      "settlement",
                      booking.settlement_status || "not_ready"
                    )}
                  >
                    <T en="Settlement:" ar="التسوية:" />{" "}
                    {booking.settlement_status || "not_ready"}
                  </span>

                  <span
                    className="badge"
                    style={badgeStyle(
                      "payout",
                      booking.payout_status || "not_started"
                    )}
                  >
                    <T en="Payout:" ar="البياوت:" />{" "}
                    {booking.payout_status || "not_started"}
                  </span>
                </div>

                <h2>{studio.name || "Studio booking"}</h2>

                <p>
                  {studio.city || ""}
                  {studio.district ? ` · ${studio.district}` : ""}
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

                {booking.payment_required_at ? (
                  <p>
                    <T en="Payment requested at:" ar="تم طلب الدفع بتاريخ:" />{" "}
                    {new Date(booking.payment_required_at).toLocaleString()}
                  </p>
                ) : null}

                {booking.paid_at ? (
                  <p>
                    <T en="Paid at:" ar="تم الدفع بتاريخ:" />{" "}
                    {new Date(booking.paid_at).toLocaleString()}
                  </p>
                ) : null}

                {booking.completed_at ? (
                  <p>
                    <T en="Completed at:" ar="تم الإكمال بتاريخ:" />{" "}
                    {new Date(booking.completed_at).toLocaleString()}
                  </p>
                ) : null}

                {booking.cancelled_at ? (
                  <p>
                    <T en="Cancelled at:" ar="تم الإلغاء بتاريخ:" />{" "}
                    {new Date(booking.cancelled_at).toLocaleString()}
                  </p>
                ) : null}

                {booking.platform_payment_id ? (
                  <p>
                    <T en="Payment record:" ar="سجل الدفع:" />{" "}
                    <small>{booking.platform_payment_id}</small>
                  </p>
                ) : null}

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
                          <T en="Confirm & Request Payment" ar="تأكيد وطلب الدفع" />
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

                  {studio.id ? (
                    <Link
                      href={`/owner/studios/${studio.id}/manage`}
                      className="btn btn-small"
                    >
                      <T en="Manage Studio" ar="إدارة الاستوديو" />
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
