import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import T from "@/components/t";
import StudioPhotoRequirements from "@/components/studio-photo-requirements";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

export default async function CreateStudioPage() {
  await requireOwnerOnly();

  async function createStudio(formData: FormData) {
    "use server";

    const { user, profile } = await requireOwnerOnly();
    const supabaseAdmin = createAdminClient();

    const name = String(formData.get("name") || "").trim();
    const city = String(formData.get("city") || "").trim();
    const district = String(formData.get("district") || "").trim();
    const address = String(formData.get("address") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const priceFrom = Number(formData.get("price_from") || 0);
    const coverImageFile = formData.get("cover_image_file") as File;
    let coverImageUrl = "";

    if (coverImageFile && coverImageFile.size > 0) {
      const fileName = `${Date.now()}-${coverImageFile.name}`;
      const filePath = `studios/${user.id}/${fileName}`;
      
      const { error: uploadError } = await supabaseAdmin.storage
        .from("studio-assets")
        .upload(filePath, coverImageFile);
        
      if (!uploadError) {
        const { data: urlData } = supabaseAdmin.storage
          .from("studio-assets")
          .getPublicUrl(filePath);
        coverImageUrl = urlData.publicUrl;
      }
    }

    if (!name || !city || !description || !priceFrom) {
      throw new Error("Please fill all required fields.");
    }

    if (priceFrom <= 0) {
      throw new Error("Starting price must be greater than zero.");
    }

    const { data: complianceProfile } = await supabaseAdmin
      .from("owner_compliance_profiles")
      .select("onboarding_status, admin_review_status")
      .eq("owner_auth_user_id", user.id)
      .maybeSingle();

    const ownerComplianceApproved =
      complianceProfile?.onboarding_status === "approved" &&
      complianceProfile?.admin_review_status === "approved";

    const baseSlug = slugify(name) || "studio";
    const slug = `${baseSlug}-${Date.now()}`;

    const { error } = await supabaseAdmin.from("studios").insert({
      owner_auth_user_id: user.id,
      name,
      slug,
      city,
      district: district || null,
      address: address || null,
      description,
      price_from: priceFrom,
      cover_image_url: coverImageUrl || null,

      status: "pending",
      verified: false,

      booking_enabled: false,
      owner_compliance_required: true,
      owner_compliance_status: ownerComplianceApproved
        ? "approved"
        : "incomplete"
    });

    if (error) {
      throw new Error(error.message);
    }

    redirect("/portal/studio/studios");
  }

  return (
    <main className="gb-dashboard-page container">
      <section className="gb-dashboard-header">
        <div>
          <p className="gb-eyebrow">
            <T en="Owner Portal" ar="بوابة المالك" />
          </p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, color: 'white' }}>
            <T en="Create Studio" ar="إنشاء استوديو" />
          </h1>
          <p className="gb-muted-text" style={{ marginTop: '8px' }}>
            <T
              en="Add your studio details. Your studio will be submitted for admin review before it becomes bookable."
              ar="أضف تفاصيل الاستوديو. سيتم إرسال الاستوديو لمراجعة الإدارة قبل أن يصبح قابلًا للحجز."
            />
          </p>
        </div>

        <Link href="/portal/studio/studios" className="gb-button gb-button-outline">
          <T en="Back to My Studios" ar="العودة لاستوديوهاتي" />
        </Link>
      </section>

      <div className="gb-dashboard-stack" style={{ gap: '32px' }}>
        <section 
          className="gb-card" 
          style={{ 
            background: 'rgba(212, 175, 55, 0.05)', 
            borderInlineStart: '4px solid var(--gb-gold)',
            padding: '24px 32px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '1.5rem' }}>ℹ️</div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white', margin: 0 }}>
                <T en="Important Note" ar="ملاحظة هامة" />
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                <T
                  en="After creation, GearBeat admin will review your listing. Your business onboarding must also be completed and approved before bookings go live."
                  ar="بعد الإنشاء، ستراجع الإدارة طلبك. يجب أيضاً إكمال بيانات النشاط التجاري واعتمادها قبل تفعيل الحجوزات."
                />
              </p>
            </div>
          </div>
        </section>

        <StudioPhotoRequirements images={[]} />

        <section className="gb-card" style={{ padding: '40px' }}>
          <form action={createStudio} className="gb-dashboard-stack" style={{ gap: '24px' }}>
            <div className="gb-dash-grid-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label className="gb-detail-label" style={{ marginBottom: '8px', display: 'block' }}>
                  <T en="Studio Name" ar="اسم الاستوديو" /> *
                </label>
                <input
                  className="gb-input"
                  name="name"
                  placeholder="e.g. Riyadh Sound Lab"
                  required
                />
              </div>

              <div>
                <label className="gb-detail-label" style={{ marginBottom: '8px', display: 'block' }}>
                  <T en="Starting Price (per hour)" ar="السعر الابتدائي (بالساعة)" /> *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="gb-input"
                    name="price_from"
                    type="number"
                    min="1"
                    placeholder="250"
                    required
                    style={{ paddingRight: '60px' }}
                  />
                  <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'var(--gb-gold)', fontWeight: 800 }}>SAR</span>
                </div>
              </div>
            </div>

            <div className="gb-dash-grid-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label className="gb-detail-label" style={{ marginBottom: '8px', display: 'block' }}>
                  <T en="City" ar="المدينة" /> *
                </label>
                <input className="gb-input" name="city" placeholder="Riyadh" required />
              </div>

              <div>
                <label className="gb-detail-label" style={{ marginBottom: '8px', display: 'block' }}>
                  <T en="District" ar="الحي" />
                </label>
                <input className="gb-input" name="district" placeholder="Al Olaya" />
              </div>
            </div>

            <div>
              <label className="gb-detail-label" style={{ marginBottom: '8px', display: 'block' }}>
                <T en="Full Address / Location" ar="العنوان الكامل / الموقع" />
              </label>
              <input
                className="gb-input"
                name="address"
                placeholder="Detailed location for approved bookings"
              />
            </div>

            <div>
              <label className="gb-detail-label" style={{ marginBottom: '8px', display: 'block' }}>
                <T en="Description" ar="الوصف" /> *
              </label>
              <textarea
                className="gb-input"
                name="description"
                rows={5}
                placeholder="Describe your studio, equipment, and services..."
                required
                style={{ resize: 'none' }}
              />
            </div>

            <div>
              <label className="gb-detail-label" style={{ marginBottom: '8px', display: 'block' }}>
                <T en="Cover Image" ar="صورة الغلاف" />
              </label>
              <div style={{ 
                border: '2px dashed var(--gb-border)', 
                borderRadius: '16px', 
                padding: '32px', 
                textAlign: 'center',
                background: 'rgba(255,255,255,0.02)',
                transition: 'border-color 0.3s'
              }}>
                <input
                  type="file"
                  name="cover_image_file"
                  accept="image/*"
                  style={{ cursor: 'pointer' }}
                />
                <p className="gb-muted-text" style={{ fontSize: '0.8rem', marginTop: '12px', marginBottom: 0 }}>
                  <T en="JPG, PNG allowed. Max 5MB." ar="مسموح بملفات JPG, PNG. بحد أقصى 5 ميجابايت." />
                </p>
              </div>
            </div>

            <button 
              className="gb-button gb-button-primary" 
              type="submit"
              style={{ width: '100%', justifyContent: 'center', height: '54px', fontSize: '1rem', marginTop: '16px' }}
            >
              <T en="Submit Studio for Review" ar="إرسال الاستوديو للمراجعة" />
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
