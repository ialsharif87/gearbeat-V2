import Link from "next/link";
import T from "@/components/t";

const steps = [
  {
    number: "01",
    title: { en: "Find the right studio", ar: "ابحث عن الاستوديو المناسب" },
    body: {
      en: "Browse studios by city, service, and starting price.",
      ar: "تصفح الاستوديوهات حسب المدينة والخدمة والسعر المبدئي.",
    },
  },
  {
    number: "02",
    title: { en: "Review the details", ar: "راجع التفاصيل" },
    body: {
      en: "Check photos, equipment, services, location, and booking notes.",
      ar: "راجع الصور والمعدات والخدمات والموقع وملاحظات الحجز.",
    },
  },
  {
    number: "03",
    title: { en: "Send a booking request", ar: "أرسل طلب الحجز" },
    body: {
      en: "Choose your preferred date and time. The studio reviews the request before confirmation.",
      ar: "اختر التاريخ والوقت المفضلين. يراجع الاستوديو الطلب قبل التأكيد.",
    },
  },
];
export default function HomePage() {
  return (
    <main className="mvp-home">
      <section className="mvp-hero">
        <div className="container mvp-hero-grid">
          <div className="mvp-hero-copy">
            <span className="mvp-kicker">
              <T en="Saudi & GCC studio marketplace" ar="سوق استوديوهات للسعودية والخليج" />
            </span>
            <h1>
              <T
                en="Find the space for your next sound."
                ar="اعثر على المكان المناسب لصوتك القادم."
              />
            </h1>
            <p className="mvp-lead">
              <T
                en="GearBeat is a premium marketplace for finding studios and sound services, starting with clear studio booking requests across Saudi Arabia and the GCC."
                ar="GearBeat سوق مميز لاكتشاف الاستوديوهات والخدمات الصوتية، ويبدأ بتجربة واضحة لإرسال طلبات حجز الاستوديوهات في السعودية والخليج."
              />
            </p>
            <div className="mvp-actions">
              <Link href="/studios" className="btn btn-primary mvp-primary">
                <T en="Find a Studio" ar="ابحث عن استوديو" />
              </Link>
              <Link href="/join/studio" className="btn btn-outline">
                <T en="List Your Studio" ar="أضف استوديوك" />
              </Link>            </div>
            <p className="mvp-safe-note">
              <T
                en="Booking requests are reviewed by the studio before confirmation. No payment is collected when a request is sent."
                ar="تتم مراجعة طلب الحجز من قبل الاستوديو قبل التأكيد. لا يتم تحصيل أي دفعة عند إرسال الطلب."
              />
            </p>
          </div>

          <div className="mvp-hero-card" aria-hidden="true">
            <div className="mvp-room-frame">
              <div className="mvp-wave">
                {Array.from({ length: 14 }).map((_, index) => (
                  <span key={index} />
                ))}
              </div>
              <div className="mvp-room-label">GEARBEAT</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mvp-section">
        <div className="container">
          <div className="mvp-section-head">
            <span className="mvp-kicker">
              <T en="Simple by design" ar="تجربة بسيطة وواضحة" />
            </span>
            <h2><T en="From discovery to request in three steps." ar="من الاكتشاف إلى طلب الحجز بثلاث خطوات." /></h2>
          </div>          <div className="mvp-steps">
            {steps.map((step) => (
              <article className="mvp-step-card" key={step.number}>
                <span className="mvp-step-number">{step.number}</span>
                <h3><T en={step.title.en} ar={step.title.ar} /></h3>
                <p><T en={step.body.en} ar={step.body.ar} /></p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mvp-section mvp-split-section">
        <div className="container mvp-split">
          <article className="mvp-feature-card mvp-feature-primary">
            <span className="mvp-kicker"><T en="Available now" ar="متاح الآن" /></span>
            <h2><T en="Studio discovery & booking requests" ar="اكتشاف الاستوديوهات وطلبات الحجز" /></h2>
            <p>
              <T
                en="Compare studio profiles, services, equipment, location, and starting prices before sending a request."
                ar="قارن ملفات الاستوديوهات والخدمات والمعدات والموقع والأسعار المبدئية قبل إرسال الطلب."
              />
            </p>
            <Link href="/studios" className="btn btn-primary">
              <T en="Browse Studios" ar="تصفح الاستوديوهات" />
            </Link>
          </article>

          <article className="mvp-feature-card">            <span className="mvp-kicker"><T en="Catalog preview" ar="معاينة الكتالوج" /></span>
            <h2><T en="Audio gear catalog" ar="كتالوج معدات الصوت" /></h2>
            <p>
              <T
                en="Explore selected audio products for reference. Checkout, shipping, and warranty services are not enabled in the MVP."
                ar="استكشف منتجات صوتية مختارة للمرجعية. الشراء والشحن والضمان غير مفعلة في النسخة الأولية."
              />
            </p>
            <Link href="/marketplace" className="btn btn-outline">
              <T en="View Gear Catalog" ar="عرض كتالوج المعدات" />
            </Link>
          </article>
        </div>
      </section>

      <section className="mvp-final">
        <div className="container mvp-final-inner">
          <div>
            <span className="mvp-kicker"><T en="For studio owners" ar="لأصحاب الاستوديوهات" /></span>
            <h2><T en="Bring your studio to GearBeat." ar="أضف استوديوك إلى GearBeat." /></h2>
            <p>
              <T
                en="Create your partner application and prepare your studio profile for review."
                ar="أنشئ طلب الشراكة وجهّز ملف استوديوك للمراجعة."
              />
            </p>
          </div>
          <Link href="/join/studio" className="btn btn-primary">            <T en="List Your Studio" ar="أضف استوديوك" />
          </Link>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .mvp-home { overflow: hidden; background: var(--gb-bg); }
        .mvp-hero { position: relative; padding: clamp(64px, 9vw, 120px) 0; border-bottom: 1px solid var(--gb-border); background: radial-gradient(circle at 78% 22%, rgba(212,175,55,.14), transparent 32%), linear-gradient(180deg, #070a0e, var(--gb-bg)); }
        .mvp-hero-grid { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(320px, .9fr); gap: clamp(36px, 7vw, 96px); align-items: center; }
        .mvp-kicker { display: inline-flex; width: fit-content; padding: 7px 12px; border-radius: 999px; border: 1px solid rgba(212,175,55,.3); background: rgba(212,175,55,.07); color: var(--gb-gold-light); font-size: .78rem; font-weight: 800; }
        .mvp-hero h1 { max-width: 780px; margin: 20px 0 18px; font-size: clamp(2.5rem, 6vw, 5.2rem); line-height: .98; letter-spacing: -.045em; }
        [dir="rtl"] .mvp-hero h1 { letter-spacing: 0; line-height: 1.15; }
        .mvp-lead { max-width: 700px; color: rgba(248,249,250,.72); font-size: clamp(1rem, 1.5vw, 1.2rem); line-height: 1.8; }
        .mvp-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 28px; }
        .mvp-actions .btn { min-height: 52px; }
        .mvp-primary { min-width: 180px; }
        .mvp-safe-note { max-width: 650px; margin-top: 18px; color: var(--gb-text-muted); font-size: .88rem; line-height: 1.7; }
        .mvp-hero-card { min-height: 420px; display: grid; place-items: center; }
        .mvp-room-frame { position: relative; width: min(100%, 520px); aspect-ratio: 1.2; overflow: hidden; border-radius: 30px; border: 1px solid rgba(212,175,55,.24); background: linear-gradient(145deg, rgba(212,175,55,.1), rgba(255,255,255,.02)), url("/brand/studio-placeholder.jpg") center/cover; box-shadow: 0 30px 90px rgba(0,0,0,.45); }
        .mvp-room-frame::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.75)); }
        .mvp-wave { position: absolute; inset: 42% 9% auto; z-index: 2; height: 90px; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .mvp-wave span { width: 5px; height: 38px; border-radius: 99px; background: var(--gb-gold-light); box-shadow: 0 0 18px rgba(212,175,55,.5); }
        .mvp-wave span:nth-child(3n) { height: 78px; } .mvp-wave span:nth-child(2n) { height: 56px; }
        .mvp-room-label { position: absolute; z-index: 2; inset-inline-start: 24px; bottom: 20px; color: var(--gb-gold-light); font-size: .78rem; font-weight: 900; letter-spacing: .18em; }
        .mvp-section { padding: clamp(56px, 8vw, 96px) 0; }        .mvp-section-head { max-width: 780px; margin-bottom: 32px; }
        .mvp-section-head h2, .mvp-feature-card h2, .mvp-final h2 { margin: 16px 0 12px; font-size: clamp(1.8rem, 3.4vw, 3rem); }
        .mvp-steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
        .mvp-step-card, .mvp-feature-card { border: 1px solid var(--gb-border); border-radius: 20px; background: linear-gradient(145deg, rgba(255,255,255,.035), rgba(15,22,33,.82)); }
        .mvp-step-card { padding: 24px; }
        .mvp-step-number { color: var(--gb-gold); font-size: .78rem; font-weight: 900; }
        .mvp-step-card h3 { margin: 24px 0 10px; font-size: 1.25rem; }
        .mvp-step-card p, .mvp-feature-card p, .mvp-final p { color: var(--gb-text-muted); line-height: 1.75; }
        .mvp-split-section { border-top: 1px solid rgba(255,255,255,.04); border-bottom: 1px solid rgba(255,255,255,.04); background: rgba(0,0,0,.14); }
        .mvp-split { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 18px; }
        .mvp-feature-card { padding: clamp(24px, 4vw, 38px); }
        .mvp-feature-primary { border-color: rgba(212,175,55,.32); background: radial-gradient(circle at top right, rgba(212,175,55,.12), transparent 42%), var(--gb-card); }
        .mvp-feature-card .btn { margin-top: 22px; }
        .mvp-final { padding: clamp(56px, 7vw, 88px) 0; }
        .mvp-final-inner { display: flex; justify-content: space-between; gap: 24px; align-items: center; padding: clamp(24px, 4vw, 40px); border: 1px solid rgba(212,175,55,.28); border-radius: 22px; background: linear-gradient(120deg, rgba(212,175,55,.09), rgba(255,255,255,.02)); }
        @media (max-width: 900px) { .mvp-hero-grid, .mvp-split { grid-template-columns: 1fr; } .mvp-hero-card { min-height: auto; } .mvp-steps { grid-template-columns: 1fr; } }
        @media (max-width: 600px) { .mvp-hero { padding-top: 48px; } .mvp-actions, .mvp-final-inner { flex-direction: column; align-items: stretch; } .mvp-actions .btn, .mvp-final .btn { width: 100%; } .mvp-room-frame { border-radius: 20px; } }
      `}} />
    </main>
  );
}
