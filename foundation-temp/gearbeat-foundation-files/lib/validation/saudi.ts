export const saudiPatterns = {
  mobile: /^(?:\+9665|9665|05)\d{8}$/,
  nationalId: /^1\d{9}$/,
  iqama: /^2\d{9}$/,
  identityNumber: /^[12]\d{9}$/,
  commercialRegistration: /^\d{10}$/,
  vatNumber: /^3\d{13}3$/,
  iban: /^SA\d{22}$/i,
  postalCode: /^\d{5}$/,
};

export function normalizeSaudiMobile(value: string) {
  const cleaned = value.replace(/[\s-]/g, "");

  if (cleaned.startsWith("05")) {
    return `+966${cleaned.slice(1)}`;
  }

  if (cleaned.startsWith("9665")) {
    return `+${cleaned}`;
  }

  return cleaned;
}

export function isSaudiMobile(value: string) {
  return saudiPatterns.mobile.test(value.replace(/[\s-]/g, ""));
}

export function isSaudiNationalId(value: string) {
  return saudiPatterns.nationalId.test(value.trim());
}

export function isSaudiIqama(value: string) {
  return saudiPatterns.iqama.test(value.trim());
}

export function isSaudiIdentityNumber(value: string) {
  return saudiPatterns.identityNumber.test(value.trim());
}

export function isSaudiCommercialRegistration(value: string) {
  return saudiPatterns.commercialRegistration.test(value.trim());
}

export function isSaudiVatNumber(value: string) {
  return saudiPatterns.vatNumber.test(value.trim());
}

export function isSaudiIban(value: string) {
  return saudiPatterns.iban.test(value.replace(/\s/g, ""));
}

export function maskSensitiveNumber(value: string, visibleDigits = 4) {
  const clean = value.trim();
  if (clean.length <= visibleDigits) return clean;
  return `${"*".repeat(Math.max(0, clean.length - visibleDigits))}${clean.slice(-visibleDigits)}`;
}

export function validateRequiredSaudiBusinessFields(input: {
  phone?: string;
  commercialRegistration?: string;
  vatNumber?: string;
  iban?: string;
}) {
  const errors: Record<string, string> = {};

  if (input.phone && !isSaudiMobile(input.phone)) {
    errors.phone = "Invalid Saudi mobile number.";
  }

  if (
    input.commercialRegistration &&
    !isSaudiCommercialRegistration(input.commercialRegistration)
  ) {
    errors.commercialRegistration = "Commercial registration must be 10 digits.";
  }

  if (input.vatNumber && !isSaudiVatNumber(input.vatNumber)) {
    errors.vatNumber = "Saudi VAT number must be 15 digits and follow ZATCA format.";
  }

  if (input.iban && !isSaudiIban(input.iban)) {
    errors.iban = "Saudi IBAN must start with SA and contain 24 characters.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
