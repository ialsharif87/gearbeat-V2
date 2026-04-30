import { redirect } from "next/navigation";
import T from "@/components/t";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveCountries } from "@/lib/countries";

function getText(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
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

function isValidSaudiVatNumber(value: string) {
  return /^3\d{13}3$/.test(value.trim());
}

function isReasonableRegistrationNumber(value: string) {
  const cleaned = value.trim();

  return cleaned.length >= 4 && cleaned.length <= 40;
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
  const countries = await getActiveCountries();

  const [
    { data: profile, error: profileError },
    { data: vendorProfile, error: vendorProfileError },
  ] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select(
        "id, auth_user_id, email, full_name, phone, country_code, phone_e164, role, account_status"
      )
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
        country_code,
        city_name,
        district,
        address_line,
        business_type,
        business_registration_type,
        business_verification_status,
        document_verification_status,
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

  if (
    vendorProfile.status === "rejected" ||
    vendorProfile.status === "suspended"
  ) {
    redirect("/vendor-pending");
  }

  const defaultCountryCode =
    vendorProfile.country_code || profile.country_code || "SA";

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
    const countries = await getActiveCountries();

    const [
      { data: profile, error: profileError },
      { data: currentVendorProfile, error: currentVendorProfileError },
    ] = await Promise.all([
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

    if (profileError) {
      throw new Error(profileError.message);
    }

    if (currentVendorProfileError) {
      throw new Error(currentVendorProfileError.message);
    }

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
    const phone = getText(formData, "phone");
    const countryCode = getText(formData, "country_code");
    const cityName = getText(formData, "city_name");
    const district = getText(formData, "district");
    const addressLine = getText(formData, "address_line");
    const businessType = getText(formData, "business_type");
    const businessRegistrationType = getText(
      formData,
      "business_registration_type"
    );
    const registrationNumber = getText(formData, "registration_number");
    const taxNumber = getText(formData, "tax_number");
    const websiteUrl = getText(formData, "website_url");

    const selectedCountry = countries.find(
      (country) => country.country_code === countryCode
    );

    if (!selectedCountry) {
      throw new Error("Selected country is invalid.");
    }

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

    if (!phone || phone.length < 8) {
      throw new Error("Valid contact phone is required.");
    }

    if (!cityName) {
      throw new Error("City is required.");
    }

    if (!addressLine || addressLine.length < 5) {
      throw new Error("Business address is required.");
    }

    if (!businessType) {
      throw new Error("Business type is required.");
    }

    if (!businessRegistrationType) {
      throw new Error("Business registration type is required.");
    }

    if (
      !registrationNumber ||
      !isReasonableRegistrationNumber(registrationNumber)
    ) {
      throw new Error("Business registration number is required.");
    }

    if (countryCode === "SA" && taxNumber && !isValidSaudiVatNumber(taxNumber)) {
      throw new Error(
        "Saudi VAT number must be 15 digits and follow ZATCA format."
      );
    }

    const slugAvailable = await isSlugAvailable({
      supabaseAdmin,
      slug: requestedSlug,
      currentVendorId: user.id,
    });

    if (!slugAvailable) {
      throw new Error("This store URL is already used by another vendor.");
    }

    const { data: updatedVendorProfile, error: updateError } =
      await supabaseAdmin
        .from("vendor_profiles")
        .update({
          business_name_en: businessNameEn,
          business_name_ar: businessNameAr,
          slug: requestedSlug,
          contact_email: contactEmail,
          contact_phone: phone,
          country_code: countryCode,
          city_name: cityName,
          district: district || null,
          address_line: addressLine,
          business_type: businessType,
          business_registration_type: businessRegistrationType,
          cr_number: registrationNumber,
          vat_number: taxNumber || null,
          website_url: websiteUrl || null,
          business_verification_status: "pending",
          document_verification_status: "not_started",
          compliance_status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .eq("status", "pending")
        .select("id")
        .maybeSingle();

    if (updateError) {
      throw new Error(updateError.message);
    }

    if (!updatedVendorProfile) {
      redirect("/vendor-pending");
    }

    redirect("/vendor-pending");
  }

  return (
    <div className="owner-onboarding-page">
      <div className="owner-onboarding-hero">
        <span className="badge badge-gold">
          <T en="Vendor Verification" ar="توثيق التاجر" />
        </span>

        <h1>
          <T en="Complete Vendor Onboarding" ar="إكمال تسجيل التاجر" />
        </h1>

        <p>
          <T
            en="Complete your business details. Your account will remain pending until GearBeat reviews and approves it."
            ar="أكمل بيانات المنشأة. سيبقى حسابك قيد المراجعة حتى يتم اعتماده من GearBeat."
          />
        </p>
      </div>

      <div className="portal-main" style={{ maxWidth: 900, margin: "0 auto" }}>
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
                <T en="Country" ar="الدولة" />
              </label>
              <select
                name="country_code"
                className="input"
                required
                defaultValue={defaultCountryCode}
              >
                {countries.map((country) => (
                  <option key={country.country_code} value={country.country_code}>
                    {country.name_en} / {country.name_ar}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>
                <T en="City" ar="المدينة" />
              </label>
              <input
                name="city_name"
                className="input"
                required
                defaultValue={vendorProfile.city_name || ""}
                placeholder="Riyadh / Amman / Dubai"
              />
            </div>
          </div>

          <div className="grid grid-2" style={{ marginTop: 20 }}>
            <div>
              <label>
                <T en="District / Area" ar="الحي / المنطقة" />
              </label>
              <input
                name="district"
                className="input"
                defaultValue={vendorProfile.district || ""}
                placeholder="District or area"
              />
            </div>

            <div>
              <label>
                <T en="Business Address" ar="عنوان المنشأة" />
              </label>
              <input
                name="address_line"
                className="input"
                required
                defaultValue={vendorProfile.address_line || ""}
                placeholder="Street, building, office"
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
                defaultValue={
                  vendorProfile.contact_phone ||
                  profile.phone_e164 ||
                  profile.phone ||
                  ""
                }
                placeholder="+966501234567"
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
                <T en="Business Type" ar="نوع النشاط التجاري" />
              </label>
              <select
                name="business_type"
                className="input"
                required
                defaultValue={vendorProfile.business_type || ""}
              >
                <option value="">
                  Select business type
                </option>
                <option value="individual_seller">
                  Individual Seller
                </option>
                <option value="sole_proprietorship">
                  Sole Proprietorship
                </option>
                <option value="company">
                  Company
                </option>
                <option value="distributor">
                  Distributor
                </option>
                <option value="authorized_reseller">
                  Authorized Reseller
                </option>
                <option value="music_store">
                  Music Store
                </option>
                <option value="equipment_rental_company">
                  Equipment Rental Company
                </option>
                <option value="other">
                  Other
                </option>
              </select>
            </div>

            <div>
              <label>
                <T en="Registration Type" ar="نوع التسجيل التجاري" />
              </label>
              <select
                name="business_registration_type"
                className="input"
                required
                defaultValue={vendorProfile.business_registration_type || ""}
              >
                <option value="">
                  Select registration type
                </option>
                <option value="commercial_registration">
                  Commercial Registration
                </option>
                <option value="trade_license">
                  Trade License
                </option>
                <option value="freelance_license">
                  Freelance License
                </option>
                <option value="municipal_license">
                  Municipal License
                </option>
                <option value="tax_registration">
                  Tax Registration
                </option>
                <option value="other">
                  Other
                </option>
              </select>
            </div>
          </div>

          <div className="grid grid-2" style={{ marginTop: 20 }}>
            <div>
              <label>
                <T
                  en="Business Registration Number"
                  ar="رقم التسجيل التجاري"
                />
              </label>
              <input
                name="registration_number"
                className="input"
                required
                defaultValue={vendorProfile.cr_number || ""}
                placeholder="CR / Trade License / Business ID"
              />
            </div>

            <div>
              <label>
                <T en="Tax / VAT Number (Optional)" ar="الرقم الضريبي (اختياري)" />
              </label>
              <input
                name="tax_number"
                className="input"
                defaultValue={vendorProfile.vat_number || ""}
                placeholder="Tax ID / VAT Number"
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
              padding: 18,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              color: "var(--muted)",
              lineHeight: 1.8,
            }}
          >
            <h3 style={{ color: "white", marginBottom: 8 }}>
              <T en="Documents will be requested next" ar="سيتم طلب الوثائق لاحقًا" />
            </h3>

            <p>
              <T
                en="After this step, GearBeat may request documents such as business registration, tax certificate, municipal license, proof of address, or authorized reseller proof depending on your country and business type."
                ar="بعد هذه الخطوة، قد تطلب GearBeat وثائق مثل السجل التجاري، الشهادة الضريبية، رخصة البلدية، إثبات العنوان، أو إثبات الوكيل المعتمد حسب الدولة ونوع النشاط."
              />
            </p>
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
