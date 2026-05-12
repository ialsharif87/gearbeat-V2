import { Metadata } from "next";
import Link from "next/link";
import T from "@/components/t";

export const metadata: Metadata = {
  title: "Audio Events & Masterclasses",
  description: "Secure your tickets to exclusive studio workshops, music masterclasses, and elite audio industry events on GearBeat.",
};

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

      {/* FEATURED EXPERIENCES GRID */}
      <section style={{ marginTop: 80 }}>
        <div className="flex-between" style={{ marginBottom: 32 }}>
          <div>
            <h2 style={{ fontSize: '2.2rem' }}>
              <T en="Featured Experiences" ar="تجارب مميزة" />
            </h2>
            <p style={{ color: 'var(--muted)', marginTop: 8 }}>
              <T en="Hand-picked events from the world's elite creators." ar="فعاليات مختارة بعناية من نخبة المبدعين في العالم." />
            </p>
          </div>
          <div className="badge-gold">
            <T en="6 Events Found" ar="تم العثور على 6 فعاليات" />
          </div>
        </div>

        <div className="grid grid-3 gap-24">
          {[
            { titleEn: 'Studio Sessions', titleAr: 'جلسات استوديو', tagEn: 'Recording', tagAr: 'تسجيل', icon: '🎙️', locationEn: 'Riyadh Hub', locationAr: 'مركز الرياض' },
            { titleEn: 'Creator Workshops', titleAr: 'ورش عمل المبدعين', tagEn: 'Education', tagAr: 'تعليم', icon: '🎹', locationEn: 'Dubai Creative', locationAr: 'دبي الإبداعية' },
            { titleEn: 'Listening Events', titleAr: 'فعاليات الاستماع', tagEn: 'Social', tagAr: 'اجتماعي', icon: '🎧', locationEn: 'London Gallery', locationAr: 'معرض لندن' },
            { titleEn: 'Product Launches', titleAr: 'إطلاق منتجات', tagEn: 'Gear', tagAr: 'معدات', icon: '🚀', locationEn: 'Berlin Lab', locationAr: 'مختبر برلين' },
            { titleEn: 'Live Performances', titleAr: 'عروض مباشرة', tagEn: 'Concert', tagAr: 'حفلة', icon: '🎸', locationEn: 'NY Stage', locationAr: 'مسرح نيويورك' },
            { titleEn: 'Private Industry Events', titleAr: 'فعاليات صناعة خاصة', tagEn: 'VIP', tagAr: 'كبار الشخصيات', icon: '👔', locationEn: 'Paris Lounge', locationAr: 'لاونج باريس' }
          ].map(event => (
            <div key={event.titleEn} className="card-premium" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: 160, background: 'linear-gradient(45deg, #111, #1a1a1a)', display: 'grid', placeItems: 'center', fontSize: '3rem' }}>
                {event.icon}
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span className="badge"><T en={event.tagEn} ar={event.tagAr} /></span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--gb-gold)', fontWeight: 800 }}>🛡️ VERIFIED</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: 8 }}><T en={event.titleEn} ar={event.titleAr} /></h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: '0.8rem' }}>
                  <span>📍</span>
                  <T en={event.locationEn} ar={event.locationAr} />
                </div>
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: 'var(--gb-gold)' }}>TBA</span>
                  <span className="btn btn-outline btn-sm" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                    <T en="View Event" ar="عرض الفعالية" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DISCOVERY TRUST & READINESS */}
      <section style={{ marginTop: 80 }}>
        <div className="card-premium" style={{ background: 'rgba(0,0,0,0.4)', padding: 40, border: '1px dashed rgba(212, 175, 55, 0.2)' }}>
          <div className="grid grid-2 gap-40 items-center">
            <div>
              <h2 style={{ marginBottom: 16 }}><T en="Secure Experience Discovery" ar="اكتشاف تجارب آمن" /></h2>
              <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
                <T
                  en="Every experience on GearBeat is verified for safety, quality, and technical readiness. Our ticketing engine ensures secure access for creators and fans alike."
                  ar="تتم مراجعة كل تجربة على جيربيت للتأكد من السلامة والجودة والجاهزية الفنية. يضمن محرك حجز التذاكر لدينا وصولاً آمناً للمبدعين والمعجبين على حد سواء."
                />
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 24 }}>
                <div className="badge-gold" style={{ fontSize: '0.7rem' }}>✅ Verified Organizer</div>
                <div className="badge-gold" style={{ fontSize: '0.7rem' }}>✅ Secure Ticketing</div>
                <div className="badge-gold" style={{ fontSize: '0.7rem' }}>✅ Event Readiness</div>
                <div className="badge-gold" style={{ fontSize: '0.7rem' }}>✅ Future QR Check-in</div>
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: 32, background: 'rgba(212, 175, 55, 0.03)', borderRadius: 20 }}>
               <h4 style={{ marginBottom: 12 }}><T en="Platform Readiness" ar="جاهزية المنصة" /></h4>
               <div style={{ display: 'grid', gap: 10 }}>
                 {[
                   { label: 'Discovery Grid', status: '✅ READY' },
                   { label: 'Experience Cards', status: '✅ READY' },
                   { label: 'Trust Integration', status: '✅ READY' },
                   { label: 'Mobile Optimization', status: '✅ READY' },
                   { label: 'Checkout Flow', status: '⏳ COMING SOON' },
                 ].map(i => (
                   <div key={i.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                     <span style={{ color: '#888' }}>{i.label}</span>
                     <span style={{ fontWeight: 800, color: i.status === '✅ READY' ? '#10b981' : '#888' }}>{i.status}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* MOBILE EXPERIENCE READINESS */}
      <section style={{ marginTop: 40 }}>
        <div className="card-premium" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.4), rgba(212, 175, 55, 0.02))', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: "1.8rem" }}>📲</span>
                <h3 style={{ fontSize: "1.3rem" }}><T en="Native Mobile Access" ar="وصول عبر تطبيق المحمول الأصلي" /></h3>
                <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>COMING SOON</span>
              </div>
              <p style={{ color: 'var(--muted)', maxWidth: 600, lineHeight: 1.6 }}>
                <T
                  en="The future GearBeat mobile app will feature native Digital Wallet integration for digital tickets and rapid QR code entry at events."
                  ar="سيتميز تطبيق جيربيت المستقبلي للهواتف المحمولة بدمج المحفظة الرقمية الأصلية للتذاكر الرقمية والدخول السريع عبر رمز الاستجابة السريعة (QR) في الفعاليات."
                />
              </p>
            </div>
            <div style={{ padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed rgba(212,175,55,0.3)', textAlign: 'center', minWidth: 200 }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎫</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--gb-gold)', fontWeight: 800 }}><T en="Digital Pass Sync" ar="مزامنة التذاكر الرقمية" /></div>
              <div style={{ fontSize: '0.7rem', color: '#888', marginTop: 4 }}>Coming Soon</div>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section style={{ marginTop: 100, textAlign: 'center', paddingBottom: 100 }}>
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
