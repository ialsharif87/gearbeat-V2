import { createNotification } from "./notifications";

/**
 * GearBeat Email Communication Utility
 * Integration: Resend (Recommended)
 */

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail({ to, subject, html, text }: EmailPayload) {
  console.log(`[EMAIL_SENT] To: ${to}, Subject: ${subject}`);
  
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not found. Email not sent to provider.");
    return { success: true, mocked: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'GearBeat <onboarding@gearbeat.app>',
        to: [to],
        subject,
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Resend API Error:", data);
      return { success: false, error: data };
    }

    return { success: true, id: data.id };
  } catch (error) {
    console.error("Fetch error sending email:", error);
    return { success: false, error };
  }
}

/**
 * Unified "Smart Notification" - Sends Internal + Email
 */
export async function sendSmartNotification(
  supabase: any,
  {
    userId,
    email,
    titleEn,
    titleAr,
    bodyEn,
    bodyAr,
    actionUrl,
    entityType,
    entityId,
  }: {
    userId: string;
    email?: string;
    titleEn: string;
    titleAr: string;
    bodyEn: string;
    bodyAr: string;
    actionUrl?: string;
    entityType?: string;
    entityId?: string;
  }
) {
  // 1. Create Internal Notification
  await createNotification(supabase, {
    userId,
    title: titleEn, // Default to English for DB, Arabic in metadata or body
    body: bodyAr || bodyEn,
    actionUrl,
    entityType,
    entityId,
    metadata: {
      title_ar: titleAr,
      body_en: bodyEn
    }
  });

  // 2. Send Email if address provided
  if (email) {
    await sendEmail({
      to: email,
      subject: `GearBeat | ${titleEn}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #080706; color: #fff; padding: 40px; border-radius: 20px; border: 1px solid #C7A45D;">
          <h1 style="color: #C7A45D;">${titleEn}</h1>
          <h2 style="color: #C7A45D; text-align: right;">${titleAr}</h2>
          <hr style="border: 0; border-top: 1px solid #1a1a1a; margin: 20px 0;">
          <p style="font-size: 1.1rem; line-height: 1.6;">${bodyEn}</p>
          <p style="font-size: 1.1rem; line-height: 1.6; text-align: right;">${bodyAr}</p>
          ${actionUrl ? `<a href="${process.env.NEXT_PUBLIC_SITE_URL}${actionUrl}" style="display: inline-block; padding: 12px 24px; background: #C7A45D; color: #000; text-decoration: none; border-radius: 10px; font-weight: bold; margin-top: 20px;">Open GearBeat</a>` : ''}
          <footer style="margin-top: 40px; font-size: 0.8rem; color: #555;">
            &copy; ${new Date().getFullYear()} GearBeat Ecosystem. All rights reserved.
          </footer>
        </div>
      `
    });
  }
}
