import "server-only";
/**
 * GearBeat SMS & WhatsApp Communication Utility
 * Integration: Twilio / Unifonic
 */

type MessagePayload = {
  to: string; // International format: +966...
  body: string;
  channel: "sms" | "whatsapp";
};

export async function sendMessage({ to, body, channel }: MessagePayload) {
  // TODO: Integrate with Twilio or Unifonic API
  console.log(`[${channel.toUpperCase()}_SENT] To: ${to}, Body: ${body}`);
  
  const hasProvider = !!(process.env.TWILIO_ACCOUNT_SID || process.env.UNIFONIC_API_KEY);

  if (!hasProvider) {
    if (process.env.NODE_ENV === "production") {
      console.error(`CRITICAL: SMS/WhatsApp provider not configured in production. ${channel} failed.`);
      return { success: false, error: "SMS provider not configured" };
    }
    console.warn(`SMS/WhatsApp provider not found. ${channel} mocked in development.`);
    return { success: true, mocked: true };
  }

  // Future implementation here...
  
  return { success: true };
}

/**
 * Sends a standard OTP code for mobile verification
 */
export async function sendOTP(phone: string, code: string) {
  const body = `Your GearBeat verification code is: ${code} | رمز التحقق الخاص بك هو: ${code}`;
  return sendMessage({ to: phone, body, channel: "sms" });
}

/**
 * Sends a high-priority WhatsApp alert to a vendor/owner
 */
export async function sendVendorAlert(phone: string, messageEn: string, messageAr: string) {
  const body = `GearBeat Alert:\n\n${messageEn}\n\n${messageAr}`;
  return sendMessage({ to: phone, body, channel: "whatsapp" });
}
