"use client";

import { useMemo, useState } from "react";
import T from "@/components/t";
import type { CountryOption } from "@/lib/countries";
import type { CityOption } from "@/lib/locations";
import { filterCitiesByCountry } from "@/lib/locations";

type LocationFieldsProps = {
  countries: CountryOption[];
  cities: CityOption[];
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
  countries,
  cities,
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
  const initialCountryCode = countries.some(
    (country) => country.country_code === defaultCountryCode
  )
    ? defaultCountryCode
    : countries[0]?.country_code || "SA";

  const [selectedCountryCode, setSelectedCountryCode] =
    useState(initialCountryCode);

  const [selectedCityId, setSelectedCityId] = useState(defaultCityId);
  const [manualCityName, setManualCityName] = useState(defaultCityName);

  const filteredCities = useMemo(
    () => filterCitiesByCountry(cities, selectedCountryCode),
    [cities, selectedCountryCode]
  );

  const selectedCity = useMemo(
    () => filteredCities.find((city) => city.id === selectedCityId),
    [filteredCities, selectedCityId]
  );

  const finalCityName =
    selectedCity?.name_en || manualCityName || defaultCityName || "";

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div className="grid grid-2">
        <div>
          <label>
            <T en="Country" ar="الدولة" />
          </label>

          <select
            name={countryName}
            className="input"
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

        <div>
          <label>
            <T en="City" ar="المدينة" />
          </label>

          {filteredCities.length > 0 ? (
            <select
              name={cityIdName}
              className="input"
              value={selectedCityId}
              required
              onChange={(event) => {
                const nextCityId = event.target.value;
                const nextCity = filteredCities.find(
                  (city) => city.id === nextCityId
                );

                setSelectedCityId(nextCityId);
                setManualCityName(nextCity?.name_en || "");
              }}
            >
              <option value="">
                Select city
              </option>

              {filteredCities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name_en} / {city.name_ar}
                </option>
              ))}
            </select>
          ) : (
            <input
              name={cityNameName}
              className="input"
              value={manualCityName}
              required
              onChange={(event) => setManualCityName(event.target.value)}
              placeholder="City"
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

      <div className="grid grid-2">
        <div>
          <label>
            <T en="District / Area" ar="الحي / المنطقة" />
          </label>

          <input
            name={districtName}
            className="input"
            defaultValue={defaultDistrict}
            placeholder="District or area"
          />
        </div>

        <div>
          <label>
            <T en="Address Line" ar="العنوان" />
          </label>

          <input
            name={addressLineName}
            className="input"
            defaultValue={defaultAddressLine}
            required
            placeholder="Street, building, floor"
          />
        </div>
      </div>

      <div>
        <label>
          <T en="Google Maps URL" ar="رابط Google Maps" />
        </label>

        <input
          name={googleMapsUrlName}
          className="input"
          defaultValue={defaultGoogleMapsUrl}
          placeholder="https://maps.google.com/..."
        />
      </div>

      <div className="grid grid-2">
        <div>
          <label>
            <T en="Latitude" ar="خط العرض" />
          </label>

          <input
            name={latitudeName}
            className="input"
            defaultValue={defaultLatitude || ""}
            required={requireCoordinates}
            placeholder="24.7136"
          />
        </div>

        <div>
          <label>
            <T en="Longitude" ar="خط الطول" />
          </label>

          <input
            name={longitudeName}
            className="input"
            defaultValue={defaultLongitude || ""}
            required={requireCoordinates}
            placeholder="46.6753"
          />
        </div>
      </div>

      <p style={{ color: "var(--muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>
        <T
          en="Tip: Google Maps URL is enough for now. Latitude and longitude will improve nearby studio search later."
          ar="ملاحظة: رابط Google Maps يكفي حاليًا. خط العرض والطول سيحسنان البحث عن الاستوديوهات القريبة لاحقًا."
        />
      </p>
    </div>
  );
}
