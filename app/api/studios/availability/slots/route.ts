import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type DbRow = Record<string, unknown>;

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

function readNumber(row: DbRow | null | undefined, keys: string[], fallback = 0) {
  if (!row) return fallback;

  for (const key of keys) {
    const value = row[key];

    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);

      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  return fallback;
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function timeToMinutes(value: string) {
  const cleanValue = value.slice(0, 5);
  const [hours, minutes] = cleanValue.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

function minutesToTime(value: number) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
}

function toLocalIso(date: string, minutes: number) {
  return `${date}T${minutesToTime(minutes)}:00`;
}

function getDayOfWeek(date: string) {
  const safeDate = new Date(`${date}T12:00:00`);
  return safeDate.getDay();
}

function rangesOverlap(
  firstStart: string,
  firstEnd: string,
  secondStart: string,
  secondEnd: string
) {
  const firstStartMs = new Date(firstStart).getTime();
  const firstEndMs = new Date(firstEnd).getTime();
  const secondStartMs = new Date(secondStart).getTime();
  const secondEndMs = new Date(secondEnd).getTime();

  if (
    Number.isNaN(firstStartMs) ||
    Number.isNaN(firstEndMs) ||
    Number.isNaN(secondStartMs) ||
    Number.isNaN(secondEndMs)
  ) {
    return false;
  }

  return firstStartMs < secondEndMs && firstEndMs > secondStartMs;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);

  let studioId = searchParams.get("studioId")?.trim() || "";
  const slug = searchParams.get("slug")?.trim() || "";
  const date = searchParams.get("date")?.trim() || "";

  if (!studioId && slug) {
    const { data: studio } = await supabase
      .from("studios")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    studioId = readText((studio || null) as DbRow | null, ["id"]);
  }

  if (!studioId) {
    return NextResponse.json(
      { error: "Studio ID is required." },
      { status: 400 }
    );
  }

  if (!isValidDate(date)) {
    return NextResponse.json(
      { error: "Valid date is required in YYYY-MM-DD format." },
      { status: 400 }
    );
  }

  const { data: exception } = await supabase
    .from("studio_availability_exceptions")
    .select("*")
    .eq("studio_id", studioId)
    .eq("exception_date", date)
    .maybeSingle();

  const exceptionRow = (exception || null) as DbRow | null;

  if (exceptionRow && Boolean(exceptionRow.is_closed)) {
    return NextResponse.json({
      ok: true,
      studioId,
      date,
      slots: [],
      reason: readText(exceptionRow, ["reason"]) || "Closed",
    });
  }

  const dayOfWeek = getDayOfWeek(date);

  const { data: rule } = await supabase
    .from("studio_availability_rules")
    .select("*")
    .eq("studio_id", studioId)
    .eq("day_of_week", dayOfWeek)
    .maybeSingle();

  const ruleRow = (rule || null) as DbRow | null;

  if (!ruleRow && !exceptionRow) {
    return NextResponse.json({
      ok: true,
      studioId,
      date,
      slots: [],
      reason: "No availability set for this day.",
    });
  }

  const isOpen = exceptionRow ? true : Boolean(ruleRow?.is_open);

  if (!isOpen) {
    return NextResponse.json({
      ok: true,
      studioId,
      date,
      slots: [],
      reason: "Closed",
    });
  }

  const openTime = exceptionRow
    ? readText(exceptionRow, ["open_time"])
    : readText(ruleRow, ["open_time"]);

  const closeTime = exceptionRow
    ? readText(exceptionRow, ["close_time"])
    : readText(ruleRow, ["close_time"]);

  const openMinutes = timeToMinutes(openTime);
  const closeMinutes = timeToMinutes(closeTime);

  if (openMinutes === null || closeMinutes === null || closeMinutes <= openMinutes) {
    return NextResponse.json({
      ok: true,
      studioId,
      date,
      slots: [],
      reason: "Invalid availability hours.",
    });
  }

  const slotMinutes = readNumber(ruleRow, ["slot_minutes"], 60);
  const bufferMinutes = readNumber(ruleRow, ["buffer_minutes"], 0);

  const blockingStatuses = [
    "pending",
    "pending_review",
    "pending_owner_review",
    "accepted",
    "confirmed",
  ];

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("studio_id", studioId)
    .in("status", blockingStatuses);

  const bookingRows = ((bookings || []) as DbRow[]).filter((booking) => {
    const start = readText(booking, [
      "start_time",
      "starts_at",
      "booking_start",
      "start_at",
    ]);

    return start.startsWith(date);
  });

  const slots = [];

  for (
    let slotStartMinutes = openMinutes;
    slotStartMinutes + slotMinutes <= closeMinutes;
    slotStartMinutes += slotMinutes + bufferMinutes
  ) {
    const slotEndMinutes = slotStartMinutes + slotMinutes;

    const slotStart = toLocalIso(date, slotStartMinutes);
    const slotEnd = toLocalIso(date, slotEndMinutes);

    const hasConflict = bookingRows.some((booking) => {
      const bookingStart = readText(booking, [
        "start_time",
        "starts_at",
        "booking_start",
        "start_at",
      ]);

      const bookingEnd = readText(booking, [
        "end_time",
        "ends_at",
        "booking_end",
        "end_at",
      ]);

      if (!bookingStart || !bookingEnd) {
        return false;
      }

      return rangesOverlap(slotStart, slotEnd, bookingStart, bookingEnd);
    });

    if (!hasConflict) {
      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
        label: `${minutesToTime(slotStartMinutes)} - ${minutesToTime(
          slotEndMinutes
        )}`,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    studioId,
    date,
    slots,
  });
}
