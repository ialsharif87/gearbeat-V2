import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import T from "@/components/t";
import Link from "next/link";

export default async function StudioVerificationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch studio and certification details
  const { data: studio, error } = await supabase
    .from("studios")
    .select(`
      id,
      name,
      slug,
      image_url,
      certified_studios!inner(
        status,
        last_verified_date,
        studio_tiers(
          level,
          name_en,
          name_ar
        )
      )
    `)
    .eq("slug", slug)
    .single();

  if (error || !studio) {
    notFound();
  }

  const cert = studio.certified_studios as any;
  const tier = cert.studio_tiers;
  const isVerified = cert.status === 'approved';

  return (
    <div className="verification-page">
      <div className="verification-card container">
        <div className="verification-header">
          <div className="gb-logo gb-logo-md">
            <div className="gb-logo-word-group">
              <span className="gb-logo-word">Gear<span>Beat</span></span>
              <span className="gb-logo-tagline">CERTIFIED PARTNER</span>
            </div>
          </div>
          <div className={`status-badge ${isVerified ? 'verified' : 'unverified'}`}>
            {isVerified ? (
              <T en="✓ Verified" ar="✓ موثق" />
            ) : (
              <T en="✕ Unverified" ar="✕ غير موثق" />
            )}
          </div>
        </div>

        <div className="studio-visual">
          {studio.image_url && (
            <img src={studio.image_url} alt={studio.name} className="studio-hero-img" />
          )}
          <div className="tier-overlay">
            <span className={`tier-tag tier-${tier.level}`}>
              <T en={tier.name_en} ar={tier.name_ar} />
            </span>
          </div>
        </div>

        <div className="verification-content">
          <h1>{studio.name}</h1>
          <p className="trust-message">
            <T 
              en="This studio is GearBeat Certified. Its profile, booking flow, and customer reviews are verified by GearBeat."
              ar="هذا الاستوديو معتمد من GearBeat. تم التحقق من بياناته، ويمكن حجزه بأمان عبر المنصة."
            />
          </p>

          <div className="trust-grid">
            <div className="trust-item">
              <span className="icon">🛡️</span>
              <div className="text">
                <strong><T en="Secure Booking" ar="حجز آمن" /></strong>
                <p><T en="Protected by GearBeat Escrow" ar="محمي بنظام الضمان من GearBeat" /></p>
              </div>
            </div>
            <div className="trust-item">
              <span className="icon">⭐</span>
              <div className="text">
                <strong><T en="Verified Reviews" ar="تقييمات حقيقية" /></strong>
                <p><T en="From real creative sessions" ar="من جلسات إبداعية حقيقية" /></p>
              </div>
            </div>
            <div className="trust-item">
              <span className="icon">📅</span>
              <div className="text">
                <strong><T en="Last Verified" ar="آخر توثيق" /></strong>
                <p>{new Date(cert.last_verified_date).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="verification-actions">
            <Link href={`/studios/${studio.slug}`} className="btn-primary">
              <T en="View Studio & Book" ar="عرض الاستوديو والحجز" />
            </Link>
            <button className="btn-report">
              <T en="Report an issue" ar="إبلاغ عن مشكلة" />
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .verification-page {
          min-height: 100vh;
          background: #050505;
          padding: 80px 20px;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .verification-card {
          max-width: 700px;
          width: 100%;
          background: #0c0b0a;
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 40px;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0,0,0,0.5), 0 0 40px rgba(212, 175, 55, 0.1);
          animation: fadeIn 0.8s ease-out;
        }

        .verification-header {
          padding: 30px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .status-badge {
          padding: 8px 16px;
          border-radius: 99px;
          font-weight: 800;
          font-size: 0.85rem;
        }

        .status-badge.verified {
          background: rgba(103, 197, 135, 0.1);
          color: #67c587;
          border: 1px solid rgba(103, 197, 135, 0.3);
        }

        .studio-visual {
          position: relative;
          height: 300px;
          overflow: hidden;
        }

        .studio-hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .tier-overlay {
          position: absolute;
          bottom: 20px;
          left: 40px;
        }

        [dir="rtl"] .tier-overlay {
          left: auto;
          right: 40px;
        }

        .tier-tag {
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 1rem;
          box-shadow: 0 10px 20px rgba(0,0,0,0.4);
        }

        .tier-1 { background: #555; color: #fff; }
        .tier-2 { background: #34495e; color: #fff; }
        .tier-3 { background: #c0392b; color: #fff; }
        .tier-4 { background: #8e44ad; color: #fff; }
        .tier-5 { background: var(--gb-gold, #d4af37); color: #000; }

        .verification-content {
          padding: 40px;
        }

        .verification-content h1 {
          font-size: 2.5rem;
          margin-bottom: 20px;
          letter-spacing: -0.02em;
        }

        .trust-message {
          color: #888;
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 40px;
        }

        .trust-grid {
          display: grid;
          gap: 24px;
          margin-bottom: 50px;
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 20px;
          background: rgba(255,255,255,0.02);
          padding: 20px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .trust-item .icon {
          font-size: 1.8rem;
        }

        .trust-item strong {
          display: block;
          color: #fff;
          margin-bottom: 4px;
        }

        .trust-item p {
          color: #666;
          font-size: 0.9rem;
          margin: 0;
        }

        .verification-actions {
          display: flex;
          gap: 16px;
        }

        .btn-primary {
          flex: 2;
          background: var(--gb-gold, #d4af37);
          color: #000;
          padding: 16px;
          border-radius: 16px;
          font-weight: 800;
          text-align: center;
          text-decoration: none;
          transition: transform 0.2s;
        }

        .btn-primary:hover { transform: translateY(-4px); }

        .btn-report {
          flex: 1;
          background: rgba(255,255,255,0.05);
          color: #666;
          border: 1px solid rgba(255,255,255,0.1);
          padding: 16px;
          border-radius: 16px;
          font-weight: 700;
          cursor: pointer;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 600px) {
          .verification-actions { flex-direction: column; }
          .verification-content h1 { font-size: 1.8rem; }
        }
      `}} />
    </div>
  );
}
