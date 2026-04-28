import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminRole } from "../../../../lib/admin";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { createAuditLog } from "../../../../lib/audit";
import T from "../../../../components/t";

type AdminRole = "super_admin" | "operations" | "support" | "finance";

type StudioRow = {
  id: string;
  name: string | null;
  slug: string | null;
  city: string | null;
  district: string | null;
  address: string | null;
  owner_auth_user_id: string | null;
};

type ReviewRow = {
  id: string;
  rating: number | null;
  cleanliness_rating: number | null;
  equipment_rating: number | null;
  sound_quality_rating: number | null;
  communication_rating: number | null;
  value_rating: number | null;
  comment: string | null;
  status: string | null;
  created_at: string | null;
};

type ReviewRequestRow = {
  id: string;
  status: string | null;
  email_sent_at: string | null;
  expires_at: string | null;
  review_submitted_at: string | null;
  review_token: string | null;
  created_at: string | null;
};

type BookingDetailsRow = {
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
  admin_notes: string | null;
  admin_notes_updated_at: string | null;
  admin_notes_updated_by: string | null;
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
  identity_created_at: string | null;
  updated_at: string | null;
};

type PlatformPaymentRow = {
  id: string;
  source_type: string;
  source_id: string;
  customer_auth_user_id: string;
  provider_type: string;
  provider_id: string;
  amount: number | null;
  tax_amount: number | null;
  total_amount: number | null;
  currency: string | null;
  payment_status: string;
  gateway: string | null;
  gateway_payment_id: string | null;
  gateway_reference: string | null;
  paid_at: string | null;
  failed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type PlatformSettlementRow = {
  id: string;
  source_type: string;
  source_id: string;
  provider_type: string;
  provider_id: string;
  payment_id: string | null;
  gross_amount: number | null;
  commission_amount: number | null;
  tax_amount: number | null;
  net_amount: number | null;
  currency: string | null;
  settlement_status: string;
  available_for_payout_at: string | null;
  hold_reason: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type PlatformRefundRow = {
  id: string;
  payment_id: string | null;
  source_type: string;
  source_id: string;
  amount: number | null;
  reason: string | null;
  status: string;
  gateway_refund_id: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type AuditLogRow = {
  id: string;
  actor_email: string | null;
  action: string;
  old_values: unknown;
  new_values: unknown;
  metadata: unknown;
  created_at: string | null;
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

function statusStyle(status: string | null | undefined) {
  if (
    status === "approved" ||
    status === "paid" ||
    status === "paid_out" ||
    status === "eligible" ||
    status === "completed" ||
    status === "confirmed"
  ) {
    return {
      background: "rgba(30, 215, 96, 0.18)",
      color: "#1ed760",
      border: "1px solid rgba(30, 215, 96, 0.45)"
    };
  }

  if (
    status === "failed" ||
    status === "cancelled" ||
    status === "rejected" ||
    status === "refunded"
  ) {
    return {
      background: "rgba(255, 75, 75, 0.18)",
      color: "#ff4b4b",
      border: "1px solid rgba(255, 75, 75, 0.45)"
    };
  }

  if (
    status === "pending" ||
    status === "pending_approval" ||
    status === "payment_required" ||
    status === "unpaid" ||
    status === "not_ready" ||
    status === "included_in_payout" ||
    status === "on_hold" ||
    status === "requested"
  ) {
    return {
      background: "rgba(255, 193, 7, 0.18)",
      color: "#ffc107",
      border: "1px solid rgba(255, 193, 7, 0.45)"
    };
  }

  return {
    background: "rgba(255, 255, 255, 0.12)",
    color: "rgba(255, 255, 255, 0.78)",
    border: "1px solid rgba(255, 255, 255, 0.22)"
  };
}

function getIdentityLabel(identityType: string | null | undefined) {
  if (identityType === "national_id") return "National ID / هوية وطنية";
  if (identityType === "iqama") return "Iqama / إقامة";
  if (identityType === "passport") return "Passport / جواز سفر";
  if (identityType === "gcc_id") return "GCC ID / هوية خليجية";
  return "—";
}

function getCustomerName(user: any, profile: CustomerProfileRow | null) {
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

function getCustomerPhone(user: any, profile: CustomerProfileRow | null) {
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

function getCustomerIdentityType(user: any, profile: CustomerProfileRow | null) {
  const metadata = user?.user_metadata || {};
  return profile?.identity_type || metadata.identity_type || "";
}

function getCustomerIdentityNumber(
  user: any,
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

export default async function AdminBookingDetailsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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

  const canManageAdminNotes =
    adminRole === "super_admin" ||
    adminRole === "operations" ||
    adminRole === "support" ||
    adminRole === "finance";

  async function updateBookingStatus(formData: FormData) {
    "use server";

    const { user, admin } = await requireAdminRole([
      "super_admin",
      "operations",
      "support"
    ]);

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

    const { data: bookingData, error: readError } = await supabaseAdmin
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

    if (readError) {
      throw new Error(readError.message);
    }

    if (!bookingData) {
      throw new Error("Booking not found.");
    }

    const booking = bookingData as unknown as BookingDetailsRow;
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

    await createAuditLog({
      actorAuthUserId: user.id,
      actorEmail: user.email,
      action: "booking_status_updated",
      entityType: "booking",
      entityId: bookingId,
      oldValues: {
        status: booking.status,
        payment_status: booking.payment_status,
        settlement_status: booking.settlement_status
      },
      newValues: updatePayload,
      metadata: {
        admin_role: admin.admin_role,
        studio_slug: studioSlug,
        studio_id: booking.studio_id,
        customer_auth_user_id: booking.customer_auth_user_id
      }
    });

    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath("/admin/bookings");
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

    const { user, admin } = await requireAdminRole([
      "super_admin",
      "operations",
      "finance"
    ]);

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

    const booking = bookingData as unknown as BookingDetailsRow;
    const studio = normalizeStudio(booking.studios);

    if (!studio?.owner_auth_user_id) {
      throw new Error("Studio owner is missing.");
    }

    const now = new Date().toISOString();
    const totalAmount = Number(booking.total_amount || 0);

    if (paymentStatus === "paid") {
      if (booking.status !== "confirmed" && booking.status !== "completed") {
        throw new Error(
          "Only confirmed or completed bookings can be marked as paid."
        );
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
              created_from: "admin_booking_details_mark_paid",
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
            source: "manual_admin_booking_details_mark_paid",
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

      await createAuditLog({
        actorAuthUserId: user.id,
        actorEmail: user.email,
        action: "booking_payment_marked_paid",
        entityType: "booking",
        entityId: booking.id,
        oldValues: {
          payment_status: booking.payment_status,
          platform_payment_id: booking.platform_payment_id
        },
        newValues: {
          payment_status: "paid",
          platform_payment_id: paymentId
        },
        metadata: {
          admin_role: admin.admin_role,
          studio_id: booking.studio_id,
          owner_auth_user_id: studio.owner_auth_user_id
        }
      });
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
        throw new Error(
          "Paid bookings cannot be changed to unpaid. Use refund flow."
        );
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
          source: "manual_admin_booking_details_refund",
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
        requested_by: user.id,
        approved_by: user.id,
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
        .in("settlement_status", [
          "not_ready",
          "pending",
          "eligible",
          "on_hold"
        ]);

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

      await createAuditLog({
        actorAuthUserId: user.id,
        actorEmail: user.email,
        action: "booking_payment_refunded",
        entityType: "booking",
        entityId: booking.id,
        oldValues: {
          payment_status: booking.payment_status,
          refund_status: booking.refund_status,
          settlement_status: booking.settlement_status
        },
        newValues: {
          payment_status: "refunded",
          refund_status: "refunded",
          settlement_status: "cancelled"
        },
        metadata: {
          admin_role: admin.admin_role,
          studio_id: booking.studio_id,
          owner_auth_user_id: studio.owner_auth_user_id
        }
      });
    }

    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath("/admin/bookings");
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

  async function updateAdminNotes(formData: FormData) {
    "use server";

    const { user, admin } = await requireAdminRole([
      "super_admin",
      "operations",
      "support",
      "finance"
    ]);

    const supabaseAdmin = createAdminClient();

    const bookingId = cleanText(formData.get("booking_id"));
    const adminNotes = cleanText(formData.get("admin_notes"));

    if (!bookingId) {
      throw new Error("Missing booking ID.");
    }

    const { data: oldBooking, error: readError } = await supabaseAdmin
      .from("bookings")
      .select("id,admin_notes,studio_id,customer_auth_user_id")
      .eq("id", bookingId)
      .maybeSingle();

    if (readError) {
      throw new Error(readError.message);
    }

    if (!oldBooking) {
      throw new Error("Booking not found.");
    }

    const { error } = await supabaseAdmin
      .from("bookings")
      .update({
        admin_notes: adminNotes || null,
        admin_notes_updated_at: new Date().toISOString(),
        admin_notes_updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq("id", bookingId);

    if (error) {
      throw new Error(error.message);
    }

    await createAuditLog({
      actorAuthUserId: user.id,
      actorEmail: user.email,
      action: "booking_admin_notes_updated",
      entityType: "booking",
      entityId: bookingId,
      oldValues: {
        admin_notes: oldBooking.admin_notes
      },
      newValues: {
        admin_notes: adminNotes || null
      },
      metadata: {
        admin_role: admin.admin_role,
        studio_id: oldBooking.studio_id,
        customer_auth_user_id: oldBooking.customer_auth_user_id
      }
    });

    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
  }

  const { data: bookingData, error } = await supabaseAdmin
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
      admin_notes,
      admin_notes_updated_at,
      admin_notes_updated_by,
      created_at,
      studios (
        id,
        name,
        slug,
        city,
        district,
        address,
        owner_auth_user_id
      ),
      reviews (
        id,
        rating,
        cleanliness_rating,
        equipment_rating,
        sound_quality_rating,
        communication_rating,
        value_rating,
        comment,
        status,
        created_at
      ),
      review_requests (
        id,
        status,
        email_sent_at,
        expires_at,
        review_submitted_at,
        review_token,
        created_at
      )
    `)
    .eq("id", id)
    .single();

  if (error || !bookingData) {
    notFound();
  }

  const booking = bookingData as BookingDetailsRow;

  const studio = normalizeStudio(booking.studios);
  const reviews = normalizeReviews(booking.reviews);
  const reviewRequests = normalizeReviewRequests(booking.review_requests);

  const { data: userData } = await supabaseAdmin.auth.admin.getUserById(
    booking.customer_auth_user_id
  );

  const { data: profileData } = await supabaseAdmin
    .from("profiles")
    .select(
      "auth_user_id,email,full_name,phone,role,identity_type,identity_number,identity_locked,identity_created_at,updated_at"
    )
    .eq("auth_user_id", booking.customer_auth_user_id)
    .maybeSingle();

  const profile = (profileData || null) as CustomerProfileRow | null;
  const customer = userData?.user || null;

  const customerName = getCustomerName(customer, profile);
  const customerEmail = profile?.email || customer?.email || "—";
  const customerPhone = getCustomerPhone(customer, profile);
  const identityType = getCustomerIdentityType(customer, profile);
  const identityNumber = getCustomerIdentityNumber(customer, profile);
  const studioSlug = studio?.slug || "";

  let payment: PlatformPaymentRow | null = null;

  if (booking.platform_payment_id) {
    const { data: paymentData } = await supabaseAdmin
      .from("platform_payments")
      .select("*")
      .eq("id", booking.platform_payment_id)
      .maybeSingle();

    payment = (paymentData || null) as PlatformPaymentRow | null;
  } else {
    const { data: paymentData } = await supabaseAdmin
      .from("platform_payments")
      .select("*")
      .eq("source_type", "studio_booking")
      .eq("source_id", booking.id)
      .maybeSingle();

    payment = (paymentData || null) as PlatformPaymentRow | null;
  }

  const { data: settlementData } = await supabaseAdmin
    .from("platform_settlements")
    .select("*")
    .eq("source_type", "studio_booking")
    .eq("source_id", booking.id)
    .maybeSingle();

  const settlement = (settlementData || null) as PlatformSettlementRow | null;

  const { data: refundsData } = await supabaseAdmin
    .from("platform_refunds")
    .select("*")
    .eq("source_type", "studio_booking")
    .eq("source_id", booking.id)
    .order("created_at", { ascending: false });

  const refunds = (refundsData || []) as PlatformRefundRow[];

  let adminNotesUpdatedByEmail = "—";

  if (booking.admin_notes_updated_by) {
    const { data: adminNoteUser } = await supabaseAdmin.auth.admin.getUserById(
      booking.admin_notes_updated_by
    );

    adminNotesUpdatedByEmail = adminNoteUser?.user?.email || "—";
  }

  const { data: auditLogsData } = await supabaseAdmin
    .from("audit_logs")
    .select("id,actor_email,action,old_values,new_values,metadata,created_at")
    .eq("entity_type", "booking")
    .eq("entity_id", booking.id)
    .order("created_at", { ascending: false })
    .limit(12);

  const auditLogs = (auditLogsData || []) as AuditLogRow[];
  const latestReviewRequest = reviewRequests[0];

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Admin Booking Details" ar="تفاصيل الحجز للإدارة" />
        </span>

        <h1>
          <T en="Booking Details" ar="تفاصيل الحجز" />
        </h1>

        <p>
          <T
            en="Full booking view with customer, identity, studio, payment, settlement, payout, refund, review, internal notes, and audit history."
            ar="عرض كامل للحجز مع بيانات العميل، الهوية، الاستوديو، الدفع، التسوية، البياوت، الاسترجاع، التقييم، الملاحظات الداخلية، وسجل التغييرات."
          />
        </p>
      </div>

      <div className="actions" style={{ marginBottom: 24 }}>
        <Link href="/admin/bookings" className="btn btn-secondary">
          <T en="Back to Bookings" ar="العودة إلى الحجوزات" />
        </Link>

        <Link href="/admin/studio-payments" className="btn btn-secondary">
          <T en="Studio Payments" ar="مدفوعات الاستوديو" />
        </Link>

        <Link href="/admin/studio-payouts" className="btn btn-secondary">
          <T en="Studio Payouts" ar="بياوت الاستوديو" />
        </Link>

        {studioSlug ? (
          <Link href={`/studios/${studioSlug}`} className="btn btn-secondary">
            <T en="View Studio" ar="عرض الاستوديو" />
          </Link>
        ) : null}
      </div>

      <div className="admin-detail-grid">
        <div className="card">
          <span className="badge">
            <T en="Booking" ar="الحجز" />
          </span>

          <h2>{booking.booking_date}</h2>

          <p>
            <T en="Time:" ar="الوقت:" />{" "}
            <strong>
              {booking.start_time} - {booking.end_time}
            </strong>
          </p>

          <p>
            <T en="Amount:" ar="المبلغ:" />{" "}
            <strong>{money(booking.total_amount)}</strong>
          </p>

          <div className="admin-badge-stack">
            <span className="badge" style={statusStyle(booking.status)}>
              {booking.status}
            </span>

            <span className="badge" style={statusStyle(booking.payment_status)}>
              {booking.payment_status}
            </span>
          </div>

          <p>
            <T en="Created:" ar="تم الإنشاء:" /> {formatDate(booking.created_at)}
          </p>

          <p>
            <T en="Customer notes:" ar="ملاحظات العميل:" />{" "}
            {booking.notes || "—"}
          </p>
        </div>

        <div className="card">
          <span className="badge">
            <T en="Finance" ar="المالية" />
          </span>

          <div className="admin-badge-stack">
            <span className="badge" style={statusStyle(booking.settlement_status)}>
              <T en="Settlement:" ar="التسوية:" />{" "}
              {booking.settlement_status || "not_ready"}
            </span>

            <span className="badge" style={statusStyle(booking.payout_status)}>
              <T en="Payout:" ar="البياوت:" />{" "}
              {booking.payout_status || "not_started"}
            </span>

            <span className="badge" style={statusStyle(booking.refund_status)}>
              <T en="Refund:" ar="الاسترجاع:" />{" "}
              {booking.refund_status || "none"}
            </span>
          </div>

          <p>
            <T en="Platform payment ID:" ar="رقم الدفع:" />{" "}
            <small>{booking.platform_payment_id || "—"}</small>
          </p>

          <p>
            <T en="Payment required:" ar="طلب الدفع:" />{" "}
            {formatDate(booking.payment_required_at)}
          </p>

          <p>
            <T en="Paid:" ar="تم الدفع:" /> {formatDate(booking.paid_at)}
          </p>

          <p>
            <T en="Completed:" ar="تم الإكمال:" />{" "}
            {formatDate(booking.completed_at)}
          </p>

          <p>
            <T en="Cancelled:" ar="تم الإلغاء:" />{" "}
            {formatDate(booking.cancelled_at)}
          </p>
        </div>

        <div className="card">
          <span className="badge">
            <T en="Customer" ar="العميل" />
          </span>

          <h2>{customerName}</h2>

          <p>
            <T en="Email:" ar="الإيميل:" /> <strong>{customerEmail}</strong>
          </p>

          <p>
            <T en="Phone:" ar="الجوال:" /> <strong>{customerPhone}</strong>
          </p>

          <p>
            <T en="User ID:" ar="رقم المستخدم:" />{" "}
            <small>{booking.customer_auth_user_id}</small>
          </p>
        </div>

        <div className="card">
          <span className="badge">
            <T en="Identity" ar="الهوية" />
          </span>

          <h2>{getIdentityLabel(identityType)}</h2>

          <p>
            <T en="Identity number:" ar="رقم الهوية:" />{" "}
            <strong>{identityNumber}</strong>
          </p>

          <p>
            <T en="Status:" ar="الحالة:" />{" "}
            {profile?.identity_locked ? (
              <span className="badge">
                <T en="Locked" ar="مقفلة" />
              </span>
            ) : (
              <span className="badge">
                <T en="Not locked" ar="غير مقفلة" />
              </span>
            )}
          </p>

          <p>
            <T en="Created:" ar="تم الإنشاء:" />{" "}
            {formatDate(profile?.identity_created_at)}
          </p>
        </div>

        <div className="card">
          <span className="badge">
            <T en="Studio" ar="الاستوديو" />
          </span>

          <h2>{studio?.name || "Studio"}</h2>

          <p>
            {studio?.city || ""}
            {studio?.district ? ` · ${studio.district}` : ""}
          </p>

          <p>{studio?.address || "—"}</p>

          <p>
            <T en="Owner ID:" ar="رقم المالك:" />{" "}
            <small>{studio?.owner_auth_user_id || "—"}</small>
          </p>
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="card">
        <span className="badge">
          <T en="Actions" ar="الإجراءات" />
        </span>

        <h2>
          <T en="Manage booking" ar="إدارة الحجز" />
        </h2>

        <div className="admin-action-section">
          {canManageBookingStatus ? (
            <div>
              <h3>
                <T en="Booking status" ar="حالة الحجز" />
              </h3>

              <div className="admin-inline-action-grid">
                {["pending", "confirmed", "completed", "cancelled"].map(
                  (status: string) =>
                    booking.status !== status ? (
                      <form action={updateBookingStatus} key={status}>
                        <input type="hidden" name="booking_id" value={booking.id} />
                        <input
                          type="hidden"
                          name="studio_slug"
                          value={studioSlug}
                        />
                        <input type="hidden" name="status" value={status} />
                        <button
                          className={
                            status === "confirmed" || status === "completed"
                              ? "btn btn-small"
                              : "btn btn-secondary btn-small"
                          }
                          type="submit"
                        >
                          {status}
                        </button>
                      </form>
                    ) : null
                )}
              </div>
            </div>
          ) : null}

          {canManagePaymentStatus ? (
            <div>
              <h3>
                <T en="Payment status" ar="حالة الدفع" />
              </h3>

              <div className="admin-inline-action-grid">
                {booking.payment_status !== "paid" ? (
                  <form action={updatePaymentStatus}>
                    <input type="hidden" name="booking_id" value={booking.id} />
                    <input type="hidden" name="studio_slug" value={studioSlug} />
                    <input type="hidden" name="payment_status" value="paid" />
                    <button className="btn btn-small" type="submit">
                      <T en="Mark Paid" ar="تحديد مدفوع" />
                    </button>
                  </form>
                ) : null}

                {booking.payment_status !== "payment_required" &&
                booking.payment_status !== "paid" ? (
                  <form action={updatePaymentStatus}>
                    <input type="hidden" name="booking_id" value={booking.id} />
                    <input type="hidden" name="studio_slug" value={studioSlug} />
                    <input
                      type="hidden"
                      name="payment_status"
                      value="payment_required"
                    />
                    <button className="btn btn-secondary btn-small" type="submit">
                      <T en="Request Payment" ar="طلب الدفع" />
                    </button>
                  </form>
                ) : null}

                {booking.payment_status !== "unpaid" &&
                booking.payment_status !== "paid" ? (
                  <form action={updatePaymentStatus}>
                    <input type="hidden" name="booking_id" value={booking.id} />
                    <input type="hidden" name="studio_slug" value={studioSlug} />
                    <input type="hidden" name="payment_status" value="unpaid" />
                    <button className="btn btn-secondary btn-small" type="submit">
                      <T en="Unpaid" ar="غير مدفوع" />
                    </button>
                  </form>
                ) : null}

                {booking.payment_status !== "failed" &&
                booking.payment_status !== "paid" ? (
                  <form action={updatePaymentStatus}>
                    <input type="hidden" name="booking_id" value={booking.id} />
                    <input type="hidden" name="studio_slug" value={studioSlug} />
                    <input type="hidden" name="payment_status" value="failed" />
                    <button className="btn btn-secondary btn-small" type="submit">
                      <T en="Failed" ar="فشل الدفع" />
                    </button>
                  </form>
                ) : null}

                {booking.payment_status === "paid" ? (
                  <form action={updatePaymentStatus}>
                    <input type="hidden" name="booking_id" value={booking.id} />
                    <input type="hidden" name="studio_slug" value={studioSlug} />
                    <input type="hidden" name="payment_status" value="refunded" />
                    <button className="btn btn-secondary btn-small" type="submit">
                      <T en="Refund" ar="استرجاع" />
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="card admin-notes-card">
        <span className="badge">
          <T en="Internal Admin Notes" ar="ملاحظات الإدارة الداخلية" />
        </span>

        <h2>
          <T en="Private notes" ar="ملاحظات خاصة" />
        </h2>

        <p>
          <T
            en="These notes are visible only to admin users. Customers and studio owners cannot see them."
            ar="هذه الملاحظات تظهر فقط لمستخدمي الإدارة. العميل وصاحب الاستوديو لا يستطيعان رؤيتها."
          />
        </p>

        {canManageAdminNotes ? (
          <form className="form" action={updateAdminNotes}>
            <input type="hidden" name="booking_id" value={booking.id} />

            <label>
              <T en="Admin notes" ar="ملاحظات الإدارة" />
            </label>

            <textarea
              className="input"
              name="admin_notes"
              rows={6}
              defaultValue={booking.admin_notes || ""}
              placeholder="Write internal notes about this booking..."
            />

            <button className="btn" type="submit">
              <T en="Save Admin Notes" ar="حفظ ملاحظات الإدارة" />
            </button>
          </form>
        ) : null}

        <div className="admin-notes-meta">
          <p>
            <T en="Last updated:" ar="آخر تحديث:" />{" "}
            {formatDate(booking.admin_notes_updated_at)}
          </p>

          <p>
            <T en="Updated by:" ar="تم التحديث بواسطة:" />{" "}
            {adminNotesUpdatedByEmail}
          </p>
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="admin-two-column">
        <div className="card">
          <span className="badge">
            <T en="Payment Record" ar="سجل الدفع" />
          </span>

          {payment ? (
            <>
              <h2>{payment.payment_status}</h2>

              <p>
                <T en="Amount:" ar="المبلغ:" />{" "}
                <strong>{money(payment.total_amount)}</strong>
              </p>

              <p>
                <T en="Gateway:" ar="بوابة الدفع:" /> {payment.gateway || "—"}
              </p>

              <p>
                <T en="Reference:" ar="المرجع:" />{" "}
                {payment.gateway_reference || "—"}
              </p>

              <p>
                <T en="Paid:" ar="تم الدفع:" /> {formatDate(payment.paid_at)}
              </p>

              <p>
                <T en="Created:" ar="تم الإنشاء:" />{" "}
                {formatDate(payment.created_at)}
              </p>
            </>
          ) : (
            <p>
              <T
                en="No platform payment record exists yet."
                ar="لا يوجد سجل دفع في النظام المالي حتى الآن."
              />
            </p>
          )}
        </div>

        <div className="card">
          <span className="badge">
            <T en="Settlement" ar="التسوية" />
          </span>

          {settlement ? (
            <>
              <h2>{settlement.settlement_status}</h2>

              <p>
                <T en="Gross:" ar="الإجمالي:" />{" "}
                <strong>{money(settlement.gross_amount)}</strong>
              </p>

              <p>
                <T en="Commission:" ar="العمولة:" />{" "}
                <strong>{money(settlement.commission_amount)}</strong>
              </p>

              <p>
                <T en="Net:" ar="الصافي:" />{" "}
                <strong>{money(settlement.net_amount)}</strong>
              </p>

              <p>
                <T en="Available for payout:" ar="متاح للبياوت:" />{" "}
                {formatDate(settlement.available_for_payout_at)}
              </p>

              {settlement.hold_reason ? (
                <p>
                  <T en="Hold reason:" ar="سبب التعليق:" />{" "}
                  {settlement.hold_reason}
                </p>
              ) : null}
            </>
          ) : (
            <p>
              <T
                en="No settlement has been created yet."
                ar="لم يتم إنشاء تسوية حتى الآن."
              />
            </p>
          )}
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="admin-two-column">
        <div className="card">
          <span className="badge">
            <T en="Review Request" ar="طلب التقييم" />
          </span>

          {latestReviewRequest ? (
            <>
              <h2>{latestReviewRequest.status}</h2>

              <p>
                <T en="Email sent:" ar="تم إرسال الإيميل:" />{" "}
                {formatDate(latestReviewRequest.email_sent_at)}
              </p>

              <p>
                <T en="Expires:" ar="ينتهي:" />{" "}
                {formatDate(latestReviewRequest.expires_at)}
              </p>

              <p>
                <T en="Submitted:" ar="تم الإرسال:" />{" "}
                {formatDate(latestReviewRequest.review_submitted_at)}
              </p>
            </>
          ) : (
            <p>
              <T
                en="No review request has been created for this booking yet."
                ar="لم يتم إنشاء طلب تقييم لهذا الحجز حتى الآن."
              />
            </p>
          )}
        </div>

        <div className="card">
          <span className="badge">
            <T en="Review" ar="التقييم" />
          </span>

          {reviews.length ? (
            reviews.map((review: ReviewRow) => (
              <div key={review.id} className="admin-list-row">
                <div>
                  <strong>{review.rating} ★</strong>
                  <p>{review.comment || "No written comment"}</p>
                  <p className="admin-muted-line">{review.status}</p>
                </div>
              </div>
            ))
          ) : (
            <p>
              <T en="No review submitted yet." ar="لم يتم إرسال تقييم بعد." />
            </p>
          )}
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="card">
        <span className="badge">
          <T en="Refunds" ar="الاسترجاعات" />
        </span>

        <h2>
          <T en="Refund activity" ar="نشاط الاسترجاع" />
        </h2>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <T en="Amount" ar="المبلغ" />
                </th>
                <th>
                  <T en="Status" ar="الحالة" />
                </th>
                <th>
                  <T en="Reason" ar="السبب" />
                </th>
                <th>
                  <T en="Reference" ar="المرجع" />
                </th>
                <th>
                  <T en="Created" ar="تم الإنشاء" />
                </th>
              </tr>
            </thead>

            <tbody>
              {refunds.length ? (
                refunds.map((refund: PlatformRefundRow) => (
                  <tr key={refund.id}>
                    <td>{money(refund.amount)}</td>

                    <td>
                      <span className="badge" style={statusStyle(refund.status)}>
                        {refund.status}
                      </span>
                    </td>

                    <td>{refund.reason || "—"}</td>

                    <td>{refund.gateway_refund_id || "—"}</td>

                    <td>{formatDate(refund.created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <T en="No refunds found." ar="لا توجد استرجاعات." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="card">
        <span className="badge">
          <T en="Audit Log" ar="سجل التغييرات" />
        </span>

        <h2>
          <T en="Recent changes" ar="آخر التغييرات" />
        </h2>

        <div className="admin-list">
          {auditLogs.length ? (
            auditLogs.map((log: AuditLogRow) => (
              <div className="admin-list-row" key={log.id}>
                <div>
                  <strong>{log.action}</strong>
                  <p>{log.actor_email || "Unknown user"}</p>
                  <p className="admin-muted-line">{formatDate(log.created_at)}</p>
                </div>

                <div>
                  <pre className="audit-json">
                    {JSON.stringify(
                      {
                        old: log.old_values,
                        new: log.new_values
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            ))
          ) : (
            <p>
              <T en="No audit activity yet." ar="لا يوجد سجل تغييرات حتى الآن." />
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
