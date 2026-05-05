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
  
  // Example for WhatsApp (Twilio):
  /*
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(process.env.TWILIO_ACCOUNT_SID + ':' + process.env.TWILIO_AUTH_TOKEN).toString('base64'),
    },
    body: new URLSearchParams({
      To: channel === 'whatsapp' ? `whatsapp:${to}` : to,
      From: channel === 'whatsapp' ? `whatsapp:${process.env.TWILIO_WA_NUMBER}` : process.env.TWILIO_SMS_NUMBER,
      Body: body,
    }),
  });
  */
  
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
