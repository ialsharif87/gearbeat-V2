import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";

function createReviewToken() {
  const randomPart = crypto.randomUUID().replaceAll("-", "");
  const timePart = Date.now().toString(36);

  return `${timePart}_${randomPart}`;
}

function combineBookingDateTime(date: string, time: string) {
  return new Date(`${date}T${time}`);
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const providedSecret = request.headers.get("x-cron-secret");

  if (cronSecret && providedSecret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      id,
      studio_id,
      customer_auth_user_id,
      booking_date,
      end_time,
      status,
      payment_status,
      review_requests (
        id
      ),
      reviews (
        id
      )
    `)
    .in("status", ["confirmed", "completed"])
    .eq("payment_status", "paid");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const eligibleBookings =
    bookings?.filter((booking) => {
      const existingRequests = Array.isArray(booking.review_requests)
        ? booking.review_requests
        : [];

      const existingReviews = Array.isArray(booking.reviews)
        ? booking.reviews
        : [];

      if (existingRequests.length > 0 || existingReviews.length > 0) {
        return false;
      }

      if (!booking.booking_date || !booking.end_time) {
        return false;
      }

      const bookingEndDateTime = combineBookingDateTime(
        booking.booking_date,
        booking.end_time
      );

      return bookingEndDateTime <= oneDayAgo;
    }) || [];

  if (!eligibleBookings.length) {
    return NextResponse.json({
      created: 0,
      message: "No eligible bookings found."
    });
  }

  const rows = eligibleBookings.map((booking) => ({
    booking_id: booking.id,
    studio_id: booking.studio_id,
    customer_auth_user_id: booking.customer_auth_user_id,
    review_token: createReviewToken(),
    status: "pending",
    expires_at: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString()
  }));

  const { error: insertError } = await supabase
    .from("review_requests")
    .insert(rows);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({
    created: rows.length,
    message: "Review requests created successfully."
  });
}
