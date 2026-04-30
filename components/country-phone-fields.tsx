"use client";

import { useMemo, useState } from "react";
import T from "@/components/t";
import type { CountryOption } from "@/lib/countries";
import { isValidE164, normalizePhoneToE164 } from "@/lib/phone";

type CountryPhoneFieldsProps = {
  countries: CountryOption[];
  defaultCountryCode?: string;
  defaultPhone?: string;
  countryName?: string;
  phoneCountryCodeName?: string;
  phoneLocalName?: string;
  phoneE164Name?: string;
  required?: boolean;
};

export default function CountryPhoneFields({
  countries,
  defaultCountryCode = "SA",
  defaultPhone = "",
  countryName = "country_code",
  phoneCountryCodeName = "phone_country_code",
  phoneLocalName = "phone_local",
  phoneE164Name = "phone_e164",
  required = true,
}: CountryPhoneFieldsProps) {
  const initialCountryCode = countries.some(
    (country) => country.country_code === defaultCountryCode
  )
    ? defaultCountryCode
    : countries[0]?.country_code || "SA";

  const [selectedCountryCode, setSelectedCountryCode] =
    useState(initialCountryCode);

  const [localPhone, setLocalPhone] = useState(defaultPhone);

  const selectedCountry = useMemo(
    () =>
      countries.find(
        (country) => country.country_code === selectedCountryCode
      ) || countries[0],
    [countries, selectedCountryCode]
  );

  const phoneCountryCode = selectedCountry?.phone_code || "";

  const phoneE164 = normalizePhoneToE164({
    countryCode: selectedCountryCode,
    localPhone,
    countries,
  });

  const showPhoneWarning = Boolean(localPhone) && !isValidE164(phoneE164);

  return (
    <div className="grid grid-2">
      <div>
        <label>
          <T en="Country" ar="الدولة" />
        </label>

        <select
          name={countryName}
          className="input"
          value={selectedCountryCode}
          required={required}
          onChange={(event) => setSelectedCountryCode(event.target.value)}
        >
          {countries.map((country) => (
            <option key={country.country_code} value={country.country_code}>
              {country.name_en} / {country.name_ar} ({country.phone_code})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>
          <T en="Phone Number" ar="رقم الجوال" />
        </label>

        <div style={{ display: "flex", gap: 10 }}>
          <input
            className="input"
            value={phoneCountryCode}
            readOnly
            aria-label="Phone country code"
            style={{ maxWidth: 110 }}
          />

          <input
            name={phoneLocalName}
            className="input"
            value={localPhone}
            required={required}
            onChange={(event) => setLocalPhone(event.target.value)}
            placeholder="50 123 4567"
          />
        </div>

        <input
          type="hidden"
          name={phoneCountryCodeName}
          value={phoneCountryCode}
          readOnly
        />

        <input
          type="hidden"
          name={phoneE164Name}
          value={phoneE164}
          readOnly
        />

        {showPhoneWarning ? (
          <p
            style={{
              marginTop: 8,
              color: "#ffb020",
              fontSize: "0.85rem",
            }}
          >
            <T
              en="Please enter a valid phone number for the selected country."
              ar="يرجى إدخال رقم جوال صحيح حسب الدولة المختارة."
            />
          </p>
        ) : null}
      </div>
    </div>
  );
}
