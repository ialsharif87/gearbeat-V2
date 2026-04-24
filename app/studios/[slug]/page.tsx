import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
      <div className="card">
        <div className="studio-cover" style={{ height: 320 }}>
          {studio.cover_image_url ? (
            <img src={studio.cover_image_url} alt={studio.name} />
          ) : (
            <div className="placeholder">No Image</div>
          )}
        </div>

        <span className="badge">
          {studio.verified ? "Verified Studio" : "Studio"}
        </span>

        <h1>{studio.name}</h1>

        <p>
          {studio.city}
          {studio.district ? ` · ${studio.district}` : ""}
        </p>

        {studio.address ? <p>{studio.address}</p> : null}

        <p>{studio.description || "No description available yet."}</p>

        <h2>From {studio.price_from ?? 0} SAR / hour</h2>

        <div className="actions">
          <Link href={/studios/${studio.slug}/book} className="btn">
            Book now
          </Link>

          <Link href="/studios" className="btn btn-secondary">
            Back to studios
          </Link>
        </div>
      </div>

      <div style={{ height: 24 }} />

      <div className="section-head">
        <span className="badge">Gallery</span>
        <h1>Studio images</h1>
      </div>

      <div className="grid">
        {images?.length ? (
          images.map((image) => (
            <div className="card" key={image.id}>
              <div className="studio-cover">
                <img src={image.image_url} alt={studio.name} />
              </div>
            </div>
          ))
        ) : (
          <div className="card">
            <p>No gallery images yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
