import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "../../../../lib/supabase/admin";

type StudioRow = {
  id: string;
  name: string | null;
  slug: string | null;
  city: string | null;
  district: string | null;
};

type BookingRow = {
  id: string;
  studio_id: string;
  customer_auth_user_id: string;
  booking_date: string | null;
  start_time: string | null;
  end_time: string | null;
  status: string | null;
  payment_status: string | null;
};

type ReviewRequestRow = {
  id: string;
  booking_id: string;
  studio_id: string;
  customer_auth_user_id: string;
  review_token: string;
  status: string;
  email_sent_at: string | null;
  expires_at: string | null;
  created_at: string | null;
  studios: StudioRow | StudioRow[] | null;
  bookings: BookingRow | BookingRow[] | null;
};

type ProfileRow = {
  auth_user_id: string;
  email: string | null;
  full_name: string | null;
  preferred_language?: string | null;
};

function getSecretFromRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const bearerToken = authHeader.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "").trim()
    : "";

  const headerSecret =
    request.headers.get("x-cron-secret") ||
    request.headers.get("x-vercel-cron-signature") ||
    "";

  const querySecret = request.nextUrl.searchParams.get("secret") || "";

  return bearerToken || headerSecret || querySecret;
}

function isAuthorizedCronRequest(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || cronSecret.trim().length < 12) {
    return {
      ok: false,
      status: 503,
      message:
        "CRON_SECRET is not configured or is too short. This endpoint is disabled."
    };
  }

  const providedSecret = getSecretFromRequest(request);

  if (!providedSecret || providedSecret !== cronSecret) {
    return {
      ok: false,
      status: 401,
      message: "Unauthorized cron request."
    };
  }

  return {
    ok: true,
    status: 200,
    message: "Authorized."
  };
}

function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;

  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  }

  return "";
}

function normalizeStudio(studios: StudioRow | StudioRow[] | null) {
  return Array.isArray(studios) ? studios[0] : studios;
}

function normalizeBooking(bookings: BookingRow | BookingRow[] | null) {
  return Array.isArray(bookings) ? bookings[0] : bookings;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch {
    return "—";
  }
}

function buildReviewEmail({
  customerName,
  studioName,
  bookingDate,
  startTime,
  endTime,
  reviewUrl
}: {
  customerName: string;
  studioName: string;
  bookingDate: string | null;
  startTime: string | null;
  endTime: string | null;
  reviewUrl: string;
}) {
  const safeCustomerName = customerName || "Creator";
  const safeStudioName = studioName || "GearBeat Studio";

  return `
<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <title>GearBeat Review</title>
  </head>

  <body style="margin:0;padding:0;background:#08080c;font-family:Arial,sans-serif;color:#ffffff;">
    <div style="max-width:640px;margin:0 auto;padding:32px;">
      <div style="background:#11111a;border:1px solid rgba(255,255,255,0.12);border-radius:24px;padding:28px;">
        <div style="display:inline-block;background:rgba(30,215,96,0.16);border:1px solid rgba(30,215,96,0.35);color:#1ed760;border-radius:999px;padding:8px 14px;font-size:13px;">
          GearBeat Verified Review
        </div>

        <h1 style="margin:22px 0 12px;font-size:26px;line-height:1.3;color:#ffffff;">
          شاركنا تجربتك في ${safeStudioName}
        </h1>

        <p style="margin:0 0 18px;color:rgba(255,255,255,0.78);font-size:16px;line-height:1.8;">
          مرحبًا ${safeCustomerName}، نرجو منك تقييم تجربتك بعد الحجز. تقييمك يساعد المبدعين الآخرين على اختيار الاستوديو المناسب.
        </p>

        <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.10);border-radius:18px;padding:18px;margin:22px 0;">
          <p style="margin:0 0 8px;color:#ffffff;">
            <strong>الاستوديو:</strong> ${safeStudioName}
          </p>
          <p style="margin:0 0 8px;color:#ffffff;">
            <strong>التاريخ:</strong> ${formatDate(bookingDate)}
          </p>
          <p style="margin:0;color:#ffffff;">
            <strong>الوقت:</strong> ${startTime || "—"} - ${endTime || "—"}
          </p>
        </div>

        <a href="${reviewUrl}" style="display:inline-block;background:#1ed760;color:#050507;text-decoration:none;font-weight:bold;border-radius:14px;padding:14px 22px;margin:10px 0 22px;">
          اكتب التقييم الآن
        </a>

        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.12);margin:26px 0;" />

        <h2 style="margin:0 0 12px;font-size:20px;color:#ffffff;direction:ltr;text-align:left;">
          How was your studio experience?
        </h2>

        <p style="margin:0 0 18px;color:rgba(255,255,255,0.78);font-size:15px;line-height:1.7;direction:ltr;text-align:left;">
          Hi ${safeCustomerName}, please review your booking experience at ${safeStudioName}. Your verified review helps other creators choose trusted studios.
        </p>

        <div style="direction:ltr;text-align:left;">
          <a href="${reviewUrl}" style="display:inline-block;background:#1ed760;color:#050507;text-decoration:none;font-weight:bold;border-radius:14px;padding:14px 22px;">
            Write Review
          </a>
        </div>

        <p style="margin:28px 0 0;color:rgba(255,255,255,0.5);font-size:12px;line-height:1.6;">
          إذا لم يعمل الزر، انسخ هذا الرابط وافتحه في المتصفح:<br />
          <span style="direction:ltr;display:block;word-break:break-all;">${reviewUrl}</span>
        </p>
      </div>
    </div>
  </body>
</html>
`;
}

