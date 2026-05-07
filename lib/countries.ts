export type CountryOption = {
  country_code: string;
  name_en: string;
  name_ar: string;
  phone_code: string;
  currency_code: string;
};

export function findCountryByCode(
  countries: CountryOption[],
  countryCode: string
) {
  return countries.find(
    (country) => country.country_code === countryCode
  );
}

export function getCountryPhoneCode(
  countries: CountryOption[],
  countryCode: string
) {
  const country = findCountryByCode(countries, countryCode);

  return country?.phone_code || "";
}
