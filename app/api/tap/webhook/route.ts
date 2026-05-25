import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

function isTapLivePaymentsEnabled() {
  return process.env.TAP_LIVE_PAYMENTS_ENABLED === "true";
}

function createTapWebhookDisabledResponse() {
  return NextResponse.json(
    {
      received: true,
      ignored: true,
      code: "TAP_LIVE_PAYMENTS_DISABLED",
      livePaymentsEnabled: false,
      message:
        "Tap webhook processing is not enabled yet. Payment status changes remain blocked until webhook verification, idempotency, and explicit approval are complete.",
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  try {
    if (!isTapLivePaymentsEnabled()) {
      return createTapWebhookDisabledResponse();
    }

    const body = await request.json();
    const { id, status, metadata } = body;

    if (!metadata?.booking_id) {
      return NextResponse.json({ received: true });
    }

    const supabase = createAdminClient();

    if (status === "CAPTURED") {
      await supabase
        .from("bookings")
        .update({
          status: "confirmed",
          payment_status: "paid",
          tap_charge_id: id,
        })
        .eq("id", metadata.booking_id);

      await supabase.from("notifications").insert({
        user_id: metadata.customer_id,
        title: "Booking Confirmed",
        body: "Your studio booking has been confirmed.",
        notification_type: "booking_confirmed",
        entity_type: "booking",
        entity_id: metadata.booking_id,
        audience: "user",
      });
    }

    if (status === "FAILED" || status === "CANCELLED") {
      await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          payment_status: "failed",
        })
        .eq("id", metadata.booking_id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Tap webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