async function getCustomerProfile(customerAuthUserId: string) {
  const supabaseAdmin = createAdminClient();

  const [{ data: userData }, { data: profileData }] = await Promise.all([
    supabaseAdmin.auth.admin.getUserById(customerAuthUserId),
    supabaseAdmin
      .from("profiles")
      .select("auth_user_id,email,full_name,preferred_language")
      .eq("auth_user_id", customerAuthUserId)
      .maybeSingle()
  ]);

  const profile = (profileData || null) as ProfileRow | null;
  const authUser = userData?.user || null;

  return {
    email: profile?.email || authUser?.email || "",
    fullName:
      profile?.full_name ||
      authUser?.user_metadata?.full_name ||
      authUser?.user_metadata?.name ||
      authUser?.email ||
      "Creator",
    preferredLanguage:
      profile?.preferred_language ||
      authUser?.user_metadata?.preferred_language ||
      "ar"
  };
}

async function createMissingReviewRequests() {
  const supabaseAdmin = createAdminClient();

  const { data: eligibleBookings, error } = await supabaseAdmin
    .from("bookings")
    .select(
      `
      id,
      studio_id,
      customer_auth_user_id,
      booking_date,
      start_time,
      end_time,
      status,
      payment_status
    `
    )
    .in("status", ["confirmed", "completed"])
    .eq("payment_status", "paid")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  const bookings = (eligibleBookings || []) as BookingRow[];
  let created = 0;

  for (const booking of bookings) {
    const [{ data: existingReview }, { data: existingRequest }] =
      await Promise.all([
        supabaseAdmin
          .from("reviews")
          .select("id")
          .eq("booking_id", booking.id)
          .maybeSingle(),

        supabaseAdmin
          .from("review_requests")
          .select("id")
          .eq("booking_id", booking.id)
          .maybeSingle()
      ]);

    if (existingReview || existingRequest) {
      continue;
    }

    const reviewToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { error: insertError } = await supabaseAdmin
      .from("review_requests")
      .insert({
        booking_id: booking.id,
        studio_id: booking.studio_id,
        customer_auth_user_id: booking.customer_auth_user_id,
        review_token: reviewToken,
        status: "pending",
        expires_at: expiresAt.toISOString()
      });

    if (!insertError) {
      created += 1;
    }
  }

  return created;
}

