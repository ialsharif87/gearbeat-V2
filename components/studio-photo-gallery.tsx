import Image from "next/image";
import T from "@/components/t";

type StudioImage = {
  id?: string;
  image_url?: string | null;
  url?: string | null;
  alt_text?: string | null;
  category?: string | null;
  is_cover?: boolean | null;
};

type StudioPhotoGalleryProps = {
  images: StudioImage[];
  studioName: string;
  coverImageUrl?: string | null;
};

function getImageUrl(image: StudioImage) {
  return image.image_url || image.url || "";
}

export default function StudioPhotoGallery({
  images,
  studioName,
  coverImageUrl,
}: StudioPhotoGalleryProps) {
  const cleanImages = images.filter((image) => getImageUrl(image));

  const coverImage =
    cleanImages.find((image) => image.is_cover) ||
    cleanImages[0] ||
    (coverImageUrl
      ? {
          image_url: coverImageUrl,
          alt_text: studioName,
          is_cover: true,
        }
      : null);

  const sideImages = cleanImages
    .filter((image) => getImageUrl(image) !== getImageUrl(coverImage || {}))
    .slice(0, 4);

  if (!coverImage) {
    return (
      <div
        className="card"
        style={{
          minHeight: 320,
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          background:
            "linear-gradient(135deg, rgba(207,167,98,0.16), rgba(255,255,255,0.04))",
        }}
      >
        <div>
          <h2>
            <T en="Studio photos coming soon" ar="صور الاستوديو قريبًا" />
          </h2>
          <p style={{ color: "var(--muted)" }}>
            <T
              en="This studio has not uploaded a complete photo gallery yet."
              ar="لم يقم هذا الاستوديو برفع معرض صور كامل بعد."
            />
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="studio-photo-gallery-container"
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: 12,
        minHeight: 420,
      }}
    >
      <div
        className="studio-cover-photo-wrapper"
        style={{
          position: "relative",
          minHeight: 420,
          borderRadius: 24,
          overflow: "hidden",
          background: "rgba(255,255,255,0.04)",
        }}
      >
        <Image
          src={getImageUrl(coverImage)}
          alt={coverImage.alt_text || studioName}
          fill
          sizes="(max-width: 900px) 100vw, 66vw"
          style={{ objectFit: "cover" }}
          priority
        />
      </div>

      <div
        className="studio-side-photos-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {sideImages.length > 0 ? (
          sideImages.map((image, index) => (
            <div
              key={image.id || `${getImageUrl(image)}-${index}`}
              style={{
                position: "relative",
                minHeight: 200,
                borderRadius: 18,
                overflow: "hidden",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <Image
                src={getImageUrl(image)}
                alt={image.alt_text || `${studioName} photo ${index + 1}`}
                fill
                sizes="(max-width: 900px) 50vw, 16vw"
                style={{ objectFit: "cover" }}
              />
            </div>
          ))
        ) : (
          <div
            className="card"
            style={{
              gridColumn: "1 / -1",
              minHeight: 420,
              display: "grid",
              placeItems: "center",
              textAlign: "center",
            }}
          >
            <p style={{ color: "var(--muted)" }}>
              <T
                en="More photos will be available soon."
                ar="سيتم إضافة صور أكثر قريبًا."
              />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
