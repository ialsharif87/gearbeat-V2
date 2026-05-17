import { NextResponse } from "next/server";

/**
 * DECOMMISSIONED ENDPOINT - PATCH 110B SECURITY HARDENING
 * Purpose: Lock down the manual confirmation testing gateway.
 * Returns: 410 Gone
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "Manual payment confirmation is disabled until an authenticated admin-only payment operations gateway is implemented."
    },
    { status: 410 }
  );
}
