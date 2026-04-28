import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireAdminRole } from "../../../lib/admin";
import { createAdminClient } from "../../../lib/supabase/admin";
import T from "../../../components/t";

type AdminRole = "super_admin" | "operations" | "support" | "finance";

type StudioRow = {
  id: string;
  name: string | null;
  slug: string | null;
  city: string | null;
  district: string | null;
  owner_auth_user_id: string | null;
};

type ReviewRow = {
  id: string;
};

type ReviewRequestRow = {
  id: string;
  status: string | null;
  email_sent_at: string | null;
};

type BookingRow = {
  id: string;
  studio_id: string;
  customer_auth_user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_amount: number | null;
  status: string;
  payment_status: string;
  settlement_status: string | null;
  payout_status: string | null;
  refund_status: string | null;
  platform_payment_id: string | null;
  payment_required_at: string | null;
  paid_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  notes: string | null;
  created_at: string | null;
  studios: StudioRow | StudioRow[] | null;
  reviews: ReviewRow[] | null;
  review_requests: ReviewRequestRow[] | null;
};

type CustomerProfileRow = {
  auth_user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: string | null;
  identity_type: string | null;
  identity_number: string | null;
  identity_locked: boolean | null;
};

type CustomerRecord = {
  user: {
    email?: string | null;
    phone?: string | null;
    user_metadata?: Record<string, any>;
  } | null;
  profile: CustomerProfileRow | null;
};

function cleanText(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

function money(value: number | null | undefined) {
  return `${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} SAR`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return "—";
  }
}

function badgeStyle(
  type: "booking" | "payment" | "settlement" | "payout" | "refund",
  status: string | null | undefined
) {
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

  if (type === "refund") {
    if (status === "none") return muted;
    if (status === "refunded" || status === "approved") return green;
    if (status === "failed" || status === "rejected") return red;
    return yellow;
  }

  return muted;
}

function getIdentityLabel(identityType: string | null | undefined) {
  if (identityType === "national_id") return "National ID / هوية وطنية";
  if (identityType === "iqama") return "Iqama / إقامة";
  if (identityType === "passport") return "Passport / جواز سفر";
  if (identityType === "gcc_id") return "GCC ID / هوية خليجية";
  return "—";
}

function getCustomerName(
  user: CustomerRecord["user"],
  profile: CustomerProfileRow | null
) {
  const metadata = user?.user_metadata || {};

  return (
    profile?.full_name ||
    metadata.full_name ||
    metadata.name ||
    metadata.display_name ||
    metadata.first_name ||
    user?.email ||
    "Customer"
  );
}

function getCustomerPhone(
  user: CustomerRecord["user"],
  profile: CustomerProfileRow | null
) {
  const metadata = user?.user_metadata || {};

  return (
    profile?.phone ||
    user?.phone ||
    metadata.phone ||
    metadata.phone_number ||
    metadata.mobile ||
    metadata.mobile_number ||
    metadata.whatsapp ||
    "—"
  );
}

function getCustomerIdentityType(
  user: CustomerRecord["user"],
  profile: CustomerProfileRow | null
) {
  const metadata = user?.user_metadata || {};

  return profile?.identity_type || metadata.identity_type || "";
}

function getCustomerIdentityNumber(
  user: CustomerRecord["user"],
  profile: CustomerProfileRow | null
) {
  const metadata = user?.user_metadata || {};

  return profile?.identity_number || metadata.identity_number || "—";
}

function normalizeStudio(studios: StudioRow | StudioRow[] | null) {
  return Array.isArray(studios) ? studios[0] : studios;
}

function normalizeReviews(reviews: ReviewRow[] | null) {
  return Array.isArray(reviews) ? reviews : [];
}

function normalizeReviewRequests(reviewRequests: ReviewRequestRow[] | null) {
  return Array.isArray(reviewRequests) ? reviewRequests : [];
}

