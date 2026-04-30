import T from "@/components/t";
import {
  buildAddressLabel,
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsSearchUrl,
  parseCoordinate,
} from "@/lib/locations";

type GoogleMapsLinkProps = {
  googleMapsUrl?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  cityName?: string | null;
  district?: string | null;
  addressLine?: string | null;
  labelEn?: string;
  labelAr?: string;
  mode?: "search" | "directions";
  className?: string;
};

export default function GoogleMapsLink({
  googleMapsUrl,
  latitude,
  longitude,
  cityName,
  district,
  addressLine,
  labelEn = "Open in Google Maps",
  labelAr = "افتح في Google Maps",
  mode = "search",
  className = "btn",
}: GoogleMapsLinkProps) {
  const parsedLatitude = parseCoordinate(latitude);
  const parsedLongitude = parseCoordinate(longitude);

  const addressLabel = buildAddressLabel({
    cityName,
    district,
    addressLine,
  });

  const href =
    googleMapsUrl ||
    (mode === "directions"
      ? buildGoogleMapsDirectionsUrl({
          destination: addressLabel,
          latitude: parsedLatitude,
          longitude: parsedLongitude,
        })
      : buildGoogleMapsSearchUrl({
          query: addressLabel,
          latitude: parsedLatitude,
          longitude: parsedLongitude,
        }));

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
    >
      <T en={labelEn} ar={labelAr} />
    </a>
  );
}
