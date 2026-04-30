import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireAdminRole } from "../../../lib/admin";
import { createAdminClient } from "../../../lib/supabase/admin";
import T from "../../../components/t";

function statusStyle(status: string) {
  if (status === "approved") {
    return {
      background: "rgba(103, 197, 135, 0.18)",
      color: "var(--gb-success)",
      border: "1px solid rgba(103, 197, 135, 0.45)"
    };
  }

  if (status === "pending_review" || status === "submitted" || status === "under_review") {
    return {
      background: "rgba(53, 216, 255, 0.16)",
      color: "var(--gb-blue)",
      border: "1px solid rgba(53, 216, 255, 0.42)"
    };
  }

  if (status === "rejected") {
    return {
      background: "rgba(226, 109, 90, 0.18)",
      color: "var(--gb-danger)",
      border: "1px solid rgba(226, 109, 90, 0.45)"
    };
  }

  return {
    background: "rgba(255, 193, 7, 0.18)",
    color: "var(--gb-warning)",
    border: "1px solid rgba(255, 193, 7, 0.45)"
  };
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

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return "—";
  }
}

export default async function AdminOwnerCompliancePage() {
  const { admin, user } = await requireAdminRole(["operations", "support", "content"]);
  const supabaseAdmin = createAdminClient();

  const canReview =
    admin.admin_role === "super_admin" ||
    admin.admin_role === "operations" ||
    admin.admin_role === "support";

  async function updateComplianceReview(formData: FormData) {
    "use server";

    const { user, admin } = await requireAdminRole(["operations", "support"]);
    const supabaseAdmin = createAdminClient();

    const profileId = String(formData.get("profile_id") || "");
    const ownerAuthUserId = String(formData.get("owner_auth_user_id") || "");
    const action = String(formData.get("action") || "");
    const adminNotes = String(formData.get("admin_notes") || "").trim();

    const canUpdate =
      admin.admin_role === "super_admin" ||
      admin.admin_role === "operations" ||
      admin.admin_role === "support";

    if (!canUpdate) {
      throw new Error("You do not have permission to review owner compliance.");
    }

    if (!profileId || !ownerAuthUserId) {
      throw new Error("Missing compliance profile details.");
    }

    if (!["approve", "reject", "under_review"].includes(action)) {
      throw new Error("Invalid review action.");
    }

    if (action === "approve") {
      const { error: profileError } = await supabaseAdmin
        .from("owner_compliance_profiles")
        .update({
          onboarding_status: "approved",
          admin_review_status: "approved",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          admin_notes: adminNotes || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", profileId)
        .eq("owner_auth_user_id", ownerAuthUserId);

      if (profileError) {
        throw new Error(profileError.message);
      }

      await supabaseAdmin
        .from("owner_compliance_documents")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq("owner_auth_user_id", ownerAuthUserId)
        .eq("status", "uploaded");

      await supabaseAdmin
        .from("studios")
        .update({
          owner_compliance_status: "approved",
          booking_enabled: true,
          updated_at: new Date().toISOString()
        })
        .eq("owner_auth_user_id", ownerAuthUserId)
        .eq("status", "approved");

      await supabaseAdmin
        .from("studios")
        .update({
          owner_compliance_status: "approved",
          booking_enabled: false,
          updated_at: new Date().toISOString()
        })
        .eq("owner_auth_user_id", ownerAuthUserId)
        .neq("status", "approved");
    }

    if (action === "reject") {
      const { error: profileError } = await supabaseAdmin
        .from("owner_compliance_profiles")
        .update({
          onboarding_status: "rejected",
          admin_review_status: "rejected",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          admin_notes: adminNotes || "Rejected by admin.",
          updated_at: new Date().toISOString()
        })
        .eq("id", profileId)
        .eq("owner_auth_user_id", ownerAuthUserId);

      if (profileError) {
        throw new Error(profileError.message);
      }

      await supabaseAdmin
        .from("studios")
        .update({
          owner_compliance_status: "rejected",
          booking_enabled: false,
          updated_at: new Date().toISOString()
        })
        .eq("owner_auth_user_id", ownerAuthUserId);
    }

    if (action === "under_review") {
      const { error: profileError } = await supabaseAdmin
        .from("owner_compliance_profiles")
        .update({
          onboarding_status: "under_review",
          admin_review_status: "pending_review",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          admin_notes: adminNotes || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", profileId)
        .eq("owner_auth_user_id", ownerAuthUserId);

      if (profileError) {
        throw new Error(profileError.message);
      }

      await supabaseAdmin
        .from("studios")
        .update({
          owner_compliance_status: "under_review",
          booking_enabled: false,
          updated_at: new Date().toISOString()
        })
        .eq("owner_auth_user_id", ownerAuthUserId);
    }

    await supabaseAdmin.from("audit_logs").insert({
      actor_auth_user_id: user.id,
      actor_email: user.email,
      action: `owner_compliance_${action}`,
      entity_type: "owner_compliance_profile",
      entity_id: profileId,
      old_values: null,
      new_values: {
        action,
        owner_auth_user_id: ownerAuthUserId
      },
      metadata: {
        admin_role: admin.admin_role,
        admin_notes: adminNotes || null
      }
    });

    revalidatePath("/admin/owner-compliance");
    revalidatePath("/admin/studios");
    revalidatePath("/admin");
    revalidatePath("/owner/onboarding");
  }

  const { data: complianceProfiles, error } = await supabaseAdmin
    .from("owner_compliance_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const ownerIds = Array.from(
    new Set(
      (complianceProfiles || [])
        .map((profile) => profile.owner_auth_user_id)
        .filter(Boolean)
    )
  );

  const { data: ownerProfiles } = ownerIds.length
    ? await supabaseAdmin
        .from("profiles")
        .select("auth_user_id, full_name, email, phone, role, account_status")
        .in("auth_user_id", ownerIds)
    : { data: [] };

  const { data: documents } = ownerIds.length
    ? await supabaseAdmin
        .from("owner_compliance_documents")
        .select("*")
        .in("owner_auth_user_id", ownerIds)
        .neq("status", "replaced")
        .order("uploaded_at", { ascending: false })
    : { data: [] };

  const { data: agreements } = ownerIds.length
    ? await supabaseAdmin
        .from("owner_agreements")
        .select("*")
        .in("owner_auth_user_id", ownerIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  const { data: studios } = ownerIds.length
    ? await supabaseAdmin
        .from("studios")
        .select("id, name, status, booking_enabled, owner_compliance_status, owner_auth_user_id")
        .in("owner_auth_user_id", ownerIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  const ownerProfileMap = new Map(
    (ownerProfiles || []).map((profile) => [profile.auth_user_id, profile])
  );

  const documentsByOwner = new Map<string, any[]>();
  for (const doc of documents || []) {
    const list = documentsByOwner.get(doc.owner_auth_user_id) || [];
    list.push(doc);
    documentsByOwner.set(doc.owner_auth_user_id, list);
  }

  const agreementsByOwner = new Map<string, any>();
  for (const agreement of agreements || []) {
    if (!agreementsByOwner.has(agreement.owner_auth_user_id)) {
      agreementsByOwner.set(agreement.owner_auth_user_id, agreement);
    }
  }

  const studiosByOwner = new Map<string, any[]>();
  for (const studio of studios || []) {
    const list = studiosByOwner.get(studio.owner_auth_user_id) || [];
    list.push(studio);
    studiosByOwner.set(studio.owner_auth_user_id, list);
  }

  const totalProfiles = complianceProfiles?.length || 0;
  const pendingProfiles =
    complianceProfiles?.filter(
      (profile) =>
        profile.admin_review_status === "pending_review" ||
        profile.onboarding_status === "submitted" ||
        profile.onboarding_status === "under_review"
    ).length || 0;
  const approvedProfiles =
    complianceProfiles?.filter((profile) => profile.admin_review_status === "approved").length || 0;
  const rejectedProfiles =
    complianceProfiles?.filter((profile) => profile.admin_review_status === "rejected").length || 0;

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Admin" ar="الإدارة" />
        </span>

        <h1>
          <T en="Owner Compliance Review" ar="مراجعة بيانات ملاك الاستوديوهات" />
        </h1>

        <p>
          <T
            en="Review company details, official documents, invoicing information, and electronic agreements before activating bookings."
            ar="راجع بيانات الشركة، الوثائق الرسمية، معلومات الفوترة، والعقود الإلكترونية قبل تفعيل الحجوزات."
          />
        </p>
      </div>

      <div className="actions" style={{ marginBottom: 24 }}>
        <Link href="/admin" className="btn btn-secondary">
          <T en="Back to Admin Dashboard" ar="العودة إلى لوحة الإدارة" />
        </Link>

        <Link href="/admin/studios" className="btn btn-secondary">
          <T en="Studios" ar="الاستوديوهات" />
        </Link>
      </div>

      <div className="admin-kpi-grid">
        <div className="card admin-kpi-card">
          <span>
            <T en="Total Owners" ar="إجمالي الملاك" />
          </span>
          <strong>{totalProfiles}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Pending Review" ar="قيد المراجعة" />
          </span>
          <strong>{pendingProfiles}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Approved" ar="معتمد" />
          </span>
          <strong>{approvedProfiles}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Rejected" ar="مرفوض" />
          </span>
          <strong>{rejectedProfiles}</strong>
        </div>
      </div>

      <div style={{ height: 24 }} />

      {error ? (
        <div className="card">
          <span className="badge">
            <T en="Error" ar="خطأ" />
          </span>
          <p>{error.message}</p>
        </div>
      ) : null}

      <div className="owner-compliance-list">
        {complianceProfiles?.length ? (
          complianceProfiles.map((complianceProfile) => {
            const ownerProfile = ownerProfileMap.get(
              complianceProfile.owner_auth_user_id
            );

            const ownerDocuments =
              documentsByOwner.get(complianceProfile.owner_auth_user_id) || [];

            const ownerAgreement = agreementsByOwner.get(
              complianceProfile.owner_auth_user_id
            );

            const ownerStudios =
              studiosByOwner.get(complianceProfile.owner_auth_user_id) || [];

            return (
              <div className="card owner-compliance-admin-card" key={complianceProfile.id}>
                <div className="owner-compliance-admin-head">
                  <div>
                    <span className="badge">
                      <T en="Owner" ar="مالك الاستوديو" />
                    </span>

                    <h2>
                      {ownerProfile?.full_name ||
                        complianceProfile.company_trade_name ||
                        complianceProfile.company_legal_name ||
                        "Studio Owner"}
                    </h2>

                    <p>
                      {ownerProfile?.email || "No owner email"} ·{" "}
                      {ownerProfile?.phone || "No phone"}
                    </p>
                  </div>

                  <div className="admin-badge-stack">
                    <span
                      className="badge"
                      style={statusStyle(complianceProfile.onboarding_status)}
                    >
                      {complianceProfile.onboarding_status}
                    </span>

                    <span
                      className="badge"
                      style={statusStyle(complianceProfile.admin_review_status)}
                    >
                      {complianceProfile.admin_review_status}
                    </span>
                  </div>
                </div>

                <div className="owner-compliance-admin-grid">
                  <div>
                    <h3>
                      <T en="Company" ar="الشركة" />
                    </h3>

                    <p>
                      <strong>
                        <T en="Legal name:" ar="الاسم القانوني:" />
                      </strong>{" "}
                      {complianceProfile.company_legal_name || "—"}
                    </p>

                    <p>
                      <strong>
                        <T en="Trade name:" ar="الاسم التجاري:" />
                      </strong>{" "}
                      {complianceProfile.company_trade_name || "—"}
                    </p>

                    <p>
                      <strong>
                        <T en="CR number:" ar="رقم السجل التجاري:" />
                      </strong>{" "}
                      {complianceProfile.commercial_registration_number || "—"}
                    </p>

                    <p>
                      <strong>
                        <T en="VAT number:" ar="الرقم الضريبي:" />
                      </strong>{" "}
                      {complianceProfile.vat_number || "—"}
                    </p>

                    <p>
                      <strong>
                        <T en="Zakat certificate:" ar="رقم شهادة الزكاة:" />
                      </strong>{" "}
                      {complianceProfile.zakat_certificate_number || "—"}
                    </p>
                  </div>

                  <div>
                    <h3>
                      <T en="National Address" ar="العنوان الوطني" />
                    </h3>

                    <p>
                      {[
                        complianceProfile.national_address_building_number,
                        complianceProfile.national_address_street,
                        complianceProfile.national_address_district,
                        complianceProfile.national_address_city,
                        complianceProfile.national_address_postal_code,
                        complianceProfile.national_address_additional_number
                      ]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </p>

                    <h3>
                      <T en="Finance" ar="المالية" />
                    </h3>

                    <p>
                      <strong>
                        <T en="Invoice email:" ar="إيميل الفواتير:" />
                      </strong>{" "}
                      {complianceProfile.invoice_email || "—"}
                    </p>

                    <p>
                      <strong>
                        <T en="Finance contact:" ar="مسؤول المالية:" />
                      </strong>{" "}
                      {complianceProfile.finance_contact_name || "—"}{" "}
                      {complianceProfile.finance_contact_phone
                        ? `· ${complianceProfile.finance_contact_phone}`
                        : ""}
                    </p>

                    <p>
                      <strong>
                        <T en="Bank:" ar="البنك:" />
                      </strong>{" "}
                      {complianceProfile.bank_name || "—"}
                    </p>

                    <p>
                      <strong>IBAN:</strong> {complianceProfile.iban || "—"}
                    </p>
                  </div>
                </div>

                <div className="owner-compliance-admin-grid">
                  <div>
                    <h3>
                      <T en="Documents" ar="الوثائق" />
                    </h3>

                    <div className="owner-admin-document-list">
                      {ownerDocuments.length ? (
                        ownerDocuments.map((doc) => (
                          <div key={doc.id}>
                            <strong>{documentLabel(doc.document_type)}</strong>
                            <span className="badge" style={statusStyle(doc.status)}>
                              {doc.status}
                            </span>
                            <p className="admin-muted-line">
                              {doc.file_name || doc.file_path}
                            </p>
                            <p className="admin-muted-line">
                              <T en="Uploaded:" ar="تاريخ الرفع:" />{" "}
                              {formatDate(doc.uploaded_at)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="admin-muted-line">
                          <T en="No documents uploaded." ar="لا توجد وثائق مرفوعة." />
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3>
                      <T en="Agreement" ar="العقد" />
                    </h3>

                    {ownerAgreement ? (
                      <div className="owner-admin-agreement-box">
                        <span
                          className="badge"
                          style={statusStyle(ownerAgreement.signed_status)}
                        >
                          {ownerAgreement.signed_status}
                        </span>

                        <p>
                          <strong>
                            <T en="Version:" ar="الإصدار:" />
                          </strong>{" "}
                          {ownerAgreement.agreement_version || "—"}
                        </p>

                        <p>
                          <strong>
                            <T en="Signer:" ar="الموقع:" />
                          </strong>{" "}
                          {ownerAgreement.signer_full_name || "—"}
                        </p>

                        <p>
                          <strong>
                            <T en="Signed at:" ar="تاريخ التوقيع:" />
                          </strong>{" "}
                          {formatDate(ownerAgreement.signed_at)}
                        </p>
                      </div>
                    ) : (
                      <p className="admin-muted-line">
                        <T en="Agreement not signed." ar="لم يتم توقيع العقد." />
                      </p>
                    )}

                    <h3>
                      <T en="Studios" ar="الاستوديوهات" />
                    </h3>

                    <div className="owner-admin-studio-list">
                      {ownerStudios.length ? (
                        ownerStudios.map((studio) => (
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
                        ))
                      ) : (
                        <p className="admin-muted-line">
                          <T en="No studios linked to this owner." ar="لا توجد استوديوهات مرتبطة بهذا المالك." />
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="owner-compliance-admin-review">
                  <h3>
                    <T en="Admin Review" ar="مراجعة الإدارة" />
                  </h3>

                  <p className="admin-muted-line">
                    <T en="Submitted:" ar="تاريخ الإرسال:" />{" "}
                    {formatDate(complianceProfile.submitted_at)}
                  </p>

                  <p className="admin-muted-line">
                    <T en="Reviewed:" ar="تاريخ المراجعة:" />{" "}
                    {formatDate(complianceProfile.reviewed_at)}
                  </p>

                  {complianceProfile.admin_notes ? (
                    <div className="admin-notes-meta">
                      <p>{complianceProfile.admin_notes}</p>
                    </div>
                  ) : null}

                  {canReview ? (
                    <form className="admin-review-form" action={updateComplianceReview}>
                      <input
                        type="hidden"
                        name="profile_id"
                        value={complianceProfile.id}
                      />

                      <input
                        type="hidden"
                        name="owner_auth_user_id"
                        value={complianceProfile.owner_auth_user_id}
                      />

                      <label>
                        <T en="Admin notes" ar="ملاحظات الإدارة" />
                      </label>

                      <textarea
                        className="input"
                        name="admin_notes"
                        rows={4}
                        placeholder="Internal notes..."
                        defaultValue={complianceProfile.admin_notes || ""}
                      />

                      <div className="admin-inline-action-grid">
                        <button
                          className="btn btn-secondary btn-small"
                          type="submit"
                          name="action"
                          value="under_review"
                        >
                          <T en="Mark Under Review" ar="قيد المراجعة" />
                        </button>

                        <button
                          className="btn btn-small"
                          type="submit"
                          name="action"
                          value="approve"
                        >
                          <T en="Approve Owner" ar="اعتماد المالك" />
                        </button>

                        <button
                          className="btn btn-secondary btn-small"
                          type="submit"
                          name="action"
                          value="reject"
                        >
                          <T en="Reject" ar="رفض" />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <span className="badge">
                      <T en="View only" ar="عرض فقط" />
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="card">
            <span className="badge">
              <T en="Empty" ar="فارغ" />
            </span>

            <h2>
              <T en="No owner compliance profiles found." ar="لا توجد ملفات امتثال لملاك الاستوديوهات." />
            </h2>
          </div>
        )}
      </div>
    </section>
  );
}
