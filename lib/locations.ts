import { createAdminClient } from "@/lib/supabase/admin";

export type CityOption = {
  id: string;
  country_code: string;
  name_en: string;
  name_ar: string;
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

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

export function filterCitiesByCountry(
  cities: CityOption[],
  countryCode: string
) {
  return cities.filter((city) => city.country_code === countryCode);
}

export function parseCoordinate(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return null;
  }

  return numberValue;
}

export function isValidLatitude(value: unknown) {
  const latitude = parseCoordinate(value);

  return latitude !== null && latitude >= -90 && latitude <= 90;
}

export function isValidLongitude(value: unknown) {
  const longitude = parseCoordinate(value);

  return longitude !== null && longitude >= -180 && longitude <= 180;
}

export function hasValidCoordinates(input: {
  latitude?: unknown;
  longitude?: unknown;
}) {
  return isValidLatitude(input.latitude) && isValidLongitude(input.longitude);
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function calculateDistanceKm(
  from: Coordinates,
  to: Coordinates
) {
  const earthRadiusKm = 6371;

  const latDistance = toRadians(to.latitude - from.latitude);
  const lonDistance = toRadians(to.longitude - from.longitude);

  const startLat = toRadians(from.latitude);
  const endLat = toRadians(to.latitude);

  const haversine =
    Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
    Math.cos(startLat) *
      Math.cos(endLat) *
      Math.sin(lonDistance / 2) *
      Math.sin(lonDistance / 2);

  const angle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return earthRadiusKm * angle;
}

export function formatDistanceKm(distanceKm: number | null | undefined) {
  if (distanceKm === null || distanceKm === undefined) {
    return "";
  }

  if (!Number.isFinite(distanceKm)) {
    return "";
  }

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toFixed(1)} km`;
}

export function buildGoogleMapsSearchUrl({
  query,
  latitude,
  longitude,
}: {
  query?: string;
  latitude?: number | null;
  longitude?: number | null;
}) {
  if (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  ) {
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  }

  if (query) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      query
    )}`;
  }

  return "https://www.google.com/maps";
}

export function buildGoogleMapsDirectionsUrl({
  destination,
  latitude,
  longitude,
}: {
  destination?: string;
  latitude?: number | null;
  longitude?: number | null;
}) {
  if (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  ) {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  }

  if (destination) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      destination
    )}`;
  }

  return "https://www.google.com/maps";
}

export function buildAddressLabel({
  cityName,
  district,
  addressLine,
}: {
  cityName?: string | null;
  district?: string | null;
  addressLine?: string | null;
}) {
  return [addressLine, district, cityName]
    .filter(Boolean)
    .join(", ");
}
