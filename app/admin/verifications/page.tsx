import { revalidatePath } from "next/cache";
import T from "@/components/t";
import { requireAdminLayoutAccess } from "@/lib/route-guards";

const ALLOWED_VERIFICATION_STATUSES = [
  "not_started",
  "pending",
  "verified",
  "approved",
  "rejected",
  "needs_more_info",
  "expired",
] as const;

const ALLOWED_DOCUMENT_STATUSES = [
  "pending",
  "approved",
  "rejected",
] as const;

type VerificationStatus = (typeof ALLOWED_VERIFICATION_STATUSES)[number];
type DocumentStatus = (typeof ALLOWED_DOCUMENT_STATUSES)[number];

function getText(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function isAllowedVerificationStatus(
  status: string
): status is VerificationStatus {
  return ALLOWED_VERIFICATION_STATUSES.includes(status as VerificationStatus);
}

function isAllowedDocumentStatus(status: string): status is DocumentStatus {
  return ALLOWED_DOCUMENT_STATUSES.includes(status as DocumentStatus);
}

function formatDate(value: unknown) {
  if (!value) {
    return "—";
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-SA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function getBadgeClass(status: string | null | undefined) {
  if (status === "verified" || status === "approved") {
    return "badge badge-success";
  }

  if (status === "pending" || status === "needs_more_info") {
    return "badge badge-warning";
  }

  if (status === "rejected" || status === "expired") {
    return "badge badge-danger";
  }

  return "badge";
}

async function getSignedDocumentUrl({
  supabaseAdmin,
  bucket,
  filePath,
}: {
  supabaseAdmin: any;
  bucket: string;
  filePath: string;
}) {
  if (!bucket || !filePath) {
    return null;
  }

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(filePath, 60 * 10);

  if (error) {
    console.error("Could not create signed document URL:", error);
    return null;
  }

  return data?.signedUrl || null;
}

export default async function AdminVerificationsPage() {
  const { supabaseAdmin } = await requireAdminLayoutAccess();

  const [
    userVerificationsResult,
    businessVerificationsResult,
    documentsResult,
  ] = await Promise.all([
    supabaseAdmin
      .from("user_verifications")
      .select(`
        id,
        auth_user_id,
        country_code,
        verification_type,
        identity_type,
        identity_number_masked,
        status,
        rejection_reason,
        notes,
        submitted_at,
        reviewed_at,
        expires_at,
        created_at
      `)
      .order("created_at", { ascending: false })
      .limit(30),

    supabaseAdmin
      .from("business_verifications")
      .select(`
        id,
        auth_user_id,
        entity_type,
        entity_id,
        country_code,
        business_type,
        legal_name,
        registration_number,
        tax_number,
        municipal_license_number,
        address_line,
        district,
        status,
        rejection_reason,
        notes,
        submitted_at,
        reviewed_at,
        expires_at,
        created_at
      `)
      .order("created_at", { ascending: false })
      .limit(30),

    supabaseAdmin
      .from("verification_documents")
      .select(`
        id,
        auth_user_id,
        verification_id,
        verification_scope,
        document_type,
        file_bucket,
        file_path,
        original_filename,
        mime_type,
        file_size_bytes,
        status,
        rejection_reason,
        uploaded_at,
        reviewed_at,
        created_at
      `)
      .order("created_at", { ascending: false })
      .limit(40),
  ]);

  if (userVerificationsResult.error) {
    throw new Error(userVerificationsResult.error.message);
  }

  if (businessVerificationsResult.error) {
    throw new Error(businessVerificationsResult.error.message);
  }

  if (documentsResult.error) {
    throw new Error(documentsResult.error.message);
  }

  const userVerifications = userVerificationsResult.data || [];
  const businessVerifications = businessVerificationsResult.data || [];
  const rawDocuments = documentsResult.data || [];

  const profileAuthUserIds = Array.from(
    new Set([
      ...userVerifications.map((item: any) => item.auth_user_id).filter(Boolean),
      ...businessVerifications
        .map((item: any) => item.auth_user_id)
        .filter(Boolean),
      ...rawDocuments.map((item: any) => item.auth_user_id).filter(Boolean),
    ])
  );

  const { data: profiles, error: profilesError } =
    profileAuthUserIds.length > 0
      ? await supabaseAdmin
          .from("profiles")
          .select("auth_user_id, full_name, email, role, country_code, phone_e164")
          .in("auth_user_id", profileAuthUserIds)
      : { data: [], error: null };

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const documents = await Promise.all(
    rawDocuments.map(async (document: any) => ({
      ...document,
      signedUrl: await getSignedDocumentUrl({
        supabaseAdmin,
        bucket: document.file_bucket,
        filePath: document.file_path,
      }),
    }))
  );

  function getProfile(authUserId: string) {
    return (profiles || []).find(
      (profile: any) => profile.auth_user_id === authUserId
    );
  }

  async function updateUserVerificationStatus(formData: FormData) {
    "use server";

    const { supabaseAdmin } = await requireAdminLayoutAccess();

    const verificationId = getText(formData, "verification_id");
    const status = getText(formData, "status");
    const rejectionReason = getText(formData, "rejection_reason");

    if (!verificationId) {
      throw new Error("Missing verification id.");
    }

    if (!isAllowedVerificationStatus(status)) {
      throw new Error("Invalid verification status.");
    }

    const payload: Record<string, unknown> = {
      status,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (status === "rejected" || status === "needs_more_info") {
      payload.rejection_reason = rejectionReason || "No reason provided.";
    } else {
      payload.rejection_reason = null;
    }

    const { error } = await supabaseAdmin
      .from("user_verifications")
      .update(payload)
      .eq("id", verificationId);

    if (error) {
      throw new Error(error.message);
    }

    if (status === "verified") {
      const { data: verification } = await supabaseAdmin
        .from("user_verifications")
        .select("auth_user_id")
        .eq("id", verificationId)
        .maybeSingle();

      if (verification?.auth_user_id) {
        await supabaseAdmin
          .from("profiles")
          .update({
            identity_verification_status: "verified",
            updated_at: new Date().toISOString(),
          })
          .eq("auth_user_id", verification.auth_user_id);
      }
    }

    revalidatePath("/admin/verifications");
  }

  async function updateBusinessVerificationStatus(formData: FormData) {
    "use server";

    const { supabaseAdmin } = await requireAdminLayoutAccess();

    const verificationId = getText(formData, "verification_id");
    const status = getText(formData, "status");
    const rejectionReason = getText(formData, "rejection_reason");

    if (!verificationId) {
      throw new Error("Missing verification id.");
    }

    if (!isAllowedVerificationStatus(status)) {
      throw new Error("Invalid verification status.");
    }

    const payload: Record<string, unknown> = {
      status,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (status === "rejected" || status === "needs_more_info") {
      payload.rejection_reason = rejectionReason || "No reason provided.";
    } else {
      payload.rejection_reason = null;
    }

    const { error } = await supabaseAdmin
      .from("business_verifications")
      .update(payload)
      .eq("id", verificationId);

    if (error) {
      throw new Error(error.message);
    }

    const { data: verification } = await supabaseAdmin
      .from("business_verifications")
      .select("auth_user_id, entity_type, entity_id")
      .eq("id", verificationId)
      .maybeSingle();

    if (verification?.entity_type === "vendor" && verification.auth_user_id) {
      await supabaseAdmin
        .from("vendor_profiles")
        .update({
          business_verification_status:
            status === "approved" || status === "verified"
              ? "approved"
              : status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", verification.auth_user_id);
    }

    revalidatePath("/admin/verifications");
    revalidatePath("/admin/vendors");
  }

  async function updateDocumentStatus(formData: FormData) {
    "use server";

    const { supabaseAdmin } = await requireAdminLayoutAccess();

    const documentId = getText(formData, "document_id");
    const status = getText(formData, "status");
    const rejectionReason = getText(formData, "rejection_reason");

    if (!documentId) {
      throw new Error("Missing document id.");
    }

    if (!isAllowedDocumentStatus(status)) {
      throw new Error("Invalid document status.");
    }

    const payload: Record<string, unknown> = {
      status,
      reviewed_at: new Date().toISOString(),
    };

    if (status === "rejected") {
      payload.rejection_reason = rejectionReason || "No reason provided.";
    } else {
      payload.rejection_reason = null;
    }

    const { error } = await supabaseAdmin
      .from("verification_documents")
      .update(payload)
      .eq("id", documentId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/verifications");
  }

  const pendingUserCount = userVerifications.filter(
    (item: any) => item.status === "pending"
  ).length;

  const pendingBusinessCount = businessVerifications.filter(
    (item: any) => item.status === "pending"
  ).length;

  const pendingDocumentCount = documents.filter(
    (item: any) => item.status === "pending"
  ).length;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <span className="badge">
          <T en="Verification Center" ar="مركز التحقق" />
        </span>

        <h1>
          <T en="Admin Verification Center" ar="مركز تحقق الإدارة" />
        </h1>

        <p>
          <T
            en="Review customer identities, business verifications, and uploaded documents."
            ar="راجع هويات العملاء، وتحقق المنشآت، والوثائق المرفوعة."
          />
        </p>
      </div>

      <div className="stats-grid" style={{ marginTop: 30 }}>
        <div className="card stat-card">
          <div className="stat-icon">🪪</div>
          <div className="stat-content">
            <label>
              <T en="Pending User Verifications" ar="تحقق مستخدمين معلق" />
            </label>
            <div className="stat-value">{pendingUserCount}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <label>
              <T en="Pending Business Verifications" ar="تحقق منشآت معلق" />
            </label>
            <div className="stat-value">{pendingBusinessCount}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">📎</div>
          <div className="stat-content">
            <label>
              <T en="Pending Documents" ar="وثائق معلقة" />
            </label>
            <div className="stat-value">{pendingDocumentCount}</div>
          </div>
        </div>
      </div>

      <section className="card" style={{ marginTop: 30 }}>
        <h2>
          <T en="User Identity Verifications" ar="تحقق هويات المستخدمين" />
        </h2>

        <div className="table-responsive" style={{ marginTop: 20 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Type</th>
                <th>Identity</th>
                <th>Status</th>
                <th>Created</th>
                <th>Decision</th>
              </tr>
            </thead>

            <tbody>
              {userVerifications.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 30 }}>
                    <T en="No user verifications found." ar="لا توجد طلبات تحقق مستخدمين." />
                  </td>
                </tr>
              ) : (
                userVerifications.map((verification: any) => {
                  const profile = getProfile(verification.auth_user_id);

                  return (
                    <tr key={verification.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>
                          {profile?.full_name || "—"}
                        </div>
                        <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                          {profile?.email || verification.auth_user_id}
                        </div>
                      </td>

                      <td>{verification.verification_type || "identity"}</td>

                      <td>
                        <div>{verification.identity_type || "—"}</div>
                        <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                          {verification.identity_number_masked || "—"}
                        </div>
                      </td>

                      <td>
                        <span className={getBadgeClass(verification.status)}>
                          {verification.status}
                        </span>
                      </td>

                      <td>{formatDate(verification.created_at)}</td>

                      <td>
                        <div style={{ display: "grid", gap: 8 }}>
                          <form action={updateUserVerificationStatus}>
                            <input type="hidden" name="verification_id" value={verification.id} />
                            <input type="hidden" name="status" value="verified" />
                            <button className="btn btn-small btn-success" type="submit">
                              Approve
                            </button>
                          </form>

                          <form action={updateUserVerificationStatus}>
                            <input type="hidden" name="verification_id" value={verification.id} />
                            <input type="hidden" name="status" value="rejected" />
                            <input
                              name="rejection_reason"
                              className="input"
                              placeholder="Reason"
                            />
                            <button className="btn btn-small btn-danger" type="submit">
                              Reject
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginTop: 30 }}>
        <h2>
          <T en="Business Verifications" ar="تحقق المنشآت" />
        </h2>

        <div className="table-responsive" style={{ marginTop: 20 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Entity</th>
                <th>Registration</th>
                <th>Status</th>
                <th>Created</th>
                <th>Decision</th>
              </tr>
            </thead>

            <tbody>
              {businessVerifications.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 30 }}>
                    <T en="No business verifications found." ar="لا توجد طلبات تحقق منشآت." />
                  </td>
                </tr>
              ) : (
                businessVerifications.map((verification: any) => {
                  const profile = getProfile(verification.auth_user_id);

                  return (
                    <tr key={verification.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>
                          {verification.legal_name || profile?.full_name || "—"}
                        </div>
                        <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                          {profile?.email || verification.auth_user_id}
                        </div>
                      </td>

                      <td>
                        <div>{verification.entity_type}</div>
                        <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                          {verification.business_type || "—"}
                        </div>
                      </td>

                      <td>
                        <div>{verification.registration_number || "—"}</div>
                        <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                          Tax: {verification.tax_number || "—"}
                        </div>
                      </td>

                      <td>
                        <span className={getBadgeClass(verification.status)}>
                          {verification.status}
                        </span>
                      </td>

                      <td>{formatDate(verification.created_at)}</td>

                      <td>
                        <div style={{ display: "grid", gap: 8 }}>
                          <form action={updateBusinessVerificationStatus}>
                            <input type="hidden" name="verification_id" value={verification.id} />
                            <input type="hidden" name="status" value="approved" />
                            <button className="btn btn-small btn-success" type="submit">
                              Approve
                            </button>
                          </form>

                          <form action={updateBusinessVerificationStatus}>
                            <input type="hidden" name="verification_id" value={verification.id} />
                            <input type="hidden" name="status" value="rejected" />
                            <input
                              name="rejection_reason"
                              className="input"
                              placeholder="Reason"
                            />
                            <button className="btn btn-small btn-danger" type="submit">
                              Reject
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginTop: 30 }}>
        <h2>
          <T en="Uploaded Documents" ar="الوثائق المرفوعة" />
        </h2>

        <p style={{ color: "var(--muted)", marginTop: 8 }}>
          <T
            en="Private document links are temporary and expire after a short time."
            ar="روابط الوثائق الخاصة مؤقتة وتنتهي بعد وقت قصير."
          />
        </p>

        <div className="table-responsive" style={{ marginTop: 20 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Document</th>
                <th>Scope</th>
                <th>Status</th>
                <th>Uploaded</th>
                <th>Open</th>
                <th>Decision</th>
              </tr>
            </thead>

            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 30 }}>
                    <T en="No documents found." ar="لا توجد وثائق." />
                  </td>
                </tr>
              ) : (
                documents.map((document: any) => {
                  const profile = getProfile(document.auth_user_id);

                  return (
                    <tr key={document.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>
                          {profile?.full_name || "—"}
                        </div>
                        <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                          {profile?.email || document.auth_user_id}
                        </div>
                      </td>

                      <td>
                        <div>{document.document_type}</div>
                        <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                          {document.original_filename || "—"}
                        </div>
                      </td>

                      <td>{document.verification_scope}</td>

                      <td>
                        <span className={getBadgeClass(document.status)}>
                          {document.status}
                        </span>
                      </td>

                      <td>{formatDate(document.uploaded_at)}</td>

                      <td>
                        {document.signedUrl ? (
                          <a
                            href={document.signedUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-small"
                          >
                            Open
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td>
                        <div style={{ display: "grid", gap: 8 }}>
                          <form action={updateDocumentStatus}>
                            <input type="hidden" name="document_id" value={document.id} />
                            <input type="hidden" name="status" value="approved" />
                            <button className="btn btn-small btn-success" type="submit">
                              Approve
                            </button>
                          </form>

                          <form action={updateDocumentStatus}>
                            <input type="hidden" name="document_id" value={document.id} />
                            <input type="hidden" name="status" value="rejected" />
                            <input
                              name="rejection_reason"
                              className="input"
                              placeholder="Reason"
                            />
                            <button className="btn btn-small btn-danger" type="submit">
                              Reject
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
