import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

function cleanUuidOrNull(value: unknown) {
  const text = cleanText(value);

  if (!text) {
    return null;
  }

  return text;
}

function cleanTextOrNull(value: unknown) {
  const text = cleanText(value);

  if (!text) {
    return null;
  }

  return text;
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

    const code = cleanText(body.code);
    const appliesTo = cleanText(body.appliesTo || body.applies_to || "all");
    const subtotalAmount = cleanNumber(
      body.subtotalAmount || body.subtotal_amount || 0
    );
    const countryCode = cleanTextOrNull(body.countryCode || body.country_code);
    const cityId = cleanUuidOrNull(body.cityId || body.city_id);
    const tierCode = cleanTextOrNull(body.tierCode || body.tier_code);

    if (!code) {
      return NextResponse.json(
        { error: "Coupon code is required." },
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

    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin.rpc("validate_coupon_code", {
      p_auth_user_id: user?.id || null,
      p_code: code,
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

    if (!validation) {
      return NextResponse.json(
        {
          valid: false,
          errorCode: "no_result",
          message: "Could not validate coupon.",
          discountAmount: 0,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      valid: Boolean(validation.is_valid),
      couponId: validation.coupon_id,
      code: validation.normalized_code,
      discountAmount: Number(validation.discount_amount || 0),
      errorCode: validation.error_code,
      message: validation.message,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);

    return NextResponse.json(
      { error: "Could not validate coupon." },
      { status: 500 }
    );
  }
}
