import Link from "next/link";
import { createClient } from "../../lib/supabase/server";

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
        <span className="badge">Error</span>
        <h1>Studios</h1>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <section>
      <div className="section-head studios-hero-head">
        <span className="badge">Browse Studios</span>

        <h1>
          Find a studio that matches your <span className="neon-text">sound</span>.
        </h1>

        <p>
          Explore premium recording rooms, podcast spaces, rehearsal studios,
          and production suites available on GearBeat.
        </p>

        <div className="visual-search studios-search">
          <span>Search by city, studio name, vibe, or price...</span>
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
                  <div className="placeholder">No Image</div>
                )}
              </div>

              <div className="studio-card-body">
                <div>
                  <span className="badge">Available</span>
                  <h2>{studio.name}</h2>

                  <p>
                    {studio.city}
                    {studio.district ? ` · ${studio.district}` : ""}
                  </p>
                </div>

                <div className="studio-card-footer">
                  <p>
                    From <strong>{studio.price_from ?? 0} SAR</strong>
                  </p>

                  <Link href={`/studios/${studio.slug}`} className="btn btn-small">
                    View Details
                  </Link>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="card">
            <h2>No studios yet</h2>
            <p>
              Once studios are approved by the admin, they will appear here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
