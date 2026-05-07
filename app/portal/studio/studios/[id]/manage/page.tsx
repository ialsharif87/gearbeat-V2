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
      <div id="basic" className="manage-section-card">
        <div className="section-header">
          <span className="icon">📝</span>
          <h2><T en="Basic Information" ar="المعلومات الأساسية" /></h2>
        </div>
        <form action={updateStudioBasicInfo} className="manage-form">
          <input type="hidden" name="studio_id" value={studio.id} />
          <div className="form-grid">
            <div className="input-group">
              <label><T en="Studio Name" ar="اسم الاستوديو" /></label>
              <input name="name" className="gb-input" defaultValue={studio.name} required placeholder="e.g. Riyadh Sound Lab" />
            </div>
            <div className="form-row-2">
              <div className="input-group">
                <label><T en="City" ar="المدينة" /></label>
                <input name="city" className="gb-input" defaultValue={studio.city} required />
              </div>
              <div className="input-group">
                <label><T en="District" ar="الحي" /></label>
                <input name="district" className="gb-input" defaultValue={studio.district || ""} placeholder="Al Olaya" />
              </div>
            </div>
            <div className="input-group">
              <label><T en="Full Address" ar="العنوان الكامل" /></label>
              <input name="address" className="gb-input" defaultValue={studio.address || ""} placeholder="Building 45, King Fahd Road" />
            </div>
            <div className="input-group">
              <label><T en="Description" ar="الوصف" /></label>
              <textarea name="description" className="gb-input" rows={4} defaultValue={studio.description || ""} placeholder="Describe your studio..." />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="save-btn"><T en="Save Basic Info" ar="حفظ المعلومات الأساسية" /></button>
          </div>
        </form>
      </div>

      {/* 2. Availability */}
      <div id="availability" className="manage-section-card">
        <div className="section-header">
          <span className="icon">📅</span>
          <h2><T en="Availability & Hours" ar="التوافر وساعات العمل" /></h2>
        </div>
        <div className="availability-preview">
          <p className="muted-text">
            <T 
              en="Manage your weekly working hours and booking slots." 
              ar="أدر ساعات عملك الأسبوعية وفترات الحجز المتاحة." 
            />
          </p>
          <div className="rules-summary">
            {availabilityRules && availabilityRules.length > 0 ? (
              <div className="rules-grid">
                {availabilityRules.sort((a:any,b:any)=>a.day_of_week - b.day_of_week).map((rule: any) => (
                  <div key={rule.id} className="rule-item">
                    <span className="day">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][rule.day_of_week]}
                    </span>
                    <span className={`status ${rule.is_open ? 'open' : 'closed'}`}>
                      {rule.is_open ? `${rule.open_time} - ${rule.close_time}` : "Closed"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <T en="No working hours set yet." ar="لم يتم تحديد ساعات العمل بعد." />
              </div>
            )}
          </div>
          <Link href={`/portal/studio/availability?studioId=${studio.id}`} className="link-btn">
            <T en="Open Full Availability Manager" ar="فتح مدير التوافر الكامل" />
          </Link>
        </div>
      </div>

      {/* 3. Pricing */}
      <div id="pricing" className="manage-section-card">
        <div className="section-header">
          <span className="icon">💰</span>
          <h2><T en="Pricing & Rates" ar="الأسعار والتعرفة" /></h2>
        </div>
        <form action={updateStudioPricing} className="manage-form">
          <input type="hidden" name="studio_id" value={studio.id} />
          <div className="input-group">
            <label><T en="Hourly Rate (SAR)" ar="سعر الساعة (ريال)" /></label>
            <div className="price-input-wrap">
              <input name="price_from" type="number" className="gb-input" defaultValue={studio.price_from} required />
              <span className="suffix">SAR</span>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="save-btn"><T en="Save Pricing" ar="حفظ الأسعار" /></button>
          </div>
        </form>
      </div>

      {/* 4. Equipment */}
      <div id="equipment" className="manage-section-card">
        <div className="section-header">
          <span className="icon">🎛️</span>
          <h2><T en="Studio Equipment" ar="معدات الاستوديو" /></h2>
        </div>
        <div className="equipment-manager">
          <table className="gb-table">
            <thead>
              <tr>
                <th><T en="Item" ar="القطعة" /></th>
                <th><T en="Category" ar="الفئة" /></th>
                <th><T en="Qty" ar="الكمية" /></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {equipment?.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                    <div className="sub">{item.brand} {item.model}</div>
                  </td>
                  <td><span className="badge">{item.category}</span></td>
                  <td>{item.quantity}</td>
                  <td>
                    <form action={deleteEquipment}>
                      <input type="hidden" name="equipment_id" value={item.id} />
                      <input type="hidden" name="studio_id" value={studio.id} />
                      <button type="submit" className="delete-btn">×</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <form action={addEquipment} className="add-equipment-form">
            <input type="hidden" name="studio_id" value={studio.id} />
            <div className="form-row-3">
              <input name="name" className="gb-input" placeholder="Item Name" required />
              <input name="brand" className="gb-input" placeholder="Brand" />
              <select name="category" className="gb-input">
                <option value="microphone">Microphone</option>
                <option value="instrument">Instrument</option>
                <option value="outboard">Outboard</option>
                <option value="monitoring">Monitoring</option>
              </select>
              <button type="submit" className="add-btn">+</button>
            </div>
          </form>
        </div>
      </div>

      {/* 5. Services */}
      <div id="services" className="manage-section-card">
        <div className="section-header">
          <span className="icon">🧑‍💻</span>
          <h2><T en="Services & Amenities" ar="الخدمات والمميزات" /></h2>
        </div>
        <div className="features-grid">
          {featureGroups.map((group) => {
            const availableGroup = groupedAvailableFeatures[group.key] || [];
            return (
              <div key={group.key} className="feature-group">
                <h3><span className="group-icon">{group.icon}</span> <T en={group.titleEn} ar={group.titleAr} /></h3>
                <div className="feature-options">
                  {availableGroup.map((item) => {
                    const isSelected = selectedFeatureIds.has(item.id);
                    return (
                      <form action={isSelected ? removeFeature : addFeature} key={item.id}>
                        {isSelected && <input type="hidden" name="link_id" value={selectedFeatures?.find(f => f.feature_id === item.id)?.id} />}
                        {!isSelected && <input type="hidden" name="feature_id" value={item.id} />}
                        <input type="hidden" name="studio_id" value={studio.id} />
                        <button 
                          type="submit" 
                          className={`feature-pill ${isSelected ? 'selected' : ''}`}
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
      <div id="gallery" className="manage-section-card">
        <div className="section-header">
          <span className="icon">🎥</span>
          <h2><T en="Photo Gallery" ar="معرض الصور" /></h2>
        </div>
        <div className="gallery-manager">
          <div className="gallery-grid">
            {studioImages?.map((img) => (
              <div key={img.id} className={`gallery-item ${img.is_cover ? 'cover' : ''}`}>
                <img src={img.image_url} alt="Studio" />
                <div className="item-actions">
                  {!img.is_cover && (
                    <form action={setCoverImage}>
                      <input type="hidden" name="image_id" value={img.id} />
                      <input type="hidden" name="studio_id" value={studio.id} />
                      <button type="submit" className="action-btn gold"><T en="Cover" ar="غلاف" /></button>
                    </form>
                  )}
                  <form action={deleteStudioImage}>
                    <input type="hidden" name="image_id" value={img.id} />
                    <input type="hidden" name="studio_id" value={studio.id} />
                    <input type="hidden" name="image_url" value={img.image_url} />
                    <button type="submit" className="action-btn red">×</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
          <form action={uploadStudioImages} className="upload-form">
            <input type="hidden" name="studio_id" value={studio.id} />
            <div className="upload-box">
              <input type="file" name="images" multiple accept="image/*" id="file-upload" />
              <label htmlFor="file-upload">
                <T en="Click to upload images (Max 10)" ar="اضغط لرفع الصور (بحد أقصى 10)" />
              </label>
            </div>
            <button type="submit" className="save-btn"><T en="Upload Photos" ar="رفع الصور" /></button>
          </form>
        </div>
      </div>

      {/* 7. External Reviews */}
      <div id="reviews" className="manage-section-card">
        <div className="section-header">
          <span className="icon">⭐</span>
          <h2><T en="External Reviews" ar="التقييمات الخارجية" /></h2>
        </div>
        <form action={updateExternalReviewLinks} className="manage-form">
          <input type="hidden" name="studio_id" value={studio.id} />
          <input type="hidden" name="studio_slug" value={studio.slug} />
          <div className="form-grid">
            <div className="input-group">
              <label><T en="Google Maps URL" ar="رابط خرائط جوجل" /></label>
              <input name="google_maps_url" className="gb-input" defaultValue={studio.google_maps_url || ""} />
            </div>
            <div className="input-group">
              <label><T en="TripAdvisor URL" ar="رابط تريب أدفايزر" /></label>
              <input name="tripadvisor_url" className="gb-input" defaultValue={studio.tripadvisor_url || ""} />
            </div>
            <div className="input-group">
              <label><T en="Google Place ID" ar="معرف المكان من جوجل" /></label>
              <input name="google_place_id" className="gb-input" defaultValue={studio.google_place_id || ""} />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="save-btn"><T en="Save Links" ar="حفظ الروابط" /></button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        .manage-section-card {
          background: var(--gb-card-bg);
          border: 1px solid var(--gb-border);
          border-radius: 24px;
          padding: 32px;
          transition: transform 0.3s;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }

        .section-header .icon { font-size: 1.5rem; }
        .section-header h2 { font-size: 1.25rem; font-weight: 800; margin: 0; }

        .manage-form .form-grid { display: grid; gap: 20px; }
        .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        
        .input-group label {
          display: block;
          font-size: 0.8rem;
          font-weight: 700;
          color: #666;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .gb-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--gb-border);
          border-radius: 12px;
          padding: 12px 16px;
          color: white;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s;
        }

        .gb-input:focus { border-color: var(--gb-gold); }

        .form-actions { margin-top: 32px; display: flex; justify-content: flex-end; }

        .save-btn {
          background: var(--gb-gold);
          color: var(--gb-navy);
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
        }

        .save-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(212, 175, 55, 0.3); }

        .availability-preview .rules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
          margin: 24px 0;
        }

        .rule-item {
          background: rgba(255, 255, 255, 0.02);
          padding: 12px;
          border-radius: 12px;
          text-align: center;
        }

        .rule-item .day { display: block; font-size: 0.75rem; font-weight: 800; color: #555; }
        .rule-item .status { font-size: 0.85rem; font-weight: 700; margin-top: 4px; display: block; }
        .rule-item .status.closed { color: #ef4444; }

        .link-btn {
          display: inline-block;
          color: var(--gb-teal);
          text-decoration: none;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .price-input-wrap { position: relative; }
        .price-input-wrap .suffix {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--gb-gold);
        }

        .gb-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .gb-table th { text-align: left; padding: 12px; font-size: 0.7rem; color: #555; text-transform: uppercase; }
        .gb-table td { padding: 16px 12px; border-top: 1px solid var(--gb-border); }
        .gb-table .sub { font-size: 0.75rem; color: #666; }

        .delete-btn { background: none; border: none; color: #ef4444; font-size: 1.5rem; cursor: pointer; }

        .form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 12px; }
        .add-btn {
          background: var(--gb-teal);
          color: white;
          border: none;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          font-size: 1.2rem;
          cursor: pointer;
        }

        .feature-group h3 { font-size: 0.9rem; font-weight: 800; color: #666; margin: 32px 0 16px; }
        .feature-options { display: flex; flex-wrap: wrap; gap: 8px; }
        .feature-pill {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--gb-border);
          color: #888;
          padding: 6px 16px;
          border-radius: 99px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
        }
        .feature-pill.selected { border-color: var(--gb-teal); color: var(--gb-teal); background: rgba(15, 160, 138, 0.05); }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .gallery-item {
          aspect-ratio: 1;
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          border: 2px solid transparent;
        }

        .gallery-item.cover { border-color: var(--gb-gold); }
        .gallery-item img { width: 100%; height: 100%; object-fit: cover; }

        .item-actions {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.6);
          opacity: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.2s;
        }

        .gallery-item:hover .item-actions { opacity: 1; }

        .action-btn {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 0.7rem;
          font-weight: 800;
          cursor: pointer;
          border: none;
        }
        .action-btn.gold { background: var(--gb-gold); color: black; }
        .action-btn.red { background: #ef4444; color: white; }

        .upload-box {
          border: 2px dashed var(--gb-border);
          border-radius: 16px;
          padding: 40px;
          text-align: center;
          margin-bottom: 24px;
          cursor: pointer;
        }
        .upload-box input { display: none; }
        .upload-box label { cursor: pointer; color: #888; font-weight: 700; }

        @media (max-width: 640px) {
          .form-row-2, .form-row-3 { grid-template-columns: 1fr; }
          .manage-section-card { padding: 20px; }
        }

        [dir="rtl"] .price-input-wrap .suffix { right: auto; left: 16px; }
        [dir="rtl"] .gb-table th { text-align: right; }
      `}</style>
    </StudioManagementLayout>
  );
}
