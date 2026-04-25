import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import T from "../../../components/t";

function formatSyncDate(value: string | null | undefined) {
  if (!value) return null;

  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return null;
  }
}

function average(numbers: number[]) {
  if (!numbers.length) return 0;
  return numbers.reduce((sum, number) => sum + number, 0) / numbers.length;
}

function formatRating(value: number) {
  if (!value) return "—";
  return value.toFixed(1);
}

function stars(value: number) {
  const rounded = Math.round(value);
  return "★★★★★".slice(0, rounded) + "☆☆☆☆☆".slice(0, 5 - rounded);
}

export default async function StudioDetailsPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: studio, error } = await supabase
    .from("studios")
    .select(
      "id,name,slug,city,district,address,description,price_from,status,cover_image_url,verified,google_maps_url,google_reviews_url,google_place_id,google_rating,google_user_ratings_total,google_rating_last_synced_at,tripadvisor_url,tripadvisor_rating,tripadvisor_reviews_total,tripadvisor_rating_last_synced_at"
    )
    .eq("slug", slug)
    .eq("status", "approved")
    .single();

  if (error || !studio) {
    notFound();
  }

  const { data: images } = await supabase
    .from("studio_images")
    .select("id,image_url,is_cover,sort_order")
    .eq("studio_id", studio.id)
    .order("sort_order", { ascending: true });

  const { data: selectedFeatures } = await supabase
    .from("studio_feature_links")
    .select("id,custom_name,studio_features(name_en,name_ar,category)")
    .eq("studio_id", studio.id);

  const { data: equipment } = await supabase
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

  const hasFeatures = Object.values(featureGroups).some(
    (items) => items.length > 0
  );

  const hasExternalTrust =
    studio.google_maps_url ||
    studio.google_reviews_url ||
    studio.tripadvisor_url ||
    studio.google_rating ||
    studio.tripadvisor_rating;

  const reviewList = reviews || [];
  const reviewCount = reviewList.length;

  const overallAverage = average(
    reviewList.map((review) => Number(review.rating || 0)).filter(Boolean)
  );

  const cleanlinessAverage = average(
    reviewList
      .map((review) => Number(review.cleanliness_rating || 0))
      .filter(Boolean)
  );

  const equipmentAverage = average(
    reviewList
      .map((review) => Number(review.equipment_rating || 0))
      .filter(Boolean)
  );

  const soundAverage = average(
    reviewList
      .map((review) => Number(review.sound_quality_rating || 0))
      .filter(Boolean)
  );

  const communicationAverage = average(
    reviewList
      .map((review) => Number(review.communication_rating || 0))
      .filter(Boolean)
  );

  const valueAverage = average(
    reviewList
      .map((review) => Number(review.value_rating || 0))
      .filter(Boolean)
  );

  return (
    <section>
      <div className="studio-detail-hero card">
        <div className="studio-detail-image">
          {studio.cover_image_url ? (
            <img src={studio.cover_image_url} alt={studio.name} />
          ) : (
            <div className="placeholder">
              <T en="No Image" ar="لا توجد صورة" />
            </div>
          )}
        </div>

        <div className="studio-detail-content">
          <span className="badge">
            {studio.verified ? (
              <T en="Verified Studio" ar="استوديو موثق" />
            ) : (
              <T en="Studio" ar="استوديو" />
            )}
          </span>

          <h1>{studio.name}</h1>

          <p className="studio-location">
            {studio.city}
            {studio.district ? ` · ${studio.district}` : ""}
          </p>

          {studio.address ? <p>{studio.address}</p> : null}

          <p>
            {studio.description || (
              <T
                en="No description available yet."
                ar="لا يوجد وصف متاح حاليًا."
              />
            )}
          </p>

          <div className="studio-price-box">
            <span>
              <T en="Starting from" ar="يبدأ من" />
            </span>
            <strong>{studio.price_from ?? 0} SAR / hour</strong>
          </div>

          {reviewCount > 0 ? (
            <div className="gearbeat-rating-mini">
              <strong>{formatRating(overallAverage)} ★</strong>
              <span>
                <T en="Verified GearBeat rating" ar="تقييم GearBeat موثق" /> ·{" "}
                {reviewCount} <T en="reviews" ar="تقييم" />
              </span>
            </div>
          ) : null}

          <div className="actions">
            <Link href={`/studios/${studio.slug}/book`} className="btn">
              <T en="Book Now" ar="احجز الآن" />
            </Link>

            <Link href="/studios" className="btn btn-secondary">
              <T en="Back to Studios" ar="العودة إلى الاستوديوهات" />
            </Link>
          </div>

          <div className="actions">
            {studio.google_maps_url ? (
              <a
                href={studio.google_maps_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-small"
              >
                <T en="Open in Google Maps" ar="فتح في Google Maps" />
              </a>
            ) : null}

            {studio.google_reviews_url ? (
              <a
                href={studio.google_reviews_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-small"
              >
                <T en="Google Reviews" ar="تقييمات Google" />
              </a>
            ) : null}

            {studio.tripadvisor_url ? (
              <a
                href={studio.tripadvisor_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-small"
              >
                TripAdvisor
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div style={{ height: 28 }} />

      <div className="pulse-panel">
        <div className="card">
          <span className="badge">
            <T en="Studio Trust" ar="ثقة الاستوديو" />
          </span>

          <h2>
            <T en="Review sources" ar="مصادر التقييم" />
          </h2>

          <p>
            <T
              en="External review links help customers validate the studio quality. Ratings are not entered manually by the owner."
              ar="روابط التقييمات الخارجية تساعد العملاء على التأكد من جودة الاستوديو. التقييمات لا يتم إدخالها يدويًا من صاحب الاستوديو."
            />
          </p>

          <div className="external-rating-grid">
            <div className="external-rating-card">
              <span className="badge">Google</span>

              <h3>
                {studio.google_rating ? `${studio.google_rating} ★` : "—"}
              </h3>

              <p>
                {studio.google_user_ratings_total ? (
                  <>
                    {studio.google_user_ratings_total}{" "}
                    <T en="reviews" ar="تقييم" />
                  </>
                ) : (
                  <T
                    en="Rating not synced yet."
                    ar="لم يتم جلب التقييم بعد."
                  />
                )}
              </p>

              {studio.google_rating_last_synced_at ? (
                <p>
                  <T en="Last sync:" ar="آخر تحديث:" />{" "}
                  {formatSyncDate(studio.google_rating_last_synced_at)}
                </p>
              ) : null}
            </div>

            <div className="external-rating-card">
              <span className="badge">TripAdvisor</span>

              <h3>
                {studio.tripadvisor_rating
                  ? `${studio.tripadvisor_rating} ★`
                  : "—"}
              </h3>

              <p>
                {studio.tripadvisor_reviews_total ? (
                  <>
                    {studio.tripadvisor_reviews_total}{" "}
                    <T en="reviews" ar="تقييم" />
                  </>
                ) : (
                  <T
                    en="Rating not verified yet."
                    ar="لم يتم التحقق من التقييم بعد."
                  />
                )}
              </p>

              {studio.tripadvisor_rating_last_synced_at ? (
                <p>
                  <T en="Last sync:" ar="آخر تحديث:" />{" "}
                  {formatSyncDate(studio.tripadvisor_rating_last_synced_at)}
                </p>
              ) : null}
            </div>
          </div>

          {!hasExternalTrust ? (
            <p>
              <T
                en="No external review sources have been added yet."
                ar="لم تتم إضافة مصادر تقييم خارجية حتى الآن."
              />
            </p>
          ) : null}
        </div>

        <div className="card wave-card">
          <span className="badge">
            <T en="Sound Profile" ar="الملف الصوتي" />
          </span>

          <h2>
            <T en="Studio pulse" ar="نبض الاستوديو" />
          </h2>

          <p>
            <T
              en="A quick visual signal for the studio experience."
              ar="إشارة بصرية سريعة لتجربة هذا الاستوديو."
            />
          </p>

          <div className="waveform" aria-hidden="true">
            {Array.from({ length: 36 }).map((_, index) => (
              <i key={index} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: 28 }} />

      <div className="card verified-reviews-card">
        <div className="section-head compact-section-head">
          <span className="badge">
            <T en="Verified GearBeat Reviews" ar="تقييمات GearBeat الموثقة" />
          </span>

          <h1>
            <T en="Real reviews from paid bookings" ar="تقييمات حقيقية من حجوزات مدفوعة" />
          </h1>

          <p>
            <T
              en="Only customers with confirmed and paid bookings can submit these reviews."
              ar="فقط العملاء الذين لديهم حجوزات مؤكدة ومدفوعة يمكنهم إرسال هذه التقييمات."
            />
          </p>
        </div>

        {reviewCount > 0 ? (
          <>
            <div className="review-summary-grid">
              <div className="review-score-hero">
                <strong>{formatRating(overallAverage)}</strong>
                <span>{stars(overallAverage)}</span>
                <p>
                  {reviewCount} <T en="verified reviews" ar="تقييم موثق" />
                </p>
              </div>

              <div className="review-breakdown-grid">
                <div>
                  <span>
                    <T en="Cleanliness" ar="النظافة" />
                  </span>
                  <strong>{formatRating(cleanlinessAverage)}</strong>
                </div>

                <div>
                  <span>
                    <T en="Equipment" ar="المعدات" />
                  </span>
                  <strong>{formatRating(equipmentAverage)}</strong>
                </div>

                <div>
                  <span>
                    <T en="Sound quality" ar="جودة الصوت" />
                  </span>
                  <strong>{formatRating(soundAverage)}</strong>
                </div>

                <div>
                  <span>
                    <T en="Communication" ar="التواصل" />
                  </span>
                  <strong>{formatRating(communicationAverage)}</strong>
                </div>

                <div>
                  <span>
                    <T en="Value" ar="القيمة" />
                  </span>
                  <strong>{formatRating(valueAverage)}</strong>
                </div>
              </div>
            </div>

            <div className="review-card-grid">
              {reviewList.slice(0, 6).map((review) => (
                <article className="review-card" key={review.id}>
                  <div className="review-card-head">
                    <span className="badge">
                      <T en="Verified booking" ar="حجز موثق" />
                    </span>
                    <strong>{review.rating} ★</strong>
                  </div>

                  <p className="review-stars">{stars(Number(review.rating || 0))}</p>

                  {review.comment ? (
                    <p>{review.comment}</p>
                  ) : (
                    <p>
                      <T
                        en="The customer did not leave a written comment."
                        ar="لم يترك العميل تعليقًا مكتوبًا."
                      />
                    </p>
                  )}

                  <small>{formatSyncDate(review.created_at)}</small>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-review-box">
            <h2>
              <T en="No GearBeat reviews yet" ar="لا توجد تقييمات GearBeat بعد" />
            </h2>

            <p>
              <T
                en="Verified reviews will appear here after customers complete paid bookings and share their feedback."
                ar="ستظهر التقييمات الموثقة هنا بعد أن يكمل العملاء حجوزات مدفوعة ويشاركون آراءهم."
              />
            </p>
          </div>
        )}
      </div>

      <div style={{ height: 28 }} />

      <div className="section-head">
        <span className="badge">
          <T en="Studio Setup" ar="إعدادات الاستوديو" />
        </span>

        <h1>
          <T en="Features and amenities" ar="المميزات والخدمات" />
        </h1>

        <p>
          <T
            en="Explore the space type, amenities, equipment features, services, and media capabilities selected by the studio owner."
            ar="استعرض نوع المساحة، المميزات، المعدات، الخدمات، وإمكانيات الإنتاج التي أضافها صاحب الاستوديو."
          />
        </p>
      </div>

      {hasFeatures ? (
        <div className="public-feature-grid">
          {[
            {
              key: "space",
              icon: "🎙️",
              en: "Studio Space Type",
              ar: "نوع مساحة الاستوديو"
            },
            {
              key: "amenity",
              icon: "✨",
              en: "Amenities",
              ar: "المميزات"
            },
            {
              key: "equipment",
              icon: "🎛️",
              en: "Equipment Features",
              ar: "مميزات المعدات"
            },
            {
              key: "service",
              icon: "🧑‍💻",
              en: "Services Available",
              ar: "الخدمات المتاحة"
            },
            {
              key: "media",
              icon: "🎥",
              en: "Media & Production",
              ar: "الإنتاج والتصوير"
            },
            {
              key: "custom",
              icon: "➕",
              en: "Custom Features",
              ar: "مميزات مخصصة"
            }
          ].map((group) => {
            const items = featureGroups[group.key] || [];

            if (!items.length) return null;

            return (
              <div className="card public-feature-card" key={group.key}>
                <div className="public-feature-head">
                  <span className="accordion-icon">{group.icon}</span>

                  <div>
                    <h2>
                      <T en={group.en} ar={group.ar} />
                    </h2>
                    <p>
                      {items.length} <T en="items" ar="عنصر" />
                    </p>
                  </div>
                </div>

                <div className="feature-pill-wrap">
                  {items.map((item) => (
                    <span className="feature-pill" key={item.id}>
                      <T
                        en={
                          item.feature?.name_en ||
                          item.custom_name ||
                          "Feature"
                        }
                        ar={
                          item.feature?.name_ar ||
                          item.custom_name ||
                          "ميزة"
                        }
                      />
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <h2>
            <T en="No features added yet" ar="لم تتم إضافة مميزات بعد" />
          </h2>
          <p>
            <T
              en="The studio owner has not added detailed features yet."
              ar="لم يقم صاحب الاستوديو بإضافة تفاصيل المميزات حتى الآن."
            />
          </p>
        </div>
      )}

      <div style={{ height: 28 }} />

      <div className="section-head">
        <span className="badge">
          <T en="Equipment" ar="المعدات" />
        </span>

        <h1>
          <T en="Studio equipment" ar="معدات الاستوديو" />
        </h1>
      </div>

      {equipment?.length ? (
        <div className="equipment-public-grid">
          {equipment.map((item) => (
            <div className="card equipment-public-card" key={item.id}>
              <div className="equipment-icon">🎚️</div>

              <div>
                <h2>{item.name}</h2>

                <p>
                  {[item.brand, item.model, item.category]
                    .filter(Boolean)
                    .join(" · ")}
                </p>

                <p>
                  <T en="Quantity:" ar="الكمية:" /> {item.quantity}
                </p>

                {item.notes ? <p>{item.notes}</p> : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <h2>
            <T en="No equipment listed yet" ar="لا توجد معدات مدرجة بعد" />
          </h2>
          <p>
            <T
              en="Detailed equipment will appear here once the studio owner adds it."
              ar="ستظهر المعدات التفصيلية هنا بعد أن يضيفها صاحب الاستوديو."
            />
          </p>
        </div>
      )}

      <div style={{ height: 34 }} />

      <div className="section-head">
        <span className="badge">
          <T en="Gallery" ar="المعرض" />
        </span>

        <h1>
          <T en="Studio images" ar="صور الاستوديو" />
        </h1>
      </div>

      <div className="grid">
        {images?.length ? (
          images.map((image) => (
            <div className="card studio-card" key={image.id}>
              <div className="studio-cover">
                <img src={image.image_url} alt={studio.name} />
              </div>
            </div>
          ))
        ) : (
          <div className="card">
            <h2>
              <T en="No gallery images yet" ar="لا توجد صور في المعرض بعد" />
            </h2>
            <p>
              <T
                en="Gallery images for this studio will appear here later."
                ar="صور هذا الاستوديو ستظهر هنا لاحقًا."
              />
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
