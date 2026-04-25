import Link from "next/link";
import { createClient } from "../../lib/supabase/server";
import T from "../../components/t";

type SearchParams = {
  q?: string;
  city?: string;
  max_price?: string;
  verified?: string;
  features?: string | string[];
};

function toArray(value: string | string[] | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default async function StudiosPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = searchParams ? await searchParams : {};

  const queryText = String(params.q || "").trim();
  const selectedCity = String(params.city || "").trim();
  const maxPrice = Number(params.max_price || 0);
  const verifiedOnly = params.verified === "true";
  const selectedFeatureIds = toArray(params.features);

  const supabase = await createClient();

  const { data: cityRows } = await supabase
    .from("studios")
    .select("city")
    .eq("status", "approved")
    .not("city", "is", null)
    .order("city", { ascending: true });

  const cities = Array.from(
    new Set((cityRows || []).map((item) => item.city).filter(Boolean))
  );

  const { data: features } = await supabase
    .from("studio_features")
    .select("id,name_en,name_ar,category,sort_order")
    .eq("status", "active")
    .order("sort_order", { ascending: true });

  let matchingStudioIds: string[] | null = null;

  if (selectedFeatureIds.length > 0) {
    const { data: linkedStudios } = await supabase
      .from("studio_feature_links")
      .select("studio_id,feature_id")
      .in("feature_id", selectedFeatureIds);

    const counts = new Map<string, Set<string>>();

    for (const item of linkedStudios || []) {
      if (!counts.has(item.studio_id)) {
        counts.set(item.studio_id, new Set());
      }

      counts.get(item.studio_id)?.add(item.feature_id);
    }

    matchingStudioIds = Array.from(counts.entries())
      .filter(([, featureSet]) =>
        selectedFeatureIds.every((featureId) => featureSet.has(featureId))
      )
      .map(([studioId]) => studioId);
  }

  let studiosQuery = supabase
    .from("studios")
    .select(
      "id,name,slug,city,district,price_from,status,cover_image_url,verified,google_rating,google_user_ratings_total,tripadvisor_rating"
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (queryText) {
    studiosQuery = studiosQuery.or(
      `name.ilike.%${queryText}%,city.ilike.%${queryText}%,district.ilike.%${queryText}%`
    );
  }

  if (selectedCity) {
    studiosQuery = studiosQuery.eq("city", selectedCity);
  }

  if (maxPrice > 0) {
    studiosQuery = studiosQuery.lte("price_from", maxPrice);
  }

  if (verifiedOnly) {
    studiosQuery = studiosQuery.eq("verified", true);
  }

  if (matchingStudioIds) {
    if (matchingStudioIds.length > 0) {
      studiosQuery = studiosQuery.in("id", matchingStudioIds);
    } else {
      studiosQuery = studiosQuery.in("id", ["00000000-0000-0000-0000-000000000000"]);
    }
  }

  const { data: studios, error } = await studiosQuery;

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

  const resultCount = studios?.length || 0;
  const hasFilters =
    queryText ||
    selectedCity ||
    maxPrice ||
    verifiedOnly ||
    selectedFeatureIds.length > 0;

  const groupedFeatures =
    features?.reduce<Record<string, typeof features>>((groups, feature) => {
      const key = feature.category || "general";

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(feature);

      return groups;
    }, {}) || {};

  const featureGroupLabels: Record<string, { en: string; ar: string; icon: string }> = {
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

      <form className="card studio-filter-panel">
        <div className="filter-main-search">
          <label>
            <T en="Search" ar="بحث" />
          </label>

          <input
            className="input"
            name="q"
            defaultValue={queryText}
            placeholder="Studio name, city, district..."
          />
        </div>

        <div>
          <label>
            <T en="City" ar="المدينة" />
          </label>

          <select className="input" name="city" defaultValue={selectedCity}>
            <option value="">All cities</option>
            {cities.map((city) => (
              <option value={city} key={city}>
                {city}
              </option>
            ))}
          </select>
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

        <button className="btn" type="submit">
          <T en="Apply Filters" ar="تطبيق الفلاتر" />
        </button>

        <Link href="/studios" className="btn btn-secondary">
          <T en="Reset" ar="إعادة ضبط" />
        </Link>

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
              const label = featureGroupLabels[category] || featureGroupLabels.general;

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
                    {groupItems.map((feature) => {
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
      </form>

      <div className="studio-results-bar">
        <div>
          <span className="badge">
            {resultCount} <T en="results" ar="نتيجة" />
          </span>

          {hasFilters ? (
            <p>
              <T
                en="Showing filtered studio results."
                ar="يتم عرض نتائج الاستوديوهات حسب الفلاتر."
              />
            </p>
          ) : (
            <p>
              <T
                en="Showing all approved studios."
                ar="يتم عرض جميع الاستوديوهات المعتمدة."
              />
            </p>
          )}
        </div>
      </div>

      <div className="grid">
        {studios?.length ? (
          studios.map((studio) => (
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
                  {studio.verified ? (
                    <span className="badge">
                      <T en="Verified" ar="موثق" />
                    </span>
                  ) : null}

                  {studio.google_rating ? (
                    <span className="badge">
                      {studio.google_rating} ★ Google
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="studio-card-body">
                <div>
                  <span className="badge">
                    <T en="Available" ar="متاح" />
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

                    {studio.tripadvisor_rating ? (
                      <span>TripAdvisor: {studio.tripadvisor_rating} ★</span>
                    ) : null}
                  </div>
                </div>

                <div className="studio-card-footer">
                  <p>
                    <T en="From" ar="من" />{" "}
                    <strong>{studio.price_from ?? 0} SAR</strong>
                  </p>

                  <Link
                    href={`/studios/${studio.slug}`}
                    className="btn btn-small"
                  >
                    <T en="View Details" ar="عرض التفاصيل" />
                  </Link>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="card">
            <h2>
              <T en="No studios found" ar="لم يتم العثور على استوديوهات" />
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
