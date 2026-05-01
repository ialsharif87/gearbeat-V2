import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function createManualReference() {
  return `MANUAL-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}

function getSafeMetadata(value: unknown) {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<string, unknown>;
  }

  return {};
}

function buildSourcePaymentPayload({
  session,
  transaction,
  manualReference,
}: {
  session: any;
  transaction: any;
  manualReference: string;
}) {
  return {
    payment_status: "paid",
    checkout_session_id: session.id,
    payment_transaction_id: transaction.id,
    payment_provider: "manual",
    payment_method: session.payment_method || "manual",
    provider_checkout_id: session.provider_checkout_id || null,
    provider_payment_id: manualReference,
    installment_provider: null,
    coupon_id: session.coupon_id || null,
    coupon_code: session.coupon_code || null,
    coupon_discount_amount: Number(session.coupon_discount_amount || 0),
    wallet_credit_used: Number(session.wallet_credit_used || 0),
    loyalty_points_redeemed: Number(session.loyalty_points_redeemed || 0),
  };
}

async function updateOwnedSourceRecord({
  supabaseAdmin,
  tableName,
  sourceId,
  authUserId,
  payload,
}: {
  supabaseAdmin: ReturnType<typeof createAdminClient>;
  tableName: string;
  sourceId: string | null;
  authUserId: string;
  payload: Record<string, unknown>;
}) {
  if (!sourceId) {
    return {
      updated: false,
      tableName,
      reason: "Missing source_id.",
    };
  }

  const ownerColumns = [
    "customer_auth_user_id",
    "auth_user_id",
    "user_id",
  ];

  let lastError = "";

  for (const ownerColumn of ownerColumns) {
    const { data, error } = await supabaseAdmin
      .from(tableName)
      .update(payload)
      .eq("id", sourceId)
      .eq(ownerColumn, authUserId)
      .select("id")
      .maybeSingle();

    if (error) {
      lastError = error.message;
      console.warn(
        `Could not update ${tableName} using owner column ${ownerColumn}:`,
        error.message
      );
      continue;
    }

    if (data?.id) {
      return {
        updated: true,
        tableName,
        ownerColumn,
        sourceId: data.id,
      };
    }
  }

  return {
    updated: false,
    tableName,
    reason:
      "No owned source record matched, or supported owner column was not found.",
    lastError,
  };
}

async function linkPaymentToSource({
  supabaseAdmin,
  session,
  transaction,
  authUserId,
  manualReference,
}: {
  supabaseAdmin: ReturnType<typeof createAdminClient>;
  session: any;
  transaction: any;
  authUserId: string;
  manualReference: string;
}) {
  const sourceType = String(session.source_type || "").trim();
  const sourceId = session.source_id || null;

  const payload = buildSourcePaymentPayload({
    session,
    transaction,
    manualReference,
  });

  if (sourceType === "studio_booking" || sourceType === "booking") {
    return updateOwnedSourceRecord({
      supabaseAdmin,
      tableName: "bookings",
      sourceId,
      authUserId,
      payload,
    });
  }

  if (
    sourceType === "marketplace_order" ||
    sourceType === "order" ||
    sourceType === "marketplace"
  ) {
    return updateOwnedSourceRecord({
      supabaseAdmin,
      tableName: "marketplace_orders",
      sourceId,
      authUserId,
      payload,
    });
  }

  return {
    updated: false,
    tableName: null,
    reason: `Source type ${sourceType || "unknown"} is not linked to a payment status update yet.`,
  };
}

async function redeemCouponAfterPayment({
  supabaseAdmin,
  session,
  authUserId,
}: {
  supabaseAdmin: ReturnType<typeof createAdminClient>;
  session: any;
  authUserId: string;
}) {
  const couponCode = String(session.coupon_code || "").trim();

  if (!couponCode) {
    return {
      redeemed: false,
      skipped: true,
      reason: "No coupon code on checkout session.",
    };
  }

  const couponId = session.coupon_id || null;
  const sourceType = String(session.source_type || "checkout_session").trim();
  const sourceId = session.source_id || session.id;

  if (couponId) {
    const { data: existingRedemption, error: existingError } =
      await supabaseAdmin
        .from("coupon_redemptions")
        .select("id, discount_amount, status")
        .eq("coupon_id", couponId)
        .eq("auth_user_id", authUserId)
        .eq("source_type", sourceType)
        .eq("source_id", sourceId)
        .maybeSingle();

    if (existingError) {
      console.warn("Coupon existing redemption lookup failed:", existingError.message);
    }

    if (existingRedemption?.id) {
      return {
        redeemed: true,
        alreadyRedeemed: true,
        redemptionId: existingRedemption.id,
        discountAmount: Number(existingRedemption.discount_amount || 0),
        status: existingRedemption.status,
        message: "Coupon was already redeemed for this source.",
      };
    }
  }

  const metadata =
    session.metadata &&
    typeof session.metadata === "object" &&
    !Array.isArray(session.metadata)
      ? session.metadata
      : {};

  const subtotalAmount = Number(
    metadata.subtotal_amount ||
      Number(session.amount || 0) +
        Number(session.coupon_discount_amount || 0) +
        Number(session.wallet_credit_used || 0)
  );

  const appliesTo =
    sourceType === "marketplace_order" ||
    sourceType === "order" ||
    sourceType === "marketplace"
      ? "marketplace_order"
      : "studio_booking";

  const { data, error } = await supabaseAdmin.rpc("redeem_coupon_code", {
    p_auth_user_id: authUserId,
    p_code: couponCode,
    p_applies_to: appliesTo,
    p_source_type: sourceType,
    p_source_id: sourceId,
    p_subtotal: subtotalAmount,
    p_country_code: null,
    p_city_id: null,
    p_tier_code: null,
  });

  if (error) {
    console.warn("Coupon redemption failed:", error.message);

    return {
      redeemed: false,
      error: error.message,
      message: "Coupon redemption failed after manual payment.",
    };
  }

  const redemption = Array.isArray(data) ? data[0] : data;

  if (!redemption?.ok) {
    return {
      redeemed: false,
      couponId: redemption?.coupon_id || couponId,
      discountAmount: Number(redemption?.discount_amount || 0),
      message: redemption?.message || "Coupon was not redeemed.",
    };
  }

  return {
    redeemed: true,
    alreadyRedeemed: false,
    couponId: redemption.coupon_id || couponId,
    redemptionId: redemption.redemption_id || null,
    discountAmount: Number(redemption.discount_amount || 0),
    message: redemption.message || "Coupon redeemed successfully.",
  };
}

async function awardLoyaltyAfterPayment({
  supabaseAdmin,
  session,
  transaction,
  authUserId,
}: {
  supabaseAdmin: ReturnType<typeof createAdminClient>;
  session: any;
  transaction: any;
  authUserId: string;
}) {
  const sourceType = String(session.source_type || "").trim();
  const sourceId = session.source_id || null;

  if (!sourceId) {
    return {
      awarded: false,
      skipped: true,
      reason: "No source_id on checkout session.",
    };
  }

  let eventType = "";
  let loyaltySourceType = "";

  if (sourceType === "studio_booking" || sourceType === "booking") {
    eventType = "booking_completed";
    loyaltySourceType = "booking";
  }

  if (
    sourceType === "marketplace_order" ||
    sourceType === "order" ||
    sourceType === "marketplace"
  ) {
    eventType = "marketplace_order_completed";
    loyaltySourceType = "marketplace_order";
  }

  if (!eventType || !loyaltySourceType) {
    return {
      awarded: false,
      skipped: true,
      reason: `Source type ${sourceType || "unknown"} is not eligible for loyalty points yet.`,
    };
  }

  const { data: existingLedger, error: existingLedgerError } =
    await supabaseAdmin
      .from("loyalty_points_ledger")
      .select("id, points, status")
      .eq("auth_user_id", authUserId)
      .eq("event_type", eventType)
      .eq("source_type", loyaltySourceType)
      .eq("source_id", sourceId)
      .maybeSingle();

  if (existingLedgerError) {
    console.warn(
      "Existing loyalty ledger lookup failed:",
      existingLedgerError.message
    );
  }

  if (existingLedger?.id) {
    return {
      awarded: true,
      alreadyAwarded: true,
      ledgerId: existingLedger.id,
      points: Number(existingLedger.points || 0),
      status: existingLedger.status,
      message: "Loyalty points were already awarded for this source.",
    };
  }

  const paidAmount = Number(
    transaction?.captured_amount ||
      transaction?.amount ||
      session.amount ||
      0
  );

  if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
    return {
      awarded: false,
      skipped: true,
      reason: "Paid amount is invalid for loyalty calculation.",
    };
  }

  const { data: ledgerId, error: awardError } = await supabaseAdmin.rpc(
    "award_loyalty_event",
    {
      p_auth_user_id: authUserId,
      p_event_type: eventType,
      p_amount: paidAmount,
      p_source_type: loyaltySourceType,
      p_source_id: sourceId,
      p_description:
        eventType === "booking_completed"
          ? "Points earned from completed studio booking."
          : "Points earned from completed marketplace order.",
    }
  );

  if (awardError) {
    console.warn("Loyalty award failed:", awardError.message);

    return {
      awarded: false,
      error: awardError.message,
      message: "Loyalty points could not be awarded after manual payment.",
    };
  }

  if (!ledgerId) {
    return {
      awarded: false,
      skipped: true,
      reason: "No loyalty ledger row was created.",
    };
  }

  const { data: ledgerRow, error: ledgerRowError } = await supabaseAdmin
    .from("loyalty_points_ledger")
    .select("id, points, status")
    .eq("id", ledgerId)
    .maybeSingle();

  if (ledgerRowError) {
    console.warn("Created loyalty ledger lookup failed:", ledgerRowError.message);
  }

  return {
    awarded: true,
    alreadyAwarded: false,
    ledgerId,
    points: Number(ledgerRow?.points || 0),
    status: ledgerRow?.status || "posted",
    eventType,
    sourceType: loyaltySourceType,
    message: "Loyalty points awarded successfully.",
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const checkoutSessionId = cleanText(
      body.checkoutSessionId || body.checkout_session_id
    );

    if (!checkoutSessionId) {
      return NextResponse.json(
        { error: "Checkout session id is required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const supabaseAdmin = createAdminClient();

    const { data: session, error: sessionError } = await supabaseAdmin
      .from("checkout_payment_sessions")
      .select(`
        id,
        auth_user_id,
        source_type,
        source_id,
        provider_code,
        payment_method,
        installment_provider,
        amount,
        currency_code,
        status,
        provider_checkout_id,
        provider_payment_id,
        provider_reference,
        coupon_id,
        coupon_code,
        coupon_discount_amount,
        wallet_credit_used,
        loyalty_points_redeemed,
        metadata,
        created_at,
        expires_at
      `)
      .eq("id", checkoutSessionId)
      .maybeSingle();

    if (sessionError) {
      throw new Error(sessionError.message);
    }

    if (!session) {
      return NextResponse.json(
        { error: "Checkout session not found." },
        { status: 404 }
      );
    }

    if (session.auth_user_id !== user.id) {
      return NextResponse.json(
        { error: "You do not have access to this checkout session." },
        { status: 403 }
      );
    }

    if (session.provider_code !== "manual") {
      return NextResponse.json(
        {
          error:
            "Only manual/testing checkout sessions can be confirmed by this endpoint.",
        },
        { status: 400 }
      );
    }

    if (session.status === "completed") {
      const { data: existingTransaction, error: existingTransactionError } =
        await supabaseAdmin
          .from("payment_transactions")
          .select(`
            id,
            status,
            amount,
            currency_code,
            provider_payment_id,
            provider_reference,
            paid_at,
            captured_at
          `)
          .eq("checkout_session_id", session.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

      if (existingTransactionError) {
        throw new Error(existingTransactionError.message);
      }

      const sourceUpdateResult = existingTransaction
        ? await linkPaymentToSource({
            supabaseAdmin,
            session,
            transaction: existingTransaction,
            authUserId: user.id,
            manualReference:
              existingTransaction.provider_reference ||
              session.provider_reference ||
              "manual-confirmed",
          })
        : {
            updated: false,
            reason: "No existing transaction found for completed session.",
          };

      const couponRedemptionResult = await redeemCouponAfterPayment({
        supabaseAdmin,
        session,
        authUserId: user.id,
      });

      const loyaltyAwardResult = existingTransaction
        ? await awardLoyaltyAfterPayment({
            supabaseAdmin,
            session,
            transaction: existingTransaction,
            authUserId: user.id,
          })
        : {
            awarded: false,
            skipped: true,
            reason: "No existing transaction found for completed session.",
          };

      return NextResponse.json({
        ok: true,
        alreadyConfirmed: true,
        checkoutSessionId: session.id,
        paymentTransactionId: existingTransaction?.id || null,
        status: existingTransaction?.status || "paid",
        amount: Number(existingTransaction?.amount || session.amount || 0),
        currencyCode:
          existingTransaction?.currency_code || session.currency_code || "SAR",
        providerReference:
          existingTransaction?.provider_reference ||
          session.provider_reference ||
          null,
        sourceUpdate: sourceUpdateResult,
        couponRedemption: couponRedemptionResult,
        loyaltyAward: loyaltyAwardResult,
        message: "Manual checkout session was already confirmed.",
      });
    }

    if (!["created", "pending", "processing"].includes(session.status)) {
      return NextResponse.json(
        {
          error: `Checkout session cannot be confirmed from status: ${session.status}`,
        },
        { status: 400 }
      );
    }

    if (
      session.expires_at &&
      new Date(session.expires_at).getTime() < Date.now()
    ) {
      await supabaseAdmin
        .from("checkout_payment_sessions")
        .update({
          status: "expired",
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.id);

      return NextResponse.json(
        { error: "Checkout session has expired." },
        { status: 400 }
      );
    }

    const amount = Number(session.amount || 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Checkout session amount is invalid." },
        { status: 400 }
      );
    }

    const manualReference = createManualReference();
    const nowIso = new Date().toISOString();

    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from("payment_transactions")
      .insert({
        auth_user_id: user.id,
        checkout_session_id: session.id,
        source_type: session.source_type,
        source_id: session.source_id,
        provider_code: "manual",
        payment_method: session.payment_method || "manual",
        installment_provider: null,
        amount,
        currency_code: session.currency_code || "SAR",
        status: "paid",
        provider_checkout_id: session.provider_checkout_id || null,
        provider_payment_id: manualReference,
        provider_reference: manualReference,
        provider_status: "manual_confirmed",
        authorized_amount: amount,
        captured_amount: amount,
        refunded_amount: 0,
        paid_at: nowIso,
        captured_at: nowIso,
        metadata: {
          source: "manual_testing_confirmation",
          checkout_session_id: session.id,
          source_type: session.source_type,
          source_id: session.source_id,
          coupon_code: session.coupon_code,
          coupon_discount_amount: session.coupon_discount_amount,
          wallet_credit_used: session.wallet_credit_used,
          loyalty_points_redeemed: session.loyalty_points_redeemed,
        },
        created_at: nowIso,
        updated_at: nowIso,
      })
      .select(`
        id,
        status,
        amount,
        currency_code,
        provider_payment_id,
        provider_reference,
        paid_at,
        captured_at
      `)
      .single();

    if (transactionError) {
      throw new Error(transactionError.message);
    }

    const sourceUpdateResult = await linkPaymentToSource({
      supabaseAdmin,
      session,
      transaction,
      authUserId: user.id,
      manualReference,
    });

    const couponRedemptionResult = await redeemCouponAfterPayment({
      supabaseAdmin,
      session,
      authUserId: user.id,
    });

    const loyaltyAwardResult = await awardLoyaltyAfterPayment({
      supabaseAdmin,
      session,
      transaction,
      authUserId: user.id,
    });

    const { error: sessionUpdateError } = await supabaseAdmin
      .from("checkout_payment_sessions")
      .update({
        status: "completed",
        provider_payment_id: manualReference,
        provider_reference: manualReference,
        completed_at: nowIso,
        updated_at: nowIso,
        metadata: {
          ...getSafeMetadata(session.metadata),
          manual_confirmed: true,
          manual_confirmed_at: nowIso,
          payment_transaction_id: transaction.id,
          source_update: sourceUpdateResult,
          coupon_redemption: couponRedemptionResult,
          loyalty_award: loyaltyAwardResult,
        },
      })
      .eq("id", session.id);

    if (sessionUpdateError) {
      throw new Error(sessionUpdateError.message);
    }

    return NextResponse.json({
      ok: true,
      alreadyConfirmed: false,
      checkoutSessionId: session.id,
      paymentTransactionId: transaction.id,
      status: transaction.status,
      amount: Number(transaction.amount || 0),
      currencyCode: transaction.currency_code || "SAR",
      providerReference: transaction.provider_reference,
      paidAt: transaction.paid_at,
      capturedAt: transaction.captured_at,
      sourceUpdate: sourceUpdateResult,
      couponRedemption: couponRedemptionResult,
      loyaltyAward: loyaltyAwardResult,
      message:
        "Manual testing payment confirmed, linked to the source payment status, coupon was redeemed when available, and loyalty points were awarded when eligible.",
    });
  } catch (error) {
    console.error("Manual checkout confirmation error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not confirm manual checkout session.",
      },
      { status: 500 }
    );
  }
}
