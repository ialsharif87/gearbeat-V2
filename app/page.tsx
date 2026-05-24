import Link from "next/link";
import T from "../components/t";
import AskGearBeatPreview from "../components/ask-gearbeat-preview";
import { publicFeatureFlags } from "../lib/public-feature-flags";

const featureCards = [
  {
    title: { en: "Book Studios", ar: "حجز الاستوديوهات" },
    body: {
      en: "Discover creative rooms, review studio details, and plan sessions with confidence.",
      ar: "اكتشف المساحات الإبداعية، راجع تفاصيل الاستوديو، وخطط لجلساتك بثقة.",
    },
    href: "/studios",
    label: { en: "Find a studio", ar: "ابحث عن استوديو" },
  },
  {
    title: { en: "Marketplace", ar: "السوق" },
    body: {
      en: "Explore professional audio gear categories prepared for the GearBeat creator ecosystem.",
      ar: "استكشف فئات معدات الصوت الاحترافية المجهزة لمنظومة GearBeat الإبداعية.",
    },
    href: "/marketplace",
    label: { en: "Explore gear", ar: "استكشف المعدات" },
  },
  {
    title: { en: "Certified Studios", ar: "استوديوهات موثقة" },
    body: {
      en: "A premium trust layer for studios that complete GearBeat review requirements.",
      ar: "طبقة ثقة مميزة للاستوديوهات التي تستكمل متطلبات مراجعة GearBeat.",
    },
    href: "/gearbeat-certified",
    label: { en: "Learn more", ar: "اعرف المزيد" },
  },
  {
    title: { en: "Rewards", ar: "المكافآت" },
    body: {
      en: "A customer membership experience designed for future loyalty and creator benefits.",
      ar: "تجربة عضوية للعملاء مصممة لمزايا الولاء والمبدعين في المراحل القادمة.",
    },
    href: "/customer/rewards",
    label: { en: "View rewards", ar: "عرض المكافآت" },
  },
];

const studioPreviewCards = [
  {
    title: { en: "Recording rooms", ar: "غرف التسجيل" },
    body: {
      en: "Compare room style, creative fit, and studio readiness before you plan a session.",
      ar: "قارن أسلوب الغرفة، وملاءمتها الإبداعية، وجاهزية الاستوديو قبل التخطيط للجلسة.",
    },
  },
  {
    title: { en: "Production spaces", ar: "مساحات الإنتاج" },
    body: {
      en: "Browse spaces prepared for vocals, podcasts, music production, and sound design.",
      ar: "تصفح مساحات مناسبة للأداء الصوتي، والبودكاست، والإنتاج الموسيقي، وتصميم الصوت.",
    },
  },
  {
    title: { en: "Certified network", ar: "شبكة موثقة" },
    body: {
      en: "Review-focused studio discovery for a more professional booking journey.",
      ar: "اكتشاف استوديوهات قائم على المراجعة لتجربة حجز أكثر احترافية.",
    },
  },
];

const gearPreviewCards = [
  {
    title: { en: "Microphones", ar: "ميكروفونات" },
    body: { en: "Vocal, podcast, and studio recording essentials.", ar: "أساسيات التسجيل الصوتي والبودكاست والاستوديو." },
  },
  {
    title: { en: "Studio monitors", ar: "سماعات استوديو" },
    body: { en: "Reference listening categories for creators and rooms.", ar: "فئات استماع مرجعية للمبدعين والمساحات." },
  },
  {
    title: { en: "Production gear", ar: "معدات الإنتاج" },
    body: { en: "Controllers, interfaces, and creator workflow tools.", ar: "وحدات تحكم وواجهات وأدوات لسير عمل المبدعين." },
  },
  {
    title: { en: "Accessories", ar: "إكسسوارات" },
    body: { en: "Practical add-ons for sessions, setup, and care.", ar: "إضافات عملية للجلسات والتجهيز والعناية." },
  },
];

const trustItems = [
  { en: "Saudi and GCC ready", ar: "جاهز للسعودية والخليج" },
  { en: "Studio-first discovery", ar: "اكتشاف يركز على الاستوديو" },
  { en: "Partner review flow", ar: "مسار مراجعة الشركاء" },
  { en: "No live card claims", ar: "بدون ادعاء مدفوعات بطاقات مباشرة" },
];

