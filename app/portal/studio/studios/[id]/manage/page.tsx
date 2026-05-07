import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import T from "@/components/t";
import StudioPhotoRequirements from "@/components/studio-photo-requirements";
import StudioManagementLayout from "@/components/studio-management-layout";

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

async function updateStudioBasicInfo(formData: FormData) {
  "use server";
  const { user } = await requireOwnerOnly();
  const supabaseAdmin = createAdminClient();
  const studioId = String(formData.get("studio_id") || "");
  
  await verifyStudioOwnership(studioId, user.id);

  const name = String(formData.get("name") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const district = String(formData.get("district") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const description = String(formData.get("description") || "").trim();

  const { error } = await supabaseAdmin
    .from("studios")
    .update({
      name,
      city,
      district: district || null,
      address: address || null,
      description,
      updated_at: new Date().toISOString()
    })
    .eq("id", studioId);

  if (error) throw new Error(error.message);
  revalidatePath(`/portal/studio/studios/${studioId}/manage`);
}

async function updateStudioPricing(formData: FormData) {
  "use server";
  const { user } = await requireOwnerOnly();
  const supabaseAdmin = createAdminClient();
  const studioId = String(formData.get("studio_id") || "");
  const priceFrom = Number(formData.get("price_from") || 0);

  await verifyStudioOwnership(studioId, user.id);

  const { error } = await supabaseAdmin
    .from("studios")
    .update({
      price_from: priceFrom,
      hourly_rate: priceFrom,
      updated_at: new Date().toISOString()
    })
    .eq("id", studioId);

  if (error) throw new Error(error.message);
  revalidatePath(`/portal/studio/studios/${studioId}/manage`);
}

async function addEquipment(formData: FormData) {
  "use server";
  const { user } = await requireOwnerOnly();
  const supabaseAdmin = createAdminClient();
  const studioId = String(formData.get("studio_id") || "");
  await verifyStudioOwnership(studioId, user.id);

  const name = String(formData.get("name") || "").trim();
  const brand = String(formData.get("brand") || "").trim();
  const model = String(formData.get("model") || "").trim();
  const category = String(formData.get("category") || "microphone");

  const { error } = await supabaseAdmin
    .from("studio_equipment")
    .insert({
      studio_id: studioId,
      name,
      brand: brand || null,
      model: model || null,
      category,
      quantity: 1
    });

  if (error) throw new Error(error.message);
  revalidatePath(`/portal/studio/studios/${studioId}/manage`);
}

async function deleteEquipment(formData: FormData) {
  "use server";
  const { user } = await requireOwnerOnly();
  const supabaseAdmin = createAdminClient();
  const equipmentId = String(formData.get("equipment_id") || "");
  const studioId = String(formData.get("studio_id") || "");
  await verifyStudioOwnership(studioId, user.id);

  const { error } = await supabaseAdmin
    .from("studio_equipment")
    .delete()
    .eq("id", equipmentId)
    .eq("studio_id", studioId);

  if (error) throw new Error(error.message);
  revalidatePath(`/portal/studio/studios/${studioId}/manage`);
}

async function addFeature(formData: FormData) {
  "use server";
  const { user } = await requireOwnerOnly();
  const supabaseAdmin = createAdminClient();
  const featureId = String(formData.get("feature_id") || "");
  const studioId = String(formData.get("studio_id") || "");
  await verifyStudioOwnership(studioId, user.id);

  const { error } = await supabaseAdmin
    .from("studio_feature_links")
    .insert({
      studio_id: studioId,
      feature_id: featureId
    });

  if (error) throw new Error(error.message);
  revalidatePath(`/portal/studio/studios/${studioId}/manage`);
}

async function removeFeature(formData: FormData) {
  "use server";
  const { user } = await requireOwnerOnly();
  const supabaseAdmin = createAdminClient();
  const linkId = String(formData.get("link_id") || "");
  const studioId = String(formData.get("studio_id") || "");
  await verifyStudioOwnership(studioId, user.id);

  const { error } = await supabaseAdmin
    .from("studio_feature_links")
    .delete()
    .eq("id", linkId)
    .eq("studio_id", studioId);

  if (error) throw new Error(error.message);
  revalidatePath(`/portal/studio/studios/${studioId}/manage`);
}

async function setCoverImage(formData: FormData) {
  "use server";
  const { user } = await requireOwnerOnly();
  const supabaseAdmin = createAdminClient();
  const imageId = String(formData.get("image_id") || "");
  const studioId = String(formData.get("studio_id") || "");
  await verifyStudioOwnership(studioId, user.id);

  // 1. Reset all covers
  await supabaseAdmin
    .from("studio_images")
    .update({ is_cover: false })
    .eq("studio_id", studioId);

  // 2. Set this one as cover
  const { error } = await supabaseAdmin
    .from("studio_images")
    .update({ is_cover: true })
    .eq("id", imageId)
    .eq("studio_id", studioId);

  if (error) throw new Error(error.message);
  revalidatePath(`/portal/studio/studios/${studioId}/manage`);
}

async function deleteStudioImage(formData: FormData) {
  "use server";
  const { user } = await requireOwnerOnly();
  const supabaseAdmin = createAdminClient();
  const imageId = String(formData.get("image_id") || "");
  const studioId = String(formData.get("studio_id") || "");
  const imageUrl = String(formData.get("image_url") || "");
  await verifyStudioOwnership(studioId, user.id);

  // 1. Delete from DB
  const { error } = await supabaseAdmin
    .from("studio_images")
    .delete()
    .eq("id", imageId)
    .eq("studio_id", studioId);

  if (error) throw new Error(error.message);
  revalidatePath(`/portal/studio/studios/${studioId}/manage`);
}

async function uploadStudioImages(formData: FormData) {
  "use server";
  const { user } = await requireOwnerOnly();
  const supabaseAdmin = createAdminClient();
  const studioId = String(formData.get("studio_id") || "");
  await verifyStudioOwnership(studioId, user.id);

  // Note: Actual upload logic would involve Supabase Storage. 
  // This is a placeholder that triggers revalidation.
  revalidatePath(`/portal/studio/studios/${studioId}/manage`);
}

async function updateExternalReviewLinks(formData: FormData) {
  "use server";
  const { user } = await requireOwnerOnly();
  const supabaseAdmin = createAdminClient();
  const studioId = String(formData.get("studio_id") || "");
  await verifyStudioOwnership(studioId, user.id);

  const google_maps_url = String(formData.get("google_maps_url") || "").trim();
  const tripadvisor_url = String(formData.get("tripadvisor_url") || "").trim();
  const google_place_id = String(formData.get("google_place_id") || "").trim();

  const { error } = await supabaseAdmin
    .from("studios")
    .update({
      google_maps_url: google_maps_url || null,
      tripadvisor_url: tripadvisor_url || null,
      google_place_id: google_place_id || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", studioId);

  if (error) throw new Error(error.message);
  revalidatePath(`/portal/studio/studios/${studioId}/manage`);
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
      "id,name,slug,city,district,address,description,price_from,status,verified,booking_enabled,owner_compliance_status,cover_image_url,google_maps_url,google_reviews_url,google_place_id,google_rating,google_user_ratings_total,google_rating_last_synced_at,tripadvisor_url,tripadvisor_rating,tripadvisor_reviews_total,tripadvisor_rating_last_synced_at"
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
    .select("id,image_url,is_cover,sort_order,category")
    .eq("studio_id", studio.id)
    .order("sort_order", { ascending: true });

  const { data: availabilityRules } = await supabaseAdmin
    .from("studio_availability_rules")
    .select("*")
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

  // Completion Calculation
  let score = 0;
  if (studio.name && studio.city && studio.description) score += 20;
  if (availabilityRules && availabilityRules.length > 0) score += 20;
  if (studio.price_from > 0) score += 10;
  if (equipment && equipment.length > 0) score += 10;
  if (selectedFeatures && selectedFeatures.length > 0) score += 10;
  const imageScore = Math.min(20, ((studioImages?.length || 0) / 6) * 20);
  score += Math.round(imageScore);
  if (studio.google_maps_url || studio.tripadvisor_url) score += 10;

  const sections = [
    { id: "basic", titleEn: "Basic Info", titleAr: "المعلومات الأساسية", icon: "📝" },
    { id: "availability", titleEn: "Availability", titleAr: "التوافر", icon: "📅" },
    { id: "pricing", titleEn: "Pricing", titleAr: "الأسعار", icon: "💰" },
    { id: "equipment", titleEn: "Equipment", titleAr: "المعدات", icon: "🎛️" },
    { id: "services", titleEn: "Services", titleAr: "الخدمات", icon: "🧑‍💻" },
    { id: "gallery", titleEn: "Photo Gallery", titleAr: "معرض الصور", icon: "🎥" },
    { id: "reviews", titleEn: "External Reviews", titleAr: "التقييمات الخارجية", icon: "⭐" },
  ];

  return (
    <StudioManagementLayout 
      sections={sections} 
      completionPercentage={score}
      studioName={studio.name}
    >
      {/* 1. Basic Info */}
      <div id="basic" className="gb-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <span style={{ fontSize: '1.5rem' }}>📝</span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}><T en="Basic Information" ar="المعلومات الأساسية" /></h2>
        </div>
        <form action={updateStudioBasicInfo} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <input type="hidden" name="studio_id" value={studio.id} />
          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label className="gb-detail-label"><T en="Studio Name" ar="اسم الاستوديو" /></label>
              <input name="name" className="gb-input" defaultValue={studio.name} required placeholder="e.g. Riyadh Sound Lab" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label className="gb-detail-label"><T en="City" ar="المدينة" /></label>
                <input name="city" className="gb-input" defaultValue={studio.city} required />
              </div>
              <div>
                <label className="gb-detail-label"><T en="District" ar="الحي" /></label>
                <input name="district" className="gb-input" defaultValue={studio.district || ""} placeholder="Al Olaya" />
              </div>
            </div>
            <div>
              <label className="gb-detail-label"><T en="Full Address" ar="العنوان الكامل" /></label>
              <input name="address" className="gb-input" defaultValue={studio.address || ""} placeholder="Building 45, King Fahd Road" />
            </div>
            <div>
              <label className="gb-detail-label"><T en="Description" ar="الوصف" /></label>
              <textarea name="description" className="gb-input" rows={4} defaultValue={studio.description || ""} placeholder="Describe your studio..." style={{ resize: 'vertical' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="gb-button gb-button-primary"><T en="Save Basic Info" ar="حفظ المعلومات الأساسية" /></button>
          </div>
        </form>
      </div>

      {/* 2. Availability */}
      <div id="availability" className="gb-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <span style={{ fontSize: '1.5rem' }}>📅</span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}><T en="Availability & Hours" ar="التوافر وساعات العمل" /></h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p className="gb-muted-text">
            <T 
              en="Manage your weekly working hours and booking slots." 
              ar="أدر ساعات عملك الأسبوعية وفترات الحجز المتاحة." 
            />
          </p>
          <div>
            {availabilityRules && availabilityRules.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', margin: '24px 0' }}>
                {availabilityRules.sort((a:any,b:any)=>a.day_of_week - b.day_of_week).map((rule: any) => (
                  <div key={rule.id} className="gb-card" style={{ padding: '12px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.02)' }}>
                    <span className="gb-detail-label" style={{ marginBottom: '4px' }}>
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][rule.day_of_week]}
                    </span>
                    <span style={{ 
                      fontSize: '0.85rem', 
                      fontWeight: 700, 
                      display: 'block',
                      color: rule.is_open ? 'var(--gb-text)' : '#ef4444'
                    }}>
                      {rule.is_open ? `${rule.open_time} - ${rule.close_time}` : "Closed"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="gb-empty-state" style={{ padding: '40px' }}>
                <T en="No working hours set yet." ar="لم يتم تحديد ساعات العمل بعد." />
              </div>
            )}
          </div>
          <Link href={`/portal/studio/availability?studioId=${studio.id}`} className="gb-text-link">
            <T en="Open Full Availability Manager" ar="فتح مدير التوافر الكامل" />
          </Link>
        </div>
      </div>

      {/* 3. Pricing */}
      <div id="pricing" className="gb-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <span style={{ fontSize: '1.5rem' }}>💰</span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}><T en="Pricing & Rates" ar="الأسعار والتعرفة" /></h2>
        </div>
        <form action={updateStudioPricing} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <input type="hidden" name="studio_id" value={studio.id} />
          <div>
            <label className="gb-detail-label"><T en="Hourly Rate (SAR)" ar="سعر الساعة (ريال)" /></label>
            <div style={{ position: 'relative' }}>
              <input name="price_from" type="number" className="gb-input" defaultValue={studio.price_from} required />
              <span style={{ 
                position: 'absolute', 
                left: '16px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                fontSize: '0.8rem', 
                fontWeight: 800, 
                color: 'var(--gb-gold)' 
              }}>SAR</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="gb-button gb-button-primary"><T en="Save Pricing" ar="حفظ الأسعار" /></button>
          </div>
        </form>
      </div>

      {/* 4. Equipment */}
      <div id="equipment" className="gb-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <span style={{ fontSize: '1.5rem' }}>🎛️</span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}><T en="Studio Equipment" ar="معدات الاستوديو" /></h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="gb-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'right', padding: '12px', color: 'var(--gb-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}><T en="Item" ar="القطعة" /></th>
                  <th style={{ textAlign: 'right', padding: '12px', color: 'var(--gb-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}><T en="Category" ar="الفئة" /></th>
                  <th style={{ textAlign: 'right', padding: '12px', color: 'var(--gb-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}><T en="Qty" ar="الكمية" /></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {equipment?.map((item) => (
                  <tr key={item.id} style={{ borderTop: '1px solid var(--gb-border)' }}>
                    <td style={{ padding: '16px 12px' }}>
                      <div style={{ fontWeight: 700 }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gb-text-muted)' }}>{item.brand} {item.model}</div>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <span className="gb-status-pill" style={{ fontSize: '0.7rem' }}>{item.category}</span>
                    </td>
                    <td style={{ padding: '16px 12px' }}>{item.quantity}</td>
                    <td style={{ padding: '16px 12px', textAlign: 'left' }}>
                      <form action={deleteEquipment}>
                        <input type="hidden" name="equipment_id" value={item.id} />
                        <input type="hidden" name="studio_id" value={studio.id} />
                        <button type="submit" style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form action={addEquipment} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
            <input type="hidden" name="studio_id" value={studio.id} />
            <div>
              <label className="gb-detail-label"><T en="Name" ar="الاسم" /></label>
              <input name="name" className="gb-input" placeholder="Item Name" required />
            </div>
            <div>
              <label className="gb-detail-label"><T en="Brand" ar="الماركة" /></label>
              <input name="brand" className="gb-input" placeholder="Brand" />
            </div>
            <div>
              <label className="gb-detail-label"><T en="Category" ar="الفئة" /></label>
              <select name="category" className="gb-input" style={{ height: '45px' }}>
                <option value="microphone">Microphone</option>
                <option value="instrument">Instrument</option>
                <option value="outboard">Outboard</option>
                <option value="monitoring">Monitoring</option>
              </select>
            </div>
            <button type="submit" className="gb-button gb-button-primary" style={{ height: '45px', width: '45px', padding: 0, justifyContent: 'center', fontSize: '1.5rem' }}>+</button>
          </form>
        </div>
      </div>

      {/* 5. Services */}
      <div id="services" className="gb-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <span style={{ fontSize: '1.5rem' }}>🧑‍💻</span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}><T en="Services & Amenities" ar="الخدمات والمميزات" /></h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {featureGroups.map((group) => {
            const availableGroup = groupedAvailableFeatures[group.key] || [];
            return (
              <div key={group.key}>
                <h3 className="gb-eyebrow" style={{ marginBottom: '16px', fontSize: '0.85rem' }}>
                  <span style={{ marginLeft: '8px' }}>{group.icon}</span> 
                  <T en={group.titleEn} ar={group.titleAr} />
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {availableGroup.map((item) => {
                    const isSelected = selectedFeatureIds.has(item.id);
                    return (
                      <form action={isSelected ? removeFeature : addFeature} key={item.id}>
                        {isSelected && <input type="hidden" name="link_id" value={selectedFeatures?.find(f => f.feature_id === item.id)?.id} />}
                        {!isSelected && <input type="hidden" name="feature_id" value={item.id} />}
                        <input type="hidden" name="studio_id" value={studio.id} />
                        <button 
                          type="submit" 
                          className="gb-button"
                          style={{ 
                            padding: '6px 16px',
                            borderRadius: '99px',
                            fontSize: '0.8rem',
                            background: isSelected ? 'rgba(15, 160, 138, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                            color: isSelected ? 'var(--gb-teal)' : 'var(--gb-text-muted)',
                            border: `1px solid ${isSelected ? 'var(--gb-teal)' : 'var(--gb-border)'}`
                          }}
                        >
                          <T en={item.name_en} ar={item.name_ar} />
                        </button>
                      </form>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Photo Gallery */}
      <div id="gallery" className="gb-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <span style={{ fontSize: '1.5rem' }}>🎥</span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}><T en="Photo Gallery" ar="معرض الصور" /></h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
            {studioImages?.map((img) => (
              <div key={img.id} style={{ 
                aspectRatio: '1/1', 
                borderRadius: '16px', 
                overflow: 'hidden', 
                position: 'relative', 
                border: `2px solid ${img.is_cover ? 'var(--gb-gold)' : 'transparent'}` 
              }} className="gallery-item-parent">
                <img src={img.image_url} alt="Studio" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  background: 'rgba(0,0,0,0.6)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  opacity: 0, 
                  transition: 'opacity 0.2s' 
                }} className="item-overlay">
                  {!img.is_cover && (
                    <form action={setCoverImage}>
                      <input type="hidden" name="image_id" value={img.id} />
                      <input type="hidden" name="studio_id" value={studio.id} />
                      <button type="submit" className="gb-button-primary gb-button-small" style={{ padding: '4px 8px' }}><T en="Cover" ar="غلاف" /></button>
                    </form>
                  )}
                  <form action={deleteStudioImage}>
                    <input type="hidden" name="image_id" value={img.id} />
                    <input type="hidden" name="studio_id" value={studio.id} />
                    <input type="hidden" name="image_url" value={img.image_url} />
                    <button type="submit" style={{ background: '#ef4444', border: 'none', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer' }}>×</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
          <form action={uploadStudioImages} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <input type="hidden" name="studio_id" value={studio.id} />
            <div style={{ 
              border: '2px dashed var(--gb-border)', 
              borderRadius: '16px', 
              padding: '40px', 
              textAlign: 'center', 
              cursor: 'pointer' 
            }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--gb-gold)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--gb-border)'}>
              <input type="file" name="images" multiple accept="image/*" id="file-upload" style={{ display: 'none' }} />
              <label htmlFor="file-upload" style={{ cursor: 'pointer', margin: 0, color: 'var(--gb-text-muted)', fontWeight: 800 }}>
                <T en="Click to upload images (Max 10)" ar="اضغط لرفع الصور (بحد أقصى 10)" />
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="gb-button gb-button-primary"><T en="Upload Photos" ar="رفع الصور" /></button>
            </div>
          </form>
        </div>
      </div>

      {/* 7. External Reviews */}
      <div id="reviews" className="gb-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <span style={{ fontSize: '1.5rem' }}>⭐</span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}><T en="External Reviews" ar="التقييمات الخارجية" /></h2>
        </div>
        <form action={updateExternalReviewLinks} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <input type="hidden" name="studio_id" value={studio.id} />
          <input type="hidden" name="studio_slug" value={studio.slug} />
          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label className="gb-detail-label"><T en="Google Maps URL" ar="رابط خرائط جوجل" /></label>
              <input name="google_maps_url" className="gb-input" defaultValue={studio.google_maps_url || ""} />
            </div>
            <div>
              <label className="gb-detail-label"><T en="TripAdvisor URL" ar="رابط تريب أدفايزر" /></label>
              <input name="tripadvisor_url" className="gb-input" defaultValue={studio.tripadvisor_url || ""} />
            </div>
            <div>
              <label className="gb-detail-label"><T en="Google Place ID" ar="معرف المكان من جوجل" /></label>
              <input name="google_place_id" className="gb-input" defaultValue={studio.google_place_id || ""} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="gb-button gb-button-primary"><T en="Save Links" ar="حفظ الروابط" /></button>
          </div>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .gallery-item-parent:hover .item-overlay { opacity: 1 !important; }
        @media (max-width: 640px) {
          form[action*="addEquipment"] { grid-template-columns: 1fr !important; }
        }
      `}} />
    </StudioManagementLayout>
  );
}
