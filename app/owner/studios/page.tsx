import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";
import { requireRole } from "../../../lib/auth";
import T from "../../../components/t";

export default async function OwnerStudiosPage() {
  const { user } = await requireRole("owner");
  const supabase = await createClient();

  const { data: studios, error } = await supabase
    .from("studios")
    .select(
      "id,name,slug,city,district,price_from,status,verified,cover_image_url,created_at"
    )
    .eq("owner_auth_user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="card">
        <span className="badge">
          <T en="Error" ar="خطأ" />
        </span>
        <h1>
          <T en="My Studios" ar="استوديوهاتي" />
        </h1>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <section>
      <div className="section-head">
        <span className="badge">
          <T en="Studio Owner" ar="صاحب الاستوديو" />
        </span>

        <h1>
          <T en="My Studios" ar="استوديوهاتي" />
        </h1>

        <p>
          <T
            en="Manage the studios you created on GearBeat."
            ar="أدر الاستوديوهات التي أنشأتها على GearBeat."
          />
        </p>
      </div>

      <div className="actions" style={{ marginBottom: 24 }}>
        <Link href="/owner/create-studio" className="btn">
          <T en="Create New Studio" ar="إنشاء استوديو جديد" />
        </Link>

        <Link href="/owner" className="btn btn-secondary">
          <T en="Back to Dashboard" ar="العودة إلى لوحة التحكم" />
        </Link>
      </div>

      <div className="grid">
        {studios?.length ? (
          studios.map((studio) => (
            <article className="card studio-card" key={studio.id}>
              <div className="studio-cover">
                {studio.cover_image_url ? (
                  <img src={studio.cover_image_url} alt={studio.name} />
                ) : (
                  <div className="placeholder">
                    <T en="No Image" ar="لا توجد صورة" />
                  </div>
                )}
              </div>

              <div className="studio-card-body">
                <div className="actions" style={{ marginTop: 0 }}>
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

                <h2>{studio.name}</h2>

                <p>
                  {studio.city}
                  {studio.district ? ` · ${studio.district}` : ""}
                </p>

                <p>
                  <T en="From" ar="من" />{" "}
                  <strong>{studio.price_from ?? 0} SAR</strong>
                </p>

                <div className="actions">
                  <Link
                    href={`/studios/${studio.slug}`}
                    className="btn btn-small"
                  >
                    <T en="View Public Page" ar="عرض الصفحة العامة" />
                  </Link>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="card">
            <h2>
              <T en="No studios yet" ar="لا توجد استوديوهات بعد" />
            </h2>

            <p>
              <T
                en="You have not created any studios yet."
                ar="لم تقم بإنشاء أي استوديو حتى الآن."
              />
            </p>

            <Link href="/owner/create-studio" className="btn">
              <T en="Create Studio" ar="إنشاء استوديو" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
