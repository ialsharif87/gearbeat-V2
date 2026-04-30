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

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isReasonableRegistrationNumber(value: string) {
  const cleaned = value.trim();
  return cleaned.length >= 4 && cleaned.length <= 40;
}

function isValidSaudiVatNumber(value: string) {
  return /^3\d{13}3$/.test(value.trim());
}

function parseCoordinate(value: string) {
  if (!value) {
    return null;
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return null;
  }

  return numberValue;
}

function isValidLatitude(value: number | null) {
  return value === null || (value >= -90 && value <= 90);
}

function isValidLongitude(value: number | null) {
  return value === null || (value >= -180 && value <= 180);
}

export default async function OwnerOnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?account=owner");
  }

  const supabaseAdmin = createAdminClient();
  const countries = await getActiveCountries();

  const [{ data: profile, error: profileError }, { data: complianceProfile, error: complianceError }] =
    await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, auth_user_id, email, full_name, phone, country_code, phone_e164, role, account_status")
        .eq("auth_user_id", user.id)
        .maybeSingle(),

      supabaseAdmin
        .from("owner_compliance_profiles")
        .select(`
          id,
          owner_auth_user_id,
          country_code,
          city_name,
          district,
          address_line,
          google_maps_url,
          latitude,
          longitude,
          business_type,
          business_registration_type,
          legal_name,
          contact_email,
          contact_phone,
          registration_number,
          tax_number,
          municipal_license_number,
          verification_status,
          compliance_status,
          created_at,
          updated_at
        `)
        .eq("owner_auth_user_id", user.id)
        .maybeSingle(),
    ]);

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (complianceError) {
    throw new Error(complianceError.message);
  }

  if (!profile || profile.role !== "owner") {
    redirect("/forbidden");
  }

  const defaultCountryCode =
    complianceProfile?.country_code || profile.country_code || "SA";

  async function submitOwnerOnboarding(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login?account=owner");
    }

    const supabaseAdmin = createAdminClient();
    const countries = await getActiveCountries();

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, role, account_status")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error(profileError.message);
    }

    if (!profile || profile.role !== "owner") {
      redirect("/forbidden");
    }

    const countryCode = getText(formData, "country_code");
    const cityName = getText(formData, "city_name");
    const district = getText(formData, "district");
    const addressLine = getText(formData, "address_line");
    const googleMapsUrl = getText(formData, "google_maps_url");
    const latitude = parseCoordinate(getText(formData, "latitude"));
    const longitude = parseCoordinate(getText(formData, "longitude"));

    const legalName = getText(formData, "legal_name");
    const contactEmail = normalizeEmail(getText(formData, "contact_email"));
    const contactPhone = getText(formData, "contact_phone");

    const businessType = getText(formData, "business_type");
    const businessRegistrationType = getText(formData, "business_registration_type");
    const registrationNumber = getText(formData, "registration_number");
    const taxNumber = getText(formData, "tax_number");
    const municipalLicenseNumber = getText(formData, "municipal_license_number");

    const selectedCountry = countries.find(
      (country) => country.country_code === countryCode
    );

    if (!selectedCountry) {
      throw new Error("Selected country is invalid.");
    }

    if (!legalName || legalName.length < 2) {
      throw new Error("Legal business name is required.");
    }

    if (!contactEmail || !isValidEmail(contactEmail)) {
      throw new Error("Valid contact email is required.");
    }

    if (!contactPhone || contactPhone.length < 8) {
      throw new Error("Valid contact phone is required.");
    }

    if (!cityName) {
      throw new Error("City is required.");
    }

    if (!addressLine || addressLine.length < 5) {
      throw new Error("Business address is required.");
    }

    if (!isValidLatitude(latitude)) {
      throw new Error("Latitude is invalid.");
    }

    if (!isValidLongitude(longitude)) {
      throw new Error("Longitude is invalid.");
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

    const payload = {
      owner_auth_user_id: user.id,
      country_code: countryCode,
      city_name: cityName,
      district: district || null,
      address_line: addressLine,
      google_maps_url: googleMapsUrl || null,
      latitude,
      longitude,
      business_type: businessType,
      business_registration_type: businessRegistrationType,
      legal_name: legalName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      registration_number: registrationNumber,
      tax_number: taxNumber || null,
      municipal_license_number: municipalLicenseNumber || null,
      verification_status: "pending",
      compliance_status: "pending",
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabaseAdmin
      .from("owner_compliance_profiles")
      .upsert(payload, {
        onConflict: "owner_auth_user_id",
      });

    if (upsertError) {
      throw new Error(upsertError.message);
    }

    redirect("/owner");
  }

  return (
    <div className="owner-onboarding-page">
      <div className="owner-onboarding-hero">
        <span className="badge badge-gold">
          <T en="Studio Owner Verification" ar="توثيق مالك الاستوديو" />
        </span>

        <h1>
          <T en="Complete Studio Owner Onboarding" ar="إكمال بيانات مالك الاستوديو" />
        </h1>

        <p>
          <T
            en="Add your legal business information and location details. GearBeat will use this information to verify studio owners and build customer trust."
            ar="أضف بيانات المنشأة والموقع. ستستخدم GearBeat هذه البيانات لتوثيق ملاك الاستوديوهات وبناء الثقة لدى العملاء."
          />
        </p>
      </div>

      <div className="portal-main" style={{ maxWidth: 960, margin: "0 auto" }}>
        <form action={submitOwnerOnboarding} className="card owner-onboarding-form">
          <h2>
            <T en="Business Information" ar="بيانات المنشأة" />
          </h2>

          <div className="grid grid-2" style={{ marginTop: 20 }}>
            <div>
              <label>
                <T en="Legal Business Name" ar="الاسم القانوني للمنشأة" />
              </label>
              <input
                name="legal_name"
                className="input"
                required
                defaultValue={complianceProfile?.legal_name || ""}
                placeholder="Studio Company LLC"
              />
            </div>

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
          </div>

          <div className="grid grid-2" style={{ marginTop: 20 }}>
            <div>
              <label>
                <T en="Contact Email" ar="البريد الإلكتروني للتواصل" />
              </label>
              <input
                name="contact_email"
                type="email"
                className="input"
                required
                defaultValue={complianceProfile?.contact_email || profile.email || ""}
                placeholder="owner@example.com"
              />
            </div>

            <div>
              <label>
                <T en="Contact Phone" ar="رقم التواصل" />
              </label>
              <input
                name="contact_phone"
                className="input"
                required
                defaultValue={
                  complianceProfile?.contact_phone ||
                  profile.phone_e164 ||
                  profile.phone ||
                  ""
                }
                placeholder="+966501234567"
              />
            </div>
          </div>

          <div className="grid grid-2" style={{ marginTop: 20 }}>
            <div>
              <label>
                <T en="Business Type" ar="نوع النشاط" />
              </label>
              <select
                name="business_type"
                className="input"
                required
                defaultValue={complianceProfile?.business_type || ""}
              >
                <option value="">Select business type</option>
                <option value="individual_owner">Individual Owner</option>
                <option value="sole_proprietorship">Sole Proprietorship</option>
                <option value="company">Company</option>
                <option value="production_house">Production House</option>
                <option value="creative_space_operator">Creative Space Operator</option>
                <option value="music_school">Music School</option>
                <option value="agency">Agency</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label>
                <T en="Registration Type" ar="نوع التسجيل" />
              </label>
              <select
                name="business_registration_type"
                className="input"
                required
                defaultValue={complianceProfile?.business_registration_type || ""}
              >
                <option value="">Select registration type</option>
                <option value="commercial_registration">Commercial Registration</option>
                <option value="trade_license">Trade License</option>
                <option value="freelance_license">Freelance License</option>
                <option value="municipal_license">Municipal License</option>
                <option value="tax_registration">Tax Registration</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-3" style={{ marginTop: 20 }}>
            <div>
              <label>
                <T en="Registration Number" ar="رقم التسجيل" />
              </label>
              <input
                name="registration_number"
                className="input"
                required
                defaultValue={complianceProfile?.registration_number || ""}
                placeholder="Business ID / CR / License"
              />
            </div>

            <div>
              <label>
                <T en="Tax / VAT Number (Optional)" ar="الرقم الضريبي (اختياري)" />
              </label>
              <input
                name="tax_number"
                className="input"
                defaultValue={complianceProfile?.tax_number || ""}
                placeholder="Tax ID / VAT"
              />
            </div>

            <div>
              <label>
                <T en="Municipal License (Optional)" ar="رخصة البلدية (اختياري)" />
              </label>
              <input
                name="municipal_license_number"
                className="input"
                defaultValue={complianceProfile?.municipal_license_number || ""}
                placeholder="Municipal License"
              />
            </div>
          </div>

          <hr
            style={{
              border: 0,
              borderTop: "1px solid rgba(255,255,255,0.1)",
              margin: "28px 0",
            }}
          />

          <h2>
            <T en="Location Information" ar="معلومات الموقع" />
          </h2>

          <div className="grid grid-2" style={{ marginTop: 20 }}>
            <div>
              <label>
                <T en="City" ar="المدينة" />
              </label>
              <input
                name="city_name"
                className="input"
                required
                defaultValue={complianceProfile?.city_name || ""}
                placeholder="Riyadh / Amman / Dubai"
              />
            </div>

            <div>
              <label>
                <T en="District / Area" ar="الحي / المنطقة" />
              </label>
              <input
                name="district"
                className="input"
                defaultValue={complianceProfile?.district || ""}
                placeholder="District or area"
              />
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <label>
              <T en="Business Address" ar="عنوان المنشأة" />
            </label>
            <input
              name="address_line"
              className="input"
              required
              defaultValue={complianceProfile?.address_line || ""}
              placeholder="Street, building, floor, office"
            />
          </div>

          <div style={{ marginTop: 20 }}>
            <label>
              <T en="Google Maps URL" ar="رابط Google Maps" />
            </label>
            <input
              name="google_maps_url"
              className="input"
              defaultValue={complianceProfile?.google_maps_url || ""}
              placeholder="https://maps.google.com/..."
            />
          </div>

          <div className="grid grid-2" style={{ marginTop: 20 }}>
            <div>
              <label>
                <T en="Latitude (Optional)" ar="خط العرض (اختياري)" />
              </label>
              <input
                name="latitude"
                className="input"
                defaultValue={complianceProfile?.latitude || ""}
                placeholder="24.7136"
              />
            </div>

            <div>
              <label>
                <T en="Longitude (Optional)" ar="خط الطول (اختياري)" />
              </label>
              <input
                name="longitude"
                className="input"
                defaultValue={complianceProfile?.longitude || ""}
                placeholder="46.6753"
              />
            </div>
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
                en="In the next step, GearBeat will support uploading business registration, tax certificate, municipal license, proof of address, identity document, and studio documents."
                ar="في الخطوة القادمة، ستدعم GearBeat رفع السجل التجاري، الشهادة الضريبية، رخصة البلدية، إثبات العنوان، الهوية، ووثائق الاستوديو."
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
              en="Submitting this form does not automatically approve your studios. GearBeat may review the details before enabling full booking access."
              ar="إرسال هذا النموذج لا يعني اعتماد الاستوديوهات تلقائيًا. قد تراجع GearBeat البيانات قبل تفعيل الحجوزات بالكامل."
            />
          </div>

          <div style={{ marginTop: 24 }}>
            <button type="submit" className="btn btn-primary btn-large w-full">
              <T en="Save Owner Information" ar="حفظ بيانات المالك" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
