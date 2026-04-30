export type PhoneCountryOption = {
  country_code: string;
  phone_code: string;
};

export function cleanPhoneInput(value: string) {
  return String(value || "")
    .trim()
    .replace(/[()\s-]/g, "");
}

export function normalizeInternationalPrefix(value: string) {
  const cleaned = cleanPhoneInput(value);

  if (cleaned.startsWith("00")) {
    return `+${cleaned.slice(2)}`;
  }

  return cleaned;
}

export function isValidE164(value: string) {
  return /^\+[1-9]\d{7,14}$/.test(value);
}

export function normalizePhoneToE164({
  countryCode,
  localPhone,
  countries,
}: {
  countryCode: string;
  localPhone: string;
  countries: PhoneCountryOption[];
}) {
  const cleanedPhone = normalizeInternationalPrefix(localPhone);

  if (!cleanedPhone) {
    return "";
  }

  if (cleanedPhone.startsWith("+")) {
    return cleanedPhone;
  }

  const country = countries.find(
    (item) => item.country_code === countryCode
  );

  if (!country?.phone_code) {
    return cleanedPhone;
  }

  const phoneCode = country.phone_code;
  const localWithoutLeadingZero = cleanedPhone.replace(/^0+/, "");

  return `${phoneCode}${localWithoutLeadingZero}`;
}

export function maskPhone(phone: string) {
  const cleaned = cleanPhoneInput(phone);

  if (cleaned.length <= 4) {
    return cleaned;
  }

  return `${cleaned.slice(0, 4)}****${cleaned.slice(-3)}`;
}
