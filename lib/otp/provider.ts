import crypto from "crypto";
import type {
  CreateOtpSessionInput,
  OtpPurpose,
  OtpTargetType,
  SendOtpInput,
  SendOtpResult,
} from "@/lib/otp/types";
import { sendMockOtp } from "@/lib/otp/mock-provider";

const OTP_LENGTH = 6;

export function generateOtpCode(length = OTP_LENGTH) {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;

  return String(crypto.randomInt(min, max + 1));
}

function getOtpHashSecret() {
  const secret =
    process.env.OTP_HASH_SECRET ||
    process.env.CRON_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "";

  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("OTP_HASH_SECRET is required in production.");
  }

  return secret || "gearbeat-dev-otp-secret";
}

export function hashOtpCode(code: string) {
  return crypto
    .createHmac("sha256", getOtpHashSecret())
    .update(code)
    .digest("hex");
}

export function isValidOtpTargetType(value: string): value is OtpTargetType {
  return value === "phone" || value === "email";
}

export function isValidOtpPurpose(value: string): value is OtpPurpose {
  return [
    "verification",
    "signup",
    "login",
    "password_reset",
    "profile_update",
  ].includes(value);
}

export function normalizeOtpTargetValue({
  targetType,
  targetValue,
}: {
  targetType: OtpTargetType;
  targetValue: string;
}) {
  const value = String(targetValue || "").trim();

  if (targetType === "email") {
    return value.toLowerCase();
  }

  return value.replace(/[()\s-]/g, "");
}

export function isValidOtpTargetValue({
  targetType,
  targetValue,
}: {
  targetType: OtpTargetType;
  targetValue: string;
}) {
  if (targetType === "email") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetValue);
  }

  return /^\+[1-9]\d{7,14}$/.test(targetValue);
}

export function isValidOtpCode(code: string) {
  return /^\d{6}$/.test(String(code || "").trim());
}

export function shouldReturnDevOtpCode() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_MOCK_OTP_ENABLED === "true" ||
    process.env.MOCK_OTP_ENABLED === "true"
  );
}

export async function sendOtpWithConfiguredProvider(
  input: SendOtpInput
): Promise<SendOtpResult> {
  const provider = process.env.OTP_PROVIDER || "mock";

  if (provider === "mock") {
    return sendMockOtp(input);
  }

  // Future provider integration point.
  // Do not fail hard now. Keep the foundation ready.
  console.warn(
    `OTP provider "${provider}" is not implemented yet. Falling back to mock provider.`
  );

  return sendMockOtp(input);
}

export function createOtpSessionPayload(input: CreateOtpSessionInput, code: string) {
  return {
    auth_user_id: input.authUserId || null,
    target_type: input.targetType,
    target_value: input.targetValue,
    provider: process.env.OTP_PROVIDER || "mock",
    purpose: input.purpose,
    code_hash: hashOtpCode(code),
    status: "pending",
    attempt_count: 0,
    max_attempts: 5,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  };
}
