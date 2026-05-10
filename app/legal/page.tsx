import Link from "next/link";
import T from "@/components/t";

export default function LegalHubPage() {
  const policies = [
    { titleEn: 'Terms of Service', titleAr: 'شروط الخدمة', path: '/legal/terms', icon: '📜' },
    { titleEn: 'Privacy Policy', titleAr: 'سياسة الخصوصية', path: '/legal/privacy', icon: '🔒' },
    { titleEn: 'Marketplace Policy', titleAr: 'سياسة السوق', path: '/legal/marketplace-policy', icon: '🛍️' },
    { titleEn: 'Booking Policy', titleAr: 'سياسة الحجز', path: '/legal/booking-policy', icon: '📅' },
    { titleEn: 'Ticketing Policy', titleAr: 'سياسة التذاكر', path: '/legal/ticketing-policy', icon: '🎫' },
  ];

  return (
    <main className="dashboard-page" style={{ maxWidth: 1000, margin: "0 auto", padding: "60px 20px" }}>
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <span className="badge badge-warning" style={{ marginBottom: 16 }}>
          <T en="DRAFT / PLANNING PHASE" ar="مسودة / مرحلة التخطيط" />
        </span>
        <h1 style={{ fontSize: "3rem", marginBottom: 16 }}>
          <T en="Legal & Policies" ar="الشؤون القانونية والسياسات" />
        </h1>
        <p style={{ color: 'var(--muted)', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
          <T 
            en="These documents are currently in draft form for architectural planning. They do not constitute final legal advice and are pending review by legal counsel before the official launch."
            ar="هذه الوثائق حالياً بصيغة مسودة للتخطيط المعماري. وهي لا تشكل استشارة قانونية نهائية وبانتظار مراجعة المستشار القانوني قبل الإطلاق الرسمي."
          />
        </p>
      </div>

      <div className="grid grid-2 gap-24">
        {policies.map(p => (
          <Link key={p.path} href={p.path} className="card-premium" style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 32, textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: '2.5rem' }}>{p.icon}</div>
            <div>
              <h2 style={{ fontSize: '1.2rem', marginBottom: 4 }}><T en={p.titleEn} ar={p.titleAr} /></h2>
              <span className="text-gold" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                <T en="View Draft" ar="عرض المسودة" /> →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
