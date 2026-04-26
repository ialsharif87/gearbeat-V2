import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import T from "../../../components/t";

function getRole(user: any, profile: any) {
  return profile?.role || user?.user_metadata?.role || "customer";
}

function getFullName(user: any, profile: any) {
  return (
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "User"
  );
}

async function getAccountDeletionStatus(userId: string, role: string) {
  const supabaseAdmin = createAdminClient();

  const activeBookingStatuses = ["pending", "confirmed"];

  const { count: customerActiveBookingsCount } = await supabaseAdmin
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("customer_auth_user_id", userId)
    .in("status", activeBookingStatuses);

  let ownerActiveStudiosCount = 0;
  let ownerActiveBookingsCount = 0;

  if (role === "owner") {
    const { data: studios } = await supabaseAdmin
      .from("studios")
      .select("id")
      .eq("owner_auth_user_id", userId);

    const studioIds = (studios || []).map((studio) => studio.id);

    ownerActiveStudiosCount = studioIds.length;

    if (studioIds.length) {
      const { count } = await supabaseAdmin
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .in("studio_id", studioIds)
        .in("status", activeBookingStatuses);

      ownerActiveBookingsCount = count || 0;
    }
  }

  const hasActiveBookings =
    (customerActiveBookingsCount || 0) > 0 || ownerActiveBookingsCount > 0;

  const hasActiveStudios = role === "owner" && ownerActiveStudiosCount > 0;

  const requiresAdminReview =
    role === "owner" || hasActiveBookings || hasActiveStudios;

  return {
    hasActiveBookings,
    hasActiveStudios,
    requiresAdminReview,
    customerActiveBookingsCount: customerActiveBookingsCount || 0,
    ownerActiveBookingsCount,
    ownerActiveStudiosCount
  };
}

