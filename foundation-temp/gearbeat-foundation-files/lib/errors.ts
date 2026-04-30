export type AppErrorCode =
  | "AUTH_REQUIRED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "BOOKING_NOT_FOUND"
  | "BOOKING_CONFLICT"
  | "CRON_UNAUTHORIZED"
  | "DATABASE_ERROR"
  | "UNKNOWN_ERROR";

export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly httpStatus: number;
  public readonly details?: unknown;

  constructor(code: AppErrorCode, message: string, httpStatus = 400, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.httpStatus = httpStatus;
    this.details = details;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function toAppError(error: unknown): AppError {
  if (isAppError(error)) return error;
  if (error instanceof Error) {
    return new AppError("UNKNOWN_ERROR", error.message || "Unexpected error", 500);
  }
  return new AppError("UNKNOWN_ERROR", "Unexpected error", 500, error);
}

export function getFriendlyErrorMessage(error: unknown, locale: "ar" | "en" = "ar") {
  const appError = toAppError(error);

  const messages: Record<AppErrorCode, { ar: string; en: string }> = {
    AUTH_REQUIRED: {
      ar: "يرجى تسجيل الدخول للمتابعة.",
      en: "Please log in to continue.",
    },
    FORBIDDEN: {
      ar: "ليس لديك صلاحية لتنفيذ هذا الإجراء.",
      en: "You do not have permission to perform this action.",
    },
    VALIDATION_ERROR: {
      ar: "يرجى التأكد من البيانات المدخلة.",
      en: "Please check the submitted information.",
    },
    NOT_FOUND: {
      ar: "العنصر المطلوب غير موجود.",
      en: "The requested item was not found.",
    },
    BOOKING_NOT_FOUND: {
      ar: "الحجز المطلوب غير موجود.",
      en: "The requested booking was not found.",
    },
    BOOKING_CONFLICT: {
      ar: "هذا الوقت غير متاح للحجز.",
      en: "This time slot is not available.",
    },
    CRON_UNAUTHORIZED: {
      ar: "طلب غير مصرح به.",
      en: "Unauthorized request.",
    },
    DATABASE_ERROR: {
      ar: "حدث خطأ في قاعدة البيانات.",
      en: "A database error occurred.",
    },
    UNKNOWN_ERROR: {
      ar: "حدث خطأ غير متوقع.",
      en: "An unexpected error occurred.",
    },
  };

  return messages[appError.code]?.[locale] ?? appError.message;
}
