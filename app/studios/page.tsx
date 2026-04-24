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
      <div className="section-head">
        <span className="badge">Browse</span>
        <h1>Studios</h1>
        <p>Discover premium creative and music spaces.</p>
      </div>

      <div className="grid">
        {studios?.length ? (
          studios.map((studio) => (
            <article className="card" key={studio.id}>
              <div className="studio-cover">
                {studio.cover_image_url ? (
                  <img src={studio.cover_image_url} alt={studio.name} />
                ) : (
                  <div className="placeholder">No Image</div>
                )}
              </div>

              <h2>{studio.name}</h2>

              <p>
                {studio.city}
                {studio.district ? ` · ${studio.district}` : ""}
              </p>

              <p>From {studio.price_from ?? 0} SAR</p>

              <Link href={`/studios/${studio.slug}`} className="btn btn-small">
                View studio
              </Link>
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
