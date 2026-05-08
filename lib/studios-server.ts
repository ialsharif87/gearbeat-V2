import "server-only";

export type SanitizedStudioListing = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  district: string | null;
  price_from: number | null;
  cover_image_url: string | null;
  verified: boolean | null;
  booking_enabled: boolean | null;
  google_rating: number | null;
  google_user_ratings_total: number | null;
  tripadvisor_rating: number | null;
  tripadvisor_reviews_total: number | null;
  description: string | null;
  is_featured: boolean | null;
  is_boosted: boolean;
  total_boost_commission: number | null;
  country_code: string | null;
  city_id: string | null;
  city_name: string | null;
  address_line: string | null;
  google_maps_url: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  instant_booking_enabled: boolean | null;
  verified_location: boolean | null;
};

export type SanitizedStudioDetail = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  district: string | null;
  address: string | null;
  description: string | null;
  price_from: number | null;
  verified: boolean | null;
  cover_image_url: string | null;
  google_maps_url: string | null;
  google_reviews_url: string | null;
  google_place_id: string | null;
  google_rating: number | null;
  google_user_ratings_total: number | null;
  booking_enabled: boolean | null;
  is_featured: boolean | null;
  country_code: string | null;
  city_id: string | null;
  city_name: string | null;
  address_line: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  owner_trust_summary: string | null;
  instant_booking_enabled: boolean | null;
  verified_location: boolean | null;
  minimum_photos_required: number | null;
  certified_studios: unknown;
};

export type SanitizedOwnerProfile = {
  full_name: string | null;
  phone_verified: boolean | null;
  email_verified: boolean | null;
  identity_verification_status: string | null;
  has_email: boolean;
};

/**
 * Sanitizes a studio object for public listing (card) consumption.
 * Removes internal administrative fields before they reach the UI or serialized props.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizeStudioListing(studio: any): SanitizedStudioListing | null {
  if (!studio) return null;
  
  return {
    id: studio.id,
    name: studio.name,
    slug: studio.slug,
    city: studio.city,
    district: studio.district,
    price_from: studio.price_from,
    cover_image_url: studio.cover_image_url,
    verified: studio.verified,
    booking_enabled: studio.booking_enabled,
    google_rating: studio.google_rating,
    google_user_ratings_total: studio.google_user_ratings_total,
    tripadvisor_rating: studio.tripadvisor_rating,
    tripadvisor_reviews_total: studio.tripadvisor_reviews_total,
    description: studio.description,
    is_featured: studio.is_featured,
    is_boosted: studio.is_boosted || false,
    total_boost_commission: studio.total_boost_commission || null,
    country_code: studio.country_code,
    city_id: studio.city_id,
    city_name: studio.city_name,
    address_line: studio.address_line,
    google_maps_url: studio.google_maps_url,
    latitude: studio.latitude,
    longitude: studio.longitude,
    instant_booking_enabled: studio.instant_booking_enabled,
    verified_location: studio.verified_location,
  };
}

/**
 * Sanitizes a full studio detail object for public view.
 * Strips internal compliance and admin-only fields.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizeStudioDetail(studio: any): SanitizedStudioDetail | null {
  if (!studio) return null;

  return {
    id: studio.id,
    name: studio.name,
    slug: studio.slug,
    city: studio.city,
    district: studio.district,
    address: studio.address,
    description: studio.description,
    price_from: studio.price_from,
    verified: studio.verified,
    cover_image_url: studio.cover_image_url,
    google_maps_url: studio.google_maps_url,
    google_reviews_url: studio.google_reviews_url,
    google_place_id: studio.google_place_id,
    google_rating: studio.google_rating,
    google_user_ratings_total: studio.google_user_ratings_total,
    booking_enabled: studio.booking_enabled,
    is_featured: studio.is_featured,
    country_code: studio.country_code,
    city_id: studio.city_id,
    city_name: studio.city_name,
    address_line: studio.address_line,
    latitude: studio.latitude,
    longitude: studio.longitude,
    owner_trust_summary: studio.owner_trust_summary,
    instant_booking_enabled: studio.instant_booking_enabled,
    verified_location: studio.verified_location,
    minimum_photos_required: studio.minimum_photos_required,
    certified_studios: studio.certified_studios,
  };
}

/**
 * Sanitizes an owner profile for public view.
 * Ensures sensitive data like raw email or ID numbers are never leaked.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizeOwnerProfile(profile: any): SanitizedOwnerProfile | null {
  if (!profile) return null;

  return {
    full_name: profile.full_name,
    phone_verified: profile.phone_verified,
    email_verified: profile.email_verified,
    identity_verification_status: profile.identity_verification_status,
    has_email: Boolean(profile.email),
  };
}
