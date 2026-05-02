import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications";

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

function createBookingNumber() {
  return `GB-STU-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`;
}

function isValidDate(value: string) {
  const date = new Date(value);
  return value && !Number.isNaN(date.getTime());
}

function normalizeTime(value: string) {
  const cleanValue = cleanText(value);

  if (/^\d{2}:\d{2}$/.test(cleanValue)) {
    return cleanValue;
  }

  if (/^\d{1}:\d{2}$/.test(cleanValue)) {
    return `0${cleanValue}`;
  }

  return "";
}

function addHoursToTime(time: string, durationHours: number) {
  const [hoursRaw, minutesRaw] = time.split(":");
  const hours = Number(hoursRaw || 0);
  const minutes = Number(minutesRaw || 0);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return "";
  }

  const totalMinutes = hours * 60 + minutes + Math.round(durationHours * 60);
  const normalizedTotal = Math.min(totalMinutes, 24 * 60);
  const nextHours = Math.floor(normalizedTotal / 60);
  const nextMinutes = normalizedTotal % 60;

  return `${String(nextHours).padStart(2, "0")}:${String(nextMinutes).padStart(
    2,
    "0"
  )}`;
}

function getStudioName(studio: any) {
  return studio?.name_en || studio?.name || studio?.name_ar || "Studio";
}

