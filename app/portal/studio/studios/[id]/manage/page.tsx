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
      <div id="basic" className="bg-[var(--gb-card-bg)] border border-[var(--gb-border)] rounded-[24px] p-8 transition-transform duration-300">
        <div className="flex items-center gap-4 mb-8">
          <span className="text-2xl">📝</span>
          <h2 className="text-[1.25rem] font-extrabold m-0"><T en="Basic Information" ar="المعلومات الأساسية" /></h2>
        </div>
        <form action={updateStudioBasicInfo} className="space-y-8">
          <input type="hidden" name="studio_id" value={studio.id} />
          <div className="grid gap-5">
            <div className="space-y-2">
              <label className="block text-[0.8rem] font-bold text-[#666] uppercase tracking-[0.5px]"><T en="Studio Name" ar="اسم الاستوديو" /></label>
              <input name="name" className="w-full bg-[rgba(255,255,255,0.02)] border border-[var(--gb-border)] rounded-[12px] px-4 py-3 text-white text-[0.95rem] outline-none transition-colors focus:border-[var(--gb-gold)]" defaultValue={studio.name} required placeholder="e.g. Riyadh Sound Lab" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-[0.8rem] font-bold text-[#666] uppercase tracking-[0.5px]"><T en="City" ar="المدينة" /></label>
                <input name="city" className="w-full bg-[rgba(255,255,255,0.02)] border border-[var(--gb-border)] rounded-[12px] px-4 py-3 text-white text-[0.95rem] outline-none transition-colors focus:border-[var(--gb-gold)]" defaultValue={studio.city} required />
              </div>
              <div className="space-y-2">
                <label className="block text-[0.8rem] font-bold text-[#666] uppercase tracking-[0.5px]"><T en="District" ar="الحي" /></label>
                <input name="district" className="w-full bg-[rgba(255,255,255,0.02)] border border-[var(--gb-border)] rounded-[12px] px-4 py-3 text-white text-[0.95rem] outline-none transition-colors focus:border-[var(--gb-gold)]" defaultValue={studio.district || ""} placeholder="Al Olaya" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[0.8rem] font-bold text-[#666] uppercase tracking-[0.5px]"><T en="Full Address" ar="العنوان الكامل" /></label>
              <input name="address" className="w-full bg-[rgba(255,255,255,0.02)] border border-[var(--gb-border)] rounded-[12px] px-4 py-3 text-white text-[0.95rem] outline-none transition-colors focus:border-[var(--gb-gold)]" defaultValue={studio.address || ""} placeholder="Building 45, King Fahd Road" />
            </div>
            <div className="space-y-2">
              <label className="block text-[0.8rem] font-bold text-[#666] uppercase tracking-[0.5px]"><T en="Description" ar="الوصف" /></label>
              <textarea name="description" className="w-full bg-[rgba(255,255,255,0.02)] border border-[var(--gb-border)] rounded-[12px] px-4 py-3 text-white text-[0.95rem] outline-none transition-colors focus:border-[var(--gb-gold)]" rows={4} defaultValue={studio.description || ""} placeholder="Describe your studio..." />
            </div>
          </div>
          <div className="mt-8 flex justify-end">
            <button type="submit" className="bg-[var(--gb-gold)] text-[var(--gb-navy)] border-none px-6 py-3 rounded-[12px] font-extrabold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(212,175,55,0.3)]"><T en="Save Basic Info" ar="حفظ المعلومات الأساسية" /></button>
          </div>
        </form>
      </div>

      {/* 2. Availability */}
      <div id="availability" className="bg-[var(--gb-card-bg)] border border-[var(--gb-border)] rounded-[24px] p-8 transition-transform duration-300 mt-10">
        <div className="flex items-center gap-4 mb-8">
          <span className="text-2xl">📅</span>
          <h2 className="text-[1.25rem] font-extrabold m-0"><T en="Availability & Hours" ar="التوافر وساعات العمل" /></h2>
        </div>
        <div className="space-y-4">
          <p className="text-[#666] text-sm">
            <T 
              en="Manage your weekly working hours and booking slots." 
              ar="أدر ساعات عملك الأسبوعية وفترات الحجز المتاحة." 
            />
          </p>
          <div className="rules-summary">
            {availabilityRules && availabilityRules.length > 0 ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3 my-6">
                {availabilityRules.sort((a:any,b:any)=>a.day_of_week - b.day_of_week).map((rule: any) => (
                  <div key={rule.id} className="bg-[rgba(255,255,255,0.02)] p-3 rounded-[12px] text-center border border-[var(--gb-border)]">
                    <span className="block text-[0.75rem] font-extrabold text-[#555]">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][rule.day_of_week]}
                    </span>
                    <span className={`text-[0.85rem] font-bold mt-1 block ${rule.is_open ? 'text-white' : 'text-[#ef4444]'}`}>
                      {rule.is_open ? `${rule.open_time} - ${rule.close_time}` : "Closed"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[rgba(255,255,255,0.02)] p-8 rounded-[12px] text-center border border-dashed border-[var(--gb-border)]">
                <T en="No working hours set yet." ar="لم يتم تحديد ساعات العمل بعد." />
              </div>
            )}
          </div>
          <Link href={`/portal/studio/availability?studioId=${studio.id}`} className="inline-block text-[var(--gb-teal)] no-underline font-bold text-[0.9rem] hover:opacity-80 transition-opacity">
            <T en="Open Full Availability Manager" ar="فتح مدير التوافر الكامل" />
          </Link>
        </div>
      </div>

      {/* 3. Pricing */}
      <div id="pricing" className="bg-[var(--gb-card-bg)] border border-[var(--gb-border)] rounded-[24px] p-8 transition-transform duration-300 mt-10">
        <div className="flex items-center gap-4 mb-8">
          <span className="text-2xl">💰</span>
          <h2 className="text-[1.25rem] font-extrabold m-0"><T en="Pricing & Rates" ar="الأسعار والتعرفة" /></h2>
        </div>
        <form action={updateStudioPricing} className="space-y-6">
          <input type="hidden" name="studio_id" value={studio.id} />
          <div className="space-y-2">
            <label className="block text-[0.8rem] font-bold text-[#666] uppercase tracking-[0.5px]"><T en="Hourly Rate (SAR)" ar="سعر الساعة (ريال)" /></label>
            <div className="relative">
              <input name="price_from" type="number" className="w-full bg-[rgba(255,255,255,0.02)] border border-[var(--gb-border)] rounded-[12px] px-4 py-3 text-white text-[0.95rem] outline-none transition-colors focus:border-[var(--gb-gold)]" defaultValue={studio.price_from} required />
              <span className="absolute right-4 rtl:right-auto rtl:left-4 top-1/2 -translate-y-1/2 text-[0.8rem] font-extrabold text-[var(--gb-gold)]">SAR</span>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-[var(--gb-gold)] text-[var(--gb-navy)] border-none px-6 py-3 rounded-[12px] font-extrabold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(212,175,55,0.3)]"><T en="Save Pricing" ar="حفظ الأسعار" /></button>
          </div>
        </form>
      </div>

      {/* 4. Equipment */}
      <div id="equipment" className="bg-[var(--gb-card-bg)] border border-[var(--gb-border)] rounded-[24px] p-8 transition-transform duration-300 mt-10">
        <div className="flex items-center gap-4 mb-8">
          <span className="text-2xl">🎛️</span>
          <h2 className="text-[1.25rem] font-extrabold m-0"><T en="Studio Equipment" ar="معدات الاستوديو" /></h2>
        </div>
        <div className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse mb-6">
              <thead>
                <tr>
                  <th className="text-left rtl:text-right p-3 text-[0.7rem] text-[#555] uppercase"><T en="Item" ar="القطعة" /></th>
                  <th className="text-left rtl:text-right p-3 text-[0.7rem] text-[#555] uppercase"><T en="Category" ar="الفئة" /></th>
                  <th className="text-left rtl:text-right p-3 text-[0.7rem] text-[#555] uppercase"><T en="Qty" ar="الكمية" /></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {equipment?.map((item) => (
                  <tr key={item.id}>
                    <td className="p-[16px_12px] border-t border-[var(--gb-border)]">
                      <strong className="text-white">{item.name}</strong>
                      <div className="text-[0.75rem] text-[#666]">{item.brand} {item.model}</div>
                    </td>
                    <td className="p-[16px_12px] border-t border-[var(--gb-border)]"><span className="bg-[rgba(255,255,255,0.05)] px-3 py-1 rounded-full text-[0.75rem] text-white/60">{item.category}</span></td>
                    <td className="p-[16px_12px] border-t border-[var(--gb-border)] text-white">{item.quantity}</td>
                    <td className="p-[16px_12px] border-t border-[var(--gb-border)] text-right rtl:text-left">
                      <form action={deleteEquipment}>
                        <input type="hidden" name="equipment_id" value={item.id} />
                        <input type="hidden" name="studio_id" value={studio.id} />
                        <button type="submit" className="bg-none border-none text-[#ef4444] text-2xl cursor-pointer hover:opacity-70 transition-opacity">×</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form action={addEquipment} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3">
            <input type="hidden" name="studio_id" value={studio.id} />
            <input name="name" className="w-full bg-[rgba(255,255,255,0.02)] border border-[var(--gb-border)] rounded-[12px] px-4 py-3 text-white text-[0.95rem] outline-none transition-colors focus:border-[var(--gb-gold)]" placeholder="Item Name" required />
            <input name="brand" className="w-full bg-[rgba(255,255,255,0.02)] border border-[var(--gb-border)] rounded-[12px] px-4 py-3 text-white text-[0.95rem] outline-none transition-colors focus:border-[var(--gb-gold)]" placeholder="Brand" />
            <select name="category" className="w-full bg-[rgba(255,255,255,0.02)] border border-[var(--gb-border)] rounded-[12px] px-4 py-3 text-white text-[0.95rem] outline-none transition-colors focus:border-[var(--gb-gold)]">
              <option value="microphone">Microphone</option>
              <option value="instrument">Instrument</option>
              <option value="outboard">Outboard</option>
              <option value="monitoring">Monitoring</option>
            </select>
            <button type="submit" className="bg-[var(--gb-teal)] text-white border-none w-11 h-11 rounded-[12px] text-[1.2rem] cursor-pointer flex items-center justify-center hover:opacity-90 transition-opacity">+</button>
          </form>
        </div>
      </div>

      {/* 5. Services */}
      <div id="services" className="bg-[var(--gb-card-bg)] border border-[var(--gb-border)] rounded-[24px] p-8 transition-transform duration-300 mt-10">
        <div className="flex items-center gap-4 mb-8">
          <span className="text-2xl">🧑‍💻</span>
          <h2 className="text-[1.25rem] font-extrabold m-0"><T en="Services & Amenities" ar="الخدمات والمميزات" /></h2>
        </div>
        <div className="space-y-10">
          {featureGroups.map((group) => {
            const availableGroup = groupedAvailableFeatures[group.key] || [];
            return (
              <div key={group.key}>
                <h3 className="text-[0.9rem] font-extrabold text-[#666] mb-4 flex items-center gap-2">
                  <span>{group.icon}</span> 
                  <T en={group.titleEn} ar={group.titleAr} />
                </h3>
                <div className="flex flex-wrap gap-2">
                  {availableGroup.map((item) => {
                    const isSelected = selectedFeatureIds.has(item.id);
                    return (
                      <form action={isSelected ? removeFeature : addFeature} key={item.id}>
                        {isSelected && <input type="hidden" name="link_id" value={selectedFeatures?.find(f => f.feature_id === item.id)?.id} />}
                        {!isSelected && <input type="hidden" name="feature_id" value={item.id} />}
                        <input type="hidden" name="studio_id" value={studio.id} />
                        <button 
                          type="submit" 
                          className={`px-4 py-1.5 rounded-full text-[0.85rem] font-bold cursor-pointer transition-all border ${
                            isSelected 
                              ? 'border-[var(--gb-teal)] text-[var(--gb-teal)] bg-[rgba(15,160,138,0.05)]' 
                              : 'bg-[rgba(255,255,255,0.03)] border-[var(--gb-border)] text-[#888] hover:border-white/20'
                          }`}
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
      <div id="gallery" className="bg-[var(--gb-card-bg)] border border-[var(--gb-border)] rounded-[24px] p-8 transition-transform duration-300 mt-10">
        <div className="flex items-center gap-4 mb-8">
          <span className="text-2xl">🎥</span>
          <h2 className="text-[1.25rem] font-extrabold m-0"><T en="Photo Gallery" ar="معرض الصور" /></h2>
        </div>
        <div className="space-y-8">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
            {studioImages?.map((img) => (
              <div key={img.id} className={`aspect-square rounded-[16px] overflow-hidden relative border-2 transition-all group ${img.is_cover ? 'border-[var(--gb-gold)]' : 'border-transparent'}`}>
                <img src={img.image_url} alt="Studio" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                  {!img.is_cover && (
                    <form action={setCoverImage}>
                      <input type="hidden" name="image_id" value={img.id} />
                      <input type="hidden" name="studio_id" value={studio.id} />
                      <button type="submit" className="px-3 py-1.5 rounded-[8px] text-[0.7rem] font-extrabold cursor-pointer border-none transition-all bg-[var(--gb-gold)] text-black hover:scale-105"><T en="Cover" ar="غلاف" /></button>
                    </form>
                  )}
                  <form action={deleteStudioImage}>
                    <input type="hidden" name="image_id" value={img.id} />
                    <input type="hidden" name="studio_id" value={studio.id} />
                    <input type="hidden" name="image_url" value={img.image_url} />
                    <button type="submit" className="px-3 py-1.5 rounded-[8px] text-[0.7rem] font-extrabold cursor-pointer border-none transition-all bg-[#ef4444] text-white hover:scale-105">×</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
          <form action={uploadStudioImages} className="space-y-6">
            <input type="hidden" name="studio_id" value={studio.id} />
            <div className="border-2 border-dashed border-[var(--gb-border)] rounded-[16px] p-10 text-center cursor-pointer hover:border-[var(--gb-gold)] transition-colors group">
              <input type="file" name="images" multiple accept="image/*" id="file-upload" className="hidden" />
              <label htmlFor="file-upload" className="cursor-pointer text-[#888] font-bold group-hover:text-[var(--gb-gold)] transition-colors">
                <T en="Click to upload images (Max 10)" ar="اضغط لرفع الصور (بحد أقصى 10)" />
              </label>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="bg-[var(--gb-gold)] text-[var(--gb-navy)] border-none px-6 py-3 rounded-[12px] font-extrabold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(212,175,55,0.3)]"><T en="Upload Photos" ar="رفع الصور" /></button>
            </div>
          </form>
        </div>
      </div>

      {/* 7. External Reviews */}
      <div id="reviews" className="bg-[var(--gb-card-bg)] border border-[var(--gb-border)] rounded-[24px] p-8 transition-transform duration-300 mt-10">
        <div className="flex items-center gap-4 mb-8">
          <span className="text-2xl">⭐</span>
          <h2 className="text-[1.25rem] font-extrabold m-0"><T en="External Reviews" ar="التقييمات الخارجية" /></h2>
        </div>
        <form action={updateExternalReviewLinks} className="space-y-8">
          <input type="hidden" name="studio_id" value={studio.id} />
          <input type="hidden" name="studio_slug" value={studio.slug} />
          <div className="grid gap-5">
            <div className="space-y-2">
              <label className="block text-[0.8rem] font-bold text-[#666] uppercase tracking-[0.5px]"><T en="Google Maps URL" ar="رابط خرائط جوجل" /></label>
              <input name="google_maps_url" className="w-full bg-[rgba(255,255,255,0.02)] border border-[var(--gb-border)] rounded-[12px] px-4 py-3 text-white text-[0.95rem] outline-none transition-colors focus:border-[var(--gb-gold)]" defaultValue={studio.google_maps_url || ""} />
            </div>
            <div className="space-y-2">
              <label className="block text-[0.8rem] font-bold text-[#666] uppercase tracking-[0.5px]"><T en="TripAdvisor URL" ar="رابط تريب أدفايزر" /></label>
              <input name="tripadvisor_url" className="w-full bg-[rgba(255,255,255,0.02)] border border-[var(--gb-border)] rounded-[12px] px-4 py-3 text-white text-[0.95rem] outline-none transition-colors focus:border-[var(--gb-gold)]" defaultValue={studio.tripadvisor_url || ""} />
            </div>
            <div className="space-y-2">
              <label className="block text-[0.8rem] font-bold text-[#666] uppercase tracking-[0.5px]"><T en="Google Place ID" ar="معرف المكان من جوجل" /></label>
              <input name="google_place_id" className="w-full bg-[rgba(255,255,255,0.02)] border border-[var(--gb-border)] rounded-[12px] px-4 py-3 text-white text-[0.95rem] outline-none transition-colors focus:border-[var(--gb-gold)]" defaultValue={studio.google_place_id || ""} />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-[var(--gb-gold)] text-[var(--gb-navy)] border-none px-6 py-3 rounded-[12px] font-extrabold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(212,175,55,0.3)]"><T en="Save Links" ar="حفظ الروابط" /></button>
          </div>
        </form>
      </div>
    </StudioManagementLayout>
  );
}
