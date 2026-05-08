"use client";

import { useState } from "react";
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
  equipmentBrands: string[];
  countries?: CountryOption[];
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
  districts,
  features,
  countries = [],
  cityOptions = [],
  selectedCountry = "",
  selectedCityId = "",
  selectedStudioType = "",
  initialValues
}: StudioFilterProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const groupedFeatures = features.reduce<Record<string, StudioFeatureRow[]>>(
    (groups, feature) => {
      const key = feature.category || "general";
      if (!groups[key]) groups[key] = [];
      groups[key].push(feature);
      return groups;
    },
    {}
  );

  const featureGroupLabels: Record<string, { en: string; ar: string; icon: string }> = {
    space: { en: "Space type", ar: "نوع المساحة", icon: "🎙️" },
    amenity: { en: "Amenities", ar: "المميزات", icon: "✨" },
    equipment: { en: "Equipment", ar: "المعدات", icon: "🎛️" },
    service: { en: "Services", ar: "الخدمات", icon: "🧑‍💻" },
    media: { en: "Media", ar: "الإنتاج", icon: "🎥" },
    general: { en: "Other", ar: "أخرى", icon: "➕" }
  };

  return (
    <form className="filter-panel advanced-studio-filter-panel animate-up">
      {/* BASIC FILTERS GRID */}
      <div className="grid grid-4" style={{ alignItems: 'end' }}>
        <div className="filter-main-search">
          <label><T en="Search" ar="بحث" /></label>
          <input
            className="input"
            name="q"
            defaultValue={initialValues.q}
            placeholder="..."
          />
        </div>

        <div>
          <label><T en="Country" ar="الدولة" /></label>
          <select className="input" name="country" defaultValue={selectedCountry}>
            <option value="">All countries</option>
            {countries.map((country) => (
              <option value={country.country_code} key={country.country_code}>
                {country.name_ar || country.name_en}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label><T en="City" ar="المدينة" /></label>
          <select className="input" name="city_id" defaultValue={selectedCityId}>
            <option value="">All cities</option>
            {cityOptions
              .filter((city) => !selectedCountry || city.country_code === selectedCountry)
              .map((city) => (
                <option value={city.id} key={city.id}>
                  {city.name_ar || city.name_en}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label><T en="District" ar="الحي" /></label>
          <select className="input" name="district" defaultValue={initialValues.district}>
            <option value="">All districts</option>
            {districts.map((district) => (
              <option value={district} key={district}>{district}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginTop: 20, alignItems: 'end' }}>
        <div className="grid grid-2" style={{ gap: 10 }}>
          <div>
            <label><T en="Min Price" ar="أقل سعر" /></label>
            <input
              className="input"
              name="min_price"
              type="number"
              defaultValue={initialValues.min_price || ""}
              placeholder="0"
            />
          </div>
          <div>
            <label><T en="Max Price" ar="أعلى سعر" /></label>
            <input
              className="input"
              name="max_price"
              type="number"
              defaultValue={initialValues.max_price || ""}
              placeholder="1000"
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
            <T en="Apply Filters" ar="تطبيق الفلاتر" />
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{ flex: 1 }}
          >
            {showAdvanced ? <T en="Less" ar="أقل" /> : <T en="More" ar="أكثر" />}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/studios/near-me" className="btn btn-secondary" style={{ flex: 1 }}>
            <T en="Near me" ar="قريب مني" />
          </Link>
          <Link href="/studios" className="btn btn-outline" style={{ flex: 1 }}>
            <T en="Reset" ar="إعادة ضبط" />
          </Link>
        </div>
      </div>

      {/* ADVANCED SECTION */}
      {showAdvanced && (
        <div className="advanced-filter-content animate-up" style={{ marginTop: 30, paddingTop: 30, borderTop: '1px solid var(--gb-border)' }}>
          <div className="grid grid-4">
            <div>
              <label><T en="Studio Type" ar="نوع الاستوديو" /></label>
              <select className="input" name="studio_type" defaultValue={selectedStudioType}>
                <option value="">Any type</option>
                <option value="recording_studio">Recording Studio</option>
                <option value="podcast_studio">Podcast Studio</option>
                <option value="rehearsal_room">Rehearsal Room</option>
                <option value="mixing_mastering">Mixing / Mastering</option>
                <option value="voice_over">Voice-over Studio</option>
              </select>
            </div>

            <div>
              <label><T en="Rating" ar="التقييم" /></label>
              <select className="input" name="min_google_rating" defaultValue={initialValues.min_google_rating || ""}>
                <option value="">Any</option>
                <option value="4">4.0+ ★</option>
                <option value="4.5">4.5+ ★</option>
              </select>
            </div>

            <div>
              <label><T en="Sort by" ar="ترتيب حسب" /></label>
              <select className="input" name="sort" defaultValue={initialValues.sort}>
                <option value="newest">Newest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>

            <label className="filter-check-card" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              marginTop: 28, 
              background: 'rgba(212, 175, 55, 0.05)',
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid var(--gb-border)',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                name="verified"
                value="true"
                defaultChecked={initialValues.verified}
                style={{ width: 18, height: 18, accentColor: 'var(--gb-gold)' }}
              />
              <span style={{ color: '#fff', fontSize: '0.9rem' }}><T en="Verified only" ar="الموثق فقط" /></span>
            </label>
          </div>

          {/* FEATURES ACCORDIONS */}
          <div style={{ marginTop: 30 }}>
            <label style={{ marginBottom: 16 }}><T en="Features & Amenities" ar="المميزات والخدمات" /></label>
            <div className="grid grid-3" style={{ gap: 15 }}>
              {Object.entries(groupedFeatures).map(([category, groupItems]) => {
                const label = featureGroupLabels[category] || featureGroupLabels.general;
                return (
                  <div key={category} style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 12, border: '1px solid var(--gb-border)' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{label.icon}</span> <T en={label.en} ar={label.ar} />
                    </h4>
                    <div style={{ display: 'grid', gap: 8 }}>
                      {groupItems.map((feature) => (
                        <label key={feature.id} style={{ display: 'flex', alignItems: 'center', gap: 8, textTransform: 'none', fontWeight: 500, color: '#ccc', cursor: 'pointer', margin: 0 }}>
                          <input
                            type="checkbox"
                            name="features"
                            value={feature.id}
                            defaultChecked={initialValues.selectedFeatureIds.includes(feature.id)}
                            style={{ accentColor: 'var(--gb-gold)' }}
                          />
                          <span><T en={feature.name_en} ar={feature.name_ar} /></span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
