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
      message:
        "Manual refund completed. No external payment provider was contacted.",
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
