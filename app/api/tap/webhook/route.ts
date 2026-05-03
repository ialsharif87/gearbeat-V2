import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
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
