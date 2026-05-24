import Link from "next/link";
import T from "../components/t";
import { publicFeatureFlags } from "../lib/public-feature-flags";

const pathways = [
  {
    href: "/studios",
    eyebrow: { en: "Rooms", ar: "مساحات" },
    title: { en: "Book Studios", ar: "حجز الاستوديوهات" },
    body: {
      en: "Step into rooms shaped for vocals, podcasts, production, and focused sound work.",
      ar: "ادخل إلى مساحات مصممة للأداء الصوتي والبودكاست والإنتاج والعمل الصوتي المركز.",
    },
    cta: { en: "Browse rooms", ar: "تصفح المساحات" },
  },
  {
    href: "/marketplace",
    eyebrow: { en: "Gear", ar: "معدات" },
    title: { en: "Marketplace", ar: "السوق" },
    body: {
      en: "Explore audio tools and creative setup categories prepared for GearBeat creators.",
      ar: "استكشف أدوات الصوت وفئات التجهيز الإبداعي المجهزة لمبدعي GearBeat.",
    },
    cta: { en: "Explore gear", ar: "استكشف المعدات" },
  },
  {
    href: "/gearbeat-certified",
    eyebrow: { en: "Trust", ar: "ثقة" },
    title: { en: "Certified Studios", ar: "استوديوهات موثقة" },
    body: {
      en: "A premium review layer for studios ready to build deeper creator confidence.",
      ar: "طبقة مراجعة مميزة للاستوديوهات الجاهزة لبناء ثقة أعمق مع المبدعين.",
    },
    cta: { en: "See the standard", ar: "شاهد المعيار" },
  },
  {
    href: "/customer/rewards",
    eyebrow: { en: "Membership", ar: "عضوية" },
    title: { en: "Rewards", ar: "المكافآت" },
    body: {
      en: "A customer experience foundation for future loyalty, access, and creator benefits.",
      ar: "أساس تجربة عملاء لمزايا مستقبلية للولاء والوصول ودعم المبدعين.",
    },
    cta: { en: "View membership", ar: "عرض العضوية" },
  },
];

const studioPreviews = [
  {
    href: "/studios",
    title: { en: "Vocal-ready rooms", ar: "غرف جاهزة للأداء الصوتي" },
    body: {
      en: "Preview the mood, room type, and creative fit before opening studio details.",
      ar: "عاين الأجواء ونوع الغرفة وملاءمتها الإبداعية قبل فتح تفاصيل الاستوديو.",
    },
  },
  {
    href: "/studios",
    title: { en: "Production suites", ar: "أجنحة إنتاج" },
    body: {
      en: "Move from idea to arrangement with spaces built for longer creative focus.",
      ar: "انتقل من الفكرة إلى التوزيع داخل مساحات مصممة للتركيز الإبداعي الطويل.",
    },
  },
  {
    href: "/gearbeat-certified",
    title: { en: "Certified discovery", ar: "اكتشاف موثق" },
    body: {
      en: "A cleaner path to compare studios with review-ready presentation and trust cues.",
      ar: "مسار أنظف لمقارنة الاستوديوهات بعرض جاهز للمراجعة وإشارات ثقة واضحة.",
    },
  },
];

const gearPreviews = [
  {
    href: "/marketplace",
    title: { en: "Microphones", ar: "ميكروفونات" },
    body: { en: "Voice, podcast, and recording essentials.", ar: "أساسيات الصوت والبودكاست والتسجيل." },
  },
  {
    href: "/marketplace",
    title: { en: "Studio monitors", ar: "سماعات استوديو" },
    body: { en: "Reference listening and room-building categories.", ar: "فئات للاستماع المرجعي وتجهيز المساحات." },
  },
  {
    href: "/marketplace",
    title: { en: "Interfaces", ar: "واجهات صوتية" },
    body: { en: "Signal flow tools for modern creator setups.", ar: "أدوات تدفق الإشارة لتجهيزات المبدعين الحديثة." },
  },
  {
    href: "/marketplace",
    title: { en: "Accessories", ar: "إكسسوارات" },
    body: { en: "Practical details that make sessions smoother.", ar: "تفاصيل عملية تجعل الجلسات أكثر سلاسة." },
  },
];

