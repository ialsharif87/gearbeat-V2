import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireAdminRole } from "../../../lib/admin";
import { createAdminClient } from "../../../lib/supabase/admin";
import T from "../../../components/t";

function studioStatusStyle(status: string) {
  if (status === "approved") {
    return {
      background: "rgba(30, 215, 96, 0.18)",
      color: "#1ed760",
      border: "1px solid rgba(30, 215, 96, 0.45)"
    };
  }

  if (status === "suspended" || status === "rejected") {
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

export default async function AdminStudiosPage() {
  const { admin } = await requireAdminRole(["operations", "content", "sales"]);
  const supabaseAdmin = createAdminClient();

  const canManageStudios =
    admin.admin_role === "super_admin" ||
    admin.admin_role === "operations" ||
    admin.admin_role === "content";

  async function updateStudioStatus(formData: FormData) {
    "use server";

    const { admin } = await requireAdminRole(["operations", "content"]);

    const canUpdate =
      admin.admin_role === "super_admin" ||
      admin.admin_role === "operations" ||
      admin.admin_role === "content";

    if (!canUpdate) {
      throw new Error("You do not have permission to update studio status.");
    }

    const supabaseAdmin = createAdminClient();

    const studioId = String(formData.get("studio_id") || "");
    const studioSlug = String(formData.get("studio_slug") || "");
    const status = String(formData.get("status") || "");

    if (!studioId) {
      throw new Error("Missing studio ID.");
    }

    const allowedStatuses = ["pending", "approved", "suspended", "rejected"];

    if (!allowedStatuses.includes(status)) {
      throw new Error("Invalid studio status.");
    }

    const { error } = await supabaseAdmin
      .from("studios")
      .update({
        status
      })
      .eq("id", studioId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/studios");
    revalidatePath("/admin");

    if (studioSlug) {
      revalidatePath(`/studios/${studioSlug}`);
    }
  }

  async function updateStudioVerified(formData: FormData) {
    "use server";

    const { admin } = await requireAdminRole(["operations", "content"]);

    const canUpdate =
      admin.admin_role === "super_admin" ||
      admin.admin_role === "operations" ||
      admin.admin_role === "content";

    if (!canUpdate) {
      throw new Error("You do not have permission to verify studios.");
    }

    const supabaseAdmin = createAdminClient();

    const studioId = String(formData.get("studio_id") || "");
    const studioSlug = String(formData.get("studio_slug") || "");
    const verified = String(formData.get("verified") || "") === "true";

    if (!studioId) {
      throw new Error("Missing studio ID.");
    }

    const { error } = await supabaseAdmin
      .from("studios")
      .update({
        verified
      })
      .eq("id", studioId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/studios");
    revalidatePath("/admin");

    if (studioSlug) {
      revalidatePath(`/studios/${studioSlug}`);
    }
  }

  const { data: studios, error } = await supabaseAdmin
    .from("studios")
    .select(`
      id,
      name,
      slug,
      city,
      district,
      price_from,
      status,
      verified,
      google_maps_url,
      google_reviews_url,
      google_rating,
      google_user_ratings_total,
      tripadvisor_url,
      tripadvisor_rating,
      tripadvisor_reviews_total,
      owner_auth_user_id,
      created_at,
      bookings (
        id
      ),
      reviews (
        id
      )
    `)
    .order("created_at", { ascending: false });

  const totalStudios = studios?.length || 0;
  const approvedStudios =
    studios?.filter((studio) => studio.status === "approved").length || 0;
  const pendingStudios =
    studios?.filter((studio) => studio.status === "pending").length || 0;
  const suspendedStudios =
    studios?.filter((studio) => studio.status === "suspended").length || 0;
  const verifiedStudios =
    studios?.filter((studio) => studio.verified).length || 0;

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Admin" ar="الإدارة" />
        </span>

        <h1>
          <T en="Studios Monitoring" ar="مراقبة الاستوديوهات" />
        </h1>

        <p>
          <T
            en="Review all studios, approve or suspend listings, manage verification, and monitor trust sources."
            ar="راجع كل الاستوديوهات، اعتمد أو أوقف القوائم، أدر التوثيق، وراقب مصادر الثقة."
          />
        </p>
      </div>

      <div className="actions" style={{ marginBottom: 24 }}>
        <Link href="/admin" className="btn btn-secondary">
          <T en="Back to Admin Dashboard" ar="العودة إلى لوحة الإدارة" />
        </Link>

        {admin.admin_role === "super_admin" ? (
          <Link href="/admin/team" className="btn btn-secondary">
            <T en="Admin Team" ar="فريق الإدارة" />
          </Link>
        ) : null}
      </div>

      <div className="admin-kpi-grid">
        <div className="card admin-kpi-card">
          <span>
            <T en="Total Studios" ar="إجمالي الاستوديوهات" />
          </span>
          <strong>{totalStudios}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Approved" ar="معتمدة" />
          </span>
          <strong>{approvedStudios}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Pending" ar="معلقة" />
          </span>
          <strong>{pendingStudios}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Suspended" ar="موقوفة" />
          </span>
          <strong>{suspendedStudios}</strong>
        </div>

        <div className="card admin-kpi-card">
          <span>
            <T en="Verified" ar="موثقة" />
          </span>
          <strong>{verifiedStudios}</strong>
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

      {!canManageStudios ? (
        <div className="card">
          <span className="badge">
            <T en="View Only" ar="عرض فقط" />
          </span>

          <p>
            <T
              en="Your role can view studios, but cannot approve, suspend, or verify them."
              ar="صلاحيتك تسمح بعرض الاستوديوهات فقط، ولا تسمح بالاعتماد أو الإيقاف أو التوثيق."
            />
          </p>
        </div>
      ) : null}

      <div className="card">
        <span className="badge">
          <T en="All Studios" ar="كل الاستوديوهات" />
        </span>

        <h2>
          <T en="Studio list" ar="قائمة الاستوديوهات" />
        </h2>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <T en="Studio" ar="الاستوديو" />
                </th>
                <th>
                  <T en="Location" ar="الموقع" />
                </th>
                <th>
                  <T en="Price" ar="السعر" />
                </th>
                <th>
                  <T en="Status" ar="الحالة" />
                </th>
                <th>
                  <T en="Trust" ar="الثقة" />
                </th>
                <th>
                  <T en="Activity" ar="النشاط" />
                </th>
                <th>
                  <T en="Actions" ar="الإجراءات" />
                </th>
              </tr>
            </thead>

            <tbody>
              {studios?.length ? (
                studios.map((studio) => {
                  const bookingsCount = Array.isArray(studio.bookings)
                    ? studio.bookings.length
                    : 0;

                  const reviewsCount = Array.isArray(studio.reviews)
                    ? studio.reviews.length
                    : 0;

                  return (
                    <tr key={studio.id}>
                      <td>
                        <strong>{studio.name}</strong>
                        <p className="admin-muted-line">{studio.slug}</p>
                      </td>

                      <td>
                        {studio.city || "-"}
                        {studio.district ? ` · ${studio.district}` : ""}
                      </td>

                      <td>{studio.price_from ?? 0} SAR</td>

                      <td>
                        <div className="admin-badge-stack">
                          <span
                            className="badge"
                            style={studioStatusStyle(studio.status)}
                          >
                            {studio.status}
                          </span>

                          {studio.verified ? (
                            <span className="badge">
                              <T en="Verified" ar="موثق" />
                            </span>
                          ) : (
                            <span className="badge">
                              <T en="Not verified" ar="غير موثق" />
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="admin-badge-stack">
                          {studio.google_rating ? (
                            <span className="badge">
                              Google {studio.google_rating} ★
                            </span>
                          ) : (
                            <span className="badge">Google —</span>
                          )}

                          {studio.tripadvisor_rating ? (
                            <span className="badge">
                              TripAdvisor {studio.tripadvisor_rating} ★
                            </span>
                          ) : (
                            <span className="badge">TripAdvisor —</span>
                          )}

                          {studio.google_user_ratings_total ? (
                            <small>
                              Google reviews: {studio.google_user_ratings_total}
                            </small>
                          ) : null}

                          {studio.tripadvisor_reviews_total ? (
                            <small>
                              TripAdvisor reviews:{" "}
                              {studio.tripadvisor_reviews_total}
                            </small>
                          ) : null}
                        </div>
                      </td>

                      <td>
                        <div className="admin-badge-stack">
                          <span>
                            <T en="Bookings:" ar="الحجوزات:" />{" "}
                            <strong>{bookingsCount}</strong>
                          </span>

                          <span>
                            <T en="Reviews:" ar="التقييمات:" />{" "}
                            <strong>{reviewsCount}</strong>
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="admin-studio-actions">
                          <div className="actions">
                            <Link
                              href={`/studios/${studio.slug}`}
                              className="btn btn-small"
                            >
                              <T en="View" ar="عرض" />
                            </Link>

                            {studio.google_maps_url ? (
                              <a
                                href={studio.google_maps_url}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-secondary btn-small"
                              >
                                Google
                              </a>
                            ) : null}

                            {studio.tripadvisor_url ? (
                              <a
                                href={studio.tripadvisor_url}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-secondary btn-small"
                              >
                                TripAdvisor
                              </a>
                            ) : null}
                          </div>

                          {canManageStudios ? (
                            <div className="admin-inline-action-grid">
                              {studio.status !== "approved" ? (
                                <form action={updateStudioStatus}>
                                  <input
                                    type="hidden"
                                    name="studio_id"
                                    value={studio.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="studio_slug"
                                    value={studio.slug}
                                  />
                                  <input
                                    type="hidden"
                                    name="status"
                                    value="approved"
                                  />
                                  <button
                                    className="btn btn-small"
                                    type="submit"
                                  >
                                    <T en="Approve" ar="اعتماد" />
                                  </button>
                                </form>
                              ) : null}

                              {studio.status !== "pending" ? (
                                <form action={updateStudioStatus}>
                                  <input
                                    type="hidden"
                                    name="studio_id"
                                    value={studio.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="studio_slug"
                                    value={studio.slug}
                                  />
                                  <input
                                    type="hidden"
                                    name="status"
                                    value="pending"
                                  />
                                  <button
                                    className="btn btn-secondary btn-small"
                                    type="submit"
                                  >
                                    <T en="Set Pending" ar="تعليق" />
                                  </button>
                                </form>
                              ) : null}

                              {studio.status !== "suspended" ? (
                                <form action={updateStudioStatus}>
                                  <input
                                    type="hidden"
                                    name="studio_id"
                                    value={studio.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="studio_slug"
                                    value={studio.slug}
                                  />
                                  <input
                                    type="hidden"
                                    name="status"
                                    value="suspended"
                                  />
                                  <button
                                    className="btn btn-secondary btn-small"
                                    type="submit"
                                  >
                                    <T en="Suspend" ar="إيقاف" />
                                  </button>
                                </form>
                              ) : null}

                              {!studio.verified ? (
                                <form action={updateStudioVerified}>
                                  <input
                                    type="hidden"
                                    name="studio_id"
                                    value={studio.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="studio_slug"
                                    value={studio.slug}
                                  />
                                  <input
                                    type="hidden"
                                    name="verified"
                                    value="true"
                                  />
                                  <button
                                    className="btn btn-small"
                                    type="submit"
                                  >
                                    <T en="Verify" ar="توثيق" />
                                  </button>
                                </form>
                              ) : (
                                <form action={updateStudioVerified}>
                                  <input
                                    type="hidden"
                                    name="studio_id"
                                    value={studio.id}
                                  />
                                  <input
                                    type="hidden"
                                    name="studio_slug"
                                    value={studio.slug}
                                  />
                                  <input
                                    type="hidden"
                                    name="verified"
                                    value="false"
                                  />
                                  <button
                                    className="btn btn-secondary btn-small"
                                    type="submit"
                                  >
                                    <T en="Unverify" ar="إلغاء التوثيق" />
                                  </button>
                                </form>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7}>
                    <T en="No studios found." ar="لا توجد استوديوهات." />
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
