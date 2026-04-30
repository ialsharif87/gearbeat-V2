import { redirect } from "next/navigation";
import T from "@/components/t";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function getText(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string) {
  const cleaned = value.replace(/[\s-]/g, "").trim();

  if (cleaned.startsWith("05")) {
    return `+966${cleaned.slice(1)}`;
  }

  if (cleaned.startsWith("9665")) {
    return `+${cleaned}`;
  }

  return cleaned;
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "vendor";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidSaudiMobile(value: string) {
  const cleaned = value.replace(/[\s-]/g, "");
  return /^(?:\+9665|9665|05)\d{8}$/.test(cleaned);
}

function isValidCommercialRegistration(value: string) {
  return /^\d{10}$/.test(value.trim());
}

function isValidSaudiVatNumber(value: string) {
  return /^3\d{13}3$/.test(value.trim());
}

async function isSlugAvailable({
  supabaseAdmin,
  slug,
  currentVendorId,
}: {
  supabaseAdmin: ReturnType<typeof createAdminClient>;
  slug: string;
  currentVendorId: string;
}) {
  const { data: existingVendor, error } = await supabaseAdmin
    .from("vendor_profiles")
    .select("id")
    .eq("slug", slug)
    .neq("id", currentVendorId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return !existingVendor;
}

export default async function VendorOnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?account=vendor");
  }

  const supabaseAdmin = createAdminClient();

  const [{ data: profile, error: profileError }, { data: vendorProfile, error: vendorProfileError }] =
    await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, auth_user_id, email, full_name, phone, role, account_status")
        .eq("auth_user_id", user.id)
        .maybeSingle(),

      supabaseAdmin
        .from("vendor_profiles")
        .select(`
          id,
          business_name_en,
          business_name_ar,
          slug,
          contact_email,
          contact_phone,
          vat_number,
          cr_number,
          website_url,
          status,
          compliance_status,
          agreement_status,
          payout_status
        `)
        .eq("id", user.id)
        .maybeSingle(),
    ]);

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (vendorProfileError) {
    throw new Error(vendorProfileError.message);
  }

  if (!profile || profile.role !== "vendor") {
    redirect("/forbidden");
  }

  if (!vendorProfile) {
    redirect("/vendor-signup");
  }

  if (vendorProfile.status === "approved") {
    redirect("/vendor");
  }

  if (vendorProfile.status === "rejected" || vendorProfile.status === "suspended") {
    redirect("/vendor-pending");
  }

  async function handleSubmit(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login?account=vendor");
    }

    const supabaseAdmin = createAdminClient();

    const [{ data: profile }, { data: currentVendorProfile }] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, role, account_status")
        .eq("auth_user_id", user.id)
        .maybeSingle(),

      supabaseAdmin
        .from("vendor_profiles")
        .select("id, status")
        .eq("id", user.id)
        .maybeSingle(),
    ]);

    if (!profile || profile.role !== "vendor") {
      redirect("/forbidden");
    }

    if (!currentVendorProfile) {
      redirect("/vendor-signup");
    }

    if (currentVendorProfile.status === "approved") {
      redirect("/vendor");
    }

    if (
      currentVendorProfile.status === "rejected" ||
      currentVendorProfile.status === "suspended"
    ) {
      redirect("/vendor-pending");
    }

    const businessNameEn = getText(formData, "business_name_en");
    const businessNameAr = getText(formData, "business_name_ar");
    const requestedSlug = slugify(getText(formData, "slug"));
    const contactEmail = normalizeEmail(getText(formData, "email"));
    const phone = normalizePhone(getText(formData, "phone"));
    const crNumber = getText(formData, "cr_number");
    const vatNumber = getText(formData, "vat_number");
    const websiteUrl = getText(formData, "website_url");

    if (!businessNameEn || businessNameEn.length < 2) {
      throw new Error("Business English name is required.");
    }

    if (!businessNameAr || businessNameAr.length < 2) {
      throw new Error("Business Arabic name is required.");
    }

    if (!requestedSlug || requestedSlug.length < 2) {
      throw new Error("Store slug is required.");
    }

    if (!contactEmail || !isValidEmail(contactEmail)) {
      throw new Error("Valid contact email is required.");
    }

    if (!phone || !isValidSaudiMobile(phone)) {
      throw new Error("Valid Saudi mobile number is required.");
    }

    if (!crNumber || !isValidCommercialRegistration(crNumber)) {
      throw new Error("Commercial Registration must be 10 digits.");
    }

    if (!vatNumber || !isValidSaudiVatNumber(vatNumber)) {
      throw new Error("Saudi VAT number must be 15 digits and follow ZATCA format.");
    }

    const slugAvailable = await isSlugAvailable({
      supabaseAdmin,
      slug: requestedSlug,
      currentVendorId: user.id,
    });

    if (!slugAvailable) {
      throw new Error("This store URL is already used by another vendor.");
    }

    const { error: updateError } = await supabaseAdmin
      .from("vendor_profiles")
      .update({
        business_name_en: businessNameEn,
        business_name_ar: businessNameAr,
        slug: requestedSlug,
        contact_email: contactEmail,
        contact_phone: phone,
        cr_number: crNumber,
        vat_number: vatNumber,
        website_url: websiteUrl || null,
        compliance_status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .eq("status", "pending");

    if (updateError) {
      throw new Error(updateError.message);
    }

    redirect("/vendor-pending");
  }

  return (
    <div className="owner-onboarding-page">
      <div className="owner-onboarding-hero">
        <span className="badge badge-gold">
          <T en="Partner Program" ar="برنامج الشركاء" />
        </span>

        <h1>
          <T en="Complete Vendor Onboarding" ar="إكمال تسجيل التاجر" />
        </h1>

        <p>
          <T
            en="Complete your business details. Your application will stay under review until approved by GearBeat admin."
            ar="أكمل بيانات المنشأة. سيبقى طلبك قيد المراجعة حتى تتم الموافقة عليه من إدارة GearBeat."
          />
        </p>
      </div>

      <div className="portal-main" style={{ maxWidth: 800, margin: "0 auto" }}>
        <form action={handleSubmit} className="card owner-onboarding-form">
          <div className="grid grid-2">
            <div>
              <label>
                <T en="Business Name (English)" ar="اسم المنشأة (إنجليزي)" />
              </label>
              <input
                name="business_name_en"
                className="input"
                required
                defaultValue={vendorProfile.business_name_en || ""}
                placeholder="Gear Store Co."
              />
            </div>

            <div>
              <label>
                <T en="Business Name (Arabic)" ar="اسم المنشأة (عربي)" />
              </label>
              <input
                name="business_name_ar"
                className="input"
                required
                defaultValue={vendorProfile.business_name_ar || ""}
                placeholder="شركة متجر المعدات"
              />
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <label>
              <T en="Store Slug (URL)" ar="رابط المتجر" />
            </label>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "var(--muted)" }}>
                gearbeat.com/vendor-store/
              </span>
              <input
                name="slug"
                className="input"
                required
                defaultValue={vendorProfile.slug || ""}
                placeholder="gear-store"
              />
            </div>
          </div>

          <div className="grid grid-2" style={{ marginTop: 20 }}>
            <div>
              <label>
                <T en="Contact Email" ar="البريد الإلكتروني للتواصل" />
              </label>
              <input
                name="email"
                type="email"
                className="input"
                required
                defaultValue={vendorProfile.contact_email || profile.email || ""}
                placeholder="sales@gearstore.com"
              />
            </div>

            <div>
              <label>
                <T en="Contact Phone" ar="رقم الهاتف" />
              </label>
              <input
                name="phone"
                className="input"
                required
                defaultValue={vendorProfile.contact_phone || profile.phone || ""}
                placeholder="+966 50 XXX XXXX"
              />
            </div>
          </div>

          <hr
            style={{
              border: 0,
              borderTop: "1px solid rgba(255,255,255,0.1)",
              margin: "24px 0",
            }}
          />

          <div className="grid grid-2">
            <div>
              <label>
                <T en="Commercial Registration (CR)" ar="السجل التجاري" />
              </label>
              <input
                name="cr_number"
                className="input"
                required
                defaultValue={vendorProfile.cr_number || ""}
                placeholder="1010XXXXXX"
              />
            </div>

            <div>
              <label>
                <T en="VAT Number" ar="الرقم الضريبي" />
              </label>
              <input
                name="vat_number"
                className="input"
                required
                defaultValue={vendorProfile.vat_number || ""}
                placeholder="300XXXXXXXXXXXX"
              />
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <label>
              <T en="Website URL (Optional)" ar="رابط الموقع الإلكتروني (اختياري)" />
            </label>
            <input
              name="website_url"
              className="input"
              defaultValue={vendorProfile.website_url || ""}
              placeholder="https://example.com"
            />
          </div>

          <div
            style={{
              marginTop: 24,
              padding: 16,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              color: "var(--muted)",
              lineHeight: 1.7,
            }}
          >
            <T
              en="Submitting this form does not approve the vendor account. The vendor dashboard remains locked until an admin approves the application."
              ar="إرسال هذا النموذج لا يعني الموافقة على حساب التاجر. ستبقى لوحة التاجر مغلقة إلى أن تقوم الإدارة بالموافقة على الطلب."
            />
          </div>

          <div style={{ marginTop: 24 }}>
            <button type="submit" className="btn btn-primary btn-large w-full">
              <T en="Submit Application" ar="تقديم الطلب" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
