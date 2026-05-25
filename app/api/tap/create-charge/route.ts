import { createTapCharge } from "@/lib/tap/charge";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

function isTapLivePaymentsEnabled() {
  return process.env.TAP_LIVE_PAYMENTS_ENABLED === "true";
}

function createTapDisabledResponse() {
  return NextResponse.json(
    {
      error: "Tap payments are not enabled yet.",
      code: "TAP_LIVE_PAYMENTS_DISABLED",
      livePaymentsEnabled: false,
      message:
        "GearBeat is in pre-live payment mode. Tap checkout remains disabled until payment hardening and explicit approval are complete.",
    },
    { status: 403 }
  );
}

export async function POST(request: NextRequest) {
  try {
    if (!isTapLivePaymentsEnabled()) {
      return createTapDisabledResponse();
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { bookingId, amount, studioId } = body;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    const { data: studio } = await supabase
      .from("studios")
      .select("tap_destination_id")
      .eq("id", studioId)
      .maybeSingle();

    const result = await createTapCharge({
      amount,
      customerId: user.id,
      customerEmail: profile?.email || user.email || "",
      customerName: profile?.full_name || "Customer",
      customerPhone: profile?.phone,
      bookingId,
      studioId,
      studioDestinationId: studio?.tap_destination_id,
      redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/studios/booking-confirmation?bookingId=${bookingId}`,
    });

    if (result.fallback) {
      return NextResponse.json({ fallback: true });
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      chargeUrl: result.charge?.transaction?.url,
    });
  } catch (error) {
    console.error("Create Tap charge error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
