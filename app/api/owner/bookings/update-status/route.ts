import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { createNotification } from "../../../../../lib/notifications";

type DbRow = Record<string, unknown>;

const allowedStatuses = new Set([
  "accepted",
  "confirmed",
  "rejected",
  "cancelled",
  "completed",
  "no_show",
]);

const lockedStatuses = new Set([
  "rejected",
  "declined",
  "cancelled",
  "completed",
  "no_show",
]);

function readText(row: DbRow | null | undefined, keys: string[]) {
  if (!row) return "";

  for (const key of keys) {
    const value = row[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return "";
}

async function userOwnsStudio(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  studioId: string
) {
  const ownerColumnCandidates = [
    "owner_id",
    "user_id",
    "created_by",
    "profile_id",
  ];

  for (const ownerColumn of ownerColumnCandidates) {
    const { data, error } = await supabase
      .from("studios")
      .select("id")
      .eq("id", studioId)
      .eq(ownerColumn, userId)
      .maybeSingle();

    if (!error && data) {
      return true;
    }
  }

  return false;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);

  const bookingId =
    typeof body?.bookingId === "string" ? body.bookingId.trim() : "";

  const nextStatus =
    typeof body?.status === "string" ? body.status.trim() : "";

  const ownerNotes =
    typeof body?.ownerNotes === "string" ? body.ownerNotes.trim() : "";

  if (!bookingId) {
    return NextResponse.json(
      { error: "Booking ID is required." },
      { status: 400 }
    );
  }

  if (!allowedStatuses.has(nextStatus)) {
    return NextResponse.json(
      { error: "Invalid booking status." },
      { status: 400 }
    );
  }

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError || !booking) {
    return NextResponse.json(
      { error: "Booking not found." },
      { status: 404 }
    );
  }

  const bookingRow = booking as DbRow;
  const studioId = readText(bookingRow, ["studio_id"]);
  const currentStatus = readText(bookingRow, ["status"]);

  if (!studioId) {
    return NextResponse.json(
      { error: "Booking does not have a studio linked." },
      { status: 400 }
    );
  }

  const ownsStudio = await userOwnsStudio(supabase, user.id, studioId);

  if (!ownsStudio) {
    return NextResponse.json(
      { error: "You do not have permission to update this booking." },
      { status: 403 }
    );
  }

  if (lockedStatuses.has(currentStatus) && currentStatus !== nextStatus) {
    return NextResponse.json(
      { error: "This booking is already closed and cannot be changed." },
      { status: 409 }
    );
  }

  const now = new Date().toISOString();

  const updatePayload: DbRow = {
    status: nextStatus,
    owner_notes: ownerNotes || null,
    status_changed_at: now,
    status_changed_by: user.id,
    updated_at: now,
  };

  if (
    nextStatus === "accepted" ||
    nextStatus === "confirmed" ||
    nextStatus === "rejected"
  ) {
    updatePayload.owner_decision_at = now;
  }

  if (nextStatus === "cancelled") {
    updatePayload.cancelled_at = now;
  }

  const { error: updateError } = await supabase
    .from("bookings")
    .update(updatePayload)
    .eq("id", bookingId);

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    );
  }

  // [Patch 75] Create notification
  const customerId = readText(bookingRow, ["customer_auth_user_id", "auth_user_id"]);
  if (customerId) {
    await createNotification(supabase, {
      userId: customerId,
      audience: "customer",
      title: "Booking status updated",
      body: `Your booking status has been updated to ${nextStatus}.`,
      notificationType: "booking_status_updated",
      entityType: "booking",
      entityId: bookingId,
      actionUrl: "/customer",
    });
  }

  return NextResponse.json({
    ok: true,
    bookingId,
    status: nextStatus,
  });
}
