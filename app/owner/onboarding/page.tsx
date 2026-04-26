import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import T from "../../../components/t";

const REQUIRED_DOCUMENTS = [
  "commercial_registration",
  "national_address",
  "zakat_certificate"
];

function cleanText(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

function cleanFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-");
}

function documentLabel(type: string) {
  const labels: Record<string, string> = {
    commercial_registration: "Commercial Registration / السجل التجاري",
    national_address: "National Address / العنوان الوطني",
    zakat_certificate: "Zakat Certificate / شهادة الزكاة",
    vat_certificate: "VAT Certificate / شهادة الضريبة",
    bank_certificate: "Bank Certificate / شهادة البنك",
    authorized_signatory_id: "Authorized Signatory ID / هوية المفوض بالتوقيع",
    other: "Other / أخرى"
  };

  return labels[type] || type;
}

function getStatusStyle(status: string) {
  if (status === "approved") {
    return {
      background: "rgba(30, 215, 96, 0.18)",
      color: "#1ed760",
      border: "1px solid rgba(30, 215, 96, 0.45)"
    };
  }

  if (status === "submitted" || status === "under_review" || status === "pending_review") {
    return {
      background: "rgba(53, 216, 255, 0.16)",
      color: "#35d8ff",
      border: "1px solid rgba(53, 216, 255, 0.42)"
    };
  }

  if (status === "rejected") {
    return {
      background: "rgba(255, 75, 75, 0.18)",
      color: "#ff4b4b",
      border: "1px solid rgba(255, 75, 75, 0.45)"
    };
  }

  return {
    background: "rgba(255, 193, 7, 0.18)",
    color: "#ffc107",
    border: "1px solid rgba(255, 193, 7, 0.45)"
  };
}

