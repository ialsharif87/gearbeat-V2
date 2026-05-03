import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import T from "@/components/t";
import ShareButton from "@/components/share-button";
import FavoriteButton from "@/components/favorite-button";
import StudioPhotoGallery from "@/components/studio-photo-gallery";
import GoogleMapsLink from "@/components/google-maps-link";
import StudioPhotoRequirements from "@/components/studio-photo-requirements";
import StudioOwnerTrustCard from "@/components/studio-owner-trust-card";

function formatSyncDate(value: string | null | undefined) {
  if (!value) return null;

  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return null;
  }
}

function average(numbers: number[]) {
  const validNumbers = numbers.filter((number) => Number.isFinite(number));

  if (!validNumbers.length) return 0;

  return (
    validNumbers.reduce((sum, number) => sum + number, 0) / validNumbers.length
  );
}

function formatRating(value: number) {
  if (!value) return "—";
  return value.toFixed(1);
}

function stars(value: number) {
  const rounded = Math.round(value);
  return "★★★★★".slice(0, rounded) + "☆☆☆☆☆".slice(0, 5 - rounded);
}

function getReviewScore(review: any) {
  const scores = [
    Number(review.rating || 0),
    Number(review.cleanliness_rating || 0),
    Number(review.equipment_rating || 0),
    Number(review.sound_quality_rating || 0),
    Number(review.communication_rating || 0),
    Number(review.value_rating || 0)
  ].filter((score) => score >= 1 && score <= 5);

  return average(scores);
}

