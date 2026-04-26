import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireAdminRole } from "../../../lib/admin";
import { createAdminClient } from "../../../lib/supabase/admin";
import T from "../../../components/t";

function badgeStyle(status: string) {
  if (status === "completed") {
    return {
      background: "rgba(30, 215, 96, 0.18)",
      color: "#1ed760",
      border: "1px solid rgba(30, 215, 96, 0.45)"
    };
  }

  if (status === "approved") {
    return {
      background: "rgba(53, 216, 255, 0.16)",
      color: "#35d8ff",
      border: "1px solid rgba(53, 216, 255, 0.42)"
    };
  }

  if (status === "rejected" || status === "cancelled") {
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

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return "—";
  }
}

export default async function AdminAccountDeletionRequestsPage() {
  const { admin } = await requireAdminRole(["operations", "support"]);

  const supabaseAdmin = createAdminClient();

  const canReview =
    admin.admin_role === "super_admin" ||
    admin.admin_role === "operations" ||
    admin.admin_role === "support";

  async function updateDeletionRequest(formData: FormData) {
    "use server";

    const { user } = await requireAdminRole(["operations", "support"]);
    const supabaseAdmin = createAdminClient();

    const requestId = String(formData.get("request_id") || "");
    const status = String(formData.get("status") || "");
    const adminNotes = String(formData.get("admin_notes") || "").trim();

    const allowedStatuses = ["approved", "rejected", "cancelled"];

    if (!requestId) {
      throw new Error("Missing request ID.");
    }

    if (!allowedStatuses.includes(status)) {
      throw new Error("Invalid request status.");
    }

    const { data: request, error: readError } = await supabaseAdmin
      .from("account_deletion_requests")
      .select("id,auth_user_id,email,status")
      .eq("id", requestId)
      .single();

    if (readError || !request) {
      throw new Error(readError?.message || "Deletion request not found.");
    }

    if (request.status === "completed") {
      throw new Error("Completed requests cannot be changed.");
    }

    const { error } = await supabaseAdmin
      .from("account_deletion_requests")
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        admin_notes: adminNotes || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", requestId);

    if (error) {
      throw new Error(error.message);
    }

    if (status === "rejected" || status === "cancelled") {
      await supabaseAdmin
        .from("profiles")
        .update({
          account_status: "active",
          deleted_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq("auth_user_id", request.auth_user_id);
    }

    revalidatePath("/admin/account-deletion-requests");
    revalidatePath("/admin");
  }

  const { data: requests, error } = await supabaseAdmin
    .from("account_deletion_requests")
    .select(
      `
      id,
      auth_user_id,
      email,
      role,
      reason,
      status,
      has_active_bookings,
      has_active_studios,
      requires_admin_review,
      requested_at,
      reviewed_at,
      reviewed_by,
      completed_at,
      admin_notes,
      created_at,
      updated_at
    `
    )
    .order("requested_at", { ascending: false });

  const totalRequests = requests?.length || 0;
  const pendingRequests =
    requests?.filter((request) => request.status === "pending").length || 0;
  const approvedRequests =
    requests?.filter((request) => request.status === "approved").length || 0;
  const completedRequests =
    requests?.filter((request) => request.status === "completed").length || 0;
  const rejectedRequests =
    requests?.filter((request) => request.status === "rejected").length || 0;

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Admin" ar="الإدارة" />
        </span>

        <h1>
          <T en="Account Deletion Requests" ar="طلبات حذف الحسابات" />
        </h1>

        <p>
          <T
            en="Review customer and studio owner account deletion requests before final removal or anonymization."
            ar="راجع طلبات حذف حسابات العملاء وأصحاب الاستوديوهات قبل الحذف أو إخفاء البيانات النهائي."
          />
        </p>
      </div>

      <div className="actions" style={{ marginBottom: 24 }}>
        <Link href="/admin" className="btn btn-secondary">
          <T en="Back to Admin Dashboard" ar="العودة إلى لوحة الإدارة" />
        </Link>

        <Link href="/admin/bookings" className="btn btn-secondary">
          <T en="Bookings" ar="الحجوزات" />
        </Link>
      </div>

      <div className="admin-kpi-grid">
        <div className="card admin-kpi-card">
          <span>
            <T en="Total Requests" ar="إجمالي الطلبات" />
          </span>
          <strong>{totalRequests}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Pending" ar="قيد المراجعة" />
          </span>
          <strong>{pendingRequests}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Approved" ar="موافق عليها" />
          </span>
          <strong>{approvedRequests}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Completed" ar="مكتملة" />
          </span>
          <strong>{completedRequests}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Rejected" ar="مرفوضة" />
          </span>
          <strong>{rejectedRequests}</strong>
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

      <div className="card">
        <span className="badge">
          <T en="Requests" ar="الطلبات" />
        </span>

        <h2>
          <T en="Deletion request list" ar="قائمة طلبات الحذف" />
        </h2>

        <p>
          <T
            en="Approved requests are not deleted automatically yet. The final delete/anonymize step will be added next."
            ar="الطلبات الموافق عليها لا يتم حذفها تلقائيًا الآن. خطوة الحذف أو إخفاء البيانات النهائي سنضيفها بعدها."
          />
        </p>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <T en="User" ar="المستخدم" />
                </th>
                <th>
                  <T en="Role" ar="نوع الحساب" />
                </th>
                <th>
                  <T en="Status" ar="الحالة" />
                </th>
                <th>
                  <T en="Checks" ar="الفحص" />
                </th>
                <th>
                  <T en="Reason" ar="السبب" />
                </th>
                <th>
                  <T en="Dates" ar="التواريخ" />
                </th>
                <th>
                  <T en="Admin Notes" ar="ملاحظات الإدارة" />
                </th>
                <th>
                  <T en="Actions" ar="الإجراءات" />
                </th>
              </tr>
            </thead>

            <tbody>
              {requests?.length ? (
                requests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <strong>{request.email || "—"}</strong>
                      <p className="admin-muted-line">
                        <small>{request.auth_user_id || "—"}</small>
                      </p>
                    </td>

                    <td>
                      <span className="badge">{request.role || "—"}</span>
                    </td>

                    <td>
                      <span className="badge" style={badgeStyle(request.status)}>
                        {request.status}
                      </span>
                    </td>

                    <td>
                      <div className="admin-badge-stack">
                        <span className="badge">
                          <T en="Bookings:" ar="حجوزات:" />{" "}
                          {request.has_active_bookings ? "Yes" : "No"}
                        </span>

                        <span className="badge">
                          <T en="Studios:" ar="استوديوهات:" />{" "}
                          {request.has_active_studios ? "Yes" : "No"}
                        </span>

                        <span className="badge">
                          <T en="Review:" ar="مراجعة:" />{" "}
                          {request.requires_admin_review ? "Yes" : "No"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <p className="admin-muted-line">
                        {request.reason || "—"}
                      </p>
                    </td>

                    <td>
                      <p className="admin-muted-line">
                        <T en="Requested:" ar="تاريخ الطلب:" />{" "}
                        {formatDate(request.requested_at)}
                      </p>

                      <p className="admin-muted-line">
                        <T en="Reviewed:" ar="تاريخ المراجعة:" />{" "}
                        {formatDate(request.reviewed_at)}
                      </p>

                      <p className="admin-muted-line">
                        <T en="Completed:" ar="تاريخ الاكتمال:" />{" "}
                        {formatDate(request.completed_at)}
                      </p>
                    </td>

                    <td>
                      <p className="admin-muted-line">
                        {request.admin_notes || "—"}
                      </p>
                    </td>

                    <td>
                      {canReview && request.status !== "completed" ? (
                        <div className="admin-studio-actions">
                          <form className="admin-review-form" action={updateDeletionRequest}>
                            <input
                              type="hidden"
                              name="request_id"
                              value={request.id}
                            />

                            <textarea
                              className="input"
                              name="admin_notes"
                              rows={3}
                              placeholder="Internal admin notes..."
                              defaultValue={request.admin_notes || ""}
                            />

                            <div className="admin-inline-action-grid">
                              {request.status !== "approved" ? (
                                <button
                                  className="btn btn-small"
                                  type="submit"
                                  name="status"
                                  value="approved"
                                >
                                  <T en="Approve" ar="موافقة" />
                                </button>
                              ) : null}

                              {request.status !== "rejected" ? (
                                <button
                                  className="btn btn-secondary btn-small"
                                  type="submit"
                                  name="status"
                                  value="rejected"
                                >
                                  <T en="Reject" ar="رفض" />
                                </button>
                              ) : null}

                              {request.status !== "cancelled" ? (
                                <button
                                  className="btn btn-secondary btn-small"
                                  type="submit"
                                  name="status"
                                  value="cancelled"
                                >
                                  <T en="Cancel" ar="إلغاء" />
                                </button>
                              ) : null}
                            </div>
                          </form>
                        </div>
                      ) : (
                        <span className="badge">
                          <T en="No action" ar="لا يوجد إجراء" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8}>
                    <T
                      en="No account deletion requests found."
                      ar="لا توجد طلبات حذف حسابات."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
