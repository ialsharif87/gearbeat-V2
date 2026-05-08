import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CountryOption } from "./countries";

/**
 * Server-only function to fetch active countries.
 * This uses the Supabase Service Role key and must NEVER be called from the client.
 */
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
