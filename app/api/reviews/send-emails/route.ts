import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCronAuthFailureResponse } from "@/lib/cron-auth";

function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
    "http://localhost:3000"
  );
}

function buildReviewEmail({
  customerEmail,
  studioName,
  reviewUrl,
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
        <a href="${reviewUrl}" style="display:inline-block; margin-top:18px; background:#67C587; color:#06130c; text-decoration:none; font-weight:bold; padding:14px 22px; border-radius:999px;">
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

export async function GET(request: NextRequest) {
  const authFailure = getCronAuthFailureResponse(request);
  if (authFailure) return authFailure;

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.REVIEW_FROM_EMAIL;

  if (!resendApiKey) {
    return NextResponse.json(
      { error: "Missing RESEND_API_KEY" },
      { status: 500 }
    );
  }

  if (!fromEmail) {
    return NextResponse.json(
      { error: "Missing REVIEW_FROM_EMAIL" },
      { status: 500 }
    );
  }

  const supabase = createAdminClient();
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!reviewRequests?.length) {
    return NextResponse.json({
      sent: 0,
      message: "No pending review emails found."
    });
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

  return NextResponse.json({
    sent,
    failed,
    message: "Review email process completed."
  });
}