export default async function AdminBookingsPage() {
  const { admin } = await requireAdminRole([
    "super_admin",
    "operations",
    "support",
    "finance"
  ]);

  const supabaseAdmin = createAdminClient();

  const adminRole = admin.admin_role as AdminRole;

  const canManageBookingStatus =
    adminRole === "super_admin" ||
    adminRole === "operations" ||
    adminRole === "support";

  const canManagePaymentStatus =
    adminRole === "super_admin" ||
    adminRole === "operations" ||
    adminRole === "finance";

  async function updateBookingStatus(formData: FormData) {
    "use server";

    await requireAdminRole(["super_admin", "operations", "support"]);

    const supabaseAdmin = createAdminClient();

    const bookingId = cleanText(formData.get("booking_id"));
    const status = cleanText(formData.get("status"));
    const studioSlug = cleanText(formData.get("studio_slug"));

    const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];

    if (!bookingId) {
      throw new Error("Missing booking ID.");
    }

    if (!allowedStatuses.includes(status)) {
      throw new Error("Invalid booking status.");
    }

    const { data: bookingData, error: bookingCheckError } = await supabaseAdmin
      .from("bookings")
      .select(`
        id,
        studio_id,
        customer_auth_user_id,
        total_amount,
        status,
        payment_status,
        settlement_status,
        payout_status,
        refund_status,
        platform_payment_id,
        paid_at,
        completed_at,
        cancelled_at,
        studios (
          id,
          slug,
          owner_auth_user_id
        )
      `)
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingCheckError) {
      throw new Error(bookingCheckError.message);
    }

    if (!bookingData) {
      throw new Error("Booking not found.");
    }

    const booking = bookingData as unknown as BookingRow;
    const studio = normalizeStudio(booking.studios);

    if (!studio?.owner_auth_user_id) {
      throw new Error("Studio owner is missing.");
    }

    const now = new Date().toISOString();

    const updatePayload: Record<string, any> = {
      status,
      updated_at: now
    };

    if (status === "pending") {
      if (booking.payment_status === "paid") {
        throw new Error("Paid bookings cannot be returned to pending.");
      }

      updatePayload.payment_status = "unpaid";
      updatePayload.payment_required_at = null;
      updatePayload.settlement_status = "not_ready";
      updatePayload.payout_status = "not_started";
      updatePayload.cancelled_at = null;
      updatePayload.completed_at = null;
    }

    if (status === "confirmed") {
      if (booking.payment_status !== "paid") {
        updatePayload.payment_status = "payment_required";
        updatePayload.payment_required_at = now;
        updatePayload.settlement_status = "not_ready";
        updatePayload.payout_status = "not_started";
      }

      updatePayload.cancelled_at = null;
    }

    if (status === "completed") {
      if (booking.payment_status !== "paid") {
        throw new Error("Only paid bookings can be completed.");
      }

      updatePayload.completed_at = booking.completed_at || now;
      updatePayload.settlement_status = "eligible";
      updatePayload.payout_status = booking.payout_status || "not_started";
      updatePayload.cancelled_at = null;
    }

    if (status === "cancelled") {
      updatePayload.cancelled_at = booking.cancelled_at || now;

      if (booking.payment_status === "paid") {
        updatePayload.settlement_status = "on_hold";
        updatePayload.payout_status = "not_started";
        updatePayload.refund_status = "requested";
      } else {
        updatePayload.settlement_status = "cancelled";
        updatePayload.payout_status = "cancelled";
      }
    }

    const { error } = await supabaseAdmin
      .from("bookings")
      .update(updatePayload)
      .eq("id", bookingId);

    if (error) {
      throw new Error(error.message);
    }

    if (status === "completed" && booking.payment_status === "paid") {
      await supabaseAdmin
        .from("platform_settlements")
        .update({
          settlement_status: "eligible",
          available_for_payout_at: now,
          updated_at: now
        })
        .eq("source_type", "studio_booking")
        .eq("source_id", bookingId)
        .eq("provider_type", "studio_owner")
        .eq("provider_id", studio.owner_auth_user_id)
        .in("settlement_status", ["pending", "not_ready"]);
    }

    if (status === "cancelled") {
      await supabaseAdmin
        .from("platform_settlements")
        .update({
          settlement_status:
            booking.payment_status === "paid" ? "on_hold" : "cancelled",
          hold_reason:
            booking.payment_status === "paid"
              ? "Booking cancelled after payment. Refund review required."
              : null,
          updated_at: now
        })
        .eq("source_type", "studio_booking")
        .eq("source_id", bookingId)
        .eq("provider_type", "studio_owner")
        .eq("provider_id", studio.owner_auth_user_id)
        .in("settlement_status", ["not_ready", "pending", "eligible"]);
    }

    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath("/admin");
    revalidatePath("/customer/bookings");
    revalidatePath("/owner/bookings");
    revalidatePath("/owner/finance");
    revalidatePath("/owner/payouts");
    revalidatePath("/admin/studio-payments");
    revalidatePath("/admin/studio-payouts");

    if (studioSlug) {
      revalidatePath(`/studios/${studioSlug}`);
    }
  }

  async function updatePaymentStatus(formData: FormData) {
    "use server";

    await requireAdminRole(["super_admin", "operations", "finance"]);

    const supabaseAdmin = createAdminClient();

    const bookingId = cleanText(formData.get("booking_id"));
    const paymentStatus = cleanText(formData.get("payment_status"));
    const studioSlug = cleanText(formData.get("studio_slug"));

    const allowedPaymentStatuses = [
      "unpaid",
      "payment_required",
      "paid",
      "failed",
      "refunded"
    ];

    if (!bookingId) {
      throw new Error("Missing booking ID.");
    }

    if (!allowedPaymentStatuses.includes(paymentStatus)) {
      throw new Error("Invalid payment status.");
    }

    const { data: bookingData, error: bookingCheckError } = await supabaseAdmin
      .from("bookings")
      .select(`
        id,
        studio_id,
        customer_auth_user_id,
        total_amount,
        status,
        payment_status,
        settlement_status,
        payout_status,
        refund_status,
        platform_payment_id,
        paid_at,
        studios (
          id,
          slug,
          owner_auth_user_id
        )
      `)
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingCheckError) {
      throw new Error(bookingCheckError.message);
    }

    if (!bookingData) {
      throw new Error("Booking not found.");
    }

    const booking = bookingData as unknown as BookingRow;
    const studio = normalizeStudio(booking.studios);

    if (!studio?.owner_auth_user_id) {
      throw new Error("Studio owner is missing.");
    }

    const now = new Date().toISOString();
    const totalAmount = Number(booking.total_amount || 0);

    if (paymentStatus === "paid") {
      if (booking.status !== "confirmed" && booking.status !== "completed") {
        throw new Error("Only confirmed or completed bookings can be marked as paid.");
      }

      if (totalAmount <= 0) {
        throw new Error("Booking amount must be greater than zero.");
      }

      let paymentId = booking.platform_payment_id;

      if (paymentId) {
        const { error: paymentUpdateError } = await supabaseAdmin
          .from("platform_payments")
          .update({
            payment_status: "paid",
            amount: totalAmount,
            tax_amount: 0,
            total_amount: totalAmount,
            currency: "SAR",
            gateway: "manual",
            gateway_reference: `manual-admin-payment-${booking.id}`,
            paid_at: now,
            failed_at: null,
            updated_at: now
          })
          .eq("id", paymentId);

        if (paymentUpdateError) {
          throw new Error(paymentUpdateError.message);
        }
      } else {
        const { data: payment, error: paymentInsertError } = await supabaseAdmin
          .from("platform_payments")
          .insert({
            source_type: "studio_booking",
            source_id: booking.id,
            customer_auth_user_id: booking.customer_auth_user_id,
            provider_type: "studio_owner",
            provider_id: studio.owner_auth_user_id,
            amount: totalAmount,
            tax_amount: 0,
            total_amount: totalAmount,
            currency: "SAR",
            payment_status: "paid",
            gateway: "manual",
            gateway_reference: `manual-admin-payment-${booking.id}`,
            paid_at: now,
            metadata: {
              created_from: "admin_bookings_mark_paid",
              booking_id: booking.id,
              studio_id: booking.studio_id
            }
          })
          .select("id")
          .single();

        if (paymentInsertError) {
          throw new Error(paymentInsertError.message);
        }

        paymentId = payment.id;
      }

      const { error: transactionError } = await supabaseAdmin
        .from("platform_payment_transactions")
        .insert({
          payment_id: paymentId,
          transaction_type: "payment",
          amount: totalAmount,
          status: "succeeded",
          gateway_reference: `manual-admin-payment-${booking.id}`,
          raw_response: {
            source: "manual_admin_mark_paid",
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
          paid_at: booking.paid_at || now,
          settlement_status:
            booking.status === "completed" ? "eligible" : "pending",
          payout_status: "not_started",
          updated_at: now
        })
        .eq("id", booking.id);

      if (bookingUpdateError) {
        throw new Error(bookingUpdateError.message);
      }
    }

    if (paymentStatus === "payment_required") {
      if (booking.payment_status === "paid") {
        throw new Error("Paid bookings cannot be changed to payment required.");
      }

      const { error } = await supabaseAdmin
        .from("bookings")
        .update({
          payment_status: "payment_required",
          payment_required_at: now,
          settlement_status: "not_ready",
          payout_status: "not_started",
          updated_at: now
        })
        .eq("id", booking.id);

      if (error) {
        throw new Error(error.message);
      }
    }

    if (paymentStatus === "unpaid") {
      if (booking.payment_status === "paid") {
        throw new Error("Paid bookings cannot be changed to unpaid. Use refund flow.");
      }

      const { error } = await supabaseAdmin
        .from("bookings")
        .update({
          payment_status: "unpaid",
          payment_required_at: null,
          settlement_status: "not_ready",
          payout_status: "not_started",
          updated_at: now
        })
        .eq("id", booking.id);

      if (error) {
        throw new Error(error.message);
      }
    }

    if (paymentStatus === "failed") {
      if (booking.platform_payment_id) {
        await supabaseAdmin
          .from("platform_payments")
          .update({
            payment_status: "failed",
            failed_at: now,
            updated_at: now
          })
          .eq("id", booking.platform_payment_id);
      }

      const { error } = await supabaseAdmin
        .from("bookings")
        .update({
          payment_status: "failed",
          settlement_status: "not_ready",
          payout_status: "not_started",
          updated_at: now
        })
        .eq("id", booking.id);

      if (error) {
        throw new Error(error.message);
      }
    }

    if (paymentStatus === "refunded") {
      if (!booking.platform_payment_id) {
        throw new Error("Cannot refund a booking without a payment record.");
      }

      await supabaseAdmin
        .from("platform_payments")
        .update({
          payment_status: "refunded",
          updated_at: now
        })
        .eq("id", booking.platform_payment_id);

      await supabaseAdmin.from("platform_payment_transactions").insert({
        payment_id: booking.platform_payment_id,
        transaction_type: "refund",
        amount: totalAmount,
        status: "succeeded",
        gateway_reference: `manual-admin-refund-${booking.id}`,
        raw_response: {
          source: "manual_admin_refund",
          booking_id: booking.id
        }
      });

      await supabaseAdmin.from("platform_refunds").insert({
        payment_id: booking.platform_payment_id,
        source_type: "studio_booking",
        source_id: booking.id,
        amount: totalAmount,
        reason: "Manual admin refund",
        status: "refunded",
        approved_by: null,
        gateway_refund_id: `manual-admin-refund-${booking.id}`
      });

      await supabaseAdmin
        .from("platform_settlements")
        .update({
          settlement_status: "cancelled",
          updated_at: now
        })
        .eq("source_type", "studio_booking")
        .eq("source_id", booking.id)
        .eq("provider_type", "studio_owner")
        .eq("provider_id", studio.owner_auth_user_id)
        .in("settlement_status", ["not_ready", "pending", "eligible", "on_hold"]);

      const { error } = await supabaseAdmin
        .from("bookings")
        .update({
          payment_status: "refunded",
          refund_status: "refunded",
          settlement_status: "cancelled",
          payout_status: "cancelled",
          updated_at: now
        })
        .eq("id", booking.id);

      if (error) {
        throw new Error(error.message);
      }
    }

    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath("/admin");
    revalidatePath("/customer/bookings");
    revalidatePath("/owner/bookings");
    revalidatePath("/owner/finance");
    revalidatePath("/owner/payouts");
    revalidatePath("/admin/studio-payments");
    revalidatePath("/admin/studio-payouts");

    if (studioSlug) {
      revalidatePath(`/studios/${studioSlug}`);
    }
  }

  const { data: bookingsData, error } = await supabaseAdmin
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
      refund_status,
      platform_payment_id,
      payment_required_at,
      paid_at,
      completed_at,
      cancelled_at,
      notes,
      created_at,
      studios (
        id,
        name,
        slug,
        city,
        district,
        owner_auth_user_id
      ),
      reviews (
        id
      ),
      review_requests (
        id,
        status,
        email_sent_at
      )
    `)
    .order("created_at", { ascending: false });

  const bookings = (bookingsData || []) as BookingRow[];

  const customerIds = Array.from(
    new Set(
      bookings
        .map((booking: BookingRow) => booking.customer_auth_user_id)
        .filter((customerId): customerId is string => Boolean(customerId))
    )
  );

  const customerResults = await Promise.all(
    customerIds.map(async (customerId: string) => {
      const [{ data: userData }, { data: profileData }] = await Promise.all([
        supabaseAdmin.auth.admin.getUserById(customerId),
        supabaseAdmin
          .from("profiles")
          .select(
            "auth_user_id,email,full_name,phone,role,identity_type,identity_number,identity_locked"
          )
          .eq("auth_user_id", customerId)
          .maybeSingle()
      ]);

      return {
        id: customerId,
        user: userData?.user || null,
        profile: (profileData || null) as CustomerProfileRow | null
      };
    })
  );

  const customerMap = new Map<string, CustomerRecord>(
    customerResults.map((item) => [
      item.id,
      {
        user: item.user,
        profile: item.profile
      }
    ])
  );

  const totalBookings = bookings.length;
  const paidBookings = bookings.filter(
    (booking: BookingRow) => booking.payment_status === "paid"
  ).length;
  const pendingBookings = bookings.filter(
    (booking: BookingRow) => booking.status === "pending"
  ).length;
  const confirmedBookings = bookings.filter(
    (booking: BookingRow) => booking.status === "confirmed"
  ).length;
  const completedBookings = bookings.filter(
    (booking: BookingRow) => booking.status === "completed"
  ).length;
  const cancelledBookings = bookings.filter(
    (booking: BookingRow) => booking.status === "cancelled"
  ).length;
  const paymentRequiredBookings = bookings.filter(
    (booking: BookingRow) => booking.payment_status === "payment_required"
  ).length;
  const eligibleSettlements = bookings.filter(
    (booking: BookingRow) => booking.settlement_status === "eligible"
  ).length;

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Admin" ar="الإدارة" />
        </span>

        <h1>
          <T en="Bookings Monitoring" ar="مراقبة الحجوزات" />
        </h1>

        <p>
          <T
            en="Track and manage booking status, payment status, customer details, identity details, review requests, and finance readiness."
            ar="تابع وأدر حالة الحجز، حالة الدفع، بيانات العميل، الهوية، طلبات التقييم، وجاهزية المالية."
          />
        </p>
      </div>

      <div className="actions" style={{ marginBottom: 24 }}>
        <Link href="/admin" className="btn btn-secondary">
          <T en="Back to Admin Dashboard" ar="العودة إلى لوحة الإدارة" />
        </Link>

        <Link href="/admin/studios" className="btn btn-secondary">
          <T en="Studios" ar="الاستوديوهات" />
        </Link>

        <Link href="/admin/reviews" className="btn btn-secondary">
          <T en="Reviews" ar="التقييمات" />
        </Link>

        <Link href="/admin/studio-payments" className="btn btn-secondary">
          <T en="Studio Payments" ar="مدفوعات الاستوديو" />
        </Link>

        <Link href="/admin/studio-payouts" className="btn btn-secondary">
          <T en="Studio Payouts" ar="بياوت الاستوديو" />
        </Link>
      </div>

      <div className="admin-kpi-grid">
        <div className="card admin-kpi-card">
          <span>
            <T en="Total Bookings" ar="إجمالي الحجوزات" />
          </span>
          <strong>{totalBookings}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Payment Required" ar="الدفع مطلوب" />
          </span>
          <strong>{paymentRequiredBookings}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Paid Bookings" ar="الحجوزات المدفوعة" />
          </span>
          <strong>{paidBookings}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Pending" ar="معلقة" />
          </span>
          <strong>{pendingBookings}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Confirmed" ar="مؤكدة" />
          </span>
          <strong>{confirmedBookings}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Completed" ar="مكتملة" />
          </span>
          <strong>{completedBookings}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Eligible Settlement" ar="تسويات مؤهلة" />
          </span>
          <strong>{eligibleSettlements}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Cancelled" ar="ملغية" />
          </span>
          <strong>{cancelledBookings}</strong>
        </div>
      </div>

      <div style={{ height: 24 }} />

      {error ? (
        <div className="card">
          <span className="badge">
            <T en="Error" ar="خطأ" />
          </span>
          <p>{error.message}</p>
        </div>
      ) : null}

      <div className="card">
        <span className="badge">
          <T en="All Bookings" ar="كل الحجوزات" />
        </span>

        <h2>
          <T en="Booking list" ar="قائمة الحجوزات" />
        </h2>

        <p>
          <T
            en="Confirming a booking now requests payment. Marking a booking as paid creates a platform payment record."
            ar="تأكيد الحجز الآن يطلب الدفع. وتحديد الحجز كمدفوع ينشئ سجل دفع في النظام المالي."
          />
        </p>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <T en="Studio" ar="الاستوديو" />
                </th>
                <th>
                  <T en="Customer" ar="العميل" />
                </th>
                <th>
                  <T en="Identity" ar="الهوية" />
                </th>
                <th>
                  <T en="Date / Time" ar="التاريخ / الوقت" />
                </th>
                <th>
                  <T en="Amount" ar="المبلغ" />
                </th>
                <th>
                  <T en="Status" ar="الحالة" />
                </th>
                <th>
                  <T en="Finance" ar="المالية" />
                </th>
                <th>
                  <T en="Review" ar="التقييم" />
                </th>
                <th>
                  <T en="Actions" ar="الإجراءات" />
                </th>
              </tr>
            </thead>

            <tbody>
              {bookings.length ? (
                bookings.map((booking: BookingRow) => {
                  const studio = normalizeStudio(booking.studios);
                  const reviews = normalizeReviews(booking.reviews);
                  const reviewRequests = normalizeReviewRequests(
                    booking.review_requests
                  );

                  const studioSlug = studio?.slug || "";
                  const customerRecord = customerMap.get(
                    booking.customer_auth_user_id
                  );

                  const customer = customerRecord?.user || null;
                  const profile = customerRecord?.profile || null;

                  const customerName = getCustomerName(customer, profile);
                  const customerPhone = getCustomerPhone(customer, profile);
                  const customerEmail = profile?.email || customer?.email || "—";
                  const identityType = getCustomerIdentityType(
                    customer,
                    profile
                  );
                  const identityNumber = getCustomerIdentityNumber(
                    customer,
                    profile
                  );

                  return (
                    <tr key={booking.id}>
                      <td>
                        <strong>{studio?.name || "Studio"}</strong>
                        <p className="admin-muted-line">
                          {studio?.city || ""}
                          {studio?.district ? ` · ${studio.district}` : ""}
                        </p>
                      </td>

                      <td>
                        <strong>{customerName}</strong>
                        <p className="admin-muted-line">{customerEmail}</p>
                        <p className="admin-muted-line">
                          <T en="Phone:" ar="الجوال:" /> {customerPhone}
                        </p>
                      </td>

                      <td>
                        <strong>{getIdentityLabel(identityType)}</strong>
                        <p className="admin-muted-line">
                          <T en="No:" ar="رقم:" /> {identityNumber}
                        </p>
                        {profile?.identity_locked ? (
                          <span className="badge">
                            <T en="Locked" ar="مقفلة" />
                          </span>
                        ) : (
                          <span className="badge">
                            <T en="Not locked" ar="غير مقفلة" />
                          </span>
                        )}
                      </td>

                      <td>
                        <strong>{booking.booking_date}</strong>
                        <p className="admin-muted-line">
                          {booking.start_time} - {booking.end_time}
                        </p>
                        <p className="admin-muted-line">
                          <T en="Created:" ar="تم الإنشاء:" />{" "}
                          {formatDate(booking.created_at)}
                        </p>
                      </td>

                      <td>{money(booking.total_amount)}</td>

                      <td>
                        <div className="admin-badge-stack">
                          <span
                            className="badge"
                            style={badgeStyle("booking", booking.status)}
                          >
                            {booking.status}
                          </span>

                          <span
                            className="badge"
                            style={badgeStyle(
                              "payment",
                              booking.payment_status
                            )}
                          >
                            {booking.payment_status}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="admin-badge-stack">
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

                          <span
                            className="badge"
                            style={badgeStyle(
                              "refund",
                              booking.refund_status || "none"
                            )}
                          >
                            <T en="Refund:" ar="الاسترجاع:" />{" "}
                            {booking.refund_status || "none"}
                          </span>
                        </div>

                        {booking.platform_payment_id ? (
                          <p className="admin-muted-line">
                            <T en="Payment ID:" ar="رقم الدفع:" />{" "}
                            <small>{booking.platform_payment_id}</small>
                          </p>
                        ) : null}

                        {booking.payment_required_at ? (
                          <p className="admin-muted-line">
                            <T en="Requested:" ar="طلب الدفع:" />{" "}
                            {formatDate(booking.payment_required_at)}
                          </p>
                        ) : null}

                        {booking.paid_at ? (
                          <p className="admin-muted-line">
                            <T en="Paid:" ar="تم الدفع:" />{" "}
                            {formatDate(booking.paid_at)}
                          </p>
                        ) : null}
                      </td>

                      <td>
                        <div className="admin-badge-stack">
                          {reviews.length ? (
                            <span className="badge">
                              <T en="Reviewed" ar="تم التقييم" />
                            </span>
                          ) : (
                            <span className="badge">
                              <T en="No review" ar="لا يوجد تقييم" />
                            </span>
                          )}

                          {reviewRequests.length ? (
                            <span className="badge">
                              <T en="Request:" ar="طلب:" />{" "}
                              {reviewRequests[0].status}
                            </span>
                          ) : (
                            <span className="badge">
                              <T en="No request" ar="لا يوجد طلب" />
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="admin-studio-actions">
                          <div className="actions">
                            <Link
                              href={`/admin/bookings/${booking.id}`}
                              className="btn btn-small"
                            >
                              <T en="Details" ar="التفاصيل" />
                            </Link>

                            {studioSlug ? (
                              <Link
                                href={`/studios/${studioSlug}`}
                                className="btn btn-secondary btn-small"
                              >
                                <T en="Studio" ar="الاستوديو" />
                              </Link>
                            ) : null}
                          </div>

                          {canManageBookingStatus ? (
                            <div className="admin-inline-action-grid">
                              {booking.status !== "confirmed" ? (
                                <form action={updateBookingStatus}>
                                  <input
                                    type="hidden"
                                    name="booking_id"
                                    value={booking.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="studio_slug"
                                    value={studioSlug}
                                  />
                                  <input
                                    type="hidden"
                                    name="status"
                                    value="confirmed"
                                  />
                                  <button
                                    className="btn btn-small"
                                    type="submit"
                                  >
                                    <T en="Confirm" ar="تأكيد" />
                                  </button>
                                </form>
                              ) : null}

                              {booking.status !== "completed" ? (
                                <form action={updateBookingStatus}>
                                  <input
                                    type="hidden"
                                    name="booking_id"
                                    value={booking.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="studio_slug"
                                    value={studioSlug}
                                  />
                                  <input
                                    type="hidden"
                                    name="status"
                                    value="completed"
                                  />
                                  <button
                                    className="btn btn-small"
                                    type="submit"
                                  >
                                    <T en="Complete" ar="إكمال" />
                                  </button>
                                </form>
                              ) : null}

                              {booking.status !== "pending" ? (
                                <form action={updateBookingStatus}>
                                  <input
                                    type="hidden"
                                    name="booking_id"
                                    value={booking.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="studio_slug"
                                    value={studioSlug}
                                  />
                                  <input
                                    type="hidden"
                                    name="status"
                                    value="pending"
                                  />
                                  <button
                                    className="btn btn-secondary btn-small"
                                    type="submit"
                                  >
                                    <T en="Pending" ar="تعليق" />
                                  </button>
                                </form>
                              ) : null}

                              {booking.status !== "cancelled" ? (
                                <form action={updateBookingStatus}>
                                  <input
                                    type="hidden"
                                    name="booking_id"
                                    value={booking.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="studio_slug"
                                    value={studioSlug}
                                  />
                                  <input
                                    type="hidden"
                                    name="status"
                                    value="cancelled"
                                  />
                                  <button
                                    className="btn btn-secondary btn-small"
                                    type="submit"
                                  >
                                    <T en="Cancel" ar="إلغاء" />
                                  </button>
                                </form>
                              ) : null}
                            </div>
                          ) : null}

                          {canManagePaymentStatus ? (
                            <div className="admin-inline-action-grid">
                              {booking.payment_status !== "paid" ? (
                                <form action={updatePaymentStatus}>
                                  <input
                                    type="hidden"
                                    name="booking_id"
                                    value={booking.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="studio_slug"
                                    value={studioSlug}
                                  />
                                  <input
                                    type="hidden"
                                    name="payment_status"
                                    value="paid"
                                  />
                                  <button
                                    className="btn btn-small"
                                    type="submit"
                                  >
                                    <T en="Mark Paid" ar="تحديد مدفوع" />
                                  </button>
                                </form>
                              ) : null}

                              {booking.payment_status !== "payment_required" &&
                              booking.payment_status !== "paid" ? (
                                <form action={updatePaymentStatus}>
                                  <input
                                    type="hidden"
                                    name="booking_id"
                                    value={booking.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="studio_slug"
                                    value={studioSlug}
                                  />
                                  <input
                                    type="hidden"
                                    name="payment_status"
                                    value="payment_required"
                                  />
                                  <button
                                    className="btn btn-secondary btn-small"
                                    type="submit"
                                  >
                                    <T en="Request Payment" ar="طلب الدفع" />
                                  </button>
                                </form>
                              ) : null}

                              {booking.payment_status !== "unpaid" &&
                              booking.payment_status !== "paid" ? (
                                <form action={updatePaymentStatus}>
                                  <input
                                    type="hidden"
                                    name="booking_id"
                                    value={booking.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="studio_slug"
                                    value={studioSlug}
                                  />
                                  <input
                                    type="hidden"
                                    name="payment_status"
                                    value="unpaid"
                                  />
                                  <button
                                    className="btn btn-secondary btn-small"
                                    type="submit"
                                  >
                                    <T en="Unpaid" ar="غير مدفوع" />
                                  </button>
                                </form>
                              ) : null}

                              {booking.payment_status !== "failed" &&
                              booking.payment_status !== "paid" ? (
                                <form action={updatePaymentStatus}>
                                  <input
                                    type="hidden"
                                    name="booking_id"
                                    value={booking.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="studio_slug"
                                    value={studioSlug}
                                  />
                                  <input
                                    type="hidden"
                                    name="payment_status"
                                    value="failed"
                                  />
                                  <button
                                    className="btn btn-secondary btn-small"
                                    type="submit"
                                  >
                                    <T en="Failed" ar="فشل الدفع" />
                                  </button>
                                </form>
                              ) : null}

                              {booking.payment_status === "paid" ? (
                                <form action={updatePaymentStatus}>
                                  <input
                                    type="hidden"
                                    name="booking_id"
                                    value={booking.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="studio_slug"
                                    value={studioSlug}
                                  />
                                  <input
                                    type="hidden"
                                    name="payment_status"
                                    value="refunded"
                                  />
                                  <button
                                    className="btn btn-secondary btn-small"
                                    type="submit"
                                  >
                                    <T en="Refund" ar="استرجاع" />
                                  </button>
                                </form>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9}>
                    <T en="No bookings found." ar="لا توجد حجوزات." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