async function sendPendingReviewEmails(request: NextRequest) {
  const supabaseAdmin = createAdminClient();

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.REVIEW_EMAIL_FROM ||
    process.env.RESEND_FROM ||
    "GearBeat <noreply@gearbeat.com>";

  if (!resendApiKey) {
    return {
      sent: 0,
      failed: 0,
      skipped: 0,
      message: "RESEND_API_KEY is not configured. Emails were not sent."
    };
  }

  const siteUrl = getSiteUrl();

  if (!siteUrl) {
    return {
      sent: 0,
      failed: 0,
      skipped: 0,
      message: "NEXT_PUBLIC_SITE_URL or VERCEL_URL is not configured."
    };
  }

  const { data: pendingRequests, error } = await supabaseAdmin
    .from("review_requests")
    .select(
      `
      id,
      booking_id,
      studio_id,
      customer_auth_user_id,
      review_token,
      status,
      email_sent_at,
      expires_at,
      created_at,
      studios (
        id,
        name,
        slug,
        city,
        district
      ),
      bookings (
        id,
        studio_id,
        customer_auth_user_id,
        booking_date,
        start_time,
        end_time,
        status,
        payment_status
      )
    `
    )
    .eq("status", "pending")
    .is("email_sent_at", null)
    .order("created_at", { ascending: true })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  const resend = new Resend(resendApiKey);
  const requests = (pendingRequests || []) as ReviewRequestRow[];

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const reviewRequest of requests) {
    const booking = normalizeBooking(reviewRequest.bookings);
    const studio = normalizeStudio(reviewRequest.studios);

    if (!booking || !studio) {
      skipped += 1;

      await supabaseAdmin
        .from("review_requests")
        .update({
          status: "failed"
        })
        .eq("id", reviewRequest.id);

      continue;
    }

    if (
      booking.payment_status !== "paid" ||
      !["confirmed", "completed"].includes(String(booking.status || ""))
    ) {
      skipped += 1;
      continue;
    }

    if (reviewRequest.expires_at) {
      const expiresAt = new Date(reviewRequest.expires_at);

      if (expiresAt.getTime() < Date.now()) {
        skipped += 1;

        await supabaseAdmin
          .from("review_requests")
          .update({
            status: "expired"
          })
          .eq("id", reviewRequest.id);

        continue;
      }
    }

    const customer = await getCustomerProfile(reviewRequest.customer_auth_user_id);

    if (!customer.email) {
      failed += 1;

      await supabaseAdmin
        .from("review_requests")
        .update({
          status: "failed"
        })
        .eq("id", reviewRequest.id);

      continue;
    }

    const reviewUrl = `${siteUrl}/customer/bookings/${booking.id}/review?token=${reviewRequest.review_token}`;

    try {
      await resend.emails.send({
        from: fromEmail,
        to: customer.email,
        subject: `Review your GearBeat booking at ${studio.name || "the studio"}`,
        html: buildReviewEmail({
          customerName: customer.fullName,
          studioName: studio.name || "GearBeat Studio",
          bookingDate: booking.booking_date,
          startTime: booking.start_time,
          endTime: booking.end_time,
          reviewUrl
        })
      });

      await supabaseAdmin
        .from("review_requests")
        .update({
          status: "sent",
          email_sent_at: new Date().toISOString()
        })
        .eq("id", reviewRequest.id);

      sent += 1;
    } catch (sendError) {
      failed += 1;

      await supabaseAdmin
        .from("review_requests")
        .update({
          status: "failed"
        })
        .eq("id", reviewRequest.id);
    }
  }

  return {
    sent,
    failed,
    skipped,
    message: "Review request email processing completed."
  };
}

export async function GET(request: NextRequest) {
  const authorization = isAuthorizedCronRequest(request);

  if (!authorization.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: authorization.message
      },
      {
        status: authorization.status
      }
    );
  }

  try {
    const createdReviewRequests = await createMissingReviewRequests();
    const emailResult = await sendPendingReviewEmails(request);

    return NextResponse.json({
      ok: true,
      created_review_requests: createdReviewRequests,
      email_result: emailResult
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown cron error."
      },
      {
        status: 500
      }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
