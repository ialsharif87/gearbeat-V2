import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";
import { requireRole } from "../../../lib/auth";

export default async function OwnerStudiosPage() {
  const { user } = await requireRole("owner");
  const supabase = await createClient();

  const { data: studios, error } = await supabase
    .from("studios")
    .select("id,name,slug,city,district,price_from,status,verified,cover_image_url,created_at")
    .eq("owner_auth_user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="card">
        <span className="badge">Error</span>
        <h1>My Studios</h1>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <section>
      <div className="section-head">
        <span className="badge">Studio Owner</span>
        <h1>My Studios</h1>
        <p>Manage the studios you created on GearBeat.</p>
      </div>

      <div className="actions" style={{ marginBottom: 24 }}>
        <Link href="/owner/create-studio" className="btn">
          Create New Studio
        </Link>

        <Link href="/owner" className="btn btn-secondary">
          Back to Dashboard
        </Link>
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

              <span className="badge">{studio.status}</span>

              <h2>{studio.name}</h2>

              <p>
                {studio.city}
                {studio.district ? ` · ${studio.district}` : ""}
              </p>

              <p>From {studio.price_from ?? 0} SAR</p>

              <div className="actions">
                <Link href={`/studios/${studio.slug}`} className="btn btn-small">
                  View Public Page
                </Link>
              </div>
            </article>
          ))
        ) : (
          <div className="card">
            <h2>No studios yet</h2>
            <p>You have not created any studios yet.</p>

            <Link href="/owner/create-studio" className="btn">
              Create Studio
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
