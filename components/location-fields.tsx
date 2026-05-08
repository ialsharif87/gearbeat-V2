"use client";

import { useEffect, useMemo, useState } from "react";
import T from "@/components/t";
import type { CountryOption } from "@/lib/countries";
import type { CityOption } from "@/lib/locations";

type LocationFieldsProps = {
  defaultCountryCode?: string;
  defaultCityId?: string;
  defaultCityName?: string;
  defaultDistrict?: string;
  defaultAddressLine?: string;
  defaultGoogleMapsUrl?: string;
  defaultLatitude?: string | number | null;
  defaultLongitude?: string | number | null;
  countryName?: string;
  cityIdName?: string;
  cityNameName?: string;
  districtName?: string;
  addressLineName?: string;
  googleMapsUrlName?: string;
  latitudeName?: string;
  longitudeName?: string;
  requireCoordinates?: boolean;
};

export default function LocationFields({
  defaultCountryCode = "SA",
  defaultCityId = "",
  defaultCityName = "",
  defaultDistrict = "",
  defaultAddressLine = "",
  defaultGoogleMapsUrl = "",
  defaultLatitude = "",
  defaultLongitude = "",
  countryName = "country_code",
  cityIdName = "city_id",
  cityNameName = "city_name",
  districtName = "district",
  addressLineName = "address_line",
  googleMapsUrlName = "google_maps_url",
  latitudeName = "latitude",
  longitudeName = "longitude",
  requireCoordinates = false,
}: LocationFieldsProps) {
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCountryCode, setSelectedCountryCode] = useState(defaultCountryCode);
  const [selectedCityId, setSelectedCityId] = useState(defaultCityId);
  const [manualCityName, setManualCityName] = useState(defaultCityName);

  useEffect(() => {
    fetch("/api/countries")
      .then((res) => res.json())
      .then((data) => {
        setCountries(data);
        if (!selectedCountryCode && data.length > 0) {
          setSelectedCountryCode(data[0].country_code);
        }
      })
      .catch((err) => console.error("Failed to fetch countries:", err));
  }, [selectedCountryCode]);

  useEffect(() => {
    if (!selectedCountryCode) return;
    setLoading(true);
    fetch(`/api/cities?country=${selectedCountryCode}`)
      .then((res) => res.json())
      .then((data) => {
        setCities(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch cities:", err);
        setLoading(false);
      });
  }, [selectedCountryCode]);

  const selectedCity = useMemo(
    () => cities.find((city) => city.id === selectedCityId),
    [cities, selectedCityId]
  );

  const finalCityName =
    selectedCity?.name_en || manualCityName || defaultCityName || "";

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <label className="gb-detail-label">
            <T en="Country" ar="الدولة" /> *
          </label>

          <select
            name={countryName}
            className="gb-input"
            value={selectedCountryCode}
            required
            onChange={(event) => {
              setSelectedCountryCode(event.target.value);
              setSelectedCityId("");
              setManualCityName("");
            }}
          >
            {countries.map((country) => (
              <option key={country.country_code} value={country.country_code}>
                {country.name_en} / {country.name_ar}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <label className="gb-detail-label">
            <T en="City" ar="المدينة" /> *
          </label>

          {loading ? (
            <div className="gb-input" style={{ opacity: 0.5, display: "flex", alignItems: "center" }}>
               <T en="Loading cities..." ar="جاري تحميل المدن..." />
            </div>
          ) : cities.length > 0 ? (
            <select
              name={cityIdName}
              className="gb-input"
              value={selectedCityId}
              required
              onChange={(event) => {
                const nextCityId = event.target.value;
                const nextCity = cities.find((city) => city.id === nextCityId);
                setSelectedCityId(nextCityId);
                setManualCityName(nextCity?.name_en || "");
              }}
            >
              <option value="">
                <T en="Select City" ar="اختر المدينة" />
              </option>

              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name_en} / {city.name_ar}
                </option>
              ))}
            </select>
          ) : (
            <input
              name={cityNameName}
              className="gb-input"
              value={manualCityName}
              required
              onChange={(event) => setManualCityName(event.target.value)}
              placeholder="Enter city name"
            />
          )}

          <input
            type="hidden"
            name={cityNameName}
            value={finalCityName}
            readOnly
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <label className="gb-detail-label">
            <T en="District / Area" ar="الحي / المنطقة" />
          </label>

          <input
            name={districtName}
            className="gb-input"
            defaultValue={defaultDistrict}
            placeholder="e.g. Al Olaya"
          />
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <label className="gb-detail-label">
            <T en="Address Line" ar="العنوان" /> *
          </label>

          <input
            name={addressLineName}
            className="gb-input"
            defaultValue={defaultAddressLine}
            required
            placeholder="Street, building, floor"
          />
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <label className="gb-detail-label">
          <T en="Google Maps URL" ar="رابط Google Maps" />
        </label>

        <input
          name={googleMapsUrlName}
          className="gb-input"
          defaultValue={defaultGoogleMapsUrl}
          placeholder="https://maps.google.com/..."
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <label className="gb-detail-label">
            <T en="Latitude" ar="خط العرض" />
          </label>

          <input
            name={latitudeName}
            className="gb-input"
            defaultValue={defaultLatitude || ""}
            required={requireCoordinates}
            placeholder="24.7136"
          />
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <label className="gb-detail-label">
            <T en="Longitude" ar="خط الطول" />
          </label>

          <input
            name={longitudeName}
            className="gb-input"
            defaultValue={defaultLongitude || ""}
            required={requireCoordinates}
            placeholder="46.6753"
          />
        </div>
      </div>

      <p style={{ color: "#666", fontSize: "0.85rem", lineHeight: 1.6, margin: 0 }}>
        <T
          en="Tip: Google Maps URL is enough for now. Latitude and longitude will improve search results later."
          ar="ملاحظة: رابط Google Maps يكفي حاليًا. خط العرض والطول سيحسنان نتائج البحث لاحقًا."
        />
      </p>
    </div>
  );
}
