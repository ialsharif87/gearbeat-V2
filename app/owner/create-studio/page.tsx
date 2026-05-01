import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import T from "../../../components/t";
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
    redirect("/login?account=owner");
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
    redirect("/login?account=owner");
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

  if (profile.role !== "owner") {
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
    const coverImageUrl = String(formData.get("cover_image_url") || "").trim();

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

    redirect("/owner/studios");
  }

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Studio Owner" ar="مالك الاستوديو" />
        </span>

        <h1>
          <T en="Create Studio" ar="إنشاء استوديو" />
        </h1>

        <p>
          <T
            en="Add your studio details. Your studio will be submitted for admin review before it becomes bookable."
            ar="أضف تفاصيل الاستوديو. سيتم إرسال الاستوديو لمراجعة الإدارة قبل أن يصبح قابلًا للحجز."
          />
        </p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <span className="badge">
          <T en="Important" ar="مهم" />
        </span>

        <h2>
          <T en="Studio will not be bookable immediately" ar="الاستوديو لن يكون قابلًا للحجز مباشرة" />
        </h2>

        <p>
          <T
            en="After creating the studio, GearBeat admin must review and approve it. Also, your business onboarding must be approved before bookings can be activated."
            ar="بعد إنشاء الاستوديو، يجب على إدارة GearBeat مراجعته واعتماده. كما يجب اعتماد بيانات النشاط التجاري قبل تفعيل الحجوزات."
          />
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <StudioPhotoRequirements images={[]} />
      </div>

      <form className="card form" action={createStudio}>
        <label>
          <T en="Studio name" ar="اسم الاستوديو" /> *
        </label>
        <input
          className="input"
          name="name"
          placeholder="Example: Riyadh Sound Lab"
          required
        />

        <label>
          <T en="City" ar="المدينة" /> *
        </label>
        <input className="input" name="city" placeholder="Riyadh" required />

        <label>
          <T en="District" ar="الحي" />
        </label>
        <input className="input" name="district" placeholder="Al Olaya" />

        <label>
          <T en="Address" ar="العنوان" />
        </label>
        <input
          className="input"
          name="address"
          placeholder="Full address or location description"
        />

        <label>
          <T en="Description" ar="الوصف" /> *
        </label>
        <textarea
          className="input"
          name="description"
          rows={5}
          placeholder="Describe the studio, equipment, vibe, and services."
          required
        />

        <label>
          <T en="Starting price / hour" ar="السعر الابتدائي / الساعة" /> *
        </label>
        <input
          className="input"
          name="price_from"
          type="number"
          min="1"
          placeholder="250"
          required
        />

        <label>
          <T en="Cover image URL" ar="رابط صورة الغلاف" />
        </label>
        <input
          className="input"
          name="cover_image_url"
          placeholder="https://images.unsplash.com/..."
        />

        <button className="btn" type="submit">
          <T en="Submit Studio for Review" ar="إرسال الاستوديو للمراجعة" />
        </button>
      </form>
    </section>
  );
}
