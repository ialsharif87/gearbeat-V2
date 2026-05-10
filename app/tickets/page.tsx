import Link from "next/link";
import T from "@/components/t";

export default function TicketsLandingPage() {
  return (
    <main className="dashboard-page" style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 20px" }}>
      {/* HERO SECTION */}
      <section className="section-head animate-up">
        <span className="badge-gold">
          <T en="GearBeat Experiences" ar="تجارب جيربيت" />
        </span>
        <h1 style={{ fontSize: "3.5rem", marginTop: 16 }}>
          <T en="Access premium" ar="احصل على" />{" "}
          <span className="neon-text">
            <T en="audio events." ar="فعاليات صوتية مميزة." />
          </span>
        </h1>
        <p className="lead" style={{ maxWidth: 700, margin: "24px 0", color: "var(--gb-text-muted)" }}>
          <T 
            en="From intimate studio workshops to global concerts and exclusive creator experiences. Secure your spot in the future of sound."
            ar="من ورش العمل الخاصة في الاستوديو إلى الحفلات العالمية وتجارب المبدعين الحصرية. احجز مكانك في مستقبل الصوت."
          />
        </p>
      </section>

      {/* EVENT CATEGORIES */}
      <section style={{ marginTop: 60 }}>
        <div className="grid grid-3 gap-24">
          {[
            { 
              icon: '🎸', 
              en: 'Concerts & Live', 
              ar: 'حفلات وعروض مباشرة', 
              descEn: 'Experience elite performances in verified venues.', 
              descAr: 'استمتع بعروض مميزة في أماكن موثقة.'
            },
            { 
              icon: '🎙️', 
              en: 'Studio Workshops', 
              ar: 'ورش عمل استوديو', 
              descEn: 'Master your craft with pro audio sessions.', 
              descAr: 'احترف مهنتك مع جلسات صوتية احترافية.'
            },
            { 
              icon: '🎟️', 
              en: 'Creator Events', 
              ar: 'فعاليات المبدعين', 
              descEn: 'Exclusive meetups and creative activations.', 
              descAr: 'لقاءات حصرية وتنشيطات إبداعية.'
            }
          ].map(item => (
            <div key={item.en} className="card-premium" style={{ padding: 32 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 20 }}>{item.icon}</div>
              <h3 style={{ marginBottom: 12 }}><T en={item.en} ar={item.ar} /></h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                <T en={item.descEn} ar={item.descAr} />
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST LAYER */}
      <section className="card" style={{ marginTop: 60, background: 'rgba(212, 175, 55, 0.03)', border: '1px solid rgba(212, 175, 55, 0.1)' }}>
        <div className="grid grid-4 gap-16">
          {[
            { icon: '🛡️', en: 'Verified Organizers', ar: 'منظمون موثقون' },
            { icon: '🔒', en: 'Secure Ticketing', ar: 'حجز تذاكر آمن' },
            { icon: '🤝', en: 'Partner Approved', ar: 'معتمد من الشركاء' },
            { icon: '✨', en: 'Event Readiness', ar: 'جاهزية الفعاليات' },
          ].map(trust => (
            <div key={trust.en} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.2rem' }}>{trust.icon}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                <T en={trust.en} ar={trust.ar} />
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section style={{ marginTop: 80, textAlign: 'center' }}>
        <div className="card-premium" style={{ padding: '60px 20px', background: 'linear-gradient(to bottom, rgba(212, 175, 55, 0.05), transparent)' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: 20 }}>
            <T en="Coming Soon to GearBeat" ar="قريباً على جيربيت" />
          </h2>
          <p style={{ color: 'var(--muted)', marginBottom: 40, maxWidth: 600, marginInline: 'auto' }}>
            <T 
              en="We are currently onboarding elite event partners. Our secure ticketing engine and event extranet are under final testing."
              ar="نعمل حالياً على ضم شركاء فعاليات متميزين. محرك حجز التذاكر الآمن وإكسترانت الفعاليات قيد الاختبار النهائي."
            />
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link href="/partner/tickets" className="btn btn-primary">
              <T en="Join as Event Partner" ar="انضم كشريك فعاليات" />
            </Link>
            <Link href="/" className="btn btn-outline">
              <T en="Stay Notified" ar="ابق على اطلاع" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
