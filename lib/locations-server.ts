import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CityOption } from "./locations";

/**
 * Server-only function to fetch active cities.
 */
export async function getActiveCities(): Promise<CityOption[]> {
  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabaseAdmin
    .from("cities")
    .select("id, country_code, name_en, name_ar")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name_en", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Server-only function to fetch active cities by country.
 */
export async function getActiveCitiesByCountry(
  countryCode: string
): Promise<CityOption[]> {
  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabaseAdmin
    .from("cities")
    .select("id, country_code, name_en, name_ar")
    .eq("is_active", true)
    .eq("country_code", countryCode)
    .order("sort_order", { ascending: true })
    .order("name_en", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}