function getStudioHourlyPrice(studio: any) {
  const price = Number(
    studio?.hourly_rate ||
      studio?.price_per_hour ||
      studio?.price_from ||
      studio?.base_price ||
      0
  );

  if (!Number.isFinite(price) || price <= 0) {
    return 0;
  }

  return price;
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

    const studioId = cleanText(body.studioId || body.studio_id);
    const bookingDate = cleanText(body.bookingDate || body.booking_date);
    const startTime = normalizeTime(body.startTime || body.start_time);
    const durationHours = cleanNumber(body.durationHours || body.duration_hours);
    const notes = cleanText(body.notes);

    if (!studioId) {
      return NextResponse.json(
        { error: "Studio id is required." },
        { status: 400 }
      );
    }

    if (!isValidDate(bookingDate)) {
      return NextResponse.json(
        { error: "Valid booking date is required." },
        { status: 400 }
      );
    }

    if (!startTime) {
      return NextResponse.json(
        { error: "Valid start time is required." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(durationHours) || durationHours <= 0) {
      return NextResponse.json(
        { error: "Duration must be greater than zero." },
        { status: 400 }
      );
    }

    if (durationHours > 12) {
      return NextResponse.json(
        { error: "Duration cannot exceed 12 hours." },
        { status: 400 }
      );
    }

    const endTime = addHoursToTime(startTime, durationHours);

    if (!endTime || endTime <= startTime) {
      return NextResponse.json(
        { error: "Invalid booking end time." },
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

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("auth_user_id, full_name, email")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    const { data: studio, error: studioError } = await supabaseAdmin
      .from("studios")
      .select(`
        id,
        slug,
        owner_auth_user_id,
        name,
        name_en,
        name_ar,
        status,
        verified,
        booking_enabled,
        price_from,
        hourly_rate,
        price_per_hour,
        base_price,
        currency_code
      `)
      .eq("id", studioId)
      .maybeSingle();

    if (studioError) {
      throw new Error(studioError.message);
    }

    if (!studio) {
      return NextResponse.json(
        { error: "Studio not found." },
        { status: 404 }
      );
    }

    if (studio.booking_enabled === false) {
      return NextResponse.json(
        { error: "Booking is not enabled for this studio." },
        { status: 400 }
      );
    }

    if (
      studio.status &&
      !["approved", "active", "published", "verified"].includes(studio.status)
    ) {
      return NextResponse.json(
        { error: "Studio is not available for booking." },
        { status: 400 }
      );
    }

    const hourlyPrice = getStudioHourlyPrice(studio);

    if (hourlyPrice <= 0) {
      return NextResponse.json(
        { error: "Studio price is not configured." },
        { status: 400 }
      );
    }

    const { data: overlappingBookings, error: overlapError } =
      await supabaseAdmin
        .from("bookings")
        .select("id")
        .eq("studio_id", studio.id)
        .eq("booking_date", bookingDate)
        .in("status", ["pending_payment", "pending", "confirmed", "paid"])
        .lt("start_time", endTime)
        .gt("end_time", startTime)
        .limit(1);

    if (overlapError) {
      throw new Error(overlapError.message);
    }

    if (overlappingBookings && overlappingBookings.length > 0) {
      return NextResponse.json(
        { error: "This studio is already booked for the selected time." },
        { status: 400 }
      );
    }

    // Availability validation
    const dayOfWeek = new Date(`${bookingDate}T12:00:00`).getDay();

    const { data: availabilityRule } = await supabaseAdmin
      .from("studio_availability_rules")
      .select("*")
      .eq("studio_id", studio.id)
      .eq("day_of_week", dayOfWeek)
      .maybeSingle();

    const { data: exception } = await supabaseAdmin
      .from("studio_availability_exceptions")
      .select("*")
      .eq("studio_id", studio.id)
      .eq("exception_date", bookingDate)
      .maybeSingle();

    if (exception && exception.is_closed) {
      return NextResponse.json(
        { error: `Studio is closed on this date: ${exception.reason || "Holiday"}` },
        { status: 400 }
      );
    }

    if (availabilityRule && !availabilityRule.is_open && !exception) {
      return NextResponse.json(
        { error: "Studio is closed on this day of the week." },
        { status: 400 }
      );
    }

    if (availabilityRule || exception) {
      const openTime = exception?.is_closed === false ? exception.open_time : availabilityRule?.open_time;
      const closeTime = exception?.is_closed === false ? exception.close_time : availabilityRule?.close_time;

      if (openTime && startTime < openTime.slice(0, 5)) {
        return NextResponse.json(
          { error: `Studio is not open yet. Opening time: ${openTime.slice(0, 5)}` },
          { status: 400 }
        );
      }

      if (closeTime && endTime > closeTime.slice(0, 5)) {
        return NextResponse.json(
          { error: `Studio will be closed by then. Closing time: ${closeTime.slice(0, 5)}` },
          { status: 400 }
        );
      }
    }

    const subtotalAmount = hourlyPrice * durationHours;
    const totalAmount = subtotalAmount;
    const currencyCode = studio.currency_code || "SAR";
    const nowIso = new Date().toISOString();
    const bookingNumber = createBookingNumber();

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .insert({
        auth_user_id: user.id,
        customer_auth_user_id: user.id,
        studio_id: studio.id,
        owner_auth_user_id: studio.owner_auth_user_id || null,
        booking_number: bookingNumber,
        customer_name: profile?.full_name || null,
        customer_email: profile?.email || user.email || null,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        duration_hours: durationHours,
        status: "pending_payment",
        payment_status: "unpaid",
        subtotal_amount: subtotalAmount,
        discount_amount: 0,
        coupon_discount_amount: 0,
        wallet_credit_used: 0,
        loyalty_points_redeemed: 0,
        total_amount: totalAmount,
        currency_code: currencyCode,
        notes: notes || null,
        metadata: {
          source: "studio_booking_checkout",
          studio_name: getStudioName(studio),
          hourly_price: hourlyPrice,
        },
        created_at: nowIso,
        updated_at: nowIso,
      })
      .select("id, booking_number, total_amount, currency_code")
      .single();

    if (bookingError) {
      throw new Error(bookingError.message);
    }

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    const { data: checkoutSession, error: checkoutError } = await supabaseAdmin
      .from("checkout_payment_sessions")
      .insert({
        auth_user_id: user.id,
        source_type: "studio_booking",
        source_id: booking.id,
        provider_code: "manual",
        payment_method: "manual",
        installment_provider: null,
        amount: totalAmount,
        currency_code: currencyCode,
        status: "created",
        coupon_discount_amount: 0,
        wallet_credit_used: 0,
        loyalty_points_redeemed: 0,
        expires_at: expiresAt,
        metadata: {
          source: "studio_booking_checkout",
          booking_id: booking.id,
          booking_number: booking.booking_number,
          studio_id: studio.id,
          studio_name: getStudioName(studio),
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
          duration_hours: durationHours,
          subtotal_amount: subtotalAmount,
        },
        created_at: nowIso,
        updated_at: nowIso,
      })
      .select("id, amount, currency_code, status, expires_at")
      .single();

    if (checkoutError) {
      throw new Error(checkoutError.message);
    }

    await supabaseAdmin
      .from("bookings")
      .update({
        checkout_session_id: checkoutSession.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id);

    // [Patch 75] Create notification
    await createNotification(supabaseAdmin, {
      userId: user.id,
      audience: "customer",
      title: "Booking request created",
      body: `Your studio booking request ${bookingNumber} has been created.`,
      notificationType: "booking_created",
      entityType: "booking",
      entityId: booking.id,
      actionUrl: "/customer",
    });

    if (studio.owner_auth_user_id) {
      await createNotification(supabaseAdmin, {
        userId: studio.owner_auth_user_id,
        audience: "owner",
        title: "New booking request",
        body: `You have a new booking request for ${getStudioName(studio)}.`,
        notificationType: "booking_created",
        entityType: "booking",
        entityId: booking.id,
        actionUrl: "/owner/bookings",
      });
    }

    return NextResponse.json({
      ok: true,
      bookingId: booking.id,
      bookingNumber: booking.booking_number,
      checkoutSessionId: checkoutSession.id,
      amount: Number(booking.total_amount || totalAmount),
      currencyCode: booking.currency_code || currencyCode,
      bookingDate,
      startTime,
      endTime,
      durationHours,
      checkoutStatus: checkoutSession.status,
      expiresAt: checkoutSession.expires_at,
      message: "Studio booking created. Manual test payment is ready.",
    });
  } catch (error) {
    console.error("Studio booking create failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not create studio booking.",
      },
      { status: 500 }
    );
  }
}
