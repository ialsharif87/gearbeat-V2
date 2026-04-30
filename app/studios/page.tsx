import Link from "next/link";
import { createClient } from "../../lib/supabase/server";
import T from "../../components/t";

type SearchParams = {
  q?: string;
  city?: string;
  district?: string;
  min_price?: string;
  max_price?: string;
  verified?: string;
  min_google_rating?: string;
  min_tripadvisor_rating?: string;
  features?: string | string[];
  equipment_categories?: string | string[];
  equipment_brand?: string;
  equipment_q?: string;
  sort?: string;
};

type StudioIdRow = {
  id: string | null;
};

type CityRow = {
  city: string | null;
};

type DistrictRow = {
  district: string | null;
};

type StudioFeatureRow = {
  id: string;
  name_en: string;
  name_ar: string;
  category: string | null;
  sort_order: number | null;
};

type EquipmentFilterRow = {
  studio_id?: string | null;
  category: string | null;
  brand: string | null;
};

type LinkedStudioFeatureRow = {
  studio_id: string;
  feature_id: string;
};

type EquipmentMatchRow = {
  studio_id: string | null;
  name?: string | null;
  brand?: string | null;
  model?: string | null;
  category?: string | null;
};

type StudioCardRow = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  district: string | null;
  price_from: number | null;
  status: string | null;
  cover_image_url: string | null;
  verified: boolean | null;
  booking_enabled: boolean | null;
  owner_compliance_status: string | null;
  google_rating: number | null;
  google_user_ratings_total: number | null;
  tripadvisor_rating: number | null;
  tripadvisor_reviews_total: number | null;
  created_at: string | null;
  description?: string | null;
  is_featured?: boolean | null;
  completion_score?: number | null;
  is_accelerated?: boolean;
};

function toArray(value: string | string[] | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function uniqueClean(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => String(value || "").trim())
        .filter((value) => value.length > 0)
    )
  );
}

function intersectMany(arrays: string[][]) {
  if (!arrays.length) return null;

  let result = new Set(arrays[0]);

  for (const array of arrays.slice(1)) {
    const nextSet = new Set(array);
    result = new Set(Array.from(result).filter((id) => nextSet.has(id)));
  }

  return Array.from(result);
}

function applyBookableStudioFilters(query: any) {
  return query
    .eq("status", "approved")
    .eq("verified", true)
    .eq("booking_enabled", true)
    .eq("owner_compliance_status", "approved");
}

