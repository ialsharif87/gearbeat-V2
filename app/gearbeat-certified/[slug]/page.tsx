import Link from "next/link";
import T from "@/components/t";
import StudioTierBadge from "@/components/studio-tier-badge";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CertifiedVerificationPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch approved certification by studio slug
  const { data: cert } = await supabase
    .from("certified_studios")
    .select(`
      id,
      status,
      trust_score,
      created_at,
      studio:studios!inner (
        name_en,
        name_ar,
        slug
      ),
      tier:studio_tiers (
        level,
        name_en,
        name_ar
      )
    `)
    .eq("studio.slug", slug)
    .eq("status", "approved") // RLS also handles this, but explicit is better
    .maybeSingle();

  const mapLevelToTier = (level: number): any => {
    switch (level) {
      case 1: return 'verified';
      case 2: return 'trusted';
      case 3: return 'premium';
      case 4: return 'elite';
      case 5: return 'flagship';
      default: return 'verified';
    }
  };

  const studioData = Array.isArray(cert?.studio) ? cert.studio[0] : cert?.studio;
  const tierData = Array.isArray(cert?.tier) ? cert.tier[0] : cert?.tier;
  const displayName = studioData?.name_en || studioData?.name_ar || slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  if (!cert) {
    return (
      <main className="verification-root">
        <div className="container animate-up">
          <div className="verification-card card-premium text-center">
            <div className="certified-badge-large" style={{ borderColor: '#333', opacity: 0.3 }}>
              <span className="star-icon">✕</span>
            </div>
            <h1 className="studio-name">{displayName}</h1>
            <div className="status-banner" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', marginTop: 30 }}>
              <div className="status-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>!</div>
              <div className="status-text">
                <h3 style={{ color: '#ef4444' }}><T en="Not Verified" ar="غير موثق" /></h3>
                <p><T en="This studio does not currently have an active GearBeat Certification." ar="هذا الاستوديو ليس لديه حالياً توثيق نشط من GearBeat." /></p>
              </div>
            </div>
            <div style={{ marginTop: 40 }}>
              <Link href="/studios" className="btn btn-outline w-full">
                <T en="Browse Verified Studios" ar="تصفح الاستوديوهات الموثقة" />
              </Link>
            </div>
          </div>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `.verification-root { padding: 120px 0 80px; min-height: 100vh; } .verification-card { max-width: 600px; margin: 0 auto; padding: 40px; background: #080808; border: 1px solid #111; } .studio-name { font-size: 2.2rem; color: #fff; }` }} />
      </main>
    );
  }

  return (
    <main className="verification-root">
      <div className="container animate-up">
        {/* VERIFICATION CARD */}
        <div className="verification-card card-premium">
          <div className="verification-header text-center">
            <div className="certified-badge-large">
              <span className="star-icon">Γÿà</span>
            </div>
            <h1 className="studio-name">{displayName}</h1>
            <div className="tier-wrapper" style={{ marginTop: 12 }}>
              <StudioTierBadge tier={mapLevelToTier(tierData?.level || 1)} />
            </div>
          </div>

          <div className="verification-body">
            <div className="status-banner success">
              <div className="status-icon">Γ£ô</div>
              <div className="status-text">
                <h3><T en="Verified by GearBeat" ar="┘à┘ê╪½┘é ┘à┘å ╪¼┘è╪▒╪¿┘è╪¬" /></h3>
                <p><T en="This studio has passed our high-trust certification audit." ar="┘ç╪░╪º ╪º┘ä╪º╪│╪¬┘ê╪»┘è┘ê ╪º╪¼╪¬╪º╪▓ ╪¬╪»┘é┘è┘é ╪º┘ä╪¬┘ê╪½┘è┘é ╪╣╪º┘ä┘è ╪º┘ä╪½┘é╪⌐ ╪º┘ä╪«╪º╪╡ ╪¿┘å╪º." /></p>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <span className="label"><T en="Certification Status" ar="╪¡╪º┘ä╪⌐ ╪º┘ä╪¬┘ê╪½┘è┘é" /></span>
                <strong className="value success"><T en="ACTIVE" ar="┘å╪┤╪╖" /></strong>
              </div>
              <div className="info-item">
                <span className="label"><T en="Last Verified" ar="آخر توثيق" /></span>
                <strong className="value">{new Date(cert.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</strong>
              </div>
              <div className="info-item">
                <span className="label"><T en="Trust Score" ar="درجة الثقة" /></span>
                <strong className="value">{cert.trust_score}/100</strong>
              </div>
            </div>

            <div className="trust-details">
              <div className="trust-box">
                <h4>≡ƒ¢á∩╕Å <T en="Hardware Audit" ar="╪¬╪»┘é┘è┘é ╪º┘ä╪╣╪¬╪º╪»" /></h4>
                <p><T en="The listed professional gear has been physically verified by our experts." ar="╪¬┘à ╪º┘ä╪¬╪¡┘é┘é ┘à┘å ╪º┘ä┘à╪╣╪»╪º╪¬ ╪º┘ä╪º╪¡╪¬╪▒╪º┘ü┘è╪⌐ ╪º┘ä┘à╪»╪▒╪¼╪⌐ ┘ü╪╣┘ä┘è╪º┘ï ┘à┘å ┘é╪¿┘ä ╪«╪¿╪▒╪º╪ª┘å╪º." /></p>
              </div>
              <div className="trust-box">
                <h4>≡ƒöè <T en="Acoustic Quality" ar="╪º┘ä╪¼┘ê╪»╪⌐ ╪º┘ä╪╡┘ê╪¬┘è╪⌐" /></h4>
                <p><T en="Room acoustics and monitoring systems meet professional industry standards." ar="╪╡┘ê╪¬┘è╪º╪¬ ╪º┘ä╪║╪▒┘ü╪⌐ ┘ê╪ú┘å╪╕┘à╪⌐ ╪º┘ä┘à╪▒╪º┘é╪¿╪⌐ ╪¬╪│╪¬┘ê┘ü┘è ┘à╪╣╪º┘è┘è╪▒ ╪º┘ä╪╡┘å╪º╪╣╪⌐ ╪º┘ä╪º╪¡╪¬╪▒╪º┘ü┘è╪⌐." /></p>
              </div>
            </div>

            <div className="qr-explanation">
              <p className="text-muted" style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
                <T 
                  en="QR Verification: Every GearBeat Certified studio has a unique physical QR code in their space. Scan the physical code to ensure you are in the verified location."
                  ar="╪¬┘ê╪½┘è┘é QR: ┘â┘ä ╪º╪│╪¬┘ê╪»┘è┘ê ┘à┘ê╪½┘é ┘à┘å ╪¼┘è╪▒╪¿┘è╪¬ ┘ä╪»┘è┘ç ╪▒┘à╪▓ QR ┘à╪º╪»┘è ┘ü╪▒┘è╪» ┘ü┘è ┘à╪│╪º╪¡╪¬┘ç. ╪º┘à╪│╪¡ ╪º┘ä╪▒┘à╪▓ ╪º┘ä┘à╪º╪»┘è ┘ä┘ä╪¬╪ú┘â╪» ┘à┘å ╪ú┘å┘â ┘ü┘è ╪º┘ä┘à┘ê┘é╪╣ ╪º┘ä┘à┘ê╪½┘é."
                />
              </p>
            </div>
          </div>

          <div className="verification-footer">
            <Link href={`/studios/${studioData?.slug}`} className="btn btn-primary w-full">
              <T en="Book This Studio" ar="احجز هذا الاستوديو" />
            </Link>
            <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
              <Link href="/gearbeat-certified" className="btn btn-outline flex-1">
                <T en="Learn About Certification" ar="╪¬╪╣╪▒┘ü ╪╣┘ä┘ë ╪º┘ä╪¬┘ê╪½┘è┘é" />
              </Link>
              <button className="btn btn-outline flex-1" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}>
                <T en="Report Issue" ar="╪Ñ╪¿┘ä╪º╪║ ╪╣┘å ┘à╪┤┘â┘ä╪⌐" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .verification-root {
          padding: 120px 0 80px;
          background: radial-gradient(circle at 50% 0%, rgba(201, 162, 77, 0.1) 0%, transparent 50%);
          min-height: 100vh;
        }

        .verification-card {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px;
          background: #080808;
          border: 1px solid rgba(201, 162, 77, 0.2);
          box-shadow: 0 20px 60px rgba(0,0,0,0.8);
        }

        .certified-badge-large {
          width: 80px;
          height: 80px;
          border: 3px solid var(--gb-gold);
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0 auto 20px;
          box-shadow: 0 0 20px rgba(201, 162, 77, 0.4);
        }
        .certified-badge-large .star-icon {
          font-size: 2.5rem;
          color: var(--gb-gold);
        }

        .studio-name {
          font-size: 2.2rem;
          font-weight: 900;
          letter-spacing: -1px;
          color: #fff;
        }

        .verification-body { margin-top: 40px; }

        .status-banner {
          display: flex;
          gap: 20px;
          padding: 24px;
          border-radius: 16px;
          margin-bottom: 30px;
        }
        .status-banner.success {
          background: rgba(45, 212, 191, 0.08);
          border: 1px solid rgba(45, 212, 191, 0.2);
        }
        .status-icon {
          font-size: 1.5rem;
          font-weight: 900;
          color: #2dd4bf;
          width: 40px;
          height: 40px;
          background: rgba(45, 212, 191, 0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .status-text h3 { color: #2dd4bf; font-size: 1.1rem; margin-bottom: 4px; }
        .status-text p { color: #666; font-size: 0.9rem; margin: 0; }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 40px;
          padding: 20px;
          background: rgba(255,255,255,0.02);
          border-radius: 12px;
        }
        .info-item { text-align: center; }
        .info-item .label { display: block; font-size: 0.7rem; color: #555; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
        .info-item .value { font-size: 1rem; color: #fff; font-weight: 800; }
        .info-item .value.success { color: #2dd4bf; }

        .trust-details { display: grid; gap: 16px; margin-bottom: 30px; }
        .trust-box { padding: 20px; background: rgba(255,255,255,0.03); border-radius: 12px; }
        .trust-box h4 { font-size: 1rem; margin-bottom: 8px; color: #fff; }
        .trust-box p { font-size: 0.85rem; color: #888; margin: 0; line-height: 1.5; }

        .qr-explanation {
          padding: 16px;
          border-left: 2px solid var(--gb-gold);
          background: rgba(201, 162, 77, 0.05);
          margin-bottom: 40px;
        }

        .w-full { width: 100%; }
        .flex-1 { flex: 1; }

        @media (max-width: 600px) {
          .verification-card { padding: 24px; }
          .info-grid { grid-template-columns: 1fr; gap: 20px; }
          .studio-name { font-size: 1.8rem; }
        }

        [dir="rtl"] .qr-explanation { border-left: none; border-right: 2px solid var(--gb-gold); }
      `}} />
    </main>
  );
}
