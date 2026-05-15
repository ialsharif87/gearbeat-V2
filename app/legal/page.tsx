import { Metadata } from "next";
import Link from "next/link";
import T from "@/components/t";

export const metadata: Metadata = {
  title: "Legal & Policies Hub",
  description: "Access GearBeat's terms of service, privacy policy, and marketplace rules. Stay informed about our platform standards and user protections.",
};

export default function LegalHubPage() {
  const policies = [
    { titleEn: 'Terms of Service', titleAr: 'شروط الخدمة', path: '/legal/terms', icon: '📜' },
    { titleEn: 'Privacy Policy', titleAr: 'سياسة الخصوصية', path: '/legal/privacy', icon: '🔒' },
    { titleEn: 'Marketplace Policy', titleAr: 'سياسة السوق', path: '/legal/marketplace-policy', icon: '🛍️' },
    { titleEn: 'Booking Policy', titleAr: 'سياسة الحجز', path: '/legal/booking-policy', icon: '📅' },
    { titleEn: 'Ticketing Policy', titleAr: 'سياسة التذاكر', path: '/legal/ticketing-policy', icon: '🎫' },
    { titleEn: 'Academy Policy', titleAr: 'سياسة الأكاديمية', path: '/legal/academy-policy', icon: '🎓' },
  ];

  return (
    <main className="dashboard-page" style={{ maxWidth: 1000, margin: "0 auto", padding: "100px 24px" }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <div className="badge-gold mb-16 ms-auto me-auto">
          <T en="Official Platform Governance" ar="الحوكمة الرسمية للمنصة" />
        </div>
        <div style={{ display: 'inline-block', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--gb-gold)', padding: '6px 16px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 800, marginBottom: 24 }}>
          <T en="PILOT PHASE NOTICE" ar="تنبيه المرحلة التجريبية" />
        </div>
        <h1 className="text-balance" style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", fontWeight: 900, marginBottom: 24 }}>
          <T en="Legal & Policies" ar="الشؤون القانونية والسياسات" />
        </h1>
        <p className="text-muted text-balance" style={{ maxWidth: 600, marginInline: 'auto', lineHeight: 1.6 }}>
          <T 
            en="GearBeat is currently in a controlled Pilot Phase. The following documents establish the framework for platform rules, user protection, and pre-launch compliance."
            ar="GearBeat حالياً في مرحلة تجريبية محكومة. الوثائق التالية ترسي إطار قواعد المنصة، حماية المستخدم، والامتثال لما قبل الإطلاق."
          />
        </p>
      </div>

      <div className="grid grid-2 gap-24">
        {policies.map(p => (
          <Link key={p.path} href={p.path} className="card-premium animate-up" style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '32px 40px', textDecoration: 'none', color: 'inherit', borderRadius: 'var(--gb-radius-md)' }}>
            <div style={{ fontSize: '2.5rem' }}>{p.icon}</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: 4, fontWeight: 800 }}><T en={p.titleEn} ar={p.titleAr} /></h2>
              <span className="text-gold" style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: 0.5 }}>
                <T en="VIEW POLICY" ar="عرض السياسة" /> →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
