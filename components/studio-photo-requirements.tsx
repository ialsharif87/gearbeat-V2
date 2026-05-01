import T from "@/components/t";
import {
  STUDIO_MAX_PHOTOS,
  STUDIO_MIN_PHOTOS,
  STUDIO_REQUIRED_PHOTO_CATEGORIES,
  analyzeStudioPhotoCompletion,
  getStudioPhotoCategoryLabel,
  type StudioPhotoLike,
} from "@/lib/studios/photo-standards";

type StudioPhotoRequirementsProps = {
  images?: StudioPhotoLike[];
  compact?: boolean;
};

export default function StudioPhotoRequirements({
  images = [],
  compact = false,
}: StudioPhotoRequirementsProps) {
  const analysis = analyzeStudioPhotoCompletion(images);

  return (
    <div
      className="card"
      style={{
        borderColor: analysis.isComplete
          ? "rgba(0,255,136,0.25)"
          : "rgba(255,176,32,0.35)",
        background: analysis.isComplete
          ? "rgba(0,255,136,0.04)"
          : "rgba(255,176,32,0.07)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div>
          <span className="badge">
            <T en="Photo standards" ar="معايير الصور" />
          </span>

          <h3 style={{ marginTop: 10 }}>
            <T
              en="Studio gallery requirements"
              ar="متطلبات صور الاستوديو"
            />
          </h3>

          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            <T
              en="Professional photos help customers trust the studio and book with confidence."
              ar="الصور الاحترافية تساعد العملاء على الثقة بالاستوديو والحجز بثقة."
            />
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <strong style={{ fontSize: "1.6rem" }}>
            {analysis.photoCount}/{STUDIO_MIN_PHOTOS}
          </strong>
          <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            <T en="minimum photos" ar="الحد الأدنى للصور" />
          </div>
        </div>
      </div>

      {!compact ? (
        <div style={{ marginTop: 18 }}>
          <div className="grid grid-2">
            <div>
              <h4>
                <T en="Required" ar="مطلوب" />
              </h4>

              <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                {STUDIO_REQUIRED_PHOTO_CATEGORIES.map((category) => {
                  const label = getStudioPhotoCategoryLabel(category);
                  const isMissing =
                    analysis.missingRequiredCategories.includes(category);

                  return (
                    <div
                      key={category}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <span>{label.en} / {label.ar}</span>
                      <span
                        style={{
                          color: isMissing ? "#ffb020" : "#00ff88",
                          fontWeight: 700,
                        }}
                      >
                        {isMissing ? "Missing" : "OK"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h4>
                <T en="Quality rules" ar="قواعد الجودة" />
              </h4>

              <ul style={{ color: "var(--muted)", lineHeight: 1.8 }}>
                <li>
                  <T en="No blurry photos." ar="لا صور ضبابية." />
                </li>
                <li>
                  <T en="No watermarks." ar="لا علامات مائية." />
                </li>
                <li>
                  <T en="No phone screenshots." ar="لا لقطات شاشة من الهاتف." />
                </li>
                <li>
                  <T
                    en={`Upload between ${STUDIO_MIN_PHOTOS} and ${STUDIO_MAX_PHOTOS} photos.`}
                    ar={`ارفع بين ${STUDIO_MIN_PHOTOS} و ${STUDIO_MAX_PHOTOS} صورة.`}
                  />
                </li>
                <li>
                  <T
                    en="Use wide, bright, realistic photos."
                    ar="استخدم صورًا واسعة وواضحة وواقعية."
                  />
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
