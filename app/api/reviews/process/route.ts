import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "../../../../lib/supabase/admin";

function createReviewToken() {
  const randomPart = crypto.randomUUID().replaceAll("-", "");
  const timePart = Date.now().toString(36);

  return `${timePart}_${randomPart}`;
}

function combineBookingDateTime(date: string, time: string) {
  return new Date(`${date}T${time}`);
}

function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000"
  );
}

function buildReviewEmail({
  customerEmail,
  studioName,
  reviewUrl
}: {
  customerEmail: string;
  studioName: string;
  reviewUrl: string;
}) {
  const subject = `How was your experience at ${studioName}?`;

  const html = `
    <div style="font-family: Arial, sans-serif; background:#070b18; color:#ffffff; padding:32px;">
      <div style="max-width:620px; margin:0 auto; background:#10172a; border:1px solid rgba(255,255,255,0.12); border-radius:24px; padding:28px;">
        <h1 style="margin:0 0 12px; font-size:28px;">How was your studio experience?</h1>
        <p style="font-size:16px; line-height:1.6; color:#cbd5e1;">
          Thank you for booking <strong>${studioName}</strong> through GearBeat.
        </p>
        <p style="font-size:16px; line-height:1.6; color:#cbd5e1;">
          Your review helps other creators choose trusted studios. This review is linked to a verified paid booking.
        </p>
        <a href="${reviewUrl}" style="display:inline-block; margin-top:18px; background:#1ed760; color:#06130c; text-decoration:none; font-weight:bold; padding:14px 22px; border-radius:999px;">
          Write your review
        </a>
        <p style="font-size:13px; line-height:1.6; color:#94a3b8; margin-top:24px;">
          If the button does not work, copy and paste this link into your browser:<br />
          <span style="word-break:break-all;">${reviewUrl}</span>
        </p>
        <hr style="border:0; border-top:1px solid rgba(255,255,255,0.12); margin:24px 0;" />
        <p style="font-size:13px; color:#94a3b8; margin:0;">
          Sent to ${customerEmail} by GearBeat.
        </p>
      </div>
    </div>
  `;

  const text = `
How was your studio experience?

Thank you for booking ${studioName} through GearBeat.

Your review helps other creators choose trusted studios. This review is linked to a verified paid booking.

Write your review:
${reviewUrl}

Sent to ${customerEmail} by GearBeat.
  `;

  return { subject, html, text };
}

async function createReviewRequests(supabase: ReturnType<typeof createAdminClient>) {
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
    throw new Error(error.message);
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
    return 0;
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
    throw new Error(insertError.message);
  }

  return rows.length;
}

async function sendReviewEmails(supabase: ReturnType<typeof createAdminClient>) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.REVIEW_FROM_EMAIL;

  if (!resendApiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }

  if (!fromEmail) {
    throw new Error("Missing REVIEW_FROM_EMAIL");
  }

  const resend = new Resend(resendApiKey);
  const siteUrl = getSiteUrl();

  const { data: reviewRequests, error } = await supabase
    .from("review_requests")
    .select(`
      id,
      booking_id,
      studio_id,
      customer_auth_user_id,
      review_token,
      status,
      email_sent_at,
      expires_at,
      studios (
        name,
        slug
      )
    `)
    .eq("status", "pending")
    .is("email_sent_at", null)
    .limit(25);

  if (error) {
    throw new Error(error.message);
  }

  if (!reviewRequests?.length) {
    return {
      sent: 0,
      failed: [] as Array<{ id: string; error: string }>
    };
  }

  let sent = 0;
  const failed: Array<{ id: string; error: string }> = [];

  for (const requestItem of reviewRequests) {
    const { data: userData, error: userError } =
      await supabase.auth.admin.getUserById(requestItem.customer_auth_user_id);

    if (userError || !userData?.user?.email) {
      failed.push({
        id: requestItem.id,
        error: userError?.message || "Customer email not found"
      });
      continue;
    }

    const studio = Array.isArray(requestItem.studios)
      ? requestItem.studios[0]
      : requestItem.studios;

    const studioName = studio?.name || "the studio";

    const reviewUrl = `${siteUrl}/customer/bookings/${requestItem.booking_id}/review?token=${requestItem.review_token}`;

    const email = buildReviewEmail({
      customerEmail: userData.user.email,
      studioName,
      reviewUrl
    });

    const { error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: userData.user.email,
      subject: email.subject,
      html: email.html,
      text: email.text
    });

    if (sendError) {
      failed.push({
        id: requestItem.id,
        error: sendError.message
      });
      continue;
    }

    const { error: updateError } = await supabase
      .from("review_requests")
      .update({
        status: "sent",
        email_sent_at: new Date().toISOString()
      })
      .eq("id", requestItem.id);

    if (updateError) {
      failed.push({
        id: requestItem.id,
        error: updateError.message
      });
      continue;
    }

    sent += 1;
  }

  return { sent, failed };
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const providedSecret = request.headers.get("x-cron-secret");

  if (cronSecret && providedSecret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    const created = await createReviewRequests(supabase);
    const emailResult = await sendReviewEmails(supabase);

    return NextResponse.json({
      created,
      sent: emailResult.sent,
      failed: emailResult.failed,
      message: "Review process completed."
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
