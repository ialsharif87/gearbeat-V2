import Link from "next/link";
import { requireAdmin } from "../../../lib/admin";
import { createAdminClient } from "../../../lib/supabase/admin";
import T from "../../../components/t";

export default async function AdminStudiosPage() {
  const { admin } = await requireAdmin();
  const supabaseAdmin = createAdminClient();

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
            en="Review all studios, their status, verification, bookings, reviews, and external trust sources."
            ar="راجع كل الاستوديوهات، حالتها، التوثيق، الحجوزات، التقييمات، ومصادر الثقة الخارجية."
          />
        </p>
      </div>

      <div className="actions" style={{ marginBottom: 24 }}>
        <Link href="/admin" className="btn btn-secondary">
          <T en="Back to Admin Dashboard" ar="العودة إلى لوحة الإدارة" />
        </Link>

        {admin.admin_role === "super_admin" ||
        admin.admin_role === "operations" ||
        admin.admin_role === "content" ? (
          <Link href="/admin/team" className="btn btn-secondary">
            <T en="Admin Team" ar="فريق الإدارة" />
          </Link>
        ) : null}
      </div>

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
                          <span className="badge">{studio.status}</span>
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