function getReviewAgeDays(createdAt: string) {
  const reviewDate = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - reviewDate.getTime();

  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function getTimeWeight(createdAt: string) {
  const ageDays = getReviewAgeDays(createdAt);

  if (ageDays <= 90) return 1;
  if (ageDays <= 180) return 0.7;
  if (ageDays <= 365) return 0.4;

  return 0.2;
}

function weightedAverageByTime(reviews: any[]) {
  if (!reviews.length) return 0;

  const weightedRows = reviews
    .map((review) => {
      const score = getReviewScore(review);
      const weight = getTimeWeight(review.created_at);

      return {
        score,
        weight
      };
    })
    .filter((item) => item.score > 0 && item.weight > 0);

  if (!weightedRows.length) return 0;

  const totalWeightedScore = weightedRows.reduce(
    (sum, item) => sum + item.score * item.weight,
    0
  );

  const totalWeight = weightedRows.reduce((sum, item) => sum + item.weight, 0);

  if (!totalWeight) return 0;

  return totalWeightedScore / totalWeight;
}

function reviewsInLastDays(reviews: any[], days: number) {
  return reviews.filter((review) => getReviewAgeDays(review.created_at) <= days);
}

export default async function StudioDetailsPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const { data: studio, error } = await supabase
    .from("studios")
    .select(`
      id,
      slug,
      name,
      description,
      city,
      district,
      address,
      address_line,
      google_maps_url,
      google_reviews_url,
      google_place_id,
      google_rating,
      google_user_ratings_total,
      google_rating_last_synced_at,
      tripadvisor_url,
      tripadvisor_rating,
      tripadvisor_reviews_total,
      tripadvisor_rating_last_synced_at,
      latitude,
      longitude,
      price_from,
      cover_image_url,
      verified,
      verified_location,
      instant_booking_enabled,
      booking_enabled,
      owner_compliance_status,
      owner_auth_user_id,
      owner_trust_summary,
      minimum_photos_required,
      created_at
    `)
    .eq("slug", slug)
    .eq("status", "approved")
    .eq("verified", true)
    .eq("booking_enabled", true)
    .eq("owner_compliance_status", "approved")
    .single();

  if (error || !studio) {
    notFound();
  }

  const { data: ownerProfile } = studio.owner_auth_user_id 
    ? await supabaseAdmin
      .from("profiles")
      .select("auth_user_id, full_name, email, phone_verified, email_verified, identity_verification_status")
      .eq("auth_user_id", studio.owner_auth_user_id)
      .maybeSingle()
    : { data: null };

  const { data: studioImages } = await supabase
    .from("studio_images")
    .select("id,image_url,is_cover,sort_order")
    .eq("studio_id", studio.id)
    .order("sort_order", { ascending: true });

  const { data: selectedFeatures } = await supabase
    .from("studio_feature_links")
    .select("id,custom_name,studio_features(name_en,name_ar,category)")
    .eq("studio_id", studio.id);

  const { data: studioEquipment } = await supabase
    .from("studio_equipment")
    .select("id,name,brand,model,category,quantity,notes")
    .eq("studio_id", studio.id)
    .order("created_at", { ascending: false });

  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      "id,rating,cleanliness_rating,equipment_rating,sound_quality_rating,communication_rating,value_rating,comment,created_at"
    )
    .eq("studio_id", studio.id)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const featureGroups: Record<string, any[]> = {
    space: [],
    amenity: [],
    equipment: [],
    service: [],
    media: [],
    custom: []
  };

  for (const item of selectedFeatures || []) {
    const feature = Array.isArray(item.studio_features)
      ? item.studio_features[0]
      : item.studio_features;

    const category = feature?.category || "custom";

    if (!featureGroups[category]) {
      featureGroups[category] = [];
    }

    featureGroups[category].push({
      ...item,
      feature
    });
  }

  const reviewList = reviews || [];
  const reviewCount = reviewList.length;

  const reviewScores = reviewList
    .map((review) => getReviewScore(review))
    .filter((score) => score > 0);

  const allTimeAverage = average(reviewScores);
  const timeWeightedAverage = weightedAverageByTime(reviewList);

  const studioName = studio.name || "Studio";
  const displayCity = studio.city || "";
  const displayLocation = [studio.district, displayCity].filter(Boolean).join(", ");
  const minimumPhotosRequired = Number(studio.minimum_photos_required || 6);
  const photoCount = studioImages?.length || 0;

  return (
    <main className="dashboard-page" style={{ maxWidth: 1240, margin: "0 auto" }}>
      <section style={{ marginTop: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div>
            <span className="badge badge-gold">
              <T en="Premium Studio" ar="استوديو مميز" />
            </span>

            <h1 style={{ marginTop: 10 }}>{studioName}</h1>

            <p style={{ color: "var(--muted)" }}>{displayLocation}</p>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              {studio.verified ? (
                <span className="badge badge-success">
                  <T en="Verified studio" ar="استوديو موثق" />
                </span>
              ) : null}

              {studio.verified_location ? (
                <span className="badge badge-success">
                  <T en="Location verified" ar="الموقع موثق" />
                </span>
              ) : null}

              {studio.instant_booking_enabled ? (
                <span className="badge">
                  <T en="Instant booking" ar="حجز فوري" />
                </span>
              ) : null}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <ShareButton
              title={studioName}
              text={`Check out ${studioName} on GearBeat`}
              shareType="studio"
              studioId={studio.id}
            />

            <FavoriteButton
              type="studio"
              studioId={studio.id}
            />
          </div>
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <StudioPhotoGallery
          images={studioImages || []}
          studioName={studioName}
          coverImageUrl={studio.cover_image_url}
        />

        <div style={{ marginTop: 14 }}>
          <StudioPhotoRequirements
            images={studioImages || []}
            compact
          />
        </div>

        {photoCount < minimumPhotosRequired ? (
          <div
            className="card"
            style={{
              marginTop: 14,
              borderColor: "rgba(255,176,32,0.35)",
              background: "rgba(255,176,32,0.08)",
            }}
          >
            <T
              en="This studio has not completed the recommended photo gallery yet."
              ar="هذا الاستوديو لم يكمل عدد الصور الموصى به بعد."
            />
          </div>
        ) : null}
      </section>

      <section
        style={{
          marginTop: 30,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 360px",
          gap: 24,
          alignItems: "start",
        }}
      >
        <div style={{ display: "grid", gap: 20 }}>
          <div className="card">
            <h2>
              <T en="About this studio" ar="عن هذا الاستوديو" />
            </h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
              {studio.description || "A premium creative space listed on GearBeat."}
            </p>
          </div>

          <div className="card">
            <h2>
              <T en="Space details" ar="تفاصيل المكان" />
            </h2>

            <div className="grid grid-3" style={{ marginTop: 16 }}>
              <div>
                <span style={{ color: "var(--muted)" }}>
                  <T en="Capacity" ar="السعة" />
                </span>
                <strong style={{ display: "block", marginTop: 6 }}>
                  {"—"}
                </strong>
              </div>

              <div>
                <span style={{ color: "var(--muted)" }}>
                  <T en="Size" ar="المساحة" />
                </span>
                <strong style={{ display: "block", marginTop: 6 }}>
                  {"—"}
                </strong>
              </div>

              <div>
                <span style={{ color: "var(--muted)" }}>
                  <T en="Starting price" ar="السعر يبدأ من" />
                </span>
                <strong style={{ display: "block", marginTop: 6 }}>
                  {Number(studio.price_from || 0).toFixed(2)} SAR
                </strong>
              </div>
            </div>
          </div>

          <div className="card">
            <h2>
              <T en="Equipment" ar="المعدات" />
            </h2>

            {studioEquipment && studioEquipment.length > 0 ? (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
                {studioEquipment.map((item: any) => (
                  <span key={item.id} className="badge">
                    {item.name} {item.brand ? `· ${item.brand}` : ""}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--muted)" }}>
                <T
                  en="Equipment details will be added soon."
                  ar="سيتم إضافة تفاصيل المعدات قريبًا."
                />
              </p>
            )}
          </div>

          {featureGroups.service && featureGroups.service.length > 0 && (
            <div className="card">
              <h2>
                <T en="Services Offered" ar="الخدمات المتاحة" />
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: 12,
                  marginTop: 16,
                }}
              >
                {featureGroups.service.map((item) => (
                  <div
                    key={item.id}
                    className="card"
                    style={{
                      padding: 16,
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "1.25rem",
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.04)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {item.feature?.slug === "mixing" ? "🎚️" : 
                       item.feature?.slug === "mastering" ? "📀" :
                       item.feature?.slug === "recording" ? "🎙️" : "🧑‍💻"}
                    </div>
                    <div>
                      <strong style={{ display: "block", fontSize: "0.95rem" }}>
                        <T
                          en={item.feature?.name_en || item.custom_name}
                          ar={item.feature?.name_ar || item.custom_name}
                        />
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <h2>
              <T en="Location" ar="الموقع" />
            </h2>

            <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
              {[studio.address_line, studio.district, studio.city]
                .filter(Boolean)
                .join(", ") || "Location details coming soon."}
            </p>

            <div style={{ marginTop: 16 }}>
              <GoogleMapsLink
                googleMapsUrl={studio.google_maps_url}
                latitude={studio.latitude}
                longitude={studio.longitude}
                cityName={studio.city}
                district={studio.district}
                addressLine={studio.address_line}
                mode="directions"
                className="btn"
              />
            </div>
          </div>

          <StudioOwnerTrustCard
            ownerName={ownerProfile?.full_name}
            ownerEmail={ownerProfile?.email}
            ownerRole="Studio Owner"
            phoneVerified={ownerProfile?.phone_verified}
            emailVerified={ownerProfile?.email_verified}
            identityVerificationStatus={ownerProfile?.identity_verification_status}
            studioVerified={studio.verified}
            locationVerified={studio.verified_location}
            businessVerified={
              studio.owner_compliance_status === "approved" ||
              studio.owner_compliance_status === "verified"
            }
            ownerTrustSummary={studio.owner_trust_summary}
          />

          {reviewCount > 0 && (
            <div className="card">
              <h2><T en="Reviews" ar="التقييمات" /></h2>
              <div className="gearbeat-rating-mini" style={{ marginBottom: 20 }}>
                <strong style={{ fontSize: '2rem' }}>{formatRating(timeWeightedAverage)} ★</strong>
                <p style={{ color: 'var(--muted)', marginTop: 4 }}>
                  <T en="GearBeat weighted rating" ar="تقييم GearBeat المرجّح" /> · {reviewCount} <T en="verified reviews" ar="تقييم موثق" />
                </p>
              </div>

              <div className="review-card-grid" style={{ display: 'grid', gap: 16 }}>
                {reviewList.slice(0, 3).map((review) => {
                  const reviewScore = getReviewScore(review);
                  return (
                    <article className="review-card" key={review.id} style={{ padding: 16, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <strong>{formatRating(reviewScore)} ★</strong>
                        <small style={{ color: 'var(--muted)' }}>{formatSyncDate(review.created_at)}</small>
                      </div>
                      <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.95rem' }}>{review.comment || (review.rating >= 4 ? "Excellent experience!" : "Good experience.")}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <aside
          className="card"
          style={{
            position: "sticky",
            top: 90,
          }}
        >
          <div style={{ color: "var(--muted)" }}>
            <T en="Starts from" ar="يبدأ من" />
          </div>

          <div style={{ fontSize: "2rem", fontWeight: 800, marginTop: 6 }}>
            {Number(studio.price_from || 0).toFixed(2)} SAR
          </div>

          <p style={{ color: "var(--muted)", marginTop: 6 }}>
            <T en="per hour" ar="بالساعة" />
          </p>

          <div style={{ marginTop: 20, display: "grid", gap: 10 }}>
            {studio.booking_enabled ? (
              <Link
                href={`/studios/${studio.slug || studio.id}/book`}
                className="btn btn-primary btn-large"
              >
                <T en="Book this studio" ar="احجز هذا الاستوديو" />
              </Link>
            ) : (
              <div
                style={{
                  padding: 14,
                  borderRadius: 12,
                  background: "rgba(255,77,77,0.08)",
                  color: "#ffb0b0",
                }}
              >
                <T
                  en="Booking is currently unavailable."
                  ar="الحجز غير متاح حاليًا."
                />
              </div>
            )}

            <GoogleMapsLink
              googleMapsUrl={studio.google_maps_url}
              latitude={studio.latitude}
              longitude={studio.longitude}
              cityName={studio.city}
              district={studio.district}
              addressLine={studio.address_line}
              mode="directions"
              className="btn"
            />
          </div>

          <p style={{ color: "var(--muted)", marginTop: 18, fontSize: "0.9rem", lineHeight: 1.7 }}>
            <T
              en="GearBeat helps verify studios and owners to create a safer creative booking experience."
              ar="تساعد GearBeat في توثيق الاستوديوهات والملاك لتجربة حجز إبداعية أكثر أمانًا."
            />
          </p>
        </aside>
      </section>
    </main>
  );
}
