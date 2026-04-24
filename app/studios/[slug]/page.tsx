import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

export default async function StudioDetailsPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: studio, error } = await supabase
    .from("studios")
    .select(
      "id,name,slug,city,district,address,description,price_from,status,cover_image_url,verified"
    )
    .eq("slug", slug)
    .eq("status", "approved")
    .single();

  if (error || !studio) {
    notFound();
  }

  const { data: images } = await supabase
    .from("studio_images")
    .select("id,image_url,is_cover,sort_order")
    .eq("studio_id", studio.id)
    .order("sort_order", { ascending: true });

  return (
    <section>
      <div className="studio-detail-hero card">
        <div className="studio-detail-image">
          {studio.cover_image_url ? (
            <img src={studio.cover_image_url} alt={studio.name} />
          ) : (
            <div className="placeholder">No Image</div>
          )}
        </div>

        <div className="studio-detail-content">
          <span className="badge">
            {studio.verified ? "Verified Studio" : "Studio"}
          </span>

          <h1>{studio.name}</h1>

          <p className="studio-location">
            {studio.city}
            {studio.district ? ` · ${studio.district}` : ""}
          </p>

          {studio.address ? <p>{studio.address}</p> : null}

          <p>{studio.description || "No description available yet."}</p>

          <div className="studio-price-box">
            <span>Starting from</span>
            <strong>{studio.price_from ?? 0} SAR / hour</strong>
          </div>

          <div className="actions">
            <Link href={`/studios/${studio.slug}/book`} className="btn">
              Book Now
            </Link>

            <Link href="/studios" className="btn btn-secondary">
              Back to Studios
            </Link>
          </div>
        </div>
      </div>

      <div className="pulse-panel">
        <div className="card">
          <span className="badge">Studio Highlights</span>
          <h2>Designed for creators</h2>
          <p>
            Use this space for recording, production, podcasts, rehearsals, or
            content creation. More detailed amenities will be added later.
          </p>

          <div className="stats-row">
            <div className="stat">
              <b>Live</b>
              <span>Booking request</span>
            </div>

            <div className="stat">
              <b>Fast</b>
              <span>Owner approval</span>
            </div>

            <div className="stat">
              <b>Secure</b>
              <span>Account based flow</span>
            </div>
          </div>
        </div>

        <div className="card wave-card">
          <span className="badge">Sound Profile</span>
          <h2>Studio pulse</h2>
          <p>Visual sound energy for this studio experience.</p>

          <div className="waveform" aria-hidden="true">
            {Array.from({ length: 36 }).map((_, index) => (
              <i key={index} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: 34 }} />

      <div className="section-head">
        <span className="badge">Gallery</span>
        <h1>Studio images</h1>
      </div>

      <div className="grid">
        {images?.length ? (
          images.map((image) => (
            <div className="card studio-card" key={image.id}>
              <div className="studio-cover">
                <img src={image.image_url} alt={studio.name} />
              </div>
            </div>
          ))
        ) : (
          <div className="card">
            <h2>No gallery images yet</h2>
            <p>Gallery images for this studio will appear here later.</p>
          </div>
        )}
      </div>
    </section>
  );
}