export default async function DeleteAccountPage() {
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
    .select(
      "id,auth_user_id,email,full_name,phone,role,account_status,deletion_requested_at,deleted_at"
    )
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const role = getRole(user, profile);
  const fullName = getFullName(user, profile);
  const email = profile?.email || user.email || "";

  const { data: existingRequest } = await supabaseAdmin
    .from("account_deletion_requests")
    .select("id,status,reason,requested_at,requires_admin_review")
    .eq("auth_user_id", user.id)
    .in("status", ["pending", "approved"])
    .order("requested_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const deletionStatus = await getAccountDeletionStatus(user.id, role);

  async function requestAccountDeletion(formData: FormData) {
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
      .select("id,auth_user_id,email,full_name,role,account_status")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    const role = getRole(user, profile);
    const email = profile?.email || user.email || "";
    const reason = String(formData.get("reason") || "").trim();

    const { data: existingRequest } = await supabaseAdmin
      .from("account_deletion_requests")
      .select("id,status")
      .eq("auth_user_id", user.id)
      .in("status", ["pending", "approved"])
      .limit(1)
      .maybeSingle();

    if (existingRequest) {
      redirect("/account/delete?requested=1");
    }

    const statusData = await getAccountDeletionStatus(user.id, role);

    const { error: requestError } = await supabaseAdmin
      .from("account_deletion_requests")
      .insert({
        auth_user_id: user.id,
        email,
        role,
        reason: reason || null,
        status: "pending",
        has_active_bookings: statusData.hasActiveBookings,
        has_active_studios: statusData.hasActiveStudios,
        requires_admin_review: statusData.requiresAdminReview
      });

    if (requestError) {
      throw new Error(requestError.message);
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        account_status: "pending_deletion",
        deletion_requested_at: new Date().toISOString(),
        deleted_reason: reason || null,
        updated_at: new Date().toISOString()
      })
      .eq("auth_user_id", user.id);

    if (profileError) {
      throw new Error(profileError.message);
    }

    revalidatePath("/account/delete");
    revalidatePath("/profile");
    revalidatePath("/admin");

    redirect("/account/delete?requested=1");
  }

  return (
    <section className="delete-account-page">
      <div className="delete-account-hero card">
        <span className="badge">
          <T en="Account Deletion" ar="حذف الحساب" />
        </span>

        <h1>
          <T en="Request account deletion" ar="طلب حذف الحساب" />
        </h1>

        <p>
          <T
            en="You can request to delete your GearBeat account. Some booking records may remain for operational, legal, reporting, or safety reasons, but personal profile details can be removed or anonymized."
            ar="يمكنك طلب حذف حسابك في GearBeat. قد تبقى بعض سجلات الحجوزات لأغراض تشغيلية أو قانونية أو تقارير أو أمان، لكن يمكن إزالة أو إخفاء بياناتك الشخصية."
          />
        </p>
      </div>

      <div style={{ height: 24 }} />

      <div className="delete-account-grid">
        <div className="card">
          <span className="badge">
            <T en="Account" ar="الحساب" />
          </span>

          <h2>{fullName}</h2>

          <p>
            <T en="Email:" ar="الإيميل:" /> <strong>{email}</strong>
          </p>

          <p>
            <T en="Account type:" ar="نوع الحساب:" /> <strong>{role}</strong>
          </p>

          <p>
            <T en="Account status:" ar="حالة الحساب:" />{" "}
            <strong>{profile?.account_status || "active"}</strong>
          </p>
        </div>

        <div className="card">
          <span className="badge">
            <T en="Checks" ar="الفحص" />
          </span>

          <h2>
            <T en="Deletion readiness" ar="جاهزية الحذف" />
          </h2>

          <div className="delete-check-list">
            <span>
              <T en="Active bookings:" ar="حجوزات نشطة:" />{" "}
              <strong>
                {deletionStatus.hasActiveBookings ? "Yes / نعم" : "No / لا"}
              </strong>
            </span>

            <span>
              <T en="Active studios:" ar="استوديوهات نشطة:" />{" "}
              <strong>
                {deletionStatus.hasActiveStudios ? "Yes / نعم" : "No / لا"}
              </strong>
            </span>

            <span>
              <T en="Admin review required:" ar="تحتاج مراجعة الإدارة:" />{" "}
              <strong>
                {deletionStatus.requiresAdminReview ? "Yes / نعم" : "No / لا"}
              </strong>
            </span>
          </div>
        </div>
      </div>

      <div style={{ height: 24 }} />

      {existingRequest ? (
        <div className="card delete-warning-card">
          <span className="badge">
            <T en="Request Already Submitted" ar="تم إرسال الطلب" />
          </span>

          <h2>
            <T en="Your deletion request is under review." ar="طلب حذف حسابك قيد المراجعة." />
          </h2>

          <p>
            <T en="Status:" ar="الحالة:" /> <strong>{existingRequest.status}</strong>
          </p>

          <p>
            <T en="Requested at:" ar="تاريخ الطلب:" />{" "}
            {new Date(existingRequest.requested_at).toLocaleString()}
          </p>

          <div className="actions">
            <Link href="/profile" className="btn btn-secondary">
              <T en="Back to Profile" ar="العودة للملف الشخصي" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="card delete-danger-card">
          <span className="badge">
            <T en="Important" ar="مهم" />
          </span>

          <h2>
            <T
              en="This action starts the account deletion process."
              ar="هذا الإجراء يبدأ عملية حذف الحساب."
            />
          </h2>

          <p>
            <T
              en="After you submit the request, your account will be marked as pending deletion. If you are a studio owner or have active bookings, the request must be reviewed by GearBeat admin first."
              ar="بعد إرسال الطلب، سيتم وضع حسابك في حالة قيد الحذف. إذا كنت صاحب استوديو أو لديك حجوزات نشطة، يجب مراجعة الطلب من إدارة GearBeat أولًا."
            />
          </p>

          <form className="form" action={requestAccountDeletion}>
            <label>
              <T en="Reason for deletion" ar="سبب الحذف" />
            </label>

            <textarea
              className="input"
              name="reason"
              rows={5}
              placeholder="Tell us why you want to delete your account..."
            />

            <button className="btn" type="submit">
              <T en="Submit Deletion Request" ar="إرسال طلب حذف الحساب" />
            </button>
          </form>

          <div className="actions">
            <Link href="/profile" className="btn btn-secondary">
              <T en="Cancel and go back" ar="إلغاء والعودة" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
