import { revalidatePath } from "next/cache";
import T from "@/components/t";
import { requireAdminLayoutAccess } from "@/lib/route-guards";

const ALLOWED_VENDOR_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "suspended",
] as const;

type VendorStatus = (typeof ALLOWED_VENDOR_STATUSES)[number];

function getText(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function isAllowedVendorStatus(status: string): status is VendorStatus {
  return ALLOWED_VENDOR_STATUSES.includes(status as VendorStatus);
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
  if (status === "approved") {
    return "badge badge-success";
  }

  if (status === "pending" || status === "unsigned") {
    return "badge badge-warning";
  }

  if (status === "rejected" || status === "suspended" || status === "disabled") {
    return "badge badge-danger";
  }

  return "badge";
}

function getProfileForVendor(profiles: any[], vendorId: string) {
  return profiles.find((profile: any) => profile.auth_user_id === vendorId) || null;
}

export default async function AdminVendorsPage() {
  const { supabaseAdmin } = await requireAdminLayoutAccess();

  const { data: vendors, error: vendorsError } = await supabaseAdmin
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
      payout_status,
      commission_rate_default,
      created_at,
      updated_at
    `)
    .order("created_at", { ascending: false });

  if (vendorsError) {
    throw new Error(vendorsError.message);
  }

  const vendorRows = vendors || [];
  const vendorIds = vendorRows.map((vendor: any) => vendor.id);

  const { data: profiles, error: profilesError } =
    vendorIds.length > 0
      ? await supabaseAdmin
          .from("profiles")
          .select("auth_user_id, email, full_name, phone, role, account_status")
          .in("auth_user_id", vendorIds)
      : { data: [], error: null };

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  async function updateVendorStatus(formData: FormData) {
    "use server";

    const { supabaseAdmin } = await requireAdminLayoutAccess();

    const vendorId = getText(formData, "vendor_id");
    const status = getText(formData, "status");

    if (!vendorId) {
      throw new Error("Missing vendor id.");
    }

    if (!isAllowedVendorStatus(status)) {
      throw new Error("Invalid vendor status.");
    }

    const { data: existingVendor, error: existingVendorError } =
      await supabaseAdmin
        .from("vendor_profiles")
        .select("id, status")
        .eq("id", vendorId)
        .maybeSingle();

    if (existingVendorError) {
      throw new Error(existingVendorError.message);
    }

    if (!existingVendor) {
      throw new Error("Vendor profile not found.");
    }

    const updatePayload: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "approved") {
      updatePayload.compliance_status = "approved";
      updatePayload.payout_status = "pending";
    }

    if (status === "rejected") {
      updatePayload.compliance_status = "rejected";
    }

    if (status === "pending") {
      updatePayload.compliance_status = "pending";
      updatePayload.payout_status = "pending";
    }

    if (status === "suspended") {
      updatePayload.payout_status = "disabled";
    }

    const { error: updateVendorError } = await supabaseAdmin
      .from("vendor_profiles")
      .update(updatePayload)
      .eq("id", vendorId);

    if (updateVendorError) {
      throw new Error(updateVendorError.message);
    }

    const { error: updateProfileError } = await supabaseAdmin
      .from("profiles")
      .update({
        role: "vendor",
        account_status: status === "suspended" ? "active" : "active",
        updated_at: new Date().toISOString(),
      })
      .eq("auth_user_id", vendorId);

    if (updateProfileError) {
      throw new Error(updateProfileError.message);
    }

    revalidatePath("/admin/vendors");
    revalidatePath("/vendor");
    revalidatePath("/vendor-pending");
  }

  const pendingCount = vendorRows.filter(
    (vendor: any) => vendor.status === "pending"
  ).length;

  const approvedCount = vendorRows.filter(
    (vendor: any) => vendor.status === "approved"
  ).length;

  const rejectedCount = vendorRows.filter(
    (vendor: any) => vendor.status === "rejected"
  ).length;

  const suspendedCount = vendorRows.filter(
    (vendor: any) => vendor.status === "suspended"
  ).length;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <span className="badge">
            <T en="Marketplace Administration" ar="إدارة السوق" />
          </span>

          <h1>
            <T en="Vendor Management" ar="إدارة التجار" />
          </h1>

          <p>
            <T
              en="Review, approve, reject, or suspend vendor applications."
              ar="مراجعة واعتماد أو رفض أو تعليق طلبات التجار."
            />
          </p>
        </div>
      </div>

      <div className="stats-grid" style={{ marginTop: 30 }}>
        <div className="card stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <label>
              <T en="Pending" ar="قيد المراجعة" />
            </label>
            <div className="stat-value">{pendingCount}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <label>
              <T en="Approved" ar="معتمد" />
            </label>
            <div className="stat-value">{approvedCount}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <label>
              <T en="Rejected" ar="مرفوض" />
            </label>
            <div className="stat-value">{rejectedCount}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">⛔</div>
          <div className="stat-content">
            <label>
              <T en="Suspended" ar="معلق" />
            </label>
            <div className="stat-value">{suspendedCount}</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, color: "var(--muted)" }}>
        <T en="Total Vendors:" ar="إجمالي التجار:" /> {vendorRows.length}
      </div>

      <div
        className="card"
        style={{ marginTop: 12, padding: 0, overflow: "hidden" }}
      >
        <table className="admin-table">
          <thead>
            <tr>
              <th>
                <T en="Business" ar="المنشأة" />
              </th>
              <th>
                <T en="Contact" ar="التواصل" />
              </th>
              <th>
                <T en="Compliance" ar="الامتثال" />
              </th>
              <th>
                <T en="Status" ar="الحالة" />
              </th>
              <th>
                <T en="Created" ar="تاريخ التسجيل" />
              </th>
              <th>
                <T en="Actions" ar="الإجراءات" />
              </th>
            </tr>
          </thead>

          <tbody>
            {vendorRows.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 40 }}>
                  <T en="No vendors found." ar="لا يوجد تجار." />
                </td>
              </tr>
            ) : (
              vendorRows.map((vendor: any) => {
                const profile = getProfileForVendor(profiles || [], vendor.id);

                return (
                  <tr key={vendor.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>
                        {vendor.business_name_en || "—"}
                      </div>

                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--muted)",
                          marginTop: 4,
                        }}
                      >
                        {vendor.business_name_ar || "—"}
                      </div>

                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--gb-gold)",
                          marginTop: 6,
                        }}
                      >
                        /vendor-store/{vendor.slug || "—"}
                      </div>

                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--muted)",
                          marginTop: 6,
                        }}
                      >
                        CR: {vendor.cr_number || "—"} · VAT:{" "}
                        {vendor.vat_number || "—"}
                      </div>
                    </td>

                    <td>
                      <div>{vendor.contact_email || profile?.email || "—"}</div>

                      <div style={{ fontSize: "0.85rem", marginTop: 4 }}>
                        {vendor.contact_phone || profile?.phone || "—"}
                      </div>

                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--muted)",
                          marginTop: 6,
                        }}
                      >
                        {profile?.full_name || "—"}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: "grid", gap: 8 }}>
                        <span className={getBadgeClass(vendor.compliance_status)}>
                          Compliance: {vendor.compliance_status || "pending"}
                        </span>

                        <span className={getBadgeClass(vendor.agreement_status)}>
                          Agreement: {vendor.agreement_status || "unsigned"}
                        </span>

                        <span className={getBadgeClass(vendor.payout_status)}>
                          Payout: {vendor.payout_status || "pending"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className={getBadgeClass(vendor.status)}>
                        {vendor.status || "pending"}
                      </span>

                      <div
                        style={{
                          marginTop: 8,
                          fontSize: "0.8rem",
                          color: "var(--muted)",
                        }}
                      >
                        Profile role: {profile?.role || "—"}
                      </div>
                    </td>

                    <td>{formatDate(vendor.created_at)}</td>

                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <form action={updateVendorStatus}>
                          <input
                            type="hidden"
                            name="vendor_id"
                            value={vendor.id}
                          />
                          <input type="hidden" name="status" value="approved" />
                          <button
                            type="submit"
                            className="btn btn-small btn-success"
                            disabled={vendor.status === "approved"}
                          >
                            <T en="Approve" ar="اعتماد" />
                          </button>
                        </form>

                        <form action={updateVendorStatus}>
                          <input
                            type="hidden"
                            name="vendor_id"
                            value={vendor.id}
                          />
                          <input type="hidden" name="status" value="rejected" />
                          <button
                            type="submit"
                            className="btn btn-small btn-danger"
                            disabled={vendor.status === "rejected"}
                          >
                            <T en="Reject" ar="رفض" />
                          </button>
                        </form>

                        <form action={updateVendorStatus}>
                          <input
                            type="hidden"
                            name="vendor_id"
                            value={vendor.id}
                          />
                          <input type="hidden" name="status" value="suspended" />
                          <button
                            type="submit"
                            className="btn btn-small btn-secondary"
                            disabled={vendor.status === "suspended"}
                          >
                            <T en="Suspend" ar="تعليق" />
                          </button>
                        </form>

                        <form action={updateVendorStatus}>
                          <input
                            type="hidden"
                            name="vendor_id"
                            value={vendor.id}
                          />
                          <input type="hidden" name="status" value="pending" />
                          <button
                            type="submit"
                            className="btn btn-small"
                            disabled={vendor.status === "pending"}
                          >
                            <T en="Reset Pending" ar="إرجاع للمراجعة" />
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

      <div className="card" style={{ marginTop: 24 }}>
        <h2>
          <T en="Approval Rules" ar="قواعد الاعتماد" />
        </h2>

        <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
          <T
            en="Approving a vendor changes vendor_profiles.status to approved. Pending, rejected, and suspended vendors cannot access the vendor dashboard."
            ar="اعتماد التاجر يغيّر حالة vendor_profiles.status إلى approved. التجار بحالة pending أو rejected أو suspended لا يمكنهم دخول لوحة التاجر."
          />
        </p>
      </div>
    </div>
  );
}