const trustItems = [
  { en: "Verified listings", ar: "قوائم موثقة" },
  { en: "Manual review readiness", ar: "جاهزية مراجعة يدوية" },
  { en: "Creator-first experience", ar: "تجربة تبدأ من المبدع" },
  { en: "Support-ready journey", ar: "مسار جاهز للدعم" },
];

function CinematicWave() {
  return (
    <div className="wow-wave" aria-hidden="true">
      {Array.from({ length: 18 }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

function PulseOrb() {
  return (
    <div className="beat-orb" aria-hidden="true">
      <div className="beat-orb-ring ring-one" />
      <div className="beat-orb-ring ring-two" />
      <div className="beat-orb-core">
        <div className="beat-center" />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="home-root wow-home">
      <section className="wow-hero">
        <div className="hero-light hero-light-a" />
        <div className="hero-light hero-light-b" />

        <div className="container wow-hero-inner">
          <div className="wow-hero-copy">
            <span className="wow-kicker">
              <T en="Saudi-first studio marketplace" ar="سوق استوديوهات سعودي أولًا" />
            </span>

            <h1>
              <span>Book the space.</span>
              <span className="gold-shimmer">Buy the gear.</span>
              <span>Create the sound.</span>
            </h1>

            <p className="arabic-line">احجز المكان، اشترِ المعدات، وابدأ الإبداع</p>

            <p className="hero-lead">
              <T
                en="GearBeat brings studio discovery and audio marketplace exploration into one premium sound-driven experience for creators across Saudi Arabia and the GCC."
                ar="تجمع GearBeat اكتشاف الاستوديوهات واستكشاف سوق معدات الصوت في تجربة فاخرة تقودها روح الصوت للمبدعين في السعودية والخليج."
              />
            </p>

            <div className="hero-actions">
              <Link href="/studios" className="btn btn-primary hero-btn">
                <T en="Book a Studio" ar="احجز استوديو" />
              </Link>
              <Link href="/marketplace" className="btn btn-outline hero-btn">
                <T en="Explore Marketplace" ar="استكشف السوق" />
              </Link>
            </div>
          </div>

          <div className="wow-stage">
            <div className="stage-frame">
              <div className="stage-depth-lines" aria-hidden="true" />
              <PulseOrb />
              <div className="wave-ribbon">
                <CinematicWave />
              </div>
              <div className="floating-card studio-float">
                <span>
                  <T en="Studio rooms" ar="مساحات استوديو" />
                </span>
                <strong>
                  <T en="Browse before booking" ar="تصفح قبل الحجز" />
                </strong>
              </div>
              <div className="floating-card gear-float">
                <span>
                  <T en="Audio gear" ar="معدات صوت" />
                </span>
                <strong>
                  <T en="Explore before buying" ar="استكشف قبل الشراء" />
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pathway-section">
        <div className="container">
          <div className="section-title-row">
            <span className="wow-kicker">
              <T en="Choose your next move" ar="اختر خطوتك التالية" />
            </span>
            <h2>
              <T en="Four ways into the GearBeat world." ar="أربع بوابات إلى عالم GearBeat." />
            </h2>
          </div>

          <div className="pathway-stage">
            {pathways.map((pathway, index) => (
              <Link href={pathway.href} className="pathway-card" key={pathway.title.en}>
                <span className="path-index">0{index + 1}</span>
                <span className="path-eyebrow">
                  <T en={pathway.eyebrow.en} ar={pathway.eyebrow.ar} />
                </span>
                <h3>
                  <T en={pathway.title.en} ar={pathway.title.ar} />
                </h3>
                <p>
                  <T en={pathway.body.en} ar={pathway.body.ar} />
                </p>
                <strong>
                  <T en={pathway.cta.en} ar={pathway.cta.ar} />
                </strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="studios-cinema">
        <div className="container">
          <div className="split-heading">
            <div>
              <span className="wow-kicker">
                <T en="Featured studios preview" ar="معاينة الاستوديوهات" />
              </span>
              <h2>
                <T en="Browse the atmosphere before booking." ar="تصفح الأجواء قبل الحجز." />
              </h2>
            </div>
            <Link href="/studios" className="btn btn-outline">
              <T en="View Studios" ar="عرض الاستوديوهات" />
            </Link>
          </div>

          <div className="studio-showcase">
            {studioPreviews.map((studio, index) => (
              <Link href={studio.href} className="studio-panel" key={studio.title.en}>
                <div className="studio-visual">
                  <div className={`studio-room room-${index + 1}`} />
                  <CinematicWave />
                </div>
                <div className="panel-copy">
                  <h3>
                    <T en={studio.title.en} ar={studio.title.ar} />
                  </h3>
                  <p>
                    <T en={studio.body.en} ar={studio.body.ar} />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="gear-cinema">
        <div className="container">
          <div className="split-heading">
            <div>
              <span className="wow-kicker">
                <T en="Featured gear preview" ar="معاينة المعدات" />
              </span>
              <h2>
                <T en="Audio gear discovery with a premium pulse." ar="اكتشاف معدات صوت بنبض فاخر." />
              </h2>
            </div>
            <Link href="/marketplace" className="btn btn-outline">
              <T en="Explore Marketplace" ar="استكشف السوق" />
            </Link>
          </div>

          <div className="gear-podium">
            {gearPreviews.map((gear, index) => (
              <Link href={gear.href} className="gear-podium-card" key={gear.title.en}>
                <span className={`gear-object object-${index + 1}`} />
                <h3>
                  <T en={gear.title.en} ar={gear.title.ar} />
                </h3>
                <p>
                  <T en={gear.body.en} ar={gear.body.ar} />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="trust-cinema">
        <div className="container trust-band">
          {trustItems.map((item) => (
            <span key={item.en}>
              <T en={item.en} ar={item.ar} />
            </span>
          ))}
        </div>
      </section>

      <section className="ecosystem-cinema">
        <div className="container">
          <div className="section-title-row centered">
            <span className="wow-kicker">
              <T en="Controlled expansion" ar="توسع مضبوط" />
            </span>
            <h2>
              <T en="More creative paths are being prepared." ar="يتم تجهيز مسارات إبداعية إضافية." />
            </h2>
          </div>

          <div className="ecosystem-dock">
            {publicFeatureFlags
              .filter((flag) => flag.showOnHomepage)
              .map((flag) => (
                <article className="dock-card" key={flag.key}>
                  <span className="dock-status">
                    <T en={flag.safeStatusLabel.en} ar={flag.safeStatusLabel.ar} />
                  </span>
                  <h3>
                    <T en={flag.enLabel} ar={flag.arLabel} />
                  </h3>
                  <p>
                    <T en={flag.description.en} ar={flag.description.ar} />
                  </p>
                </article>
              ))}
          </div>
        </div>
      </section>

      <section className="final-wow">
        <div className="container final-wow-inner">
          <span className="wow-kicker">
            <T en="Ready when the beat starts" ar="جاهز عندما يبدأ الإيقاع" />
          </span>
          <h2>
            <T en="Your sound deserves a better stage." ar="صوتك يستحق منصة أفضل." />
          </h2>
          <div className="hero-actions center">
            <Link href="/signup" className="btn btn-primary hero-btn">
              <T en="Create Account" ar="إنشاء حساب" />
            </Link>
            <Link href="/support" className="btn btn-outline hero-btn">
              <T en="Talk to GearBeat" ar="تحدث مع GearBeat" />
            </Link>
          </div>
        </div>
      </section>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .wow-home {
          overflow: hidden;
          background:
            radial-gradient(circle at 20% -10%, rgba(212, 175, 55, 0.16), transparent 34%),
            radial-gradient(circle at 88% 10%, rgba(15, 160, 138, 0.08), transparent 32%),
            linear-gradient(180deg, #020304 0%, #080b10 42%, #020304 100%);
        }

        .wow-hero {
          position: relative;
          min-height: calc(100vh - 80px);
          isolation: isolate;
          display: grid;
          align-items: center;
          padding: clamp(58px, 8vw, 120px) 0 clamp(42px, 7vw, 96px);
        }

        .wow-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -3;
          background:
            linear-gradient(115deg, rgba(255,255,255,0.04), transparent 24%),
            repeating-linear-gradient(90deg, rgba(212,175,55,0.09) 0 1px, transparent 1px 74px);
          mask-image: radial-gradient(circle at 58% 42%, black, transparent 72%);
          opacity: 0.62;
        }

        .hero-light {
          position: absolute;
          z-index: -2;
          pointer-events: none;
          border-radius: 999px;
          filter: blur(58px);
        }

        .hero-light-a {
          width: 44vw;
          height: 44vw;
          left: -12vw;
          top: 10vh;
          background: rgba(212, 175, 55, 0.18);
        }

        .hero-light-b {
          width: 38vw;
          height: 38vw;
          right: -14vw;
          bottom: 10vh;
          background: rgba(212, 175, 55, 0.12);
        }

        .wow-hero-inner {
          display: grid;
          grid-template-columns: minmax(0, 0.92fr) minmax(380px, 1.08fr);
          gap: clamp(34px, 6vw, 88px);
          align-items: center;
        }

        .wow-kicker {
          display: inline-flex;
          width: fit-content;
          min-height: 34px;
          align-items: center;
          padding: 7px 14px;
          border: 1px solid rgba(212, 175, 55, 0.42);
          border-radius: 999px;
          color: var(--gb-gold-light);
          background: rgba(212, 175, 55, 0.08);
          box-shadow: 0 0 30px rgba(212, 175, 55, 0.08);
          font-size: 0.74rem;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .wow-hero-copy h1 {
          max-width: 820px;
          margin: 24px 0 16px;
          color: #fff;
          font-size: clamp(3.1rem, 7.8vw, 7.8rem);
          line-height: 0.88;
          letter-spacing: 0;
        }

        .wow-hero-copy h1 span {
          display: block;
        }

        .gold-shimmer {
          width: fit-content;
          color: var(--gb-gold-light);
          background: linear-gradient(90deg, var(--gb-gold), #fff3b2, var(--gb-gold));
          background-size: 220% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: goldShimmer 5.6s ease-in-out infinite;
        }

        @keyframes goldShimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .arabic-line {
          margin: 0 0 18px;
          color: var(--gb-gold-light);
          font-size: clamp(1.2rem, 2.2vw, 2rem);
          font-weight: 900;
          line-height: 1.5;
        }

        .hero-lead {
          max-width: 650px;
          color: rgba(248, 249, 250, 0.7);
          font-size: clamp(1rem, 1.45vw, 1.17rem);
          line-height: 1.85;
        }

        .hero-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 34px;
        }

        .hero-actions.center {
          justify-content: center;
        }

        .hero-btn {
          min-height: 58px;
          min-width: 188px;
          border-radius: 16px;
          box-shadow: 0 16px 42px rgba(0,0,0,0.28);
        }

        .hero-btn:hover {
          transform: translateY(-4px);
        }

        .wow-stage {
          position: relative;
          min-height: min(70vw, 620px);
          display: grid;
          place-items: center;
        }

        .stage-frame {
          position: relative;
          width: min(100%, 740px);
          min-height: min(68vw, 580px);
          border-radius: clamp(28px, 5vw, 54px);
          overflow: hidden;
          border: 1px solid rgba(212, 175, 55, 0.22);
          background:
            radial-gradient(circle at 50% 46%, rgba(244, 212, 122, 0.2), transparent 26%),
            radial-gradient(circle at 72% 22%, rgba(15, 160, 138, 0.12), transparent 28%),
            linear-gradient(145deg, rgba(15,22,33,0.84), rgba(0,0,0,0.96));
          box-shadow:
            0 40px 120px rgba(0,0,0,0.55),
            0 0 80px rgba(212,175,55,0.12),
            inset 0 0 70px rgba(212,175,55,0.08);
        }

        .stage-frame::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent 28%, rgba(212,175,55,0.08));
          pointer-events: none;
        }

        .stage-depth-lines {
          position: absolute;
          inset: -10% -18%;
          opacity: 0.32;
          background-image:
            linear-gradient(115deg, rgba(212,175,55,0.14) 0 1px, transparent 1px),
            linear-gradient(65deg, rgba(255,255,255,0.05) 0 1px, transparent 1px);
          background-size: 96px 96px;
          transform: perspective(700px) rotateX(62deg) translateY(24%);
          transform-origin: center bottom;
        }

        .beat-orb {
          position: absolute;
          inset: 50% auto auto 50%;
          width: min(48vw, 360px);
          aspect-ratio: 1;
          transform: translate(-50%, -50%);
          display: grid;
          place-items: center;
        }

        .beat-orb-core {
          position: relative;
          z-index: 2;
          width: 58%;
          aspect-ratio: 1;
          display: grid;
          place-items: center;
          border-radius: 50%;
          border: 2px solid rgba(244, 212, 122, 0.62);
          background:
            radial-gradient(circle at 34% 28%, rgba(255,255,255,0.2), transparent 18%),
            radial-gradient(circle, rgba(212,175,55,0.18), rgba(3,5,7,1) 68%);
          box-shadow:
            0 0 70px rgba(212,175,55,0.25),
            inset 0 0 44px rgba(244,212,122,0.13);
          animation: coreBreath 4.8s ease-in-out infinite;
        }

        .beat-center {
          width: 36%;
          aspect-ratio: 1;
          border-radius: 50%;
          background: var(--gb-gold-light);
          box-shadow: 0 0 34px rgba(244,212,122,0.72);
        }

        .beat-orb-ring {
          position: absolute;
          inset: 10%;
          border-radius: 50%;
          border: 1px solid rgba(212,175,55,0.36);
          box-shadow: 0 0 36px rgba(212,175,55,0.12);
          animation: ringBreath 5.4s ease-in-out infinite;
        }

        .ring-two {
          inset: -8%;
          opacity: 0.52;
          animation-delay: -2.7s;
        }

        @keyframes coreBreath {
          0%, 100% { transform: scale(0.96); }
          50% { transform: scale(1.045); }
        }

        @keyframes ringBreath {
          0%, 100% { transform: scale(0.88); opacity: 0.28; }
          50% { transform: scale(1.08); opacity: 0.74; }
        }

        .wave-ribbon {
          position: absolute;
          left: -8%;
          right: -8%;
          top: 50%;
          z-index: 4;
          transform: translateY(-50%) rotate(-8deg);
          padding: 42px 0;
          mask-image: linear-gradient(90deg, transparent, black 16%, black 84%, transparent);
        }

        .wow-wave {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(6px, 1.1vw, 13px);
          min-height: 160px;
        }

        .wow-wave span {
          width: clamp(5px, 0.72vw, 10px);
          height: 58px;
          border-radius: 999px;
          background: linear-gradient(180deg, transparent, var(--gb-gold-light), transparent);
          box-shadow: 0 0 20px rgba(212,175,55,0.62);
          transform-origin: center;
          animation: waveAlive 1.72s ease-in-out infinite;
        }

        .wow-wave span:nth-child(2n) { animation-delay: 0.08s; height: 86px; }
        .wow-wave span:nth-child(3n) { animation-delay: 0.16s; height: 126px; }
        .wow-wave span:nth-child(4n) { animation-delay: 0.24s; height: 156px; }
        .wow-wave span:nth-child(5n) { animation-delay: 0.32s; height: 108px; }
        .wow-wave span:nth-child(7n) { animation-delay: 0.44s; height: 140px; }

        @keyframes waveAlive {
          0%, 100% { transform: scaleY(0.46); opacity: 0.42; }
          50% { transform: scaleY(1.06); opacity: 1; }
        }

        .floating-card {
          position: absolute;
          z-index: 5;
          width: min(48%, 220px);
          padding: 16px;
          border-radius: 20px;
          border: 1px solid rgba(212,175,55,0.2);
          background: rgba(3,5,7,0.72);
          backdrop-filter: blur(18px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.34);
          animation: cardFloat 6s ease-in-out infinite;
        }

        .floating-card span {
          display: block;
          color: rgba(248,249,250,0.54);
          font-size: 0.75rem;
          font-weight: 800;
        }

        .floating-card strong {
          display: block;
          margin-top: 6px;
          color: var(--gb-gold-light);
          font-size: 0.94rem;
          line-height: 1.25;
        }

        .studio-float {
          left: 28px;
          bottom: 34px;
        }

        .gear-float {
          right: 28px;
          top: 34px;
          animation-delay: -3s;
        }

        @keyframes cardFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }

        .pathway-section,
        .studios-cinema,
        .gear-cinema,
        .ecosystem-cinema,
        .final-wow {
          position: relative;
          padding: clamp(72px, 10vw, 130px) 0;
        }

        .section-title-row {
          max-width: 850px;
          margin-bottom: 42px;
        }

        .section-title-row.centered {
          margin-inline: auto;
          text-align: center;
        }

        .section-title-row h2,
        .split-heading h2,
        .final-wow h2 {
          margin-top: 16px;
          color: #fff;
          font-size: clamp(2.2rem, 5.6vw, 5rem);
          line-height: 0.96;
          letter-spacing: 0;
        }

        .pathway-stage {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr 0.9fr 1.1fr;
          gap: 18px;
          align-items: stretch;
        }

        .pathway-card {
          position: relative;
          min-height: 360px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          overflow: hidden;
          padding: 28px;
          border-radius: 30px;
          border: 1px solid rgba(212,175,55,0.18);
          background:
            radial-gradient(circle at 50% 0%, rgba(212,175,55,0.18), transparent 32%),
            linear-gradient(150deg, rgba(15,22,33,0.9), rgba(3,5,7,0.96));
          box-shadow: 0 26px 72px rgba(0,0,0,0.32);
          transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
        }

        .pathway-card:nth-child(2),
        .pathway-card:nth-child(3) {
          transform: translateY(34px);
        }

        .pathway-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(135deg, rgba(255,255,255,0.08), transparent 34%),
            repeating-linear-gradient(90deg, rgba(212,175,55,0.09) 0 2px, transparent 2px 18px);
          opacity: 0.28;
          mask-image: linear-gradient(to bottom, black, transparent 70%);
        }

        .pathway-card:hover {
          color: inherit;
          transform: translateY(-8px);
          border-color: rgba(244,212,122,0.5);
          box-shadow: 0 34px 90px rgba(0,0,0,0.42), 0 0 42px rgba(212,175,55,0.14);
        }

        .pathway-card:nth-child(2):hover,
        .pathway-card:nth-child(3):hover {
          transform: translateY(22px);
        }

        .path-index {
          position: absolute;
          top: 22px;
          right: 24px;
          color: rgba(244,212,122,0.26);
          font-size: 3.1rem;
          font-weight: 900;
          line-height: 1;
        }

        [dir="rtl"] .path-index {
          right: auto;
          left: 24px;
        }

        .path-eyebrow {
          position: relative;
          width: fit-content;
          margin-bottom: auto;
          color: var(--gb-gold-light);
          font-size: 0.72rem;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .pathway-card h3,
        .studio-panel h3,
        .gear-podium-card h3,
        .dock-card h3 {
          position: relative;
          color: #fff;
          margin: 22px 0 12px;
          font-size: 1.5rem;
          letter-spacing: 0;
        }

        .pathway-card p,
        .studio-panel p,
        .gear-podium-card p,
        .dock-card p {
          position: relative;
          color: rgba(248,249,250,0.64);
          line-height: 1.7;
          font-size: 0.94rem;
        }

        .pathway-card strong {
          position: relative;
          margin-top: 22px;
          color: var(--gb-gold-light);
        }

        .studios-cinema {
          background:
            radial-gradient(circle at 12% 20%, rgba(212,175,55,0.1), transparent 30%),
            rgba(0,0,0,0.24);
          border-block: 1px solid rgba(255,255,255,0.06);
        }

        .split-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 28px;
          margin-bottom: 36px;
        }

        .studio-showcase {
          display: grid;
          grid-template-columns: 1.2fr 0.9fr 0.9fr;
          gap: 20px;
          align-items: stretch;
        }

        .studio-panel {
          position: relative;
          overflow: hidden;
          min-height: 490px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          border-radius: 34px;
          border: 1px solid rgba(212,175,55,0.18);
          background: #05080b;
          box-shadow: 0 30px 90px rgba(0,0,0,0.38);
          transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
        }

        .studio-panel:hover {
          color: inherit;
          transform: translateY(-10px);
          border-color: rgba(244,212,122,0.5);
          box-shadow: 0 36px 100px rgba(0,0,0,0.48), 0 0 46px rgba(212,175,55,0.12);
        }

        .studio-visual {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .studio-room {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to top, rgba(0,0,0,0.88), transparent 55%),
            radial-gradient(circle at 50% 38%, rgba(212,175,55,0.24), transparent 34%),
            linear-gradient(135deg, rgba(255,255,255,0.08), rgba(3,5,7,0.92));
        }

        .room-2 {
          background:
            linear-gradient(to top, rgba(0,0,0,0.9), transparent 56%),
            radial-gradient(circle at 76% 30%, rgba(212,175,55,0.24), transparent 32%),
            linear-gradient(135deg, rgba(15,160,138,0.08), rgba(3,5,7,0.94));
        }

        .room-3 {
          background:
            linear-gradient(to top, rgba(0,0,0,0.9), transparent 58%),
            radial-gradient(circle at 28% 32%, rgba(212,175,55,0.2), transparent 34%),
            linear-gradient(145deg, rgba(212,175,55,0.05), rgba(3,5,7,0.95));
        }

        .studio-visual .wow-wave {
          position: absolute;
          left: -18%;
          right: -18%;
          top: 30%;
          min-height: 110px;
          opacity: 0.32;
          transform: rotate(-12deg) scale(0.72);
        }

        .panel-copy {
          position: relative;
          z-index: 2;
          padding: 30px;
        }

        .gear-podium {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        .gear-podium-card {
          position: relative;
          min-height: 340px;
          overflow: hidden;
          padding: 28px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          border-radius: 32px;
          border: 1px solid rgba(212,175,55,0.18);
          background:
            radial-gradient(circle at 50% 20%, rgba(212,175,55,0.14), transparent 30%),
            linear-gradient(180deg, rgba(15,22,33,0.86), rgba(3,5,7,0.98));
          box-shadow: 0 28px 80px rgba(0,0,0,0.34);
          transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
        }

        .gear-podium-card:hover {
          color: inherit;
          transform: translateY(-10px);
          border-color: rgba(244,212,122,0.5);
          box-shadow: 0 34px 90px rgba(0,0,0,0.45), 0 0 42px rgba(212,175,55,0.12);
        }

        .gear-object {
          position: absolute;
          top: 38px;
          left: 50%;
          width: 112px;
          aspect-ratio: 1;
          transform: translateX(-50%);
          border-radius: 28px;
          border: 1px solid rgba(244,212,122,0.38);
          background:
            radial-gradient(circle at 35% 25%, rgba(255,255,255,0.24), transparent 16%),
            radial-gradient(circle, rgba(212,175,55,0.24), rgba(0,0,0,0.9) 68%);
          box-shadow: 0 26px 60px rgba(0,0,0,0.42), 0 0 40px rgba(212,175,55,0.18);
          animation: objectFloat 6.2s ease-in-out infinite;
        }

        .object-2 { border-radius: 999px; animation-delay: -1.4s; }
        .object-3 { border-radius: 20px 44px 20px 44px; animation-delay: -2.8s; }
        .object-4 { border-radius: 44px 20px 44px 20px; animation-delay: -4.2s; }

        .trust-cinema {
          padding: 20px 0;
        }

        .trust-band {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          padding: 14px;
          border-radius: 26px;
          border: 1px solid rgba(212,175,55,0.16);
          background: rgba(255,255,255,0.035);
          box-shadow: 0 24px 70px rgba(0,0,0,0.28);
        }

        .trust-band span {
          display: grid;
          min-height: 58px;
          place-items: center;
          padding: 10px;
          border-radius: 18px;
          color: rgba(248,249,250,0.72);
          background: rgba(0,0,0,0.22);
          border: 1px solid rgba(255,255,255,0.06);
          text-align: center;
          font-size: 0.82rem;
          font-weight: 900;
        }

        .ecosystem-cinema {
          background: radial-gradient(circle at 50% 0%, rgba(212,175,55,0.08), transparent 36%);
        }

        .ecosystem-dock {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .dock-card {
          position: relative;
          min-height: 260px;
          padding: 28px;
          border-radius: 28px;
          border: 1px solid rgba(212,175,55,0.14);
          background: linear-gradient(145deg, rgba(15,22,33,0.68), rgba(3,5,7,0.92));
          box-shadow: 0 24px 70px rgba(0,0,0,0.26);
        }

        .dock-status {
          display: inline-flex;
          padding: 7px 11px;
          border-radius: 999px;
          color: var(--gb-gold-light);
          background: rgba(212,175,55,0.08);
          border: 1px solid rgba(212,175,55,0.22);
          font-size: 0.72rem;
          font-weight: 900;
        }

        .final-wow {
          text-align: center;
          background:
            radial-gradient(circle at 50% 0%, rgba(212,175,55,0.18), transparent 46%),
            #000;
          border-top: 1px solid rgba(212,175,55,0.1);
        }

        .final-wow-inner {
          max-width: 880px;
        }

        @keyframes objectFloat {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-16px); }
        }

        .pathway-card,
        .studio-panel,
        .gear-podium-card,
        .dock-card,
        .trust-band {
          animation: fadeInUp 0.9s ease both;
        }

        @media (prefers-reduced-motion: reduce) {
          .gold-shimmer,
          .beat-orb-core,
          .beat-orb-ring,
          .wow-wave span,
          .gear-object,
          .floating-card,
          .pathway-card,
          .studio-panel,
          .gear-podium-card,
          .dock-card,
          .trust-band {
            animation: none !important;
          }
        }

        @media (max-width: 1120px) {
          .wow-hero-inner {
            grid-template-columns: 1fr;
          }

          .wow-stage {
            order: 2;
            min-height: 480px;
          }

          .stage-frame {
            min-height: 460px;
          }

          .pathway-stage,
          .gear-podium,
          .ecosystem-dock {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .pathway-card:nth-child(2),
          .pathway-card:nth-child(3),
          .pathway-card:nth-child(2):hover,
          .pathway-card:nth-child(3):hover {
            transform: none;
          }

          .studio-showcase {
            grid-template-columns: 1fr;
          }

          .studio-panel {
            min-height: 380px;
          }
        }

        @media (max-width: 720px) {
          .wow-hero {
            min-height: auto;
            padding-top: 42px;
          }

          .wow-hero-copy h1 {
            font-size: clamp(2.85rem, 16vw, 4.4rem);
          }

          .arabic-line {
            max-width: 12em;
          }

          .hero-actions,
          .hero-actions .btn {
            width: 100%;
          }

          .wow-stage {
            min-height: 390px;
          }

          .stage-frame {
            min-height: 360px;
            border-radius: 28px;
          }

          .floating-card {
            width: min(56%, 190px);
            padding: 12px;
          }

          .studio-float {
            left: 14px;
            bottom: 16px;
          }

          .gear-float {
            right: 14px;
            top: 16px;
          }

          .wave-ribbon {
            left: -22%;
            right: -22%;
          }

          .pathway-stage,
          .gear-podium,
          .ecosystem-dock,
          .trust-band {
            grid-template-columns: 1fr;
          }

          .pathway-card,
          .gear-podium-card {
            min-height: 280px;
          }

          .split-heading {
            align-items: stretch;
            flex-direction: column;
          }

          .split-heading .btn {
            width: 100%;
          }

          .section-title-row h2,
          .split-heading h2,
          .final-wow h2 {
            font-size: clamp(2.1rem, 11vw, 3.2rem);
          }
        }

        [dir="rtl"] .wow-hero-copy,
        [dir="rtl"] .split-heading,
        [dir="rtl"] .section-title-row {
          direction: rtl;
        }

        [dir="rtl"] .gold-shimmer {
          margin-inline-start: auto;
        }
      `,
        }}
      />
    </main>
  );
}
