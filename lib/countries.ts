import { createAdminClient } from "@/lib/supabase/admin";

export type CountryOption = {
  country_code: string;
  name_en: string;
  name_ar: string;
  phone_code: string;
  currency_code: string;
};

export async function getActiveCountries(): Promise<CountryOption[]> {
  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabaseAdmin
    .from("countries")
    .select("country_code, name_en, name_ar, phone_code, currency_code")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name_en", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

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
