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
      className="gb-card"
      style={{
        borderInlineStart: analysis.isComplete
          ? "4px solid var(--gb-teal)"
          : "4px solid var(--gb-gold)",
        background: analysis.isComplete
          ? "rgba(15, 160, 138, 0.05)"
          : "rgba(212, 175, 55, 0.05)",
        padding: '32px'
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: '24px',
          alignItems: "flex-start",
          flexWrap: "wrap",
          marginBottom: '32px'
        }}
      >
        <div style={{ flex: 1, minWidth: '300px' }}>
          <p className="gb-eyebrow">
            <T en="Visual Standards" ar="معايير الصور" />
          </p>

          <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', margin: '8px 0' }}>
            <T
              en="Studio Gallery Requirements"
              ar="متطلبات معرض الصور"
            />
          </h3>

          <p className="gb-muted-text" style={{ fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '500px' }}>
            <T
              en="High-quality, professional photography is essential for building trust and increasing booking conversion rates."
              ar="الصور الاحترافية عالية الجودة ضرورية لبناء الثقة وزيادة معدلات تحويل الحجوزات."
            />
          </p>
        </div>

        <div style={{ textAlign: "right", background: 'rgba(255,255,255,0.05)', padding: '16px 24px', borderRadius: '16px', border: '1px solid var(--gb-border)' }}>
          <strong style={{ fontSize: "2rem", fontWeight: 900, color: 'white', display: 'block' }}>
            {analysis.photoCount}<span style={{ opacity: 0.3, fontSize: '1.2rem' }}>/{STUDIO_MIN_PHOTOS}</span>
          </strong>
          <div className="gb-eyebrow" style={{ marginTop: '4px' }}>
            <T en="Photos Uploaded" ar="صور تم رفعها" />
          </div>
        </div>
      </div>

      {!compact && (
        <div className="gb-dash-grid-4" style={{ gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📸</span> <T en="Required Angles" ar="الزوايا المطلوبة" />
            </h4>

            <div style={{ display: "grid", gap: '12px' }}>
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
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: 'rgba(0,0,0,0.2)',
                      borderRadius: '12px',
                      border: '1px solid var(--gb-border)'
                    }}
                  >
                    <span style={{ fontSize: '0.9rem', color: 'white', fontWeight: 600 }}>{label.en} / {label.ar}</span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '4px 12px',
                        borderRadius: '6px',
                        background: isMissing ? 'rgba(212, 175, 55, 0.1)' : 'rgba(15, 160, 138, 0.1)',
                        color: isMissing ? 'var(--gb-gold)' : 'var(--gb-teal)'
                      }}
                    >
                      {isMissing ? <T en="Missing" ar="مفقود" /> : <T en="Ready" ar="جاهز" />}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✨</span> <T en="Quality Guidelines" ar="إرشادات الجودة" />
            </h4>

            <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'grid', gap: '12px' }}>
              {[
                { en: "No blurry or low-res photos.", ar: "لا صور ضبابية أو منخفضة الدقة." },
                { en: "No watermarks or text overlays.", ar: "لا علامات مائية أو نصوص مضافة." },
                { en: "No phone screenshots.", ar: "لا لقطات شاشة من الهاتف." },
                { en: `Upload ${STUDIO_MIN_PHOTOS}-${STUDIO_MAX_PHOTOS} photos.`, ar: `ارفع بين ${STUDIO_MIN_PHOTOS} و ${STUDIO_MAX_PHOTOS} صورة.` },
                { en: "Use wide, bright, realistic angles.", ar: "استخدم زوايا واسعة، واضحة وواقعية." }
              ].map((rule, idx) => (
                <li key={idx} style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', display: 'flex', gap: '10px', alignItems: 'start' }}>
                  <span style={{ color: 'var(--gb-gold)' }}>•</span>
                  <T en={rule.en} ar={rule.ar} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
