import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Discover Elite Studios",
  description: "Browse and book world-class music and recording studios. Filter by equipment, rating, and location across Saudi Arabia and the GCC.",
};
import T from "@/components/t";
import StudioFilter from "@/components/studio-filter";
import SmartDiscoveryPreview from "@/components/smart-discovery-preview";
import { getActiveCountries } from "@/lib/countries-server";
import { getActiveCities } from "@/lib/locations-server";
import { sanitizeStudioListing, SanitizedStudioListing } from "@/lib/studios-server";

type SearchParams = {
  q?: string;
  country?: string;
  city_id?: string;
  city?: string;
  district?: string;
  studio_type?: string;
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

type CountryRow = {
  country_code: string;
  name_en: string;
  name_ar: string;
  phone_code: string;
  currency_code: string;
};

type CityOptionRow = {
  id: string;
  country_code: string;
  name_en: string;
  name_ar: string;
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
  is_boosted?: boolean;
  total_boost_commission?: number;
  // Global / Location Standard fields
  country_code?: string | null;
  city_id?: string | null;
  city_name?: string | null;
  address_line?: string | null;
  google_maps_url?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  minimum_photos_required?: number | null;
  instant_booking_enabled?: boolean | null;
  verified_location?: boolean | null;
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
  const selectedCountry = String(params.country || "").trim();
  const selectedCityId = String(params.city_id || "").trim();
  const selectedCity = String(params.city || "").trim();
  const selectedDistrict = String(params.district || "").trim();
  const selectedStudioType = String(params.studio_type || "").trim();

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

  // FIX 0A: Loading timeout logic (8 seconds)
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("TIMEOUT")), 8000)
  );

  try {
    const [countries, activeCities] = (await Promise.race([
      Promise.all([getActiveCountries(), getActiveCities()]),
      timeoutPromise,
    ])) as any;

    const { data: bookableStudioRows, error: fetchError } = (await Promise.race([
      applyBookableStudioFilters(supabase.from("studios").select("id")),
      timeoutPromise,
    ])) as any;

    if (fetchError) throw fetchError;

    const bookableStudioRowsList = (bookableStudioRows || []) as StudioIdRow[];

    const bookableStudioIds = uniqueClean(
      bookableStudioRowsList.map((item: StudioIdRow) => item.id)
    );

    const { data: cityRows } = (await Promise.race([
      applyBookableStudioFilters(
        supabase
          .from("studios")
          .select("city")
          .not("city", "is", null)
          .order("city", { ascending: true })
      ),
      timeoutPromise,
    ])) as any;

    const cityRowsList = (cityRows || []) as CityRow[];

    const legacyCities = uniqueClean(
      cityRowsList.map((item: CityRow) => item.city)
    );

    const { data: districtRows } = (await Promise.race([
      applyBookableStudioFilters(
        supabase
          .from("studios")
          .select("district")
          .not("district", "is", null)
          .order("district", { ascending: true })
      ),
      timeoutPromise,
    ])) as any;

    const districtRowsList = (districtRows || []) as DistrictRow[];

    const districts = uniqueClean(
      districtRowsList.map((item: DistrictRow) => item.district)
    );

    const { data: features } = (await Promise.race([
      supabase
        .from("studio_features")
        .select("id,name_en,name_ar,category,sort_order")
        .eq("status", "active")
        .order("sort_order", { ascending: true }),
      timeoutPromise,
    ])) as any;

    const featuresList = (features || []) as StudioFeatureRow[];

    let equipmentFilterRows: EquipmentFilterRow[] = [];

    if (bookableStudioIds.length > 0) {
      const { data } = (await Promise.race([
        supabase
          .from("studio_equipment")
          .select("studio_id,category,brand")
          .in("studio_id", bookableStudioIds)
          .order("category", { ascending: true }),
        timeoutPromise,
      ])) as any;

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
          "00000000-0000-0000-0000-000000000000",
        ]);
      }

      const { data: linkedStudios } = (await Promise.race([
        linkedStudiosQuery,
        timeoutPromise,
      ])) as any;

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
          "00000000-0000-0000-0000-000000000000",
        ]);
      }

      if (selectedEquipmentCategories.length > 0) {
        equipmentQuery = equipmentQuery.in("category", selectedEquipmentCategories);
      }

      if (selectedEquipmentBrand) {
        equipmentQuery = equipmentQuery.ilike("brand", `%${selectedEquipmentBrand}%`);
      }

      if (equipmentKeyword) {
        equipmentQuery = equipmentQuery.or(
          `name.ilike.%${equipmentKeyword}%,brand.ilike.%${equipmentKeyword}%,model.ilike.%${equipmentKeyword}%,category.ilike.%${equipmentKeyword}%`
        );
      }

      const { data: matchingEquipmentRows } = (await Promise.race([
        equipmentQuery,
        timeoutPromise,
      ])) as any;

      const matchingEquipmentRowsList =
        (matchingEquipmentRows || []) as EquipmentMatchRow[];

      const matchingEquipmentStudioIds = uniqueClean(
        matchingEquipmentRowsList.map((item: EquipmentMatchRow) => item.studio_id)
      );

      studioIdFilters.push(matchingEquipmentStudioIds);
    }

    const finalMatchingStudioIds = intersectMany(studioIdFilters);

    let studiosQuery = applyBookableStudioFilters(
      supabase
        .from("studios")
        .select(
          "id,name,slug,city,district,price_from,status,cover_image_url,verified,booking_enabled,owner_compliance_status,google_rating,google_user_ratings_total,tripadvisor_rating,tripadvisor_reviews_total,created_at,description,is_featured,completion_score,country_code,city_id,city_name,address_line,google_maps_url,latitude,longitude,minimum_photos_required,instant_booking_enabled,verified_location"
        )
    );

    if (queryText) {
      studiosQuery = studiosQuery.or(
        `name.ilike.%${queryText}%,city.ilike.%${queryText}%,city_name.ilike.%${queryText}%,district.ilike.%${queryText}%,address_line.ilike.%${queryText}%,description.ilike.%${queryText}%`
      );
    }

    if (selectedCountry) {
      studiosQuery = studiosQuery.eq("country_code", selectedCountry);
    }

    if (selectedCityId) {
      studiosQuery = studiosQuery.eq("city_id", selectedCityId);
    }

    if (selectedCity && !selectedCityId) {
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
      studiosQuery = studiosQuery.gte("tripadvisor_rating", minTripAdvisorRating);
    }

    if (finalMatchingStudioIds) {
      if (finalMatchingStudioIds.length > 0) {
        studiosQuery = studiosQuery.in("id", finalMatchingStudioIds);
      } else {
        studiosQuery = studiosQuery.in("id", [
          "00000000-0000-0000-0000-000000000000",
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
        nullsFirst: false,
      });
    } else if (sort === "tripadvisor_rating") {
      studiosQuery = studiosQuery.order("tripadvisor_rating", {
        ascending: false,
        nullsFirst: false,
      });
    } else {
      studiosQuery = studiosQuery.order("created_at", { ascending: false });
    }

    const { data: studios, error: queryError } = (await Promise.race([
      studiosQuery,
      timeoutPromise,
    ])) as any;

    if (queryError) throw queryError;

    const studiosList = (studios || []) as StudioCardRow[];

    const { data: activeBoosts } = (await Promise.race([
      supabase
        .from("studio_boost_subscriptions")
        .select("studio_id, total_commission_percent")
        .eq("status", "active")
        .gt("ends_at", new Date().toISOString()),
      timeoutPromise,
    ])) as any;

    const boostMap = new Map<string, number>();
    if (activeBoosts) {
      for (const boost of activeBoosts) {
        boostMap.set(boost.studio_id, Number(boost.total_commission_percent || 0));
      }
    }

    if (sort === "newest") {
      studiosList.sort((a, b) => {
        const aBoostScore = boostMap.get(a.id) || 0;
        const bBoostScore = boostMap.get(b.id) || 0;

        if (aBoostScore !== bBoostScore) return bBoostScore - aBoostScore;
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        const aComp = a.completion_score || 0;
        const bComp = b.completion_score || 0;
        if (aComp !== bComp) return bComp - aComp;
        return (
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
      });
    }

    const sanitizedList = (studiosList.map((studio) => sanitizeStudioListing({
      ...studio,
      is_boosted: boostMap.has(studio.id),
      total_boost_commission: boostMap.get(studio.id),
    })).filter(Boolean) as SanitizedStudioListing[]);

    const resultCount = sanitizedList.length;

    const hasFilters =
      queryText ||
      selectedCountry ||
      selectedCityId ||
      selectedCity ||
      selectedDistrict ||
      selectedStudioType ||
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

    return (
      <section>
        <div className="section-head studios-hero-head">
          <span className="badge">
            <T en="Browse Studios" ar="تصفح الاستوديوهات" />
          </span>

          <h1>
            <T en="Explore elite studios in our" ar="استكشف استوديوهات النخبة في" />{" "}
            <span className="neon-text">
              <T en="pilot network." ar="شبكتنا التجريبية." />
            </span>
          </h1>

          <p className="text-balance" style={{ maxWidth: 700, marginInline: 'auto' }}>
            <T
              en="Search, filter, and compare premium recording rooms, podcast spaces, rehearsal studios, and production suites."
              ar="ابحث، فلتر، وقارن بين غرف التسجيل، مساحات البودكاست، استوديوهات التدريب، وغرف الإنتاج."
            />
          </p>

          {/* STUDIO TRUST LAYER */}
          <div className="studio-trust-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: 16,
            marginTop: 40,
            marginBottom: 8 
          }}>
            {[
              { icon: '🎙️', en: 'Studio Tested', ar: 'مختبر في الاستوديو' },
              { icon: '🎚️', en: 'Pro Audio Grade', ar: 'جودة صوت احترافية' },
              { icon: '⭐', en: 'Top Rated', ar: 'الأعلى تقييماً' },
              { icon: '💎', en: 'Premium Quality', ar: 'جودة ممتازة' },
            ].map(item => (
              <div key={item.en} style={{ 
                padding: '16px 20px', 
                background: 'rgba(212, 175, 55, 0.04)', 
                border: '1px solid rgba(212, 175, 55, 0.12)', 
                borderRadius: 'var(--gb-radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>
                  <T en={item.en} ar={item.ar} />
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24 }}>
            <Link href="/studios/near-me" className="btn btn-secondary">
              <T en="Studios near me" ar="استوديوهات قريبة مني" />
            </Link>
          </div>
        </div>

        {/* ADVANCED FILTERS READINESS */}
        <div className="hide-app" style={{ marginBottom: 24 }}>
          <div className="card-premium" style={{ padding: 16, background: 'rgba(212,175,55,0.05)', border: '1px dashed rgba(212,175,55,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.5rem' }}>🎛️</span>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.9rem' }}><T en="Advanced Filtering & Mobile Drawer" ar="تصفية متقدمة ودرج الهاتف المحمول" /></h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 }}>
                  <T en="Advanced equipment, rating, and real-time availability filters are being optimized." ar="يتم تحسين فلاتر المعدات المتقدمة والتقييم والتوافر في الوقت الفعلي." />
                </p>
              </div>
            </div>
            <span className="badge badge-gold" style={{ fontSize: '0.6rem' }}>ENHANCED SEARCH</span>
          </div>
        </div>

        <SmartDiscoveryPreview vertical="studios" />

        <div style={{ marginTop: 40, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.05)' }}></span>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--gb-gold)', textTransform: 'uppercase', letterSpacing: 1 }}>
            <T en="Manual Advanced Filters" ar="فلاتر يدوية متقدمة" />
          </span>
          <span style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.05)' }}></span>
        </div>

        <StudioFilter
          cities={legacyCities}
          districts={districts}
          features={featuresList}
          equipmentCategories={equipmentCategories}
          equipmentBrands={equipmentBrands}
          countries={countries}
          cityOptions={activeCities}
          selectedCountry={selectedCountry}
          selectedCityId={selectedCityId}
          selectedStudioType={selectedStudioType}
          initialValues={{
            q: queryText,
            city: selectedCity,
            district: selectedDistrict,
            min_price: minPrice,
            max_price: maxPrice,
            verified: verifiedOnly,
            min_google_rating: minGoogleRating,
            min_tripadvisor_rating: minTripAdvisorRating,
            selectedFeatureIds,
            selectedEquipmentCategories,
            selectedEquipmentBrand,
            equipmentKeyword,
            sort,
          }}
        />

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
          {sanitizedList.length ? (
            sanitizedList.map((studio: SanitizedStudioListing) => {
              const displayCity = studio.city_name || studio.city;
              const displayDistrict = studio.district;

              return (
                <article className="card studio-card" key={studio.id}>
                  <div className="studio-cover">
                    {studio.cover_image_url ? (
                      <div style={{ position: "relative", width: "100%", height: "100%" }}>
                        <Image
                          src={studio.cover_image_url}
                          alt={studio.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          style={{ objectFit: "cover", borderRadius: 'var(--gb-radius-md) var(--gb-radius-md) 0 0' }}
                        />
                      </div>
                    ) : (
                      <div className="placeholder">
                        <T en="No Image" ar="لا توجد صورة" />
                      </div>
                    )}

                    <div className="studio-card-floating-badges">
                      {studio.is_boosted ? (
                        <span
                          className="badge"
                          style={{
                            borderColor: "var(--gb-gold)",
                            background: "var(--gb-surface)",
                            color: "var(--gb-gold)",
                          }}
                        >
                          <T en="Featured" ar="مميز" />
                        </span>
                      ) : studio.is_featured ? (
                        <span
                          className="badge"
                          style={{
                            borderColor: "var(--gb-gold)",
                            background: "var(--gb-surface)",
                            color: "var(--gb-gold)",
                          }}
                        >
                          <T en="Featured" ar="مميز" />
                        </span>
                      ) : null}

                      <span className="badge studio-bookable-badge">
                        <T en="Pilot Partner" ar="شريك تجريبي" />
                      </span>

                      <span className="badge">
                        <T en="Verified" ar="موثق" />
                      </span>

                      {studio.instant_booking_enabled ? (
                        <span className="badge badge-success">
                          <T en="Direct Access" ar="وصول مباشر" />
                        </span>
                      ) : null}

                      {studio.verified_location ? (
                        <span className="badge badge-success">
                          <T en="Location verified" ar="الموقع موثق" />
                        </span>
                      ) : null}

                      {studio.google_rating ? (
                        <span className="badge">{studio.google_rating} <T en="★ Google" ar="★ جوجل" /></span>
                      ) : null}

                      {studio.tripadvisor_rating ? (
                        <span className="badge">
                          {studio.tripadvisor_rating} <T en="★ TripAdvisor" ar="★ تريب أدفايزر" />
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="studio-card-body">
                    <div>
                      <span className="badge">
                        <T en="Active Pilot Studio" ar="استوديو تجريبي نشط" />
                      </span>

                      <h2>{studio.name}</h2>

                      <p>
                        {displayCity}
                        {displayDistrict ? ` · ${displayDistrict}` : ""}
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
                        <strong>{studio.price_from ?? 0} <T en="SAR" ar="ر.س" /></strong>
                      </p>

                      <Link href={`/studios/${studio.slug}`} className="btn btn-small">
                        <T en="Explore Studio" ar="استكشف الاستوديو" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div
              className="card-premium animate-up"
              style={{ 
                textAlign: "center", 
                padding: "80px 40px",
                background: "linear-gradient(180deg, rgba(212,175,55,0.05), rgba(0,0,0,0))",
                border: "1px dashed rgba(212,175,55,0.2)",
                gridColumn: "1 / -1"
              }}
            >
              <div style={{ fontSize: "4rem", marginBottom: 24 }}>🎙️</div>
              <h2 style={{ fontSize: "2.2rem", marginBottom: "1rem", color: "var(--gb-gold)" }}>
                <T en="Ready to join GearBeat?" ar="هل أنت مستعد للانضمام إلى GearBeat؟" />
              </h2>
              <p style={{ color: "var(--gb-text-muted)", marginBottom: "2.5rem", maxWidth: 600, marginInline: 'auto', fontSize: '1.1rem', lineHeight: 1.6 }}>
                <T 
                  en="We couldn't find studios matching your current filters. Become a part of our elite network of verified studios today." 
                  ar="لم نتمكن من العثور على استوديوهات تطابق فلاتر البحث. كن جزءًا من شبكتنا النخبة من الاستوديوهات الموثقة اليوم." 
                />
              </p>
              
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/join/studio" className="btn btn-primary">
                  <T en="Join as Studio" ar="انضم كاستوديو" />
                </Link>
                <Link href="/studios" className="btn btn-outline">
                  <T en="Reset Filters" ar="إعادة ضبط الفلاتر" />
                </Link>
                <Link href="/support" className="btn btn-outline">
                  <T en="Request a Location" ar="طلب موقع" />
                </Link>
                <Link href="/marketplace" className="btn btn-outline">
                  <T en="Explore Marketplace" ar="استكشاف المتجر" />
                </Link>
              </div>

              <p style={{ marginTop: "2rem", color: "var(--gb-gold)", fontWeight: 600, fontSize: "0.9rem" }}>
                <T en="Pilot‑Ready – listings are provisional and no live payments are processed." ar="في مرحلة التجريب – القوائم تجريبية ولا يتم معالجة المدفوعات الحية." />
              </p>
            </div>
          )}
        </div>
      </section>
    );
  } catch (err: any) {
    const isTimeout = err.message === "TIMEOUT";

    return (
      <div className="card" style={{ textAlign: "center", padding: "60px 20px" }}>
        <h2 style={{ color: "var(--gb-gold)", marginBottom: "1rem" }}>
          {isTimeout ? (
            <T en="Connection Timeout" ar="انتهت مهلة الاتصال" />
          ) : (
            <T en="Unexpected Error" ar="حدث خطأ غير متوقع" />
          )}
        </h2>
        <p style={{ color: "var(--gb-steel)", marginBottom: "2rem" }}>
          {isTimeout ? (
            <T
              en="The server is taking too long to respond. Please try again."
              ar="استغرق الخادم وقتاً طويلاً للرد. يرجى المحاولة مرة أخرى."
            />
          ) : (
            <T
              en="Something went wrong while fetching studios. Please try again later."
              ar="حدث خطأ ما أثناء جلب الاستوديوهات. يرجى المحاولة مرة أخرى لاحقاً."
            />
          )}
        </p>

        <Link href="/studios" className="btn btn-primary">
          <T en="Try Again" ar="حاول مرة أخرى" />
        </Link>
      </div>
    );
  }
}