function SoundWaveMotion() {
  return (
    <div className="cinema-wave" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

function PulseOrb() {
  return (
    <div className="pulse-orb" aria-hidden="true">
      <div className="orb-ring orb-ring-a" />
      <div className="orb-ring orb-ring-b" />
      <div className="orb-core">
        <SoundWaveMotion />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="home-root">
      <section className="cinema-hero">
        <div className="cinema-grid container">
          <div className="cinema-copy">
            <span className="cinema-kicker">
              <T en="GearBeat creative marketplace" ar="سوق GearBeat الإبداعي" />
            </span>

            <h1>
              <span>Book the space.</span>
              <span>Buy the gear.</span>
              <span>Create the sound.</span>
            </h1>

            <p className="cinema-arabic-line">
              احجز المكان، اشترِ المعدات، وابدأ الإبداع
            </p>

            <p className="cinema-lead">
              <T
                en="A premium dark-gold destination for creators to discover studios, explore audio gear, and prepare the next sound with a safer, phased marketplace experience."
                ar="وجهة فاخرة بالأسود والذهبي للمبدعين لاكتشاف الاستوديوهات، واستكشاف معدات الصوت، والتحضير للصوت القادم عبر تجربة سوق مرحلية أكثر أمانًا."
              />
            </p>

            <div className="cinema-actions">
              <Link href="/studios" className="btn btn-primary btn-lg shadow-gold">
                <T en="Book a Studio" ar="احجز استوديو" />
              </Link>
              <Link href="/marketplace" className="btn btn-outline btn-lg">
                <T en="Explore Marketplace" ar="استكشف السوق" />
              </Link>
            </div>

            <div className="trust-strip">
              {trustItems.map((item) => (
                <span key={item.en}>
                  <T en={item.en} ar={item.ar} />
                </span>
              ))}
            </div>
          </div>

          <div className="cinema-visual">
            <div className="visual-card glow-frame">
              <div className="visual-card-topline" />
              <PulseOrb />
              <div className="visual-stack">
                <span className="visual-chip">
                  <T en="Studio pulse" ar="نبض الاستوديو" />
                </span>
                <span className="visual-chip muted">
                  <T en="Marketplace layer" ar="طبقة السوق" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AskGearBeatPreview />

      <section className="cinema-section">
        <div className="container">
          <div className="cinema-section-head">
            <span className="cinema-kicker">
              <T en="Premium access paths" ar="مسارات وصول فاخرة" />
            </span>
            <h2>
              <T en="Everything starts with the sound." ar="كل شيء يبدأ بالصوت." />
            </h2>
          </div>

          <div className="feature-grid">
            {featureCards.map((feature) => (
              <Link href={feature.href} className="feature-card glow-frame" key={feature.title.en}>
                <span className="feature-wave" aria-hidden="true" />
                <h3>
                  <T en={feature.title.en} ar={feature.title.ar} />
                </h3>
                <p>
                  <T en={feature.body.en} ar={feature.body.ar} />
                </p>
                <strong>
                  <T en={feature.label.en} ar={feature.label.ar} />
                </strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="cinema-section studio-preview-section">
        <div className="container">
          <div className="cinema-split-head">
            <div>
              <span className="cinema-kicker">
                <T en="Featured studios preview" ar="معاينة الاستوديوهات" />
              </span>
              <h2>
                <T en="Browse the room before the session." ar="تصفح المساحة قبل الجلسة." />
              </h2>
            </div>
            <Link href="/studios" className="btn btn-outline">
              <T en="View studios" ar="عرض الاستوديوهات" />
            </Link>
          </div>

          <div className="studio-preview-grid">
            {studioPreviewCards.map((card) => (
              <article className="preview-card glow-frame" key={card.title.en}>
                <div className="preview-image studio-image" aria-hidden="true">
                  <SoundWaveMotion />
                </div>
                <h3>
                  <T en={card.title.en} ar={card.title.ar} />
                </h3>
                <p>
                  <T en={card.body.en} ar={card.body.ar} />
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cinema-section">
        <div className="container">
          <div className="cinema-split-head">
            <div>
              <span className="cinema-kicker">
                <T en="Featured gear preview" ar="معاينة المعدات" />
              </span>
              <h2>
                <T en="A marketplace built for audio culture." ar="سوق مصمم لثقافة الصوت." />
              </h2>
            </div>
            <Link href="/marketplace" className="btn btn-outline">
              <T en="Explore marketplace" ar="استكشف السوق" />
            </Link>
          </div>

          <div className="gear-preview-grid">
            {gearPreviewCards.map((card) => (
              <article className="gear-card glow-frame" key={card.title.en}>
                <div className="gear-mark" aria-hidden="true" />
                <h3>
                  <T en={card.title.en} ar={card.title.ar} />
                </h3>
                <p>
                  <T en={card.body.en} ar={card.body.ar} />
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cinema-section ecosystem-section">
        <div className="container">
          <div className="cinema-section-head">
            <span className="cinema-kicker">
              <T en="Ecosystem expansion" ar="توسيع المنظومة" />
            </span>
            <h2>
              <T en="Prepared in controlled phases." ar="يتم التحضير على مراحل مضبوطة." />
            </h2>
            <p>
              <T
                en="GearBeat is expanding carefully across creative services, learning, and experiences without overclaiming unavailable live operations."
                ar="تتوسع GearBeat بعناية عبر الخدمات الإبداعية والتعلم والتجارب دون مبالغة في ادعاء عمليات مباشرة غير متاحة."
              />
            </p>
          </div>

          <div className="coming-soon-grid">
            {publicFeatureFlags
              .filter((flag) => flag.showOnHomepage)
              .map((flag) => (
                <article key={flag.key} className="coming-card glow-frame">
                  <span className="badge-gold">
                    <T en={flag.safeStatusLabel.en} ar={flag.safeStatusLabel.ar} />
                  </span>
                  <h3>
                    <T en={flag.enLabel} ar={flag.arLabel} />
                  </h3>
                  <p>
                    <T en={flag.description.en} ar={flag.description.ar} />
                  </p>
                  <span className="coming-status">
                    <T en={flag.safeStatusIndicator.en} ar={flag.safeStatusIndicator.ar} />
                  </span>
                </article>
              ))}
          </div>
        </div>
      </section>

      <section className="final-cinema-cta">
        <div className="container">
          <span className="cinema-kicker">
            <T en="Start with the next session" ar="ابدأ من الجلسة القادمة" />
          </span>
          <h2>
            <T en="Your sound deserves a better stage." ar="صوتك يستحق منصة أفضل." />
          </h2>
          <div className="cinema-actions center">
            <Link href="/signup" className="btn btn-primary btn-lg shadow-gold">
              <T en="Create Account" ar="إنشاء حساب" />
            </Link>
            <Link href="/support" className="btn btn-outline btn-lg">
              <T en="Talk to GearBeat" ar="تحدث مع GearBeat" />
            </Link>
          </div>
        </div>
      </section>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .home-root {
          overflow: hidden;
          background:
            radial-gradient(circle at 15% 5%, rgba(212, 175, 55, 0.12), transparent 32%),
            radial-gradient(circle at 86% 12%, rgba(15, 160, 138, 0.08), transparent 28%),
            linear-gradient(180deg, #030507 0%, #0b0f16 38%, #030507 100%);
        }

        .cinema-hero {
          position: relative;
          min-height: calc(100vh - 80px);
          display: grid;
          align-items: center;
          padding: clamp(72px, 10vw, 132px) 0 clamp(48px, 8vw, 96px);
        }

        .cinema-hero::before,
        .cinema-hero::after {
          content: "";
          position: absolute;
          inset: auto -10% 0;
          height: 44%;
          pointer-events: none;
          background-image: repeating-linear-gradient(90deg, rgba(212,175,55,0.12) 0 1px, transparent 1px 58px);
          mask-image: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
          opacity: 0.28;
        }

        .cinema-hero::after {
          inset: 0 -10% auto;
          transform: rotate(180deg);
          opacity: 0.16;
        }

        .cinema-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: minmax(0, 1.04fr) minmax(320px, 0.76fr);
          gap: clamp(36px, 7vw, 88px);
          align-items: center;
        }

        .cinema-copy h1 {
          max-width: 820px;
          margin: 20px 0 16px;
          color: #fff;
          font-size: clamp(2.7rem, 7vw, 6.9rem);
          line-height: 0.92;
          letter-spacing: 0;
        }

        .cinema-copy h1 span {
          display: block;
        }

        .cinema-arabic-line {
          color: var(--gb-gold-light);
          font-size: clamp(1.15rem, 2.5vw, 2rem);
          font-weight: 800;
          margin: 0 0 22px;
        }

        .cinema-lead {
          max-width: 650px;
          color: rgba(248, 249, 250, 0.7);
          font-size: clamp(1rem, 1.7vw, 1.2rem);
          line-height: 1.8;
        }

        .cinema-kicker {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          min-height: 34px;
          padding: 7px 14px;
          border: 1px solid rgba(212, 175, 55, 0.38);
          border-radius: 999px;
          color: var(--gb-gold-light);
          background: rgba(212, 175, 55, 0.08);
          box-shadow: 0 0 26px rgba(212, 175, 55, 0.08);
          font-size: 0.76rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .cinema-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 34px;
        }

        .cinema-actions.center {
          justify-content: center;
        }

        .btn-lg {
          min-height: 56px;
          padding: 16px 28px;
        }

        .trust-strip {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          max-width: 760px;
          margin-top: 34px;
        }

        .trust-strip span {
          min-height: 54px;
          display: grid;
          place-items: center;
          padding: 10px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.035);
          color: rgba(248,249,250,0.72);
          font-size: 0.78rem;
          font-weight: 800;
          text-align: center;
        }

        .cinema-visual {
          display: grid;
          place-items: center;
          min-height: 480px;
        }

        .glow-frame {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(212, 175, 55, 0.2);
          background:
            radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.14), transparent 38%),
            linear-gradient(145deg, rgba(15,22,33,0.84), rgba(3,5,7,0.96));
          box-shadow: 0 24px 80px rgba(0,0,0,0.38), 0 0 34px rgba(212,175,55,0.07);
        }

        .glow-frame::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(135deg, rgba(255,255,255,0.08), transparent 36%, rgba(212,175,55,0.06));
          opacity: 0.72;
        }

        .visual-card {
          width: min(100%, 470px);
          min-height: 520px;
          display: grid;
          place-items: center;
          border-radius: 30px;
        }

        .visual-card-topline {
          position: absolute;
          top: 28px;
          left: 28px;
          right: 28px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(212,175,55,0.7), transparent);
        }

        .pulse-orb {
          position: relative;
          width: min(72vw, 320px);
          aspect-ratio: 1;
          display: grid;
          place-items: center;
        }

        .orb-core {
          width: 72%;
          aspect-ratio: 1;
          border-radius: 50%;
          display: grid;
          place-items: center;
          border: 2px solid rgba(212, 175, 55, 0.56);
          background:
            radial-gradient(circle at 35% 25%, rgba(244,212,122,0.32), transparent 22%),
            radial-gradient(circle, rgba(212,175,55,0.1), rgba(3,5,7,1) 72%);
          box-shadow: inset 0 0 44px rgba(212,175,55,0.16), 0 0 48px rgba(212,175,55,0.16);
        }

        .orb-ring {
          position: absolute;
          inset: 7%;
          border-radius: 50%;
          border: 1px solid rgba(212,175,55,0.32);
          animation: orbPulse 5.8s ease-in-out infinite;
        }

        .orb-ring-b {
          inset: -8%;
          animation-delay: -2.9s;
          opacity: 0.65;
        }

        @keyframes orbPulse {
          0%, 100% { transform: scale(0.88); opacity: 0.24; }
          50% { transform: scale(1.08); opacity: 0.68; }
        }

        .cinema-wave {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          min-height: 120px;
        }

        .cinema-wave span {
          width: 5px;
          height: 34px;
          border-radius: 999px;
          background: linear-gradient(180deg, transparent, var(--gb-gold-light), transparent);
          box-shadow: 0 0 15px rgba(212,175,55,0.4);
          animation: waveLift 1.9s ease-in-out infinite;
        }

        .cinema-wave span:nth-child(2) { animation-delay: 0.08s; height: 56px; }
        .cinema-wave span:nth-child(3) { animation-delay: 0.16s; height: 88px; }
        .cinema-wave span:nth-child(4) { animation-delay: 0.24s; height: 112px; }
        .cinema-wave span:nth-child(5) { animation-delay: 0.32s; height: 92px; }
        .cinema-wave span:nth-child(6) { animation-delay: 0.4s; height: 70px; }
        .cinema-wave span:nth-child(7) { animation-delay: 0.48s; height: 46px; }
        .cinema-wave span:nth-child(8) { animation-delay: 0.56s; height: 30px; }

        @keyframes waveLift {
          0%, 100% { transform: scaleY(0.72); opacity: 0.48; }
          50% { transform: scaleY(1.12); opacity: 1; }
        }

        .visual-stack {
          position: absolute;
          left: 24px;
          right: 24px;
          bottom: 24px;
          display: flex;
          gap: 10px;
          justify-content: space-between;
          flex-wrap: wrap;
        }

        .visual-chip {
          padding: 9px 12px;
          border-radius: 999px;
          border: 1px solid rgba(212,175,55,0.26);
          color: var(--gb-gold-light);
          background: rgba(0,0,0,0.36);
          font-size: 0.76rem;
          font-weight: 900;
        }

        .visual-chip.muted {
          color: rgba(248,249,250,0.68);
          border-color: rgba(255,255,255,0.1);
        }

        .cinema-section {
          padding: clamp(64px, 9vw, 116px) 0;
        }

        .cinema-section-head {
          max-width: 780px;
          margin: 0 auto 38px;
          text-align: center;
        }

        .cinema-section-head h2,
        .cinema-split-head h2,
        .final-cinema-cta h2 {
          margin-top: 18px;
          color: #fff;
          font-size: clamp(2rem, 5vw, 4.2rem);
          letter-spacing: 0;
        }

        .cinema-section-head p {
          margin: 16px auto 0;
          color: rgba(248,249,250,0.66);
          max-width: 720px;
        }

        .cinema-split-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 32px;
        }

        .feature-grid,
        .studio-preview-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        .feature-card,
        .preview-card,
        .gear-card,
        .coming-card {
          min-height: 270px;
          padding: 24px;
          border-radius: 22px;
        }

        .feature-card {
          display: grid;
          align-content: space-between;
        }

        .feature-card h3,
        .preview-card h3,
        .gear-card h3,
        .coming-card h3 {
          position: relative;
          color: #fff;
          margin: 18px 0 12px;
          font-size: 1.28rem;
          letter-spacing: 0;
        }

        .feature-card p,
        .preview-card p,
        .gear-card p,
        .coming-card p {
          position: relative;
          color: rgba(248,249,250,0.65);
          line-height: 1.7;
          font-size: 0.92rem;
        }

        .feature-card strong {
          position: relative;
          color: var(--gb-gold-light);
          font-size: 0.86rem;
        }

        .feature-wave {
          position: relative;
          width: 82px;
          height: 28px;
          display: block;
          border-radius: 999px;
          background: repeating-linear-gradient(90deg, rgba(212,175,55,0.25) 0 4px, transparent 4px 10px);
          box-shadow: 0 0 22px rgba(212,175,55,0.12);
        }

        .studio-preview-section {
          background: rgba(0,0,0,0.28);
          border-block: 1px solid rgba(255,255,255,0.05);
        }

        .preview-card {
          min-height: 360px;
        }

        .preview-image {
          position: relative;
          height: 170px;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid rgba(212,175,55,0.16);
          background:
            linear-gradient(135deg, rgba(255,255,255,0.05), transparent),
            radial-gradient(circle at 50% 50%, rgba(212,175,55,0.16), transparent 46%),
            #05080b;
        }

        .preview-image .cinema-wave {
          transform: scale(0.62);
          min-height: 170px;
        }

        .gear-preview-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .gear-card {
          min-height: 230px;
        }

        .gear-mark {
          position: relative;
          width: 62px;
          aspect-ratio: 1;
          border-radius: 18px;
          background:
            radial-gradient(circle, rgba(244,212,122,0.28), transparent 54%),
            linear-gradient(135deg, rgba(212,175,55,0.28), rgba(15,160,138,0.08));
          border: 1px solid rgba(212,175,55,0.32);
        }

        .coming-soon-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .coming-card {
          min-height: 300px;
          display: grid;
          align-content: start;
          gap: 12px;
        }

        .coming-status {
          position: relative;
          width: fit-content;
          margin-top: auto;
          padding: 8px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(248,249,250,0.55);
          font-size: 0.78rem;
          font-weight: 800;
        }

        .final-cinema-cta {
          padding: clamp(78px, 12vw, 142px) 0;
          text-align: center;
          background:
            radial-gradient(circle at 50% 0%, rgba(212,175,55,0.16), transparent 42%),
            #000;
          border-top: 1px solid rgba(212,175,55,0.1);
        }

        .final-cinema-cta h2 {
          max-width: 820px;
          margin-inline: auto;
        }

        @media (prefers-reduced-motion: reduce) {
          .orb-ring,
          .cinema-wave span {
            animation: none;
          }
        }

        @media (max-width: 1100px) {
          .cinema-grid {
            grid-template-columns: 1fr;
          }

          .cinema-visual {
            min-height: 380px;
            order: -1;
          }

          .visual-card {
            min-height: 390px;
          }

          .feature-grid,
          .studio-preview-grid,
          .gear-preview-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .coming-soon-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .cinema-hero {
            min-height: auto;
            padding-top: 42px;
          }

          .cinema-copy h1 {
            font-size: clamp(2.45rem, 16vw, 4rem);
          }

          .cinema-actions,
          .cinema-actions .btn {
            width: 100%;
          }

          .trust-strip,
          .feature-grid,
          .studio-preview-grid,
          .gear-preview-grid,
          .coming-soon-grid {
            grid-template-columns: 1fr;
          }

          .cinema-split-head {
            align-items: stretch;
            flex-direction: column;
          }

          .cinema-split-head .btn {
            width: 100%;
          }

          .visual-card {
            border-radius: 24px;
          }
        }

        [dir="rtl"] .cinema-copy,
        [dir="rtl"] .cinema-split-head {
          direction: rtl;
        }
      `,
        }}
      />
    </main>
  );
}
