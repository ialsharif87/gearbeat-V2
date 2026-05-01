import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function cleanText(value: unknown) {
  return String(value || "").trim();
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

    const offerId = cleanText(body.offerId || body.offer_id);

    if (!offerId) {
      return NextResponse.json(
        { error: "Offer id is required." },
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

    const { data, error } = await supabaseAdmin.rpc("claim_offer", {
      p_offer_id: offerId,
      p_auth_user_id: user.id,
    });

    if (error) {
      throw new Error(error.message);
    }

    const result = Array.isArray(data) ? data[0] : data;

    if (!result) {
      return NextResponse.json(
        { error: "Could not claim offer." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: Boolean(result.ok),
      claimId: result.claim_id,
      couponId: result.coupon_id,
      couponCode: result.coupon_code,
      message: result.message,
    });
  } catch (error) {
    console.error("Offer claim error:", error);

    return NextResponse.json(
      { error: "Could not claim offer." },
      { status: 500 }
    );
  }
}
