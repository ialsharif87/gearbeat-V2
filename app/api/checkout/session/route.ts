import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_SOURCE_TYPES = [
  "studio_booking",
  "marketplace_order",
  "booking",
  "order",
  "cart",
  "marketplace",
];

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function cleanTextOrNull(value: unknown) {
  const valueText = cleanText(value);

  return valueText || null;
}

function cleanNumber(value: unknown) {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  return numberValue;
}

function cleanInteger(value: unknown) {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  return Math.max(Math.floor(numberValue), 0);
}

function isAllowedSourceType(value: string) {
  return ALLOWED_SOURCE_TYPES.includes(value);
}

async function validateCouponOnServer({
  supabaseAdmin,
  authUserId,
  couponCode,
  appliesTo,
  subtotalAmount,
  countryCode,
  cityId,
  tierCode,
}: {
  supabaseAdmin: ReturnType<typeof createAdminClient>;
  authUserId: string;
  couponCode: string | null;
  appliesTo: string;
  subtotalAmount: number;
  countryCode: string | null;
  cityId: string | null;
  tierCode: string | null;
}) {
  if (!couponCode) {
    return {
      couponId: null,
      couponCode: null,
      discountAmount: 0,
    };
  }

  const { data, error } = await supabaseAdmin.rpc("validate_coupon_code", {
    p_auth_user_id: authUserId,
    p_code: couponCode,
    p_applies_to: appliesTo,
    p_subtotal: subtotalAmount,
    p_country_code: countryCode,
    p_city_id: cityId,
    p_tier_code: tierCode,
  });

  if (error) {
    throw new Error(error.message);
  }

  const validation = Array.isArray(data) ? data[0] : data;

  if (!validation?.is_valid) {
    throw new Error(validation?.message || "Coupon is invalid.");
  }

  return {
    couponId: validation.coupon_id || null,
    couponCode: validation.normalized_code || couponCode,
    discountAmount: Number(validation.discount_amount || 0),
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

    const sourceType = cleanText(body.sourceType || body.source_type);
    const sourceId = cleanTextOrNull(body.sourceId || body.source_id);

    const providerCode = cleanText(
      body.paymentProvider || body.payment_provider || "manual"
    );

    const paymentMethod = cleanText(
      body.paymentMethod || body.payment_method || "manual"
    );

    const installmentProvider = cleanTextOrNull(
      body.installmentProvider || body.installment_provider
    );

    const subtotalAmount = cleanNumber(
      body.subtotalAmount || body.subtotal_amount
    );

    const currencyCode = cleanText(
      body.currencyCode || body.currency_code || "SAR"
    );

    const couponCode = cleanTextOrNull(
      body.couponCode || body.coupon_code
    );

    const appliesTo = cleanText(
      body.appliesTo || body.applies_to || sourceType || "all"
    );

    const countryCode = cleanTextOrNull(
      body.countryCode || body.country_code
    );

    const cityId = cleanTextOrNull(body.cityId || body.city_id);
    const tierCode = cleanTextOrNull(body.tierCode || body.tier_code);

    const walletCreditUsed = cleanNumber(
      body.walletCreditUsed || body.wallet_credit_used
    );

    const loyaltyPointsRedeemed = cleanInteger(
      body.loyaltyPointsRedeemed || body.loyalty_points_redeemed
    );

    const successUrl = cleanTextOrNull(body.successUrl || body.success_url);
    const cancelUrl = cleanTextOrNull(body.cancelUrl || body.cancel_url);
    const returnUrl = cleanTextOrNull(body.returnUrl || body.return_url);

    if (!isAllowedSourceType(sourceType)) {
      return NextResponse.json(
        { error: "Invalid checkout source type." },
        { status: 400 }
      );
    }

    if (!providerCode) {
      return NextResponse.json(
        { error: "Payment provider is required." },
        { status: 400 }
      );
    }

    if (subtotalAmount <= 0) {
      return NextResponse.json(
        { error: "Subtotal amount must be greater than zero." },
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

    const couponResult = await validateCouponOnServer({
      supabaseAdmin,
      authUserId: user.id,
      couponCode,
      appliesTo,
      subtotalAmount,
      countryCode,
      cityId,
      tierCode,
    });

    const safeWalletCreditUsed = Math.max(walletCreditUsed, 0);
    const safeCouponDiscountAmount = Math.max(
      Number(couponResult.discountAmount || 0),
      0
    );

    const payableAmount = Math.max(
      subtotalAmount - safeCouponDiscountAmount - safeWalletCreditUsed,
      0
    );

    if (payableAmount <= 0) {
      return NextResponse.json(
        {
          error:
            "Payable amount must be greater than zero for this checkout foundation.",
        },
        { status: 400 }
      );
    }

    const { data: sessionId, error: sessionError } = await supabaseAdmin.rpc(
      "create_checkout_payment_session",
      {
        p_auth_user_id: user.id,
        p_source_type: sourceType,
        p_source_id: sourceId,
        p_provider_code: providerCode,
        p_payment_method: paymentMethod,
        p_amount: payableAmount,
        p_currency_code: currencyCode,
        p_installment_provider: installmentProvider,
        p_coupon_id: couponResult.couponId,
        p_coupon_code: couponResult.couponCode,
        p_coupon_discount_amount: safeCouponDiscountAmount,
        p_wallet_credit_used: safeWalletCreditUsed,
        p_loyalty_points_redeemed: loyaltyPointsRedeemed,
      }
    );

    if (sessionError) {
      throw new Error(sessionError.message);
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: "Could not create checkout session." },
        { status: 500 }
      );
    }

    await supabaseAdmin
      .from("checkout_payment_sessions")
      .update({
        success_url: successUrl,
        cancel_url: cancelUrl,
        return_url: returnUrl,
        metadata: {
          source: "checkout_session_foundation",
          subtotal_amount: subtotalAmount,
          coupon_discount_amount: safeCouponDiscountAmount,
          wallet_credit_used: safeWalletCreditUsed,
          payable_amount: payableAmount,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    return NextResponse.json({
      ok: true,
      checkoutSessionId: sessionId,
      status: "created",
      providerCode,
      paymentMethod,
      installmentProvider,
      subtotalAmount,
      couponId: couponResult.couponId,
      couponCode: couponResult.couponCode,
      couponDiscountAmount: safeCouponDiscountAmount,
      walletCreditUsed: safeWalletCreditUsed,
      loyaltyPointsRedeemed,
      payableAmount,
      currencyCode,
      checkoutUrl: null,
      message:
        "Checkout session created. Real payment redirection is not enabled yet.",
    });
  } catch (error) {
    console.error("Checkout session error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not create checkout session.",
      },
      { status: 500 }
    );
  }
}
