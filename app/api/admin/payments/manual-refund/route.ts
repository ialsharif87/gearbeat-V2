import { NextResponse } from "next/server";
import { requireAdminLayoutAccess } from "@/lib/route-guards";

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function cleanNumber(value: unknown) {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  return numberValue;
}

function createManualRefundReference() {
  return `REFUND-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}

function getSourceTable(sourceType: string) {
  if (sourceType === "studio_booking" || sourceType === "booking") {
    return "bookings";
  }

  if (
    sourceType === "marketplace_order" ||
    sourceType === "order" ||
    sourceType === "marketplace"
  ) {
    return "marketplace_orders";
  }

  return null;
}

async function updateSourceRefundStatus({
  supabaseAdmin,
  sourceType,
  sourceId,
  paymentStatus,
}: {
  supabaseAdmin: any;
  sourceType: string;
  sourceId: string | null;
  paymentStatus: "refunded" | "partially_refunded";
}) {
  const tableName = getSourceTable(sourceType);

  if (!tableName || !sourceId) {
    return {
      updated: false,
      reason: "No supported source table or source id.",
    };
  }

  const { data, error } = await supabaseAdmin
    .from(tableName)
    .update({
      payment_status: paymentStatus,
    })
    .eq("id", sourceId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.warn("Source refund status update failed:", error.message);

    return {
      updated: false,
      tableName,
      reason: error.message,
    };
  }

  return {
    updated: Boolean(data?.id),
    tableName,
    sourceId: data?.id || sourceId,
    paymentStatus,
  };
}

async function reverseLoyaltyAfterManualRefund({
  supabaseAdmin,
  transaction,
  refund,
  refundAmount,
  capturedAmount,
  isFullRefund,
}: {
  supabaseAdmin: any;
  transaction: any;
  refund: any;
  refundAmount: number;
  capturedAmount: number;
  isFullRefund: boolean;
}) {
  const authUserId = transaction.auth_user_id;
  const sourceType = String(transaction.source_type || "").trim();
  const sourceId = transaction.source_id || null;

  if (!authUserId) {
    return {
      reversed: false,
      skipped: true,
      reason: "Transaction has no auth_user_id.",
    };
  }

  if (!sourceId) {
    return {
      reversed: false,
      skipped: true,
      reason: "Transaction has no source_id.",
    };
  }

  let originalEventType = "";
  let originalLoyaltySourceType = "";

  if (sourceType === "studio_booking" || sourceType === "booking") {
    originalEventType = "booking_completed";
    originalLoyaltySourceType = "booking";
  }

  if (
    sourceType === "marketplace_order" ||
    sourceType === "order" ||
    sourceType === "marketplace"
  ) {
    originalEventType = "marketplace_order_completed";
    originalLoyaltySourceType = "marketplace_order";
  }

  if (!originalEventType || !originalLoyaltySourceType) {
    return {
      reversed: false,
      skipped: true,
      reason: `Source type ${sourceType || "unknown"} is not eligible for loyalty reversal.`,
    };
  }

  const { data: existingRefundReversal, error: existingRefundReversalError } =
    await supabaseAdmin
      .from("loyalty_points_ledger")
      .select("id, points, status")
      .eq("auth_user_id", authUserId)
      .eq("event_type", "manual_refund_reversal")
      .eq("source_type", "payment_refund")
      .eq("source_id", refund.id)
      .maybeSingle();

  if (existingRefundReversalError) {
    console.warn(
      "Existing refund loyalty reversal lookup failed:",
      existingRefundReversalError.message
    );
  }

  if (existingRefundReversal?.id) {
    return {
      reversed: true,
      alreadyReversed: true,
      ledgerId: existingRefundReversal.id,
      points: Math.abs(Number(existingRefundReversal.points || 0)),
      status: existingRefundReversal.status,
      message: "Loyalty points were already reversed for this refund.",
    };
  }

  const { data: originalLedgers, error: originalLedgersError } =
    await supabaseAdmin
      .from("loyalty_points_ledger")
      .select("id, points, status")
      .eq("auth_user_id", authUserId)
      .eq("event_type", originalEventType)
      .eq("source_type", originalLoyaltySourceType)
      .eq("source_id", sourceId)
      .eq("status", "posted")
      .gt("points", 0);

  if (originalLedgersError) {
    console.warn(
      "Original loyalty ledger lookup failed:",
      originalLedgersError.message
    );

    return {
      reversed: false,
      error: originalLedgersError.message,
      message: "Could not look up original loyalty points.",
    };
  }

  const originalPoints = (originalLedgers || []).reduce(
    (sum: number, row: any) => sum + Number(row.points || 0),
    0
  );

  if (originalPoints <= 0) {
    return {
      reversed: false,
      skipped: true,
      reason: "No original loyalty points found for this source.",
    };
  }

  const { data: reversalLedgers, error: reversalLedgersError } =
    await supabaseAdmin
      .from("loyalty_points_ledger")
      .select("id, points, metadata")
      .eq("auth_user_id", authUserId)
      .eq("event_type", "manual_refund_reversal")
      .eq("source_type", "payment_refund")
      .eq("status", "posted");

  if (reversalLedgersError) {
    console.warn(
      "Prior loyalty reversal lookup failed:",
      reversalLedgersError.message
    );
  }

  const priorReversedPoints = (reversalLedgers || []).reduce(
    (sum: number, row: any) => {
      const metadata =
        row.metadata &&
        typeof row.metadata === "object" &&
        !Array.isArray(row.metadata)
          ? row.metadata
          : {};

      if (metadata.payment_transaction_id === transaction.id) {
        return sum + Math.abs(Number(row.points || 0));
      }

      return sum;
    },
    0
  );

  const remainingPointsToReverse = Math.max(
    originalPoints - priorReversedPoints,
    0
  );

  if (remainingPointsToReverse <= 0) {
    return {
      reversed: false,
      skipped: true,
      reason: "All eligible loyalty points were already reversed.",
      originalPoints,
      priorReversedPoints,
    };
  }

  const safeCapturedAmount = Number(capturedAmount || 0);
  const safeRefundAmount = Number(refundAmount || 0);

  if (!Number.isFinite(safeCapturedAmount) || safeCapturedAmount <= 0) {
    return {
      reversed: false,
      skipped: true,
      reason: "Captured amount is invalid.",
    };
  }

  const refundRatio = Math.min(safeRefundAmount / safeCapturedAmount, 1);

  const proportionalPoints = Math.max(
    1,
    Math.round(originalPoints * refundRatio)
  );

  const pointsToReverse = isFullRefund
    ? remainingPointsToReverse
    : Math.min(proportionalPoints, remainingPointsToReverse);

  if (pointsToReverse <= 0) {
    return {
      reversed: false,
      skipped: true,
      reason: "Calculated loyalty reversal points are zero.",
    };
  }

  const { data: walletId, error: walletError } = await supabaseAdmin.rpc(
    "ensure_customer_wallet",
    {
      p_auth_user_id: authUserId,
    }
  );

  if (walletError) {
    console.warn("Could not ensure wallet before loyalty reversal:", walletError.message);

    return {
      reversed: false,
      error: walletError.message,
      message: "Could not ensure customer wallet.",
    };
  }

  if (!walletId) {
    return {
      reversed: false,
      skipped: true,
      reason: "Customer wallet was not found.",
    };
  }

  const { data: wallet, error: walletLookupError } = await supabaseAdmin
    .from("customer_wallets")
    .select("id, points_balance")
    .eq("id", walletId)
    .maybeSingle();

  if (walletLookupError) {
    console.warn("Wallet lookup failed before loyalty reversal:", walletLookupError.message);

    return {
      reversed: false,
      error: walletLookupError.message,
      message: "Could not look up customer wallet.",
    };
  }

  const currentPointsBalance = Number(wallet?.points_balance || 0);
  const nextPointsBalance = Math.max(currentPointsBalance - pointsToReverse, 0);
  const nowIso = new Date().toISOString();

  const { data: reversalLedger, error: reversalInsertError } =
    await supabaseAdmin
      .from("loyalty_points_ledger")
      .insert({
        auth_user_id: authUserId,
        wallet_id: walletId,
        event_type: "manual_refund_reversal",
        source_type: "payment_refund",
        source_id: refund.id,
        points: -pointsToReverse,
        status: "posted",
        description: "Points reversed after manual refund.",
        amount_basis: safeRefundAmount,
        metadata: {
          payment_transaction_id: transaction.id,
          payment_refund_id: refund.id,
          original_source_type: originalLoyaltySourceType,
          original_source_id: sourceId,
          original_event_type: originalEventType,
          original_points: originalPoints,
          prior_reversed_points: priorReversedPoints,
          reversed_points: pointsToReverse,
          refund_amount: safeRefundAmount,
          captured_amount: safeCapturedAmount,
          refund_ratio: refundRatio,
          is_full_refund: isFullRefund,
        },
        created_at: nowIso,
      })
      .select("id, points, status")
      .single();

  if (reversalInsertError) {
    console.warn("Loyalty reversal insert failed:", reversalInsertError.message);

    return {
      reversed: false,
      error: reversalInsertError.message,
      message: "Could not insert loyalty reversal ledger.",
    };
  }

  const { error: walletUpdateError } = await supabaseAdmin
    .from("customer_wallets")
    .update({
      points_balance: nextPointsBalance,
      updated_at: nowIso,
    })
    .eq("id", walletId);

  if (walletUpdateError) {
    console.warn("Wallet update failed after loyalty reversal:", walletUpdateError.message);

    return {
      reversed: false,
      error: walletUpdateError.message,
      ledgerId: reversalLedger.id,
      message:
        "Loyalty reversal ledger was created, but wallet balance update failed.",
    };
  }

  await supabaseAdmin.rpc("refresh_customer_wallet_tier", {
    p_auth_user_id: authUserId,
  });

  return {
    reversed: true,
    alreadyReversed: false,
    ledgerId: reversalLedger.id,
    points: pointsToReverse,
    ledgerPoints: Number(reversalLedger.points || 0),
    previousPointsBalance: currentPointsBalance,
    nextPointsBalance,
    originalPoints,
    priorReversedPoints,
    remainingPointsToReverse: Math.max(
      remainingPointsToReverse - pointsToReverse,
      0
    ),
    message: "Loyalty points reversed successfully.",
  };
}

async function reverseCouponAfterFullManualRefund({
  supabaseAdmin,
  transaction,
  refund,
  isFullRefund,
}: {
  supabaseAdmin: any;
  transaction: any;
  refund: any;
  isFullRefund: boolean;
}) {
  if (!isFullRefund) {
    return {
      reversed: false,
      skipped: true,
      reason: "Coupon redemption is only reversed after a full refund.",
    };
  }

  const authUserId = transaction.auth_user_id;
  const sourceType = String(transaction.source_type || "").trim();
  const sourceId = transaction.source_id || null;

  if (!authUserId) {
    return {
      reversed: false,
      skipped: true,
      reason: "Transaction has no auth_user_id.",
    };
  }

  if (!sourceType || !sourceId) {
    return {
      reversed: false,
      skipped: true,
      reason: "Transaction has no source_type or source_id.",
    };
  }

  const { data: redemption, error: redemptionError } = await supabaseAdmin
    .from("coupon_redemptions")
    .select(`
      id,
      coupon_id,
      coupon_code,
      auth_user_id,
      source_type,
      source_id,
      discount_amount,
      status,
      metadata
    `)
    .eq("auth_user_id", authUserId)
    .eq("source_type", sourceType)
    .eq("source_id", sourceId)
    .order("redeemed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (redemptionError) {
    console.warn(
      "Coupon redemption lookup failed:",
      redemptionError.message
    );

    return {
      reversed: false,
      error: redemptionError.message,
      message: "Could not look up coupon redemption.",
    };
  }

  if (!redemption?.id) {
    return {
      reversed: false,
      skipped: true,
      reason: "No coupon redemption found for this transaction source.",
    };
  }

  if (
    redemption.status === "reversed" ||
    redemption.status === "refunded" ||
    redemption.status === "cancelled"
  ) {
    return {
      reversed: true,
      alreadyReversed: true,
      redemptionId: redemption.id,
      couponId: redemption.coupon_id,
      couponCode: redemption.coupon_code,
      discountAmount: Number(redemption.discount_amount || 0),
      status: redemption.status,
      message: "Coupon redemption was already reversed.",
    };
  }

  const nowIso = new Date().toISOString();

  const existingMetadata =
    redemption.metadata &&
    typeof redemption.metadata === "object" &&
    !Array.isArray(redemption.metadata)
      ? redemption.metadata
      : {};

  const { error: redemptionUpdateError } = await supabaseAdmin
    .from("coupon_redemptions")
    .update({
      status: "refunded",
      metadata: {
        ...existingMetadata,
        coupon_reversed_by_manual_refund: true,
        coupon_reversed_at: nowIso,
        payment_refund_id: refund.id,
        payment_transaction_id: transaction.id,
      },
    })
    .eq("id", redemption.id);

  if (redemptionUpdateError) {
    console.warn(
      "Coupon redemption update failed:",
      redemptionUpdateError.message
    );

    return {
      reversed: false,
      error: redemptionUpdateError.message,
      message: "Could not reverse coupon redemption.",
    };
  }

  if (redemption.coupon_id) {
    const { data: couponRow, error: couponLookupError } = await supabaseAdmin
      .from("coupons")
      .select("id, used_count")
      .eq("id", redemption.coupon_id)
      .maybeSingle();

    if (!couponLookupError && couponRow?.id) {
      await supabaseAdmin
        .from("coupons")
        .update({
          used_count: Math.max(Number(couponRow.used_count || 0) - 1, 0),
          updated_at: nowIso,
        })
        .eq("id", couponRow.id);
    }
  }

  return {
    reversed: true,
    alreadyReversed: false,
    redemptionId: redemption.id,
    couponId: redemption.coupon_id,
    couponCode: redemption.coupon_code,
    discountAmount: Number(redemption.discount_amount || 0),
    status: "refunded",
    message: "Coupon redemption reversed after full manual refund.",
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

    const paymentTransactionId = cleanText(
      body.paymentTransactionId || body.payment_transaction_id
    );

    const requestedAmount = cleanNumber(body.amount);
    const reason = cleanText(body.reason) || "Manual admin refund";

    if (!paymentTransactionId) {
      return NextResponse.json(
        { error: "Payment transaction id is required." },
        { status: 400 }
      );
    }

    if (requestedAmount <= 0) {
      return NextResponse.json(
        { error: "Refund amount must be greater than zero." },
        { status: 400 }
      );
    }

    const { supabaseAdmin } = await requireAdminLayoutAccess();

    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from("payment_transactions")
      .select(`
        id,
        auth_user_id,
        checkout_session_id,
        source_type,
        source_id,
        provider_code,
        provider_payment_id,
        provider_reference,
        amount,
        currency_code,
        status,
        captured_amount,
        refunded_amount
      `)
      .eq("id", paymentTransactionId)
      .maybeSingle();

    if (transactionError) {
      throw new Error(transactionError.message);
    }

    if (!transaction) {
      return NextResponse.json(
        { error: "Payment transaction not found." },
        { status: 404 }
      );
    }

    if (transaction.provider_code !== "manual") {
      return NextResponse.json(
        {
          error:
            "Only manual/testing transactions can be refunded by this endpoint.",
        },
        { status: 400 }
      );
    }

    if (!["paid", "captured", "partially_refunded"].includes(transaction.status)) {
      return NextResponse.json(
        {
          error: `Transaction cannot be refunded from status: ${transaction.status}`,
        },
        { status: 400 }
      );
    }

    const capturedAmount = Number(
      transaction.captured_amount || transaction.amount || 0
    );

    const alreadyRefunded = Number(transaction.refunded_amount || 0);
    const refundableAmount = Math.max(capturedAmount - alreadyRefunded, 0);

    if (refundableAmount <= 0) {
      return NextResponse.json(
        { error: "Transaction has no refundable balance." },
        { status: 400 }
      );
    }

    if (requestedAmount > refundableAmount) {
      return NextResponse.json(
        {
          error: `Refund amount cannot exceed refundable balance: ${refundableAmount.toFixed(
            2
          )}`,
        },
        { status: 400 }
      );
    }

    const nowIso = new Date().toISOString();
    const providerRefundId = createManualRefundReference();
    const newRefundedAmount = alreadyRefunded + requestedAmount;
    const isFullRefund = newRefundedAmount >= capturedAmount;
    const nextTransactionStatus = isFullRefund
      ? "refunded"
      : "partially_refunded";

    const { data: refund, error: refundError } = await supabaseAdmin
      .from("payment_refunds")
      .insert({
        payment_transaction_id: transaction.id,
        auth_user_id: transaction.auth_user_id,
        provider_code: "manual",
        provider_refund_id: providerRefundId,
        provider_payment_id: transaction.provider_payment_id,
        amount: requestedAmount,
        currency_code: transaction.currency_code || "SAR",
        reason,
        status: "completed",
        requested_at: nowIso,
        completed_at: nowIso,
        metadata: {
          source: "manual_admin_refund",
          payment_transaction_id: transaction.id,
          source_type: transaction.source_type,
          source_id: transaction.source_id,
          previous_refunded_amount: alreadyRefunded,
          new_refunded_amount: newRefundedAmount,
          is_full_refund: isFullRefund,
        },
        created_at: nowIso,
        updated_at: nowIso,
      })
      .select(`
        id,
        amount,
        currency_code,
        status,
        provider_refund_id,
        completed_at
      `)
      .single();

    if (refundError) {
      throw new Error(refundError.message);
    }

    const { error: transactionUpdateError } = await supabaseAdmin
      .from("payment_transactions")
      .update({
        refunded_amount: newRefundedAmount,
        status: nextTransactionStatus,
        updated_at: nowIso,
      })
      .eq("id", transaction.id);

    if (transactionUpdateError) {
      throw new Error(transactionUpdateError.message);
    }

    const sourceUpdate = await updateSourceRefundStatus({
      supabaseAdmin,
      sourceType: transaction.source_type,
      sourceId: transaction.source_id,
      paymentStatus: isFullRefund ? "refunded" : "partially_refunded",
    });

    const loyaltyReversal = await reverseLoyaltyAfterManualRefund({
      supabaseAdmin,
      transaction,
      refund,
      refundAmount: requestedAmount,
      capturedAmount,
      isFullRefund,
    });

    const couponReversal = await reverseCouponAfterFullManualRefund({
      supabaseAdmin,
      transaction,
      refund,
      isFullRefund,
    });

    await supabaseAdmin
      .from("payment_refunds")
      .update({
        metadata: {
          source: "manual_admin_refund",
          payment_transaction_id: transaction.id,
          source_type: transaction.source_type,
          source_id: transaction.source_id,
          previous_refunded_amount: alreadyRefunded,
          new_refunded_amount: newRefundedAmount,
          is_full_refund: isFullRefund,
          source_update: sourceUpdate,
          loyalty_reversal: loyaltyReversal,
          coupon_reversal: couponReversal,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", refund.id);

    return NextResponse.json({
      ok: true,
      refundId: refund.id,
      providerRefundId: refund.provider_refund_id,
      paymentTransactionId: transaction.id,
      refundedAmount: Number(refund.amount || 0),
      totalRefundedAmount: newRefundedAmount,
      refundableRemaining: Math.max(capturedAmount - newRefundedAmount, 0),
      currencyCode: refund.currency_code || transaction.currency_code || "SAR",
      transactionStatus: nextTransactionStatus,
      sourceUpdate,
      loyaltyReversal,
      couponReversal,
      message:
        "Manual refund completed, source payment status updated when possible, loyalty points were reversed when eligible, and coupon redemption was reversed after full refund when available. No external payment provider was contacted.",
    });
  } catch (error) {
    console.error("Manual refund error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not create manual refund.",
      },
      { status: 500 }
    );
  }
}
