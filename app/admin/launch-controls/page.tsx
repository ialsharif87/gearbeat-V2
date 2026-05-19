import { requireAdminLayoutAccess } from "@/lib/route-guards";
import T from "@/components/t";
import { publicFeatureFlags } from "@/lib/public-feature-flags";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminLaunchControls() {
  // Ensure the user has layout-level admin access
  await requireAdminLayoutAccess();

  return (
    <main className="gb-launch-controls-page" style={{ padding: '40px 24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <section className="launch-controls-header" style={{ marginBottom: 40, borderBottom: '1px solid var(--gb-border)', paddingBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p className="gb-eyebrow" style={{ color: 'var(--gb-gold)', margin: 0, textTransform: 'uppercase', letterSpacing: '1.5px', fontSize: '0.75rem', fontWeight: 800 }}>
              <T en="Super Admin Console" ar="لوحة الإدارة العليا" />
            </p>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 900, margin: '8px 0 0', letterSpacing: '-1px', color: 'white' }}>
              <T en="Feature Launch Controls" ar="ضوابط إطلاق الميزات" />
            </h1>
          </div>
          <div>
            <Link href="/admin" className="btn btn-outline btn-sm">
              <T en="← Back to Dashboard" ar="← العودة للوحة التحكم" />
            </Link>
          </div>
        </div>

        {/* Informative Banner */}
        <div style={{ 
          marginTop: 24, 
          padding: '16px 20px', 
          background: 'rgba(212, 175, 55, 0.05)', 
          border: '1px solid rgba(212, 175, 55, 0.15)', 
          borderRadius: 8, 
          display: 'flex', 
          flexDirection: 'column',
          gap: 4
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--gb-gold)' }}>
            <span>⚠️</span>
            <T en="Preview Mode Only" ar="وضع المعاينة فقط" />
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--gb-text-muted)', lineHeight: 1.5 }}>
            <T 
              en="This interface displays the public feature visibility configurations configured in lib/public-feature-flags.ts. Database-backed editing, persistence, and live toggles are not activated in this patch." 
              ar="تعرض هذه الواجهة إعدادات وضوح الميزات العامة المحددة في ملف lib/public-feature-flags.ts. لم يتم تفعيل الحفظ في قاعدة البيانات أو التغيير المباشر في هذا الإصدار." 
            />
          </p>
        </div>
      </section>

      {/* Feature Table / Grid */}
      <section style={{ display: 'grid', gap: 24 }}>
        {publicFeatureFlags.map((feature) => (
          <div key={feature.key} style={{ 
            background: '#0c0e12', 
            border: '1px solid var(--gb-border)', 
            borderRadius: 12, 
            padding: 24,
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Status indicators */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '2rem' }}>{feature.iconEmoji}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                    <T en={feature.enLabel} ar={feature.arLabel} />
                  </h3>
                  <code style={{ fontSize: '0.75rem', color: 'var(--gb-gold-light)', opacity: 0.8 }}>key: {feature.key}</code>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ 
                  background: 'rgba(212, 175, 55, 0.1)', 
                  color: 'var(--gb-gold)', 
                  border: '1px solid rgba(212, 175, 55, 0.3)', 
                  padding: '4px 10px', 
                  borderRadius: 20, 
                  fontSize: '0.7rem', 
                  fontWeight: 800,
                  textTransform: 'uppercase'
                }}>
                  {feature.status}
                </span>
                <span style={{ 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  color: '#fff', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  padding: '4px 10px', 
                  borderRadius: 20, 
                  fontSize: '0.7rem', 
                  fontWeight: 800
                }}>
                  <T en={feature.safeStatusLabel.en} ar={feature.safeStatusLabel.ar} />
                </span>
              </div>
            </div>

            {/* Description */}
            <p style={{ fontSize: '0.9rem', color: 'var(--gb-text-muted)', margin: '0 0 24px', lineHeight: 1.6 }}>
              <T en={feature.description.en} ar={feature.description.ar} />
            </p>

            {/* Config metadata fields */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
              gap: 16, 
              borderTop: '1px solid rgba(255,255,255,0.05)', 
              paddingTop: 20 
            }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--gb-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                  <T en="Show in Header" ar="عرض في الهيدر" />
                </span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: feature.showInHeader ? '#00ff88' : '#ef4444' }}>
                  {feature.showInHeader ? "🟢 ENABLED" : "🔴 DISABLED"}
                </span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--gb-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                  <T en="Show in Footer" ar="عرض في الفوتر" />
                </span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: feature.showInFooter ? '#00ff88' : '#ef4444' }}>
                  {feature.showInFooter ? "🟢 ENABLED" : "🔴 DISABLED"}
                </span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--gb-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                  <T en="Show on Homepage" ar="عرض في الصفحة الرئيسية" />
                </span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: feature.showOnHomepage ? '#00ff88' : '#ef4444' }}>
                  {feature.showOnHomepage ? "🟢 ENABLED" : "🔴 DISABLED"}
                </span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--gb-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                  <T en="Admin Preview Allowed" ar="معاينة الإدارة مسموحة" />
                </span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: feature.adminPreviewAllowed ? '#00ff88' : '#ef4444' }}>
                  {feature.adminPreviewAllowed ? "🟢 YES" : "🔴 NO"}
                </span>
              </div>

              {feature.publicPath && (
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--gb-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                    <T en="Public Path" ar="المسار العام" />
                  </span>
                  <code style={{ fontSize: '0.8rem', color: '#cfa86e' }}>{feature.publicPath}</code>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
