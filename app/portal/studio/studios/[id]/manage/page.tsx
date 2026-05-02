import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import T from "@/components/t";
import StudioPhotoRequirements from "@/components/studio-photo-requirements";

const featureGroups = [
  {
    key: "space",
    icon: "🎙️",
    titleEn: "Studio Space Type",
    titleAr: "نوع مساحة الاستوديو",
    descEn: "Choose what kind of creative space this studio offers.",
    descAr: "اختر نوع المساحة الإبداعية التي يقدمها هذا الاستوديو."
  },
  {
    key: "amenity",
    icon: "✨",
    titleEn: "Amenities",
    titleAr: "المميزات",
    descEn: "Add comfort and access features available to guests.",
    descAr: "أضف المميزات والخدمات المتاحة للضيوف."
  },
  {
    key: "equipment",
    icon: "🎛️",
    titleEn: "Equipment Features",
    titleAr: "مميزات المعدات",
    descEn: "Select the main equipment available in the studio.",
    descAr: "اختر أهم المعدات المتوفرة داخل الاستوديو."
  },
  {
    key: "service",
    icon: "🧑‍💻",
    titleEn: "Services Available",
    titleAr: "الخدمات المتاحة",
    descEn: "Show if the studio offers engineers, producers, or support.",
    descAr: "وضح إذا كان الاستوديو يوفر مهندسين أو منتجين أو دعم."
  },
  {
    key: "media",
    icon: "🎥",
    titleEn: "Media & Production",
    titleAr: "الإنتاج والتصوير",
    descEn: "Add video, content, podcast, and production capabilities.",
    descAr: "أضف إمكانيات التصوير والبودكاست وصناعة المحتوى."
  },
  {
    key: "custom",
    icon: "➕",
    titleEn: "Custom Features",
    titleAr: "مميزات مخصصة",
    descEn: "Add anything special that does not exist in the list.",
    descAr: "أضف ميزة خاصة غير موجودة في القائمة."
  }
];

async function requireOwnerOnly() {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login");
  }

  const { data: adminUser } = await supabaseAdmin
    .from("admin_users")
    .select("id, auth_user_id, status")
    .eq("auth_user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (adminUser) {
    redirect("/admin");
  }

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("id, auth_user_id, email, full_name, phone, role, account_status")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!profile) {
    redirect("/portal/login");
  }

  if (profile.account_status === "deleted") {
    redirect("/forbidden");
  }

  if (profile.account_status === "pending_deletion") {
    redirect("/account/delete");
  }

  if (profile.role === "customer") {
    redirect("/customer");
  }

  if (profile.role !== "owner" && profile.role !== "studio_owner") {
    redirect("/forbidden");
  }

  return { user, profile };
}

async function verifyStudioOwnership(studioId: string, ownerAuthUserId: string) {
  const supabaseAdmin = createAdminClient();

  const { data: studio, error } = await supabaseAdmin
    .from("studios")
    .select("id, slug, owner_auth_user_id")
    .eq("id", studioId)
    .eq("owner_auth_user_id", ownerAuthUserId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!studio) {
    throw new Error("You do not have permission to manage this studio.");
  }

  return studio;
}

function groupFeaturesByCategory(features: any[] | null | undefined) {
  const grouped: Record<string, any[]> = {
    space: [],
    amenity: [],
    equipment: [],
    service: [],
    media: [],
    custom: []
  };

  for (const item of features || []) {
    const category = item.category || "custom";

    if (!grouped[category]) {
      grouped[category] = [];
    }

    grouped[category].push(item);
  }

  return grouped;
}

function formatSyncDate(value: string | null | undefined) {
  if (!value) return null;

  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return null;
  }
}

