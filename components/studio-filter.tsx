"use client";

import { useState } from "react";
import T from "./t";

type StudioFeatureRow = {
  id: string;
  name_en: string;
  name_ar: string;
  category: string | null;
  sort_order: number | null;
};

type StudioFilterProps = {
  cities: string[];
  districts: string[];
  features: StudioFeatureRow[];
  equipmentCategories: string[];
  equipmentBrands: string[];
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
  districts,
  features,
  equipmentCategories,
  equipmentBrands,
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
    <form className="card studio-filter-panel advanced-studio-filter-panel">
      {/* BASIC FILTERS ROW */}
      <div className="filter-main-search">
        <label><T en="Search" ar="بحث" /></label>
        <input
          className="input"
          name="q"
          defaultValue={initialValues.q}
          placeholder="Studio name, city, district..."
        />
      </div>

      <div>
        <label><T en="City" ar="المدينة" /></label>
        <select className="input" name="city" defaultValue={initialValues.city}>
          <option value="">All cities</option>
          {cities.map((city) => (
            <option value={city} key={city}>{city}</option>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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

      {/* TOGGLE & ACTIONS ROW */}
      <div className="filter-action-row" style={{ marginTop: 0, paddingTop: 10, border: 0 }}>
        <button
          type="button"
          className="btn btn-secondary btn-small"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ marginRight: 'auto' }}
        >
          {showAdvanced ? <T en="Less Filters" ar="فلاتر أقل" /> : <T en="More Filters" ar="فلاتر أكثر" />}
        </button>

        <button type="submit" className="btn btn-primary">
          <T en="Apply Filters" ar="تطبيق الفلاتر" />
        </button>

        <a href="/studios" className="btn btn-secondary">
          <T en="Reset" ar="إعادة ضبط" />
        </a>
      </div>

      {/* ADVANCED SECTION */}
      {showAdvanced && (
        <div className="advanced-filter-content" style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <label><T en="Min Google Rating" ar="أقل تقييم Google" /></label>
            <select className="input" name="min_google_rating" defaultValue={initialValues.min_google_rating || ""}>
              <option value="">Any</option>
              <option value="3">3.0+</option>
              <option value="4">4.0+</option>
              <option value="4.5">4.5+</option>
            </select>
          </div>

          <div>
            <label><T en="Min TripAdvisor" ar="أقل تقييم TripAdvisor" /></label>
            <select className="input" name="min_tripadvisor_rating" defaultValue={initialValues.min_tripadvisor_rating || ""}>
              <option value="">Any</option>
              <option value="3">3.0+</option>
              <option value="4">4.0+</option>
            </select>
          </div>

          <div>
            <label><T en="Sort by" ar="ترتيب حسب" /></label>
            <select className="input" name="sort" defaultValue={initialValues.sort}>
              <option value="newest">Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="google_rating">Google Rating</option>
            </select>
          </div>

          <label className="filter-check-card" style={{ marginTop: 24 }}>
            <input
              type="checkbox"
              name="verified"
              value="true"
              defaultChecked={initialValues.verified}
            />
            <span><T en="Verified only" ar="الموثق فقط" /></span>
          </label>

          {/* FEATURES */}
          <div className="feature-filter-area" style={{ gridColumn: '1 / -1' }}>
            <div className="feature-filter-groups">
              {Object.entries(groupedFeatures).map(([category, groupItems]) => {
                const label = featureGroupLabels[category] || featureGroupLabels.general;
                return (
                  <details className="filter-accordion" key={category}>
                    <summary>
                      <span>{label.icon}</span>
                      <strong><T en={label.en} ar={label.ar} /></strong>
                      <small>{groupItems.length}</small>
                    </summary>
                    <div className="feature-filter-options">
                      {groupItems.map((feature) => (
                        <label className="feature-filter-chip" key={feature.id}>
                          <input
                            type="checkbox"
                            name="features"
                            value={feature.id}
                            defaultChecked={initialValues.selectedFeatureIds.includes(feature.id)}
                          />
                          <span><T en={feature.name_en} ar={feature.name_ar} /></span>
                        </label>
                      ))}
                    </div>
                  </details>
                );
              })}
            </div>
          </div>

          {/* EQUIPMENT */}
          <div className="equipment-filter-area" style={{ gridColumn: '1 / -1' }}>
            <div className="equipment-filter-grid">
              <div>
                <label><T en="Equipment Keyword" ar="كلمة بحث للمعدات" /></label>
                <input
                  className="input"
                  name="equipment_q"
                  defaultValue={initialValues.equipmentKeyword}
                  placeholder="U87, Piano, Camera..."
                />
              </div>
              <div>
                <label><T en="Equipment Brand" ar="علامة المعدة" /></label>
                <select className="input" name="equipment_brand" defaultValue={initialValues.selectedEquipmentBrand}>
                  <option value="">Any brand</option>
                  {equipmentBrands.map((brand) => (
                    <option value={brand} key={brand}>{brand}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="equipment-category-chips">
              {equipmentCategories.map((category) => (
                <label className="feature-filter-chip" key={category}>
                  <input
                    type="checkbox"
                    name="equipment_categories"
                    value={category}
                    defaultChecked={initialValues.selectedEquipmentCategories.includes(category)}
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
