import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import T from "../../../components/t";

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
            <div className="placeholder">
              <T en="No Image" ar="لا توجد صورة" />
            </div>
          )}
        </div>

        <div className="studio-detail-content">
          <span className="badge">
            {studio.verified ? (
              <T en="Verified Studio" ar="استوديو موثق" />
            ) : (
              <T en="Studio" ar="استوديو" />
            )}
          </span>

          <h1>{studio.name}</h1>

          <p className="studio-location">
            {studio.city}
            {studio.district ? ` · ${studio.district}` : ""}
          </p>

          {studio.address ? <p>{studio.address}</p> : null}

          <p>
            {studio.description || (
              <T
                en="No description available yet."
                ar="لا يوجد وصف متاح حاليًا."
              />
            )}
          </p>

          <div className="studio-price-box">
            <span>
              <T en="Starting from" ar="يبدأ من" />
            </span>
            <strong>{studio.price_from ?? 0} SAR / hour</strong>
          </div>

          <div className="actions">
            <Link href={`/studios/${studio.slug}/book`} className="btn">
              <T en="Book Now" ar="احجز الآن" />
            </Link>

            <Link href="/studios" className="btn btn-secondary">
              <T en="Back to Studios" ar="العودة إلى الاستوديوهات" />
            </Link>
          </div>
        </div>
      </div>

      <div className="pulse-panel">
        <div className="card">
          <span className="badge">
            <T en="Studio Highlights" ar="مميزات الاستوديو" />
          </span>

          <h2>
            <T en="Designed for creators" ar="مصمم للمبدعين" />
          </h2>

          <p>
            <T
              en="Use this space for recording, production, podcasts, rehearsals, or content creation. More detailed amenities will be added later."
              ar="استخدم هذه المساحة للتسجيل، الإنتاج، البودكاست، التدريب، أو صناعة المحتوى. سيتم إضافة مميزات أكثر لاحقًا."
            />
          </p>

          <div className="stats-row">
            <div className="stat">
              <b>
                <T en="Live" ar="مباشر" />
              </b>
              <span>
                <T en="Booking request" ar="طلب الحجز" />
              </span>
            </div>

            <div className="stat">
              <b>
                <T en="Fast" ar="سريع" />
              </b>
              <span>
                <T en="Owner approval" ar="موافقة المالك" />
              </span>
            </div>

            <div className="stat">
              <b>
                <T en="Secure" ar="آمن" />
              </b>
              <span>
                <T en="Account based flow" ar="مسار مرتبط بالحساب" />
              </span>
            </div>
          </div>
        </div>

        <div className="card wave-card">
          <span className="badge">
            <T en="Sound Profile" ar="الملف الصوتي" />
          </span>

          <h2>
            <T en="Studio pulse" ar="نبض الاستوديو" />
          </h2>

          <p>
            <T
              en="Visual sound energy for this studio experience."
              ar="طاقة صوتية بصرية تعكس تجربة هذا الاستوديو."
            />
          </p>

          <div className="waveform" aria-hidden="true">
            {Array.from({ length: 36 }).map((_, index) => (
              <i key={index} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: 34 }} />

      <div className="section-head">
        <span className="badge">
          <T en="Gallery" ar="المعرض" />
        </span>

        <h1>
          <T en="Studio images" ar="صور الاستوديو" />
        </h1>
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
            <h2>
              <T en="No gallery images yet" ar="لا توجد صور في المعرض بعد" />
            </h2>
            <p>
              <T
                en="Gallery images for this studio will appear here later."
                ar="صور هذا الاستوديو ستظهر هنا لاحقًا."
              />
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
