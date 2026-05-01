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

    if (session.expires_at && new Date(session.expires_at).getTime() < Date.now()) {
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

    const { error: sessionUpdateError } = await supabaseAdmin
      .from("checkout_payment_sessions")
      .update({
        status: "completed",
        provider_payment_id: manualReference,
        provider_reference: manualReference,
        completed_at: nowIso,
        updated_at: nowIso,
        metadata: {
          ...(session.metadata || {}),
          manual_confirmed: true,
          manual_confirmed_at: nowIso,
          payment_transaction_id: transaction.id,
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
      message:
        "Manual testing payment confirmed. Real payment provider integration is still not active.",
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
