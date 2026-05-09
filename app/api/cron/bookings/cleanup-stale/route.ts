import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";

/**
 * GEARBEAT PATCH 44B: Stale Booking Cleanup
 * 
 * This route identifies bookings stuck in 'pending_payment' for more than 60 minutes
 * and moves them to 'cancelled' to release the studio availability slots.
 */

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // 1. Authorization
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json(
      { error: "Unauthorized cron request", code: "CRON_UNAUTHORIZED" },
      { status: 401 }
    );
  }

  try {
    const supabaseAdmin = createAdminClient();
    
    // 2. Define Expiry Window (60 Minutes)
    const expiryDate = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    // 3. Update Stale Bookings
    // We target:
    // - status = 'pending_payment'
    // - payment_status != 'paid' (double safety check)
    // - created_at < 60 minutes ago
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
        metadata: {
          cancelled_reason: "Stale pending payment expired",
          system_cancelled_at: new Date().toISOString()
        }
      })
      .eq("status", "pending_payment")
      .neq("payment_status", "paid")
      .lt("created_at", expiryDate)
      .select("id");

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      ok: true,
      expiry_window_minutes: 60,
      affected_rows: data?.length || 0,
      cancelled_booking_ids: data?.map((b) => b.id) || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Stale booking cleanup error:", error);
    
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Internal cleanup error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
