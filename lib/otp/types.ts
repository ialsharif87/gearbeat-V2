export type OtpTargetType = "phone" | "email";

export type OtpPurpose =
  | "verification"
  | "signup"
  | "login"
  | "password_reset"
  | "profile_update";

export type OtpProviderCode = "mock" | "twilio" | "unifonic" | "msegat" | "whatsapp";

export type SendOtpInput = {
  targetType: OtpTargetType;
  targetValue: string;
  code: string;
  purpose: OtpPurpose;
};

export type SendOtpResult = {
  provider: OtpProviderCode;
  delivered: boolean;
  message?: string;
};

export type CreateOtpSessionInput = {
  authUserId?: string | null;
  targetType: OtpTargetType;
  targetValue: string;
  purpose: OtpPurpose;
};

export type VerifyOtpInput = {
  sessionId?: string;
  targetType?: OtpTargetType;
  targetValue?: string;
  purpose?: OtpPurpose;
  code: string;
};
