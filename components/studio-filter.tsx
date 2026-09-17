"use client";

import Link from "next/link";
import T from "./t";

type StudioFeatureRow = {
  id: string;
  name_en: string;
  name_ar: string;
  category: string | null;
  sort_order: number | null;
};

type CountryOption = {
  country_code: string;
  name_en: string;
  name_ar: string;
  phone_code: string;
  currency_code: string;
};

type CityOption = {
  id: string;
  country_code: string;
  name_en: string;
  name_ar: string;
};

type StudioFilterProps = {
  cities: string[];
  districts: string[];
  features: StudioFeatureRow[];
  equipmentCategories: string[];
  equipmentBrands: string[];  countries?: CountryOption[];
  cityOptions?: CityOption[];
  selectedCountry?: string;
  selectedCityId?: string;
  selectedStudioType?: string;
  initialValues: {
    q: string;
    city: string;
    district: string;
    min_price: number;
    max_price: number;
    verified: boolean;
    min_google_rating: number;
    min_tripadvisor_rating: number;
    selectedFeatureIds: string[];
    selectedEquipmentCategories: string[];
    selectedEquipmentBrand: string;
    equipmentKeyword: string;
    sort: string;
  };
};

export default function StudioFilter({
  cities,
  features,
  initialValues,
}: StudioFilterProps) {
  const serviceFeatures = features.filter((feature) => feature.category === "service");
  const selectedService = initialValues.selectedFeatureIds[0] || "";

  return (
    <form className="filter-panel simple-studio-filter" action="/studios">      <div className="simple-studio-filter-grid">
        <div>
          <label><T en="Search" ar="Ø¨Ø­Ø«" /></label>
          <input
            className="input"
            name="q"
            defaultValue={initialValues.q}
            placeholder="Studio name"
          />
        </div>

        <div>
          <label><T en="City" ar="Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©" /></label>
          <select className="input" name="city" defaultValue={initialValues.city}>
            <option value=""><T en="All cities" ar="ÙƒÙ„ Ø§Ù„Ù…Ø¯Ù†" /></option>
            {cities.map((city) => (
              <option value={city} key={city}>{city}</option>
            ))}
          </select>
        </div>

        <div>
          <label><T en="Service type" ar="Ù†ÙˆØ¹ Ø§Ù„Ø®Ø¯Ù…Ø©" /></label>
          <select className="input" name="features" defaultValue={selectedService}>
            <option value=""><T en="Any service" ar="ÙƒÙ„ Ø§Ù„Ø®Ø¯Ù…Ø§Øª" /></option>
            {serviceFeatures.map((feature) => (
              <option value={feature.id} key={feature.id}>
                {feature.name_ar} / {feature.name_en}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label><T en="Maximum price" ar="Ø£Ø¹Ù„Ù‰ Ø³Ø¹Ø±" /></label>
          <input
            className="input"
            name="max_price"
            type="number"
            min="0"
            step="1"
            defaultValue={initialValues.max_price || ""}
            placeholder="SAR"
          />
        </div>

        <div>
          <label><T en="Sort" ar="Ø§Ù„ØªØ±ØªÙŠØ¨" /></label>
          <select className="input" name="sort" defaultValue={initialValues.sort}>
            <option value="newest"><T en="Recommended" ar="Ø§Ù„Ù…ÙˆØµÙ‰ Ø¨Ù‡" /></option>
            <option value="price_low"><T en="Price: low to high" ar="Ø§Ù„Ø³Ø¹Ø±: Ù…Ù† Ø§Ù„Ø£Ù‚Ù„" /></option>
            <option value="price_high"><T en="Price: high to low" ar="Ø§Ù„Ø³Ø¹Ø±: Ù…Ù† Ø§Ù„Ø£Ø¹Ù„Ù‰" /></option>
          </select>
        </div>

        <div className="simple-studio-filter-actions">
          <button type="submit" className="btn btn-primary">
            <T en="Apply filters" ar="ØªØ·Ø¨ÙŠÙ‚ Ø§Ù„ÙÙ„Ø§ØªØ±" />
          </button>
          <Link href="/studios" className="btn btn-outline">
            <T en="Reset" ar="Ø¥Ø¹Ø§Ø¯Ø© Ø¶Ø¨Ø·" />
          </Link>
        </div>
      </div>
      <p className="simple-studio-filter-note">
        <T
          en="Only studios currently accepting booking requests are shown."
          ar="ÙŠØªÙ… Ø¹Ø±Ø¶ Ø§Ù„Ø§Ø³ØªÙˆØ¯ÙŠÙˆÙ‡Ø§Øª Ø§Ù„ØªÙŠ ØªØ³ØªÙ‚Ø¨Ù„ Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ø­Ø¬Ø² Ø­Ø§Ù„ÙŠÙ‹Ø§ ÙÙ‚Ø·."
        />
      </p>

      <style jsx>{`
        .simple-studio-filter-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
          align-items: end;
        }
        .simple-studio-filter-actions {
          display: flex;
          gap: 8px;
        }
        .simple-studio-filter-actions .btn { flex: 1; min-height: 42px; }
        .simple-studio-filter-note {
          margin: 12px 0 0;
          color: var(--gb-text-muted);
          font-size: 0.8rem;
        }
        @media (max-width: 980px) {
          .simple-studio-filter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 600px) {
          .simple-studio-filter-grid { grid-template-columns: 1fr; }
          .simple-studio-filter-actions { width: 100%; }
        }
      `}</style>
    </form>
  );
}
