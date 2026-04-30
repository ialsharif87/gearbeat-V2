import type { SendOtpInput, SendOtpResult } from "@/lib/otp/types";

function maskTarget(value: string) {
  if (!value) {
    return "unknown";
  }

  if (value.includes("@")) {
    const [name, domain] = value.split("@");
    return `${name.slice(0, 2)}***@${domain}`;
  }

  return `${value.slice(0, 4)}****${value.slice(-3)}`;
}

export async function sendMockOtp(input: SendOtpInput): Promise<SendOtpResult> {
  console.log("[MOCK OTP]", {
    targetType: input.targetType,
    targetValue: maskTarget(input.targetValue),
    purpose: input.purpose,
    code:
      process.env.NODE_ENV === "production"
        ? "[hidden]"
        : input.code,
  });

  return {
    provider: "mock",
    delivered: true,
    message: "Mock OTP provider used. Replace with real SMS/email provider later.",
  };
}