export default async function StudiosPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = searchParams ? await searchParams : {};

  const queryText = String(params.q || "").trim().replaceAll(",", " ");
  const selectedCity = String(params.city || "").trim();
  const selectedDistrict = String(params.district || "").trim();

  const minPrice = Number(params.min_price || 0);
  const maxPrice = Number(params.max_price || 0);

  const verifiedOnly = params.verified === "true";

  const minGoogleRating = Number(params.min_google_rating || 0);
  const minTripAdvisorRating = Number(params.min_tripadvisor_rating || 0);

  const selectedFeatureIds = toArray(params.features);
  const selectedEquipmentCategories = toArray(params.equipment_categories);

  const selectedEquipmentBrand = String(params.equipment_brand || "").trim();
  const equipmentKeyword = String(params.equipment_q || "")
    .trim()
    .replaceAll(",", " ");

  const sort = String(params.sort || "newest");

  const supabase = await createClient();

  const { data: bookableStudioRows } = await applyBookableStudioFilters(
    supabase.from("studios").select("id")
  );

  const bookableStudioRowsList = (bookableStudioRows || []) as StudioIdRow[];

  const bookableStudioIds = uniqueClean(
    bookableStudioRowsList.map((item: StudioIdRow) => item.id)
  );

  const { data: cityRows } = await applyBookableStudioFilters(
    supabase
      .from("studios")
      .select("city")
      .not("city", "is", null)
      .order("city", { ascending: true })
  );

  const cityRowsList = (cityRows || []) as CityRow[];

  const cities = uniqueClean(
    cityRowsList.map((item: CityRow) => item.city)
  );

  const { data: districtRows } = await applyBookableStudioFilters(
    supabase
      .from("studios")
      .select("district")
      .not("district", "is", null)
      .order("district", { ascending: true })
  );

  const districtRowsList = (districtRows || []) as DistrictRow[];

  const districts = uniqueClean(
    districtRowsList.map((item: DistrictRow) => item.district)
  );

  const { data: features } = await supabase
    .from("studio_features")
    .select("id,name_en,name_ar,category,sort_order")
    .eq("status", "active")
    .order("sort_order", { ascending: true });

  const featuresList = (features || []) as StudioFeatureRow[];

  let equipmentFilterRows: EquipmentFilterRow[] = [];

  if (bookableStudioIds.length > 0) {
    const { data } = await supabase
      .from("studio_equipment")
      .select("studio_id,category,brand")
      .in("studio_id", bookableStudioIds)
      .order("category", { ascending: true });

    equipmentFilterRows = (data || []) as EquipmentFilterRow[];
  }

  const equipmentCategories = uniqueClean(
    equipmentFilterRows.map((item: EquipmentFilterRow) => item.category)
  );

  const equipmentBrands = uniqueClean(
    equipmentFilterRows.map((item: EquipmentFilterRow) => item.brand)
  );

  const studioIdFilters: string[][] = [];

  if (selectedFeatureIds.length > 0) {
    let linkedStudiosQuery = supabase
      .from("studio_feature_links")
      .select("studio_id,feature_id")
      .in("feature_id", selectedFeatureIds);

    if (bookableStudioIds.length > 0) {
      linkedStudiosQuery = linkedStudiosQuery.in("studio_id", bookableStudioIds);
    } else {
      linkedStudiosQuery = linkedStudiosQuery.in("studio_id", [
        "00000000-0000-0000-0000-000000000000"
      ]);
    }

    const { data: linkedStudios } = await linkedStudiosQuery;

    const linkedStudiosList = (linkedStudios || []) as LinkedStudioFeatureRow[];

    const counts = new Map<string, Set<string>>();

    for (const item of linkedStudiosList) {
      if (!counts.has(item.studio_id)) {
        counts.set(item.studio_id, new Set());
      }

      counts.get(item.studio_id)?.add(item.feature_id);
    }

    const matchingFeatureStudioIds = Array.from(counts.entries())
      .filter(([, featureSet]) =>
        selectedFeatureIds.every((featureId: string) => featureSet.has(featureId))
      )
      .map(([studioId]) => studioId);

    studioIdFilters.push(matchingFeatureStudioIds);
  }

  const hasEquipmentFilters =
    selectedEquipmentCategories.length > 0 ||
    selectedEquipmentBrand ||
    equipmentKeyword;

  if (hasEquipmentFilters) {
    let equipmentQuery = supabase
      .from("studio_equipment")
      .select("studio_id,name,brand,model,category");

    if (bookableStudioIds.length > 0) {
      equipmentQuery = equipmentQuery.in("studio_id", bookableStudioIds);
    } else {
      equipmentQuery = equipmentQuery.in("studio_id", [
        "00000000-0000-0000-0000-000000000000"
      ]);
    }

    if (selectedEquipmentCategories.length > 0) {
      equipmentQuery = equipmentQuery.in(
        "category",
        selectedEquipmentCategories
      );
    }

    if (selectedEquipmentBrand) {
      equipmentQuery = equipmentQuery.ilike(
        "brand",
        `%${selectedEquipmentBrand}%`
      );
    }

    if (equipmentKeyword) {
      equipmentQuery = equipmentQuery.or(
        `name.ilike.%${equipmentKeyword}%,brand.ilike.%${equipmentKeyword}%,model.ilike.%${equipmentKeyword}%,category.ilike.%${equipmentKeyword}%`
      );
    }

    const { data: matchingEquipmentRows } = await equipmentQuery;

    const matchingEquipmentRowsList =
      (matchingEquipmentRows || []) as EquipmentMatchRow[];

    const matchingEquipmentStudioIds = uniqueClean(
      matchingEquipmentRowsList.map(
        (item: EquipmentMatchRow) => item.studio_id
      )
    );

    studioIdFilters.push(matchingEquipmentStudioIds);
  }

  const finalMatchingStudioIds = intersectMany(studioIdFilters);

  let studiosQuery = applyBookableStudioFilters(
    supabase
      .from("studios")
      .select(
        "id,name,slug,city,district,price_from,status,cover_image_url,verified,booking_enabled,owner_compliance_status,google_rating,google_user_ratings_total,tripadvisor_rating,tripadvisor_reviews_total,created_at,description,is_featured,completion_score"
      )
  );

  if (queryText) {
    studiosQuery = studiosQuery.or(
      `name.ilike.%${queryText}%,city.ilike.%${queryText}%,district.ilike.%${queryText}%,description.ilike.%${queryText}%`
    );
  }

  if (selectedCity) {
    studiosQuery = studiosQuery.eq("city", selectedCity);
  }

  if (selectedDistrict) {
    studiosQuery = studiosQuery.eq("district", selectedDistrict);
  }

  if (minPrice > 0) {
    studiosQuery = studiosQuery.gte("price_from", minPrice);
  }

  if (maxPrice > 0) {
    studiosQuery = studiosQuery.lte("price_from", maxPrice);
  }

  if (verifiedOnly) {
    studiosQuery = studiosQuery.eq("verified", true);
  }

  if (minGoogleRating > 0) {
    studiosQuery = studiosQuery.gte("google_rating", minGoogleRating);
  }

  if (minTripAdvisorRating > 0) {
    studiosQuery = studiosQuery.gte(
      "tripadvisor_rating",
      minTripAdvisorRating
    );
  }

  if (finalMatchingStudioIds) {
    if (finalMatchingStudioIds.length > 0) {
      studiosQuery = studiosQuery.in("id", finalMatchingStudioIds);
    } else {
      studiosQuery = studiosQuery.in("id", [
        "00000000-0000-0000-0000-000000000000"
      ]);
    }
  }

  if (sort === "price_low") {
    studiosQuery = studiosQuery.order("price_from", { ascending: true });
  } else if (sort === "price_high") {
    studiosQuery = studiosQuery.order("price_from", { ascending: false });
  } else if (sort === "google_rating") {
    studiosQuery = studiosQuery.order("google_rating", {
      ascending: false,
      nullsFirst: false
    });
  } else if (sort === "tripadvisor_rating") {
    studiosQuery = studiosQuery.order("tripadvisor_rating", {
      ascending: false,
      nullsFirst: false
    });
  } else {
    studiosQuery = studiosQuery.order("created_at", { ascending: false });
  }

  const { data: studios, error } = await studiosQuery;

  let studiosList = (studios || []) as StudioCardRow[];

  if (!error) {
    const { data: activeAccelerations } = await supabase
      .from("studio_accelerations")
      .select("studio_id, priority_score")
      .eq("status", "active")
      .gte("end_date", new Date().toISOString());

    const accelerationMap = new Map<string, number>();
    if (activeAccelerations) {
      for (const acc of activeAccelerations) {
        accelerationMap.set(acc.studio_id, acc.priority_score || 0);
      }
    }

    if (sort === "newest") {
      studiosList.sort((a, b) => {
        const aBoost = accelerationMap.has(a.id);
        const bBoost = accelerationMap.has(b.id);
        
        if (aBoost && !bBoost) return -1;
        if (!aBoost && bBoost) return 1;

        if (aBoost && bBoost) {
          const aScore = accelerationMap.get(a.id)!;
          const bScore = accelerationMap.get(b.id)!;
          if (aScore !== bScore) return bScore - aScore;
        }

        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;

        const aComp = a.completion_score || 0;
        const bComp = b.completion_score || 0;
        if (aComp !== bComp) return bComp - aComp;

        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
    }
    
    // Add is_accelerated flag to the objects for rendering badges
    studiosList = studiosList.map((studio) => ({
      ...studio,
      is_accelerated: accelerationMap.has(studio.id)
    }));
  }

  if (error) {
    return (
      <div className="card">
        <span className="badge">
          <T en="Error" ar="خطأ" />
        </span>
        <h1>
          <T en="Studios" ar="الاستوديوهات" />
        </h1>
        <p>{error.message}</p>
      </div>
    );
  }

  const resultCount = studiosList.length;

  const hasFilters =
    queryText ||
    selectedCity ||
    selectedDistrict ||
    minPrice ||
    maxPrice ||
    verifiedOnly ||
    minGoogleRating ||
    minTripAdvisorRating ||
    selectedFeatureIds.length > 0 ||
    selectedEquipmentCategories.length > 0 ||
    selectedEquipmentBrand ||
    equipmentKeyword ||
    sort !== "newest";

  const groupedFeatures = featuresList.reduce<Record<string, StudioFeatureRow[]>>(
    (groups, feature: StudioFeatureRow) => {
      const key = feature.category || "general";

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(feature);

      return groups;
    },
    {}
  );

  const featureGroupLabels: Record<
    string,
    { en: string; ar: string; icon: string }
  > = {
    space: {
      en: "Space type",
      ar: "نوع المساحة",
      icon: "🎙️"
    },
    amenity: {
      en: "Amenities",
      ar: "المميزات",
      icon: "✨"
    },
    equipment: {
      en: "Equipment",
      ar: "المعدات",
      icon: "🎛️"
    },
    service: {
      en: "Services",
      ar: "الخدمات",
      icon: "🧑‍💻"
    },
    media: {
      en: "Media",
      ar: "الإنتاج",
      icon: "🎥"
    },
    general: {
      en: "Other",
      ar: "أخرى",
      icon: "➕"
    }
  };

  return (
    <section>
      <div className="section-head studios-hero-head">
        <span className="badge">
          <T en="Browse Studios" ar="تصفح الاستوديوهات" />
        </span>

        <h1>
          <T en="Find a studio that matches your" ar="اعثر على استوديو يناسب" />{" "}
          <span className="neon-text">
            <T en="sound." ar="صوتك." />
          </span>
        </h1>

        <p>
          <T
            en="Search, filter, and compare premium recording rooms, podcast spaces, rehearsal studios, and production suites."
            ar="ابحث، فلتر، وقارن بين غرف التسجيل، مساحات البودكاست، استوديوهات التدريب، وغرف الإنتاج."
          />
        </p>
      </div>

      <form className="card studio-filter-panel advanced-studio-filter-panel">
        <div className="filter-main-search">
          <label>
            <T en="Search" ar="بحث" />
          </label>

          <input
            className="input"
            name="q"
            defaultValue={queryText}
            placeholder="Studio name, city, district, description..."
          />
        </div>

        <div>
          <label>
            <T en="City" ar="المدينة" />
          </label>

          <select className="input" name="city" defaultValue={selectedCity}>
            <option value="">All cities</option>
            {cities.map((city: string) => (
              <option value={city} key={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>
            <T en="District" ar="الحي" />
          </label>

          <select
            className="input"
            name="district"
            defaultValue={selectedDistrict}
          >
            <option value="">All districts</option>
            {districts.map((district: string) => (
              <option value={district} key={district}>
                {district}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>
            <T en="Min price" ar="أقل سعر" />
          </label>

          <input
            className="input"
            name="min_price"
            type="number"
            min="0"
            defaultValue={minPrice || ""}
            placeholder="100"
          />
        </div>

        <div>
          <label>
            <T en="Max price" ar="أعلى سعر" />
          </label>

          <input
            className="input"
            name="max_price"
            type="number"
            min="0"
            defaultValue={maxPrice || ""}
            placeholder="500"
          />
        </div>

        <div>
          <label>
            <T en="Min Google rating" ar="أقل تقييم Google" />
          </label>

          <select
            className="input"
            name="min_google_rating"
            defaultValue={minGoogleRating || ""}
          >
            <option value="">Any</option>
            <option value="3">3.0+</option>
            <option value="3.5">3.5+</option>
            <option value="4">4.0+</option>
            <option value="4.5">4.5+</option>
          </select>
        </div>

        <div>
          <label>
            <T en="Min TripAdvisor rating" ar="أقل تقييم TripAdvisor" />
          </label>

          <select
            className="input"
            name="min_tripadvisor_rating"
            defaultValue={minTripAdvisorRating || ""}
          >
            <option value="">Any</option>
            <option value="3">3.0+</option>
            <option value="3.5">3.5+</option>
            <option value="4">4.0+</option>
            <option value="4.5">4.5+</option>
          </select>
        </div>

        <div>
          <label>
            <T en="Sort by" ar="ترتيب حسب" />
          </label>

          <select className="input" name="sort" defaultValue={sort}>
            <option value="newest">Newest</option>
            <option value="price_low">Price: low to high</option>
            <option value="price_high">Price: high to low</option>
            <option value="google_rating">Google rating</option>
            <option value="tripadvisor_rating">TripAdvisor rating</option>
          </select>
        </div>

        <label className="filter-check-card">
          <input
            type="checkbox"
            name="verified"
            value="true"
            defaultChecked={verifiedOnly}
          />
          <span>
            <T en="Verified only" ar="الموثق فقط" />
          </span>
        </label>

        <div className="feature-filter-area">
          <div className="feature-filter-head">
            <span className="badge">
              <T en="Feature Filters" ar="فلاتر المميزات" />
            </span>

            <p>
              <T
                en="Filter by space type, amenities, equipment, services, and media capabilities."
                ar="فلتر حسب نوع المساحة، المميزات، المعدات، الخدمات، وإمكانيات الإنتاج."
              />
            </p>
          </div>

          <div className="feature-filter-groups">
            {Object.entries(groupedFeatures).map(([category, groupItems]) => {
              const label =
                featureGroupLabels[category] || featureGroupLabels.general;

              return (
                <details className="filter-accordion" key={category}>
                  <summary>
                    <span>{label.icon}</span>
                    <strong>
                      <T en={label.en} ar={label.ar} />
                    </strong>
                    <small>{groupItems.length}</small>
                  </summary>

                  <div className="feature-filter-options">
                    {groupItems.map((feature: StudioFeatureRow) => {
                      const checked = selectedFeatureIds.includes(feature.id);

                      return (
                        <label className="feature-filter-chip" key={feature.id}>
                          <input
                            type="checkbox"
                            name="features"
                            value={feature.id}
                            defaultChecked={checked}
                          />

                          <span>
                            <T en={feature.name_en} ar={feature.name_ar} />
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </details>
              );
            })}
          </div>
        </div>

        <div className="equipment-filter-area">
          <div className="feature-filter-head">
            <span className="badge">
              <T en="Equipment Filters" ar="فلاتر المعدات" />
            </span>

            <p>
              <T
                en="Search by detailed equipment category, brand, model, or name."
                ar="ابحث حسب تصنيف المعدة، العلامة التجارية، الموديل، أو الاسم."
              />
            </p>
          </div>

          <div className="equipment-filter-grid">
            <div>
              <label>
                <T en="Equipment keyword" ar="كلمة بحث للمعدات" />
              </label>

              <input
                className="input"
                name="equipment_q"
                defaultValue={equipmentKeyword}
                placeholder="Neumann, U87, Piano, Camera..."
              />
            </div>

            <div>
              <label>
                <T en="Equipment brand" ar="علامة المعدة" />
              </label>

              <select
                className="input"
                name="equipment_brand"
                defaultValue={selectedEquipmentBrand}
              >
                <option value="">Any brand</option>
                {equipmentBrands.map((brand: string) => (
                  <option value={brand} key={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="equipment-category-chips">
            {equipmentCategories.map((category: string) => {
              const checked = selectedEquipmentCategories.includes(category);

              return (
                <label className="feature-filter-chip" key={category}>
                  <input
                    type="checkbox"
                    name="equipment_categories"
                    value={category}
                    defaultChecked={checked}
                  />

                  <span>{category}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="filter-action-row">
          <button className="btn" type="submit">
            <T en="Apply All Filters" ar="تطبيق كل الفلاتر" />
          </button>

          <Link href="/studios" className="btn btn-secondary">
            <T en="Reset" ar="إعادة ضبط" />
          </Link>
        </div>
      </form>

      <div className="studio-results-bar">
        <div>
          <span className="badge">
            {resultCount} <T en="results" ar="نتيجة" />
          </span>

          {hasFilters ? (
            <p>
              <T
                en="Showing filtered bookable studio results."
                ar="يتم عرض الاستوديوهات القابلة للحجز حسب الفلاتر."
              />
            </p>
          ) : (
            <p>
              <T
                en="Showing all bookable studios."
                ar="يتم عرض جميع الاستوديوهات القابلة للحجز."
              />
            </p>
          )}
        </div>
      </div>

      <div className="grid">
        {studiosList.length ? (
          studiosList.map((studio: StudioCardRow) => (
            <article className="card studio-card" key={studio.id}>
              <div className="studio-cover">
                {studio.cover_image_url ? (
                  <img src={studio.cover_image_url} alt={studio.name} />
                ) : (
                  <div className="placeholder">
                    <T en="No Image" ar="لا توجد صورة" />
                  </div>
                )}

                <div className="studio-card-floating-badges">
                  {studio.is_accelerated ? (
                    <span className="badge" style={{ borderColor: 'var(--gb-gold)', background: 'var(--gb-surface)', color: 'var(--gb-gold)' }}>
                      <T en="Featured" ar="مميز" />
                    </span>
                  ) : studio.is_featured ? (
                    <span className="badge" style={{ borderColor: 'var(--gb-gold)', background: 'var(--gb-surface)', color: 'var(--gb-gold)' }}>
                      <T en="Featured" ar="مميز" />
                    </span>
                  ) : null}

                  <span className="badge studio-bookable-badge">
                    <T en="Bookable" ar="قابل للحجز" />
                  </span>

                  <span className="badge">
                    <T en="Verified" ar="موثق" />
                  </span>

                  {studio.google_rating ? (
                    <span className="badge">
                      {studio.google_rating} ★ Google
                    </span>
                  ) : null}

                  {studio.tripadvisor_rating ? (
                    <span className="badge">
                      {studio.tripadvisor_rating} ★ TripAdvisor
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="studio-card-body">
                <div>
                  <span className="badge">
                    <T en="Available for booking" ar="متاح للحجز" />
                  </span>

                  <h2>{studio.name}</h2>

                  <p>
                    {studio.city}
                    {studio.district ? ` · ${studio.district}` : ""}
                  </p>

                  <div className="studio-trust-mini">
                    {studio.google_user_ratings_total ? (
                      <span>
                        Google: {studio.google_user_ratings_total}{" "}
                        <T en="reviews" ar="تقييم" />
                      </span>
                    ) : null}

                    {studio.tripadvisor_reviews_total ? (
                      <span>
                        TripAdvisor: {studio.tripadvisor_reviews_total}{" "}
                        <T en="reviews" ar="تقييم" />
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="studio-card-footer">
                  <p>
                    <T en="From" ar="من" />{" "}
                    <strong>{studio.price_from ?? 0} SAR</strong>
                  </p>

                  <Link href={`/studios/${studio.slug}`} className="btn btn-small">
                    <T en="View & Book" ar="عرض وحجز" />
                  </Link>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="card">
            <h2>
              <T en="No bookable studios found" ar="لا توجد استوديوهات قابلة للحجز" />
            </h2>
            <p>
              <T
                en="Try changing the search or filters."
                ar="جرّب تغيير البحث أو الفلاتر."
              />
            </p>

            <Link href="/studios" className="btn">
              <T en="Reset filters" ar="إعادة ضبط الفلاتر" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
