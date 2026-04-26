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

function deletedEmailForUser(userId: string) {
  return `deleted-user-${userId.slice(0, 8)}@gearbeat.local`;
}

export default async function AdminAccountDeletionRequestsPage() {
  const { admin } = await requireAdminRole(["operations", "support"]);

  const supabaseAdmin = createAdminClient();

  const canReview =
    admin.admin_role === "super_admin" ||
    admin.admin_role === "operations" ||
    admin.admin_role === "support";

  const canExecuteDeletion =
    admin.admin_role === "super_admin" || admin.admin_role === "operations";

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

  async function executeDeletion(formData: FormData) {
    "use server";

    const { user, admin } = await requireAdminRole(["operations"]);
    const supabaseAdmin = createAdminClient();

    const requestId = String(formData.get("request_id") || "");

    if (!requestId) {
      throw new Error("Missing request ID.");
    }

    const { data: request, error: requestError } = await supabaseAdmin
      .from("account_deletion_requests")
      .select(
        "id,auth_user_id,email,role,reason,status,has_active_bookings,has_active_studios"
      )
      .eq("id", requestId)
      .single();

    if (requestError || !request) {
      throw new Error(requestError?.message || "Deletion request not found.");
    }

    if (request.status !== "approved") {
      throw new Error("Only approved requests can be executed.");
    }

    if (!request.auth_user_id) {
      throw new Error("Missing auth user ID.");
    }

    if (request.role === "admin" || request.role === "super_admin") {
      throw new Error("Admin accounts cannot be deleted from this page.");
    }

    const targetUserId = request.auth_user_id;
    const targetEmail = request.email || deletedEmailForUser(targetUserId);
    const replacementEmail = deletedEmailForUser(targetUserId);

    const activeBookingStatuses = ["pending", "confirmed"];

    const { count: customerActiveBookingsCount } = await supabaseAdmin
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("customer_auth_user_id", targetUserId)
      .in("status", activeBookingStatuses);

    let ownerActiveBookingsCount = 0;
    let ownerStudioIds: string[] = [];

    if (request.role === "owner") {
      const { data: studios } = await supabaseAdmin
        .from("studios")
        .select("id")
        .eq("owner_auth_user_id", targetUserId);

      ownerStudioIds = (studios || []).map((studio) => studio.id);

      if (ownerStudioIds.length) {
        const { count } = await supabaseAdmin
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .in("studio_id", ownerStudioIds)
          .in("status", activeBookingStatuses);

        ownerActiveBookingsCount = count || 0;
      }
    }

    const totalActiveBookings =
      (customerActiveBookingsCount || 0) + ownerActiveBookingsCount;

    if (totalActiveBookings > 0) {
      throw new Error(
        "Cannot execute deletion while the account has active bookings."
      );
    }

    if (request.role === "owner" && ownerStudioIds.length) {
      await supabaseAdmin
        .from("studios")
        .update({
          status: "inactive",
          updated_at: new Date().toISOString()
        })
        .eq("owner_auth_user_id", targetUserId);
    }

    await supabaseAdmin
      .from("admin_users")
      .delete()
      .eq("auth_user_id", targetUserId);

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        email: replacementEmail,
        full_name: "Deleted User",
        phone: null,
        identity_type: null,
        identity_number: null,
        identity_locked: false,
        account_status: "deleted",
        deleted_at: new Date().toISOString(),
        deleted_reason: request.reason || "Account deletion request executed.",
        updated_at: new Date().toISOString()
      })
      .eq("auth_user_id", targetUserId);

    if (profileError) {
      throw new Error(profileError.message);
    }

    await supabaseAdmin.from("audit_logs").insert({
      actor_auth_user_id: user.id,
      actor_email: user.email,
      action: "account_deletion_executed",
      entity_type: "account_deletion_request",
      entity_id: request.id,
      old_values: {
        status: request.status,
        email: targetEmail,
        role: request.role
      },
      new_values: {
        status: "completed",
        email: replacementEmail,
        account_status: "deleted"
      },
      metadata: {
        admin_role: admin.admin_role,
        target_auth_user_id: targetUserId,
        owner_studio_count: ownerStudioIds.length,
        customer_active_bookings_count: customerActiveBookingsCount || 0,
        owner_active_bookings_count: ownerActiveBookingsCount
      }
    });

    const { error: authDeleteError } =
      await supabaseAdmin.auth.admin.deleteUser(targetUserId);

    if (authDeleteError) {
      throw new Error(authDeleteError.message);
    }

    const { error: completeError } = await supabaseAdmin
      .from("account_deletion_requests")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        admin_notes: "Account deletion/anonymization executed.",
        updated_at: new Date().toISOString()
      })
      .eq("id", requestId);

    if (completeError) {
      throw new Error(completeError.message);
    }

    revalidatePath("/admin/account-deletion-requests");
    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/reviews");
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
            en="Approved requests can be executed by operations or super admin. Execution removes login access and anonymizes personal profile data."
            ar="يمكن تنفيذ الطلبات الموافق عليها من العمليات أو السوبر أدمن. التنفيذ يزيل إمكانية تسجيل الدخول ويخفي بيانات الملف الشخصية."
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
                      <div className="admin-studio-actions">
                        {canReview && request.status !== "completed" ? (
                          <form
                            className="admin-review-form"
                            action={updateDeletionRequest}
                          >
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
                        ) : null}

                        {canExecuteDeletion &&
                        request.status === "approved" &&
                        request.role !== "admin" &&
                        request.role !== "super_admin" ? (
                          <form action={executeDeletion}>
                            <input
                              type="hidden"
                              name="request_id"
                              value={request.id}
                            />

                            <button
                              className="btn btn-secondary btn-small"
                              type="submit"
                            >
                              <T en="Execute Deletion" ar="تنفيذ الحذف" />
                            </button>
                          </form>
                        ) : null}

                        {request.status === "completed" ? (
                          <span className="badge">
                            <T en="Completed" ar="مكتمل" />
                          </span>
                        ) : null}
                      </div>
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