async function uploadOwnerDocument({
  supabaseAdmin,
  ownerId,
  complianceProfileId,
  formData,
  documentType,
  fieldName
}: {
  supabaseAdmin: any;
  ownerId: string;
  complianceProfileId: string;
  formData: FormData;
  documentType: string;
  fieldName: string;
}) {
  const value = formData.get(fieldName);

  if (!(value instanceof File)) {
    return;
  }

  if (!value.name || value.size === 0) {
    return;
  }

  const maxSize = 10 * 1024 * 1024;

  if (value.size > maxSize) {
    throw new Error(`${documentLabel(documentType)} file is larger than 10MB.`);
  }

  const allowedTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp"
  ];

  if (!allowedTypes.includes(value.type)) {
    throw new Error(`${documentLabel(documentType)} must be PDF or image.`);
  }

  const safeName = cleanFileName(value.name);
  const filePath = `${ownerId}/${documentType}-${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("owner-compliance-documents")
    .upload(filePath, value, {
      contentType: value.type,
      upsert: true
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  await supabaseAdmin
    .from("owner_compliance_documents")
    .update({
      status: "replaced",
      updated_at: new Date().toISOString()
    })
    .eq("owner_auth_user_id", ownerId)
    .eq("document_type", documentType)
    .eq("status", "uploaded");

  const { error: documentError } = await supabaseAdmin
    .from("owner_compliance_documents")
    .insert({
      owner_auth_user_id: ownerId,
      compliance_profile_id: complianceProfileId,
      document_type: documentType,
      document_name: documentLabel(documentType),
      file_path: filePath,
      file_name: value.name,
      file_mime_type: value.type,
      file_size_bytes: value.size,
      status: "uploaded"
    });

  if (documentError) {
    throw new Error(documentError.message);
  }
}

export default async function OwnerOnboardingPage() {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: adminUser } = await supabaseAdmin
    .from("admin_users")
    .select("id")
    .eq("auth_user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (adminUser) {
    redirect("/admin");
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, auth_user_id, email, full_name, phone, role, account_status")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const role = profile?.role || user.user_metadata?.role || "customer";

  if (role !== "owner") {
    redirect("/customer");
  }

  const { data: complianceProfile } = await supabaseAdmin
    .from("owner_compliance_profiles")
    .select("*")
    .eq("owner_auth_user_id", user.id)
    .maybeSingle();

  const { data: documents } = await supabaseAdmin
    .from("owner_compliance_documents")
    .select("*")
    .eq("owner_auth_user_id", user.id)
    .neq("status", "replaced")
    .order("uploaded_at", { ascending: false });

  const { data: agreement } = await supabaseAdmin
    .from("owner_agreements")
    .select("*")
    .eq("owner_auth_user_id", user.id)
    .eq("agreement_type", "studio_owner_agreement")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: studios } = await supabaseAdmin
    .from("studios")
    .select("id, name, status, booking_enabled, owner_compliance_status")
    .eq("owner_auth_user_id", user.id)
    .order("created_at", { ascending: false });

  const uploadedDocumentTypes = new Set(
    (documents || [])
      .filter((doc) => doc.status === "uploaded" || doc.status === "approved")
      .map((doc) => doc.document_type)
  );

  const missingRequiredDocuments = REQUIRED_DOCUMENTS.filter(
    (type) => !uploadedDocumentTypes.has(type)
  );

  const agreementSigned = agreement?.signed_status === "signed";

  async function saveOwnerOnboarding(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role, email, full_name")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    const role = profile?.role || user.user_metadata?.role || "customer";

    if (role !== "owner") {
      redirect("/customer");
    }

    const intent = cleanText(formData.get("intent"));

    const companyLegalName = cleanText(formData.get("company_legal_name"));
    const companyTradeName = cleanText(formData.get("company_trade_name"));
    const commercialRegistrationNumber = cleanText(
      formData.get("commercial_registration_number")
    );
    const vatNumber = cleanText(formData.get("vat_number"));
    const zakatCertificateNumber = cleanText(
      formData.get("zakat_certificate_number")
    );

    const nationalAddressBuildingNumber = cleanText(
      formData.get("national_address_building_number")
    );
    const nationalAddressStreet = cleanText(
      formData.get("national_address_street")
    );
    const nationalAddressDistrict = cleanText(
      formData.get("national_address_district")
    );
    const nationalAddressCity = cleanText(formData.get("national_address_city"));
    const nationalAddressPostalCode = cleanText(
      formData.get("national_address_postal_code")
    );
    const nationalAddressAdditionalNumber = cleanText(
      formData.get("national_address_additional_number")
    );

    const invoiceEmail = cleanText(formData.get("invoice_email"));
    const financeContactName = cleanText(formData.get("finance_contact_name"));
    const financeContactPhone = cleanText(formData.get("finance_contact_phone"));

    const bankName = cleanText(formData.get("bank_name"));
    const iban = cleanText(formData.get("iban"));
    const beneficiaryName = cleanText(formData.get("beneficiary_name"));

    if (!companyLegalName) {
      throw new Error("Company legal name is required.");
    }

    if (!commercialRegistrationNumber) {
      throw new Error("Commercial registration number is required.");
    }

    if (!nationalAddressCity) {
      throw new Error("National address city is required.");
    }

    if (!invoiceEmail) {
      throw new Error("Invoice email is required.");
    }

    const { data: existingComplianceProfile } = await supabaseAdmin
      .from("owner_compliance_profiles")
      .select("id, onboarding_status, admin_review_status")
      .eq("owner_auth_user_id", user.id)
      .maybeSingle();

    const nextStatus =
      intent === "submit" ? "submitted" : existingComplianceProfile?.onboarding_status || "draft";

    const nextReviewStatus =
      intent === "submit"
        ? "pending_review"
        : existingComplianceProfile?.admin_review_status || "not_submitted";

    const payload = {
      owner_auth_user_id: user.id,

      company_legal_name: companyLegalName,
      company_trade_name: companyTradeName || null,
      commercial_registration_number: commercialRegistrationNumber,
      vat_number: vatNumber || null,
      zakat_certificate_number: zakatCertificateNumber || null,

      national_address_building_number: nationalAddressBuildingNumber || null,
      national_address_street: nationalAddressStreet || null,
      national_address_district: nationalAddressDistrict || null,
      national_address_city: nationalAddressCity,
      national_address_postal_code: nationalAddressPostalCode || null,
      national_address_additional_number: nationalAddressAdditionalNumber || null,
      national_address_country: "Saudi Arabia",

      invoice_email: invoiceEmail,
      finance_contact_name: financeContactName || null,
      finance_contact_phone: financeContactPhone || null,

      bank_name: bankName || null,
      iban: iban || null,
      beneficiary_name: beneficiaryName || null,

      onboarding_status: nextStatus,
      admin_review_status: nextReviewStatus,
      submitted_at: intent === "submit" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };

    const { data: savedProfile, error: profileError } = await supabaseAdmin
      .from("owner_compliance_profiles")
      .upsert(payload, {
        onConflict: "owner_auth_user_id"
      })
      .select("id")
      .single();

    if (profileError) {
      throw new Error(profileError.message);
    }

    await uploadOwnerDocument({
      supabaseAdmin,
      ownerId: user.id,
      complianceProfileId: savedProfile.id,
      formData,
      documentType: "commercial_registration",
      fieldName: "commercial_registration_file"
    });

    await uploadOwnerDocument({
      supabaseAdmin,
      ownerId: user.id,
      complianceProfileId: savedProfile.id,
      formData,
      documentType: "national_address",
      fieldName: "national_address_file"
    });

    await uploadOwnerDocument({
      supabaseAdmin,
      ownerId: user.id,
      complianceProfileId: savedProfile.id,
      formData,
      documentType: "zakat_certificate",
      fieldName: "zakat_certificate_file"
    });

    await uploadOwnerDocument({
      supabaseAdmin,
      ownerId: user.id,
      complianceProfileId: savedProfile.id,
      formData,
      documentType: "vat_certificate",
      fieldName: "vat_certificate_file"
    });

    await uploadOwnerDocument({
      supabaseAdmin,
      ownerId: user.id,
      complianceProfileId: savedProfile.id,
      formData,
      documentType: "bank_certificate",
      fieldName: "bank_certificate_file"
    });

    await uploadOwnerDocument({
      supabaseAdmin,
      ownerId: user.id,
      complianceProfileId: savedProfile.id,
      formData,
      documentType: "authorized_signatory_id",
      fieldName: "authorized_signatory_id_file"
    });

    if (intent === "submit") {
      const { data: latestDocuments } = await supabaseAdmin
        .from("owner_compliance_documents")
        .select("document_type, status")
        .eq("owner_auth_user_id", user.id)
        .neq("status", "replaced");

      const latestTypes = new Set(
        (latestDocuments || [])
          .filter((doc) => doc.status === "uploaded" || doc.status === "approved")
          .map((doc) => doc.document_type)
      );

      const missingDocs = REQUIRED_DOCUMENTS.filter(
        (type) => !latestTypes.has(type)
      );

      if (missingDocs.length) {
        await supabaseAdmin
          .from("owner_compliance_profiles")
          .update({
            onboarding_status: "incomplete",
            admin_review_status: "not_submitted",
            submitted_at: null,
            updated_at: new Date().toISOString()
          })
          .eq("owner_auth_user_id", user.id);

        throw new Error(
          `Missing required documents: ${missingDocs
            .map((doc) => documentLabel(doc))
            .join(", ")}`
        );
      }

      const signerFullName =
        profile?.full_name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        "Studio Owner";

      const signerEmail = profile?.email || user.email || "";

      const signedAgreement = cleanText(formData.get("sign_agreement")) === "yes";

      if (!signedAgreement) {
        await supabaseAdmin
          .from("owner_compliance_profiles")
          .update({
            onboarding_status: "incomplete",
            admin_review_status: "not_submitted",
            submitted_at: null,
            updated_at: new Date().toISOString()
          })
          .eq("owner_auth_user_id", user.id);

        throw new Error("You must sign the electronic agreement before submitting.");
      }

      await supabaseAdmin.from("owner_agreements").insert({
        owner_auth_user_id: user.id,
        agreement_type: "studio_owner_agreement",
        agreement_version: "v1.0",
        agreement_title: "GearBeat Studio Owner Agreement",
        agreement_text_snapshot:
          "Studio Owner confirms that company information, tax information, documents, and banking details are accurate. Studio Owner agrees to GearBeat marketplace rules, booking rules, review rules, commission/settlement terms to be defined, and platform operating standards.",
        signed_status: "signed",
        signed_at: new Date().toISOString(),
        signer_full_name: signerFullName,
        signer_email: signerEmail
      });

      await supabaseAdmin
        .from("studios")
        .update({
          owner_compliance_status: "submitted",
          booking_enabled: false,
          updated_at: new Date().toISOString()
        })
        .eq("owner_auth_user_id", user.id);
    }

    revalidatePath("/owner/onboarding");
    revalidatePath("/owner");
    revalidatePath("/admin/owner-compliance");
    revalidatePath("/admin/studios");

    redirect("/owner/onboarding?saved=1");
  }

  return (
    <section className="owner-onboarding-page">
      <div className="owner-onboarding-hero card">
        <span className="badge">
          <T en="Owner Onboarding" ar="إعداد صاحب الاستوديو" />
        </span>

        <h1>
          <T
            en="Complete your business profile before bookings go live."
            ar="أكمل بياناتك التجارية قبل تفعيل الحجوزات."
          />
        </h1>

        <p>
          <T
            en="Your studio can be created and reviewed, but it will not be bookable until business documents, invoicing details, and the electronic agreement are completed and approved."
            ar="يمكن إنشاء ومراجعة الاستوديو، لكنه لن يكون قابلًا للحجز حتى تكتمل بيانات الشركة، الفوترة، الوثائق، والعقد الإلكتروني ويتم اعتمادها."
          />
        </p>
      </div>

      <div style={{ height: 24 }} />

      <div className="owner-onboarding-status-grid">
        <div className="card">
          <span className="badge">
            <T en="Onboarding Status" ar="حالة الإعداد" />
          </span>

          <h2>{complianceProfile?.onboarding_status || "draft"}</h2>

          <span
            className="badge"
            style={getStatusStyle(complianceProfile?.admin_review_status || "not_submitted")}
          >
            {complianceProfile?.admin_review_status || "not_submitted"}
          </span>
        </div>

        <div className="card">
          <span className="badge">
            <T en="Required Documents" ar="الوثائق المطلوبة" />
          </span>

          <h2>
            {REQUIRED_DOCUMENTS.length - missingRequiredDocuments.length}/
            {REQUIRED_DOCUMENTS.length}
          </h2>

          <p>
            <T
              en="Commercial registration, national address, and zakat certificate are required."
              ar="السجل التجاري، العنوان الوطني، وشهادة الزكاة مطلوبة."
            />
          </p>
        </div>

        <div className="card">
          <span className="badge">
            <T en="Agreement" ar="العقد" />
          </span>

          <h2>{agreementSigned ? "Signed" : "Not signed"}</h2>

          <p>
            {agreementSigned ? (
              <T en="Electronic agreement completed." ar="تم توقيع العقد الإلكتروني." />
            ) : (
              <T en="Agreement must be signed before submission." ar="يجب توقيع العقد قبل الإرسال." />
            )}
          </p>
        </div>
      </div>

      <div style={{ height: 24 }} />

      {studios?.length ? (
        <div className="card">
          <span className="badge">
            <T en="Your Studios" ar="استوديوهاتك" />
          </span>

          <h2>
            <T en="Booking activation depends on approval" ar="تفعيل الحجز يعتمد على الاعتماد" />
          </h2>

          <div className="owner-studio-compliance-list">
            {studios.map((studio) => (
              <div key={studio.id}>
                <strong>{studio.name}</strong>
                <span className="badge">{studio.status}</span>
                <span className="badge">
                  {studio.booking_enabled ? "Bookable" : "Not bookable"}
                </span>
                <span className="badge">
                  {studio.owner_compliance_status || "incomplete"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div style={{ height: 24 }} />

      <form className="form owner-onboarding-form" action={saveOwnerOnboarding}>
        <div className="card">
          <span className="badge">
            <T en="Company Details" ar="بيانات الشركة" />
          </span>

          <h2>
            <T en="Legal business information" ar="البيانات القانونية للمنشأة" />
          </h2>

          <label>
            <T en="Company legal name" ar="الاسم القانوني للشركة" />
          </label>
          <input
            className="input"
            name="company_legal_name"
            defaultValue={complianceProfile?.company_legal_name || ""}
            required
          />

          <label>
            <T en="Company trade name" ar="الاسم التجاري" />
          </label>
          <input
            className="input"
            name="company_trade_name"
            defaultValue={complianceProfile?.company_trade_name || ""}
          />

          <label>
            <T en="Commercial registration number" ar="رقم السجل التجاري" />
          </label>
          <input
            className="input"
            name="commercial_registration_number"
            defaultValue={complianceProfile?.commercial_registration_number || ""}
            required
          />

          <label>
            <T en="VAT number" ar="الرقم الضريبي" />
          </label>
          <input
            className="input"
            name="vat_number"
            defaultValue={complianceProfile?.vat_number || ""}
          />

          <label>
            <T en="Zakat certificate number" ar="رقم شهادة الزكاة" />
          </label>
          <input
            className="input"
            name="zakat_certificate_number"
            defaultValue={complianceProfile?.zakat_certificate_number || ""}
          />
        </div>

        <div className="card">
          <span className="badge">
            <T en="National Address" ar="العنوان الوطني" />
          </span>

          <h2>
            <T en="Official address details" ar="بيانات العنوان الرسمي" />
          </h2>

          <label>
            <T en="Building number" ar="رقم المبنى" />
          </label>
          <input
            className="input"
            name="national_address_building_number"
            defaultValue={complianceProfile?.national_address_building_number || ""}
          />

          <label>
            <T en="Street" ar="الشارع" />
          </label>
          <input
            className="input"
            name="national_address_street"
            defaultValue={complianceProfile?.national_address_street || ""}
          />

          <label>
            <T en="District" ar="الحي" />
          </label>
          <input
            className="input"
            name="national_address_district"
            defaultValue={complianceProfile?.national_address_district || ""}
          />

          <label>
            <T en="City" ar="المدينة" />
          </label>
          <input
            className="input"
            name="national_address_city"
            defaultValue={complianceProfile?.national_address_city || ""}
            required
          />

          <label>
            <T en="Postal code" ar="الرمز البريدي" />
          </label>
          <input
            className="input"
            name="national_address_postal_code"
            defaultValue={complianceProfile?.national_address_postal_code || ""}
          />

          <label>
            <T en="Additional number" ar="الرقم الإضافي" />
          </label>
          <input
            className="input"
            name="national_address_additional_number"
            defaultValue={complianceProfile?.national_address_additional_number || ""}
          />
        </div>

        <div className="card">
          <span className="badge">
            <T en="Invoicing & Finance" ar="الفوترة والمالية" />
          </span>

          <h2>
            <T en="Invoice and settlement details" ar="بيانات الفواتير والتسويات" />
          </h2>

          <label>
            <T en="Invoice email" ar="إيميل الفواتير" />
          </label>
          <input
            className="input"
            name="invoice_email"
            type="email"
            defaultValue={complianceProfile?.invoice_email || profile?.email || user.email || ""}
            required
          />

          <label>
            <T en="Finance contact name" ar="اسم مسؤول المالية" />
          </label>
          <input
            className="input"
            name="finance_contact_name"
            defaultValue={complianceProfile?.finance_contact_name || ""}
          />

          <label>
            <T en="Finance contact phone" ar="رقم مسؤول المالية" />
          </label>
          <input
            className="input"
            name="finance_contact_phone"
            defaultValue={complianceProfile?.finance_contact_phone || ""}
          />

          <label>
            <T en="Bank name" ar="اسم البنك" />
          </label>
          <input
            className="input"
            name="bank_name"
            defaultValue={complianceProfile?.bank_name || ""}
          />

          <label>IBAN</label>
          <input
            className="input"
            name="iban"
            defaultValue={complianceProfile?.iban || ""}
          />

          <label>
            <T en="Beneficiary name" ar="اسم المستفيد" />
          </label>
          <input
            className="input"
            name="beneficiary_name"
            defaultValue={complianceProfile?.beneficiary_name || ""}
          />
        </div>

        <div className="card">
          <span className="badge">
            <T en="Documents" ar="الوثائق" />
          </span>

          <h2>
            <T en="Upload official documents" ar="رفع الوثائق الرسمية" />
          </h2>

          <p>
            <T
              en="Accepted files: PDF, PNG, JPG, WEBP. Maximum file size: 10MB."
              ar="الملفات المقبولة: PDF, PNG, JPG, WEBP. الحد الأقصى: 10MB."
            />
          </p>

          <div className="owner-document-upload-grid">
            <div>
              <label>
                <T en="Commercial registration" ar="السجل التجاري" /> *
              </label>
              <input
                className="input"
                name="commercial_registration_file"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
              />
            </div>

            <div>
              <label>
                <T en="National address" ar="العنوان الوطني" /> *
              </label>
              <input
                className="input"
                name="national_address_file"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
              />
            </div>

            <div>
              <label>
                <T en="Zakat certificate" ar="شهادة الزكاة" /> *
              </label>
              <input
                className="input"
                name="zakat_certificate_file"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
              />
            </div>

            <div>
              <label>
                <T en="VAT certificate" ar="شهادة الضريبة" />
              </label>
              <input
                className="input"
                name="vat_certificate_file"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
              />
            </div>

            <div>
              <label>
                <T en="Bank certificate" ar="شهادة البنك" />
              </label>
              <input
                className="input"
                name="bank_certificate_file"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
              />
            </div>

            <div>
              <label>
                <T en="Authorized signatory ID" ar="هوية المفوض بالتوقيع" />
              </label>
              <input
                className="input"
                name="authorized_signatory_id_file"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
              />
            </div>
          </div>

          <div className="owner-uploaded-documents">
            {(documents || []).length ? (
              documents?.map((doc) => (
                <div key={doc.id}>
                  <strong>{documentLabel(doc.document_type)}</strong>
                  <span className="badge">{doc.status}</span>
                  <p className="admin-muted-line">{doc.file_name}</p>
                </div>
              ))
            ) : (
              <p className="admin-muted-line">
                <T en="No documents uploaded yet." ar="لم يتم رفع وثائق بعد." />
              </p>
            )}
          </div>
        </div>

        <div className="card owner-agreement-card">
          <span className="badge">
            <T en="Electronic Agreement" ar="العقد الإلكتروني" />
          </span>

          <h2>
            <T en="Studio Owner Agreement" ar="عقد صاحب الاستوديو" />
          </h2>

          <p>
            <T
              en="By signing, you confirm that all company, tax, invoicing, banking, and document information is accurate. You also agree to GearBeat platform rules, booking standards, review rules, settlement rules, and operating standards."
              ar="بالتوقيع، تؤكد أن جميع بيانات الشركة، الضريبة، الفوترة، البنك، والوثائق صحيحة. كما توافق على قواعد منصة GearBeat، معايير الحجز، التقييمات، التسويات، ومعايير التشغيل."
            />
          </p>

          {agreementSigned ? (
            <div className="success">
              <T en="Agreement already signed." ar="تم توقيع العقد مسبقًا." />
            </div>
          ) : (
            <label className="owner-agreement-checkbox">
              <input type="checkbox" name="sign_agreement" value="yes" />
              <span>
                <T
                  en="I agree and electronically sign the Studio Owner Agreement."
                  ar="أوافق وأوقع إلكترونيًا على عقد صاحب الاستوديو."
                />
              </span>
            </label>
          )}
        </div>

        <div className="owner-onboarding-actions card">
          <span className="badge">
            <T en="Final Step" ar="الخطوة الأخيرة" />
          </span>

          <h2>
            <T en="Save or submit for review" ar="احفظ أو أرسل للمراجعة" />
          </h2>

          <p>
            <T
              en="Saving keeps the profile as draft. Submitting sends it to GearBeat admin for approval."
              ar="الحفظ يبقي الملف كمسودة. الإرسال يرسله إلى إدارة GearBeat للمراجعة والاعتماد."
            />
          </p>

          <div className="actions">
            <button className="btn btn-secondary" type="submit" name="intent" value="save">
              <T en="Save Draft" ar="حفظ كمسودة" />
            </button>

            <button className="btn" type="submit" name="intent" value="submit">
              <T en="Submit for Review" ar="إرسال للمراجعة" />
            </button>

            <Link href="/owner" className="btn btn-secondary">
              <T en="Back to Owner Dashboard" ar="العودة للوحة صاحب الاستوديو" />
            </Link>
          </div>
        </div>
      </form>
    </section>
  );
}
