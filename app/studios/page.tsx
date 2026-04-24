import Link from "next/link";
import { createClient } from "../../lib/supabase/server";
import T from "../../components/t";

export default async function StudiosPage() {
  const supabase = await createClient();

  const { data: studios, error } = await supabase
    .from("studios")
    .select("id,name,slug,city,district,price_from,status,cover_image_url")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="card">
        <span className="badge">
          <T en="Error" ar="خطأ" />
        </span>
        <h1>
          <T en="Studios" ar="الاستوديوهات" />
        </h1>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <section>
      <div className="section-head studios-hero-head">
        <span className="badge">
          <T en="Browse Studios" ar="تصفح الاستوديوهات" />
        </span>

        <h1>
          <T en="Find a studio that matches your" ar="اعثر على استوديو يناسب" />{" "}
          <span className="neon-text">
            <T en="sound." ar="صوتك." />
          </span>
        </h1>

        <p>
          <T
            en="Explore premium recording rooms, podcast spaces, rehearsal studios, and production suites available on GearBeat."
            ar="استكشف غرف التسجيل الفاخرة، مساحات البودكاست، استوديوهات التدريب، وغرف الإنتاج المتاحة على GearBeat."
          />
        </p>

        <div className="visual-search studios-search">
          <span>
            <T
              en="Search by city, studio name, vibe, or price..."
              ar="ابحث حسب المدينة، اسم الاستوديو، الأجواء، أو السعر..."
            />
          </span>
          <span className="search-icon">⌕</span>
        </div>
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
                <div>
                  <span className="badge">
                    <T en="Available" ar="متاح" />
                  </span>

                  <h2>{studio.name}</h2>

                  <p>
                    {studio.city}
                    {studio.district ? ` · ${studio.district}` : ""}
                  </p>
                </div>

                <div className="studio-card-footer">
                  <p>
                    <T en="From" ar="من" />{" "}
                    <strong>{studio.price_from ?? 0} SAR</strong>
                  </p>

                  <Link href={`/studios/${studio.slug}`} className="btn btn-small">
                    <T en="View Details" ar="عرض التفاصيل" />
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
                en="Once studios are approved by the admin, they will appear here."
                ar="بعد اعتماد الاستوديوهات من الإدارة، ستظهر هنا."
              />
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