export default async function ManageStudioPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user } = await requireOwnerOnly();
  const supabaseAdmin = createAdminClient();

  const { data: studio, error: studioError } = await supabaseAdmin
    .from("studios")
    .select(
      "id,name,slug,city,district,address,price_from,status,verified,booking_enabled,owner_compliance_status,cover_image_url,google_maps_url,google_reviews_url,google_place_id,google_rating,google_user_ratings_total,google_rating_last_synced_at,tripadvisor_url,tripadvisor_rating,tripadvisor_reviews_total,tripadvisor_rating_last_synced_at"
    )
    .eq("id", id)
    .eq("owner_auth_user_id", user.id)
    .maybeSingle();

  if (studioError || !studio) {
    notFound();
  }

  const { data: features } = await supabaseAdmin
    .from("studio_features")
    .select("id,name_en,name_ar,slug,category,sort_order")
    .eq("status", "active")
    .order("sort_order", { ascending: true });

  const { data: selectedFeatures } = await supabaseAdmin
    .from("studio_feature_links")
    .select(
      "id,feature_id,custom_name,studio_features(id,name_en,name_ar,category)"
    )
    .eq("studio_id", studio.id);

  const { data: equipment } = await supabaseAdmin
    .from("studio_equipment")
    .select("id,name,brand,model,category,quantity,notes,created_at")
    .eq("studio_id", studio.id)
    .order("created_at", { ascending: false });

  const { data: studioImages } = await supabaseAdmin
    .from("studio_images")
    .select("id,image_url,is_cover,category")
    .eq("studio_id", studio.id);

  const selectedFeatureIds = new Set(
    selectedFeatures?.map((item) => item.feature_id).filter(Boolean) || []
  );

  const groupedAvailableFeatures = groupFeaturesByCategory(features);

  const groupedSelectedFeatures: Record<string, any[]> = {
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

    if (!groupedSelectedFeatures[category]) {
      groupedSelectedFeatures[category] = [];
    }

    groupedSelectedFeatures[category].push({
      ...item,
      feature
    });
  }

  async function updateExternalReviewLinks(formData: FormData) {
    "use server";

    const { user } = await requireOwnerOnly();
    const supabaseAdmin = createAdminClient();

    const studioId = String(formData.get("studio_id") || "");
    const studioSlug = String(formData.get("studio_slug") || "");

    const googleMapsUrl = String(formData.get("google_maps_url") || "").trim();
    const googleReviewsUrl = String(
      formData.get("google_reviews_url") || ""
    ).trim();
    const googlePlaceId = String(formData.get("google_place_id") || "").trim();
    const tripadvisorUrl = String(
      formData.get("tripadvisor_url") || ""
    ).trim();

    if (!studioId) {
      throw new Error("Missing studio ID.");
    }

    await verifyStudioOwnership(studioId, user.id);

    const { error } = await supabaseAdmin
      .from("studios")
      .update({
        google_maps_url: googleMapsUrl || null,
        google_reviews_url: googleReviewsUrl || null,
        google_place_id: googlePlaceId || null,
        tripadvisor_url: tripadvisorUrl || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", studioId)
      .eq("owner_auth_user_id", user.id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/portal/studio/studios/${studioId}/manage`);

    if (studioSlug) {
      revalidatePath(`/studios/${studioSlug}`);
    }
  }

  async function addFeature(formData: FormData) {
    "use server";

    const { user } = await requireOwnerOnly();
    const supabaseAdmin = createAdminClient();

    const featureId = String(formData.get("feature_id") || "");
    const studioId = String(formData.get("studio_id") || "");

    if (!featureId || !studioId) {
      throw new Error("Missing feature or studio.");
    }

    await verifyStudioOwnership(studioId, user.id);

    const { error } = await supabaseAdmin.from("studio_feature_links").insert({
      studio_id: studioId,
      feature_id: featureId
    });

    if (error && !error.message.includes("duplicate key")) {
      throw new Error(error.message);
    }

    revalidatePath(`/portal/studio/studios/${studioId}/manage`);
  }

  async function addCustomFeature(formData: FormData) {
    "use server";

    const { user } = await requireOwnerOnly();
    const supabaseAdmin = createAdminClient();

    const studioId = String(formData.get("studio_id") || "");
    const customName = String(formData.get("custom_name") || "").trim();

    if (!studioId || !customName) {
      throw new Error("Custom feature name is required.");
    }

    await verifyStudioOwnership(studioId, user.id);

    const { error } = await supabaseAdmin.from("studio_feature_links").insert({
      studio_id: studioId,
      custom_name: customName
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/portal/studio/studios/${studioId}/manage`);
  }

  async function removeFeature(formData: FormData) {
    "use server";

    const { user } = await requireOwnerOnly();
    const supabaseAdmin = createAdminClient();

    const linkId = String(formData.get("link_id") || "");
    const studioId = String(formData.get("studio_id") || "");

    if (!linkId || !studioId) {
      throw new Error("Missing feature link.");
    }

    await verifyStudioOwnership(studioId, user.id);

    const { error } = await supabaseAdmin
      .from("studio_feature_links")
      .delete()
      .eq("id", linkId)
      .eq("studio_id", studioId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/portal/studio/studios/${studioId}/manage`);
  }

  async function addEquipment(formData: FormData) {
    "use server";

    const { user } = await requireOwnerOnly();
    const supabaseAdmin = createAdminClient();

    const studioId = String(formData.get("studio_id") || "");
    const name = String(formData.get("name") || "").trim();
    const brand = String(formData.get("brand") || "").trim();
    const model = String(formData.get("model") || "").trim();
    const category = String(formData.get("category") || "general").trim();
    const quantity = Number(formData.get("quantity") || 1);
    const notes = String(formData.get("notes") || "").trim();

    if (!studioId || !name) {
      throw new Error("Equipment name is required.");
    }

    await verifyStudioOwnership(studioId, user.id);

    const { error } = await supabaseAdmin.from("studio_equipment").insert({
      studio_id: studioId,
      name,
      brand: brand || null,
      model: model || null,
      category: category || "general",
      quantity: quantity > 0 ? quantity : 1,
      notes: notes || null
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/portal/studio/studios/${studioId}/manage`);
  }

  async function deleteEquipment(formData: FormData) {
    "use server";

    const { user } = await requireOwnerOnly();
    const supabaseAdmin = createAdminClient();

    const equipmentId = String(formData.get("equipment_id") || "");
    const studioId = String(formData.get("studio_id") || "");

    if (!equipmentId || !studioId) {
      throw new Error("Missing equipment.");
    }

    await verifyStudioOwnership(studioId, user.id);

    const { error } = await supabaseAdmin
      .from("studio_equipment")
      .delete()
      .eq("id", equipmentId)
      .eq("studio_id", studioId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/portal/studio/studios/${studioId}/manage`);
  }

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Studio Management" ar="إدارة الاستوديو" />
        </span>

        <h1>{studio.name}</h1>

        <p>
          {studio.city}
          {studio.district ? ` · ${studio.district}` : ""}
        </p>
      </div>

      <div className="actions" style={{ marginBottom: 24 }}>
        <Link href="/portal/studio/studios" className="btn btn-secondary">
          <T en="Back to My Studios" ar="العودة إلى استوديوهاتي" />
        </Link>

        <Link href={`/studios/${studio.slug}`} className="btn">
          <T en="View Public Page" ar="عرض الصفحة العامة" />
        </Link>
      </div>

      <div className="card onboarding-intro-card">
        <div>
          <span className="badge">
            <T en="Setup Flow" ar="خطوات الإعداد" />
          </span>

          <h2>
            <T
              en="Make your studio stand out"
              ar="اجعل استوديوك يظهر بشكل أفضل"
            />
          </h2>

          <p>
            <T
              en="Group your studio details into space type, amenities, equipment, services, media capabilities, Google location, and trusted review sources."
              ar="قسّم تفاصيل الاستوديو إلى نوع المساحة، المميزات، المعدات، الخدمات، إمكانيات الإنتاج، موقع Google، ومصادر التقييمات الموثوقة."
            />
          </p>
        </div>

        <div className="onboarding-steps">
          <div>
            <b>1</b>
            <span>
              <T en="Choose features" ar="اختر المميزات" />
            </span>
          </div>

          <div>
            <b>2</b>
            <span>
              <T en="Add equipment" ar="أضف المعدات" />
            </span>
          </div>

          <div>
            <b>3</b>
            <span>
              <T en="Add review sources" ar="أضف مصادر التقييم" />
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, marginBottom: 24 }}>
        <StudioPhotoRequirements images={studioImages || []} />
      </div>

      <div style={{ height: 28 }} />

      <div className="card google-review-card">
        <span className="badge">
          <T en="Trust & External Reviews" ar="الثقة والتقييمات الخارجية" />
        </span>

        <h2>
          <T
            en="Google, TripAdvisor, and trusted sources"
            ar="Google وTripAdvisor ومصادر موثوقة"
          />
        </h2>

        <p>
          <T
            en="Owners can add source links only. Ratings are read-only and should be synced automatically or verified later by the platform."
            ar="صاحب الاستوديو يضيف روابط المصادر فقط. التقييمات للعرض فقط ويتم جلبها تلقائيًا أو التحقق منها لاحقًا من المنصة."
          />
        </p>

        <form
          className="google-location-form"
          action={updateExternalReviewLinks}
        >
          <input type="hidden" name="studio_id" value={studio.id} />
          <input type="hidden" name="studio_slug" value={studio.slug} />

          <label>
            <T en="Google Maps URL" ar="رابط Google Maps" />
          </label>
          <input
            className="input"
            name="google_maps_url"
            type="url"
            defaultValue={studio.google_maps_url || ""}
            placeholder="https://maps.google.com/..."
          />

          <label>
            <T en="Google Reviews URL" ar="رابط تقييمات Google" />
          </label>
          <input
            className="input"
            name="google_reviews_url"
            type="url"
            defaultValue={studio.google_reviews_url || ""}
            placeholder="https://search.google.com/local/writereview?placeid=..."
          />

          <label>
            <T en="Google Place ID" ar="معرّف Google Place ID" />
          </label>
          <input
            className="input"
            name="google_place_id"
            defaultValue={studio.google_place_id || ""}
            placeholder="Optional"
          />

          <label>
            <T en="TripAdvisor URL" ar="رابط TripAdvisor" />
          </label>
          <input
            className="input"
            name="tripadvisor_url"
            type="url"
            defaultValue={studio.tripadvisor_url || ""}
            placeholder="https://www.tripadvisor.com/..."
          />

          <div className="external-rating-grid">
            <div className="external-rating-card">
              <span className="badge">Google</span>

              <h3>
                {studio.google_rating
                  ? `${studio.google_rating} ★`
                  : "Not synced"}
              </h3>

              <p>
                {studio.google_user_ratings_total ? (
                  <>
                    {studio.google_user_ratings_total}{" "}
                    <T en="reviews" ar="تقييم" />
                  </>
                ) : (
                  <T
                    en="Google rating will be synced automatically later."
                    ar="سيتم جلب تقييم Google تلقائيًا لاحقًا."
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
                  : "Not verified"}
              </h3>

              <p>
                {studio.tripadvisor_reviews_total ? (
                  <>
                    {studio.tripadvisor_reviews_total}{" "}
                    <T en="reviews" ar="تقييم" />
                  </>
                ) : (
                  <T
                    en="TripAdvisor rating will be verified later."
                    ar="سيتم التحقق من تقييم TripAdvisor لاحقًا."
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

          <button className="btn" type="submit">
            <T en="Save Review Sources" ar="حفظ مصادر التقييم" />
          </button>
        </form>

        <div className="actions">
          {studio.google_maps_url ? (
            <a
              href={studio.google_maps_url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
            >
              <T en="Open in Google Maps" ar="فتح في Google Maps" />
            </a>
          ) : null}

          {studio.google_reviews_url ? (
            <a
              href={studio.google_reviews_url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
            >
              <T en="Open Google Reviews" ar="فتح تقييمات Google" />
            </a>
          ) : null}

          {studio.tripadvisor_url ? (
            <a
              href={studio.tripadvisor_url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
            >
              <T en="Open TripAdvisor" ar="فتح TripAdvisor" />
            </a>
          ) : null}
        </div>
      </div>

      <div style={{ height: 28 }} />

      <div className="manage-split">
        <div className="card">
          <span className="badge">
            <T en="Selected" ar="المحدد" />
          </span>

          <h2>
            <T en="Current studio setup" ar="إعدادات الاستوديو الحالية" />
          </h2>

          <p>
            <T
              en="These are the features currently visible for this studio."
              ar="هذه هي المميزات الظاهرة حاليًا لهذا الاستوديو."
            />
          </p>

          <div className="selected-feature-groups">
            {featureGroups.map((group) => {
              const selectedGroup = groupedSelectedFeatures[group.key] || [];

              return (
                <details className="gb-accordion" key={group.key} open>
                  <summary>
                    <span className="accordion-icon">{group.icon}</span>
                    <span>
                      <strong>
                        <T en={group.titleEn} ar={group.titleAr} />
                      </strong>
                      <small>
                        {selectedGroup.length} <T en="selected" ar="محدد" />
                      </small>
                    </span>
                  </summary>

                  <div className="feature-pill-wrap">
                    {selectedGroup.length ? (
                      selectedGroup.map((item) => (
                        <div className="feature-pill" key={item.id}>
                          <span>
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

                          <form action={removeFeature}>
                            <input type="hidden" name="link_id" value={item.id} />
                            <input
                              type="hidden"
                              name="studio_id"
                              value={studio.id}
                            />
                            <button className="mini-danger" type="submit">
                              ×
                            </button>
                          </form>
                        </div>
                      ))
                    ) : (
                      <p className="muted-line">
                        <T
                          en="Nothing selected in this group yet."
                          ar="لا يوجد شيء محدد في هذه المجموعة بعد."
                        />
                      </p>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        </div>

        <div className="card">
          <span className="badge">
            <T en="Add Details" ar="إضافة تفاصيل" />
          </span>

          <h2>
            <T en="Choose from grouped options" ar="اختر من الخيارات المقسمة" />
          </h2>

          <p>
            <T
              en="Open each group and add what applies to your studio."
              ar="افتح كل مجموعة وأضف ما ينطبق على استوديوك."
            />
          </p>

          <div className="feature-options">
            {featureGroups
              .filter((group) => group.key !== "custom")
              .map((group) => {
                const availableGroup = groupedAvailableFeatures[group.key] || [];

                return (
                  <details className="gb-accordion" key={group.key}>
                    <summary>
                      <span className="accordion-icon">{group.icon}</span>
                      <span>
                        <strong>
                          <T en={group.titleEn} ar={group.titleAr} />
                        </strong>
                        <small>
                          {availableGroup.length} <T en="available" ar="متاح" />
                        </small>
                      </span>
                    </summary>

                    <p className="accordion-desc">
                      <T en={group.descEn} ar={group.descAr} />
                    </p>

                    <div className="feature-options-wrap">
                      {availableGroup.length ? (
                        availableGroup.map((item) => {
                          const isSelected = selectedFeatureIds.has(item.id);

                          return (
                            <form action={addFeature} key={item.id}>
                              <input
                                type="hidden"
                                name="feature_id"
                                value={item.id}
                              />
                              <input
                                type="hidden"
                                name="studio_id"
                                value={studio.id}
                              />
                              <button
                                className={
                                  isSelected ? "pill-option selected" : "pill-option"
                                }
                                type="submit"
                                disabled={isSelected}
                              >
                                <T en={item.name_en} ar={item.name_ar} />
                                {isSelected ? " ✓" : " +"}
                              </button>
                            </form>
                          );
                        })
                      ) : (
                        <p className="muted-line">
                          <T en="No features in this group." ar="لا توجد مميزات." />
                        </p>
                      )}
                    </div>
                  </details>
                );
              })}

            <details className="gb-accordion">
              <summary>
                <span className="accordion-icon">➕</span>
                <span>
                  <strong>
                    <T en="Add Custom Feature" ar="إضافة ميزة مخصصة" />
                  </strong>
                </span>
              </summary>

              <form className="form custom-feature-form" action={addCustomFeature}>
                <input type="hidden" name="studio_id" value={studio.id} />
                <input
                  className="input"
                  name="custom_name"
                  placeholder="Example: Secret underground tunnel"
                  required
                />
                <button className="btn" type="submit">
                  <T en="Add Custom" ar="إضافة مخصصة" />
                </button>
              </form>
            </details>
          </div>
        </div>
      </div>

      <div style={{ height: 28 }} />

      <div className="card">
        <span className="badge">
          <T en="Gear & Tools" ar="المعدات والأدوات" />
        </span>

        <h2>
          <T en="Studio Equipment List" ar="قائمة معدات الاستوديو" />
        </h2>

        <p>
          <T
            en="Add your hardware, instruments, and software to show guests what they can use."
            ar="أضف أجهزتك، آلاتك، وبرامجك لتوضح للضيوف ما يمكنهم استخدامه."
          />
        </p>

        <div className="equipment-list" style={{ marginTop: 24 }}>
          {equipment?.length ? (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Qty</th>
                    <th>Notes</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {equipment.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.name}</strong>
                        {item.brand || item.model ? (
                          <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                            {item.brand} {item.model}
                          </div>
                        ) : null}
                      </td>
                      <td>
                        <span className="badge">{item.category}</span>
                      </td>
                      <td>{item.quantity}</td>
                      <td>{item.notes}</td>
                      <td>
                        <form action={deleteEquipment}>
                          <input type="hidden" name="equipment_id" value={item.id} />
                          <input type="hidden" name="studio_id" value={studio.id} />
                          <button className="mini-danger" type="submit">
                            Delete
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted-line">
              <T en="No equipment added yet." ar="لم يتم إضافة معدات بعد." />
            </p>
          )}
        </div>

        <form className="form equipment-form" action={addEquipment}>
          <h3>
            <T en="Add new item" ar="إضافة قطعة جديدة" />
          </h3>

          <input type="hidden" name="studio_id" value={studio.id} />

          <div className="form-row">
            <div>
              <label>
                <T en="Item Name" ar="اسم القطعة" /> *
              </label>
              <input className="input" name="name" placeholder="Microphone" required />
            </div>

            <div>
              <label>
                <T en="Brand" ar="الماركة" />
              </label>
              <input className="input" name="brand" placeholder="Neumann" />
            </div>

            <div>
              <label>
                <T en="Model" ar="الموديل" />
              </label>
              <input className="input" name="model" placeholder="U87 Ai" />
            </div>
          </div>

          <div className="form-row">
            <div>
              <label>
                <T en="Category" ar="الفئة" />
              </label>
              <select className="input" name="category">
                <option value="general">General</option>
                <option value="microphone">Microphone</option>
                <option value="instrument">Instrument</option>
                <option value="outboard">Outboard / Rack</option>
                <option value="computer">Computer / Software</option>
                <option value="monitoring">Monitoring</option>
                <option value="backline">Backline</option>
              </select>
            </div>

            <div>
              <label>
                <T en="Quantity" ar="الكمية" />
              </label>
              <input className="input" name="quantity" type="number" defaultValue="1" min="1" />
            </div>
          </div>

          <label>
            <T en="Notes" ar="ملاحظات" />
          </label>
          <input className="input" name="notes" placeholder="Condition, special cables, etc." />

          <button className="btn" type="submit">
            <T en="Add Equipment" ar="إضافة المعدات" />
          </button>
        </form>
      </div>
    </section>
  );
}
