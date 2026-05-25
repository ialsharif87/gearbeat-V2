import Link from "next/link";
import type { ReactNode } from "react";
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

const discoveryPrompts = [
  { en: "Find a vocal room", ar: "ابحث عن غرفة صوت" },
  { en: "Compare studio prices", ar: "قارن أسعار الاستوديوهات" },
  { en: "Plan a podcast setup", ar: "خطط لتجهيز بودكاست" },
  { en: "Discover trusted gear", ar: "اكتشف معدات موثوقة" },
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

function VerticalAiDiscoveryRail() {
  return (
    <aside className="ai-discovery-rail" aria-label="Ask GearBeat discovery rail">
      <div className="ai-rail-heading">
        <span>
          <T en="Ask GearBeat" ar="اسأل GearBeat" />
        </span>
        <h3>
          <T en="Discovery assistant" ar="مساعد الاكتشاف" />
        </h3>
        <p>
          <T
            en="Start with what you need, then explore studios, gear, and creator paths."
            ar="ابدأ بما تحتاجه، ثم استكشف الاستوديوهات والمعدات ومسارات المبدعين."
          />
        </p>
      </div>

      <div className="ai-rail-items">
        {discoveryPrompts.map((prompt) => (
          <span key={prompt.en}>
            <T en={prompt.en} ar={prompt.ar} />
          </span>
        ))}
      </div>
    </aside>
  );
}

function CinematicJourneyShell({ children }: { children: ReactNode }) {
  return <main className="home-root wow-home cinematic-journey-shell">{children}</main>;
}

export default function HomePage() {
  return (
    <CinematicJourneyShell>
      <section className="wow-hero">
        <div className="hero-light hero-light-a" />
        <div className="hero-light hero-light-b" />
        <div className="studio-atmosphere atmosphere-left" aria-hidden="true" />
        <div className="studio-atmosphere atmosphere-right" aria-hidden="true" />

        <div className="container wow-hero-inner">
          <div className="wow-hero-copy">
            <span className="wow-kicker">
              <T en="Saudi-first studio marketplace" ar="سوق استوديوهات سعودي أولًا" />
            </span>

            <h1>
              <span><T en="Book the space." ar="احجز المكان." /></span>
              <span className="gold-shimmer"><T en="Buy the gear." ar="اشترِ المعدات." /></span>
              <span><T en="Create the sound." ar="اصنع الصوت." /></span>
            </h1>

            <p className="hero-lead">
              <T
                en="GearBeat connects creators with trusted studios, curated gear discovery, and premium music experiences across Saudi Arabia and the GCC."
                ar="تربط GearBeat المبدعين باستوديوهات موثوقة، واكتشاف معدات منتقاة، وتجارب موسيقية فاخرة في السعودية والخليج."
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
            <div className="hero-wave-field" aria-hidden="true">
              <CinematicWave />
            </div>
            <div className="stage-frame">
              <div className="stage-depth-lines" aria-hidden="true" />
              <PulseOrb />
              <div className="wave-ribbon">
                <CinematicWave />
              </div>
            </div>
          </div>

          <VerticalAiDiscoveryRail />
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
                <span className={`gear-object object-${index + 1}`}>
                  {index === 0 && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="gear-icon" aria-hidden="true">
                      <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                      <line x1="12" y1="18" x2="12" y2="22" />
                      <line x1="10" y1="22" x2="14" y2="22" />
                    </svg>
                  )}
                  {index === 1 && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="gear-icon" aria-hidden="true">
                      <rect x="4" y="2" width="16" height="20" rx="2" />
                      <circle cx="12" cy="7" r="2" />
                      <circle cx="12" cy="15" r="4" />
                    </svg>
                  )}
                  {index === 2 && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="gear-icon" aria-hidden="true">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <circle cx="6" cy="12" r="1.5" />
                      <circle cx="12" cy="12" r="1.5" />
                      <line x1="16" y1="9" x2="19" y2="9" />
                      <line x1="16" y1="12" x2="18" y2="12" />
                      <line x1="16" y1="15" x2="19" y2="15" />
                    </svg>
                  )}
                  {index === 3 && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="gear-icon" aria-hidden="true">
                      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                    </svg>
                  )}
                </span>
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
          position: relative;
          overflow: hidden;
          isolation: isolate;
          --home-display: 1.85rem;
          --home-section-title: clamp(1.95rem, 3.45vw, 3.45rem);
          --home-card-title: clamp(1.35rem, 1.65vw, 1.68rem);
          --home-body: clamp(1rem, 1.1vw, 1.1rem);
          background:
            radial-gradient(circle at 18% 18%, rgba(242, 201, 76, 0.16), transparent 34%),
            radial-gradient(circle at 74% 22%, rgba(212, 175, 55, 0.18), transparent 32%),
            linear-gradient(180deg, #070a0b 0%, #030506 55%, #010203 100%);
        }

        .wow-home::after {
          content: "";
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            linear-gradient(90deg, rgba(3,5,7,0.92), rgba(3,5,7,0.78) 44%, rgba(3,5,7,0.9)),
            linear-gradient(180deg, rgba(3,5,7,0.82), rgba(3,5,7,0.94) 42%, #030506 100%),
            url("/brand/studio-placeholder.jpg") center / cover no-repeat;
          opacity: 0.22;
          filter: saturate(0.76) contrast(1.08);
        }

        .wow-home::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background:
            linear-gradient(115deg, transparent 0 14%, rgba(242,201,76,0.08) 14.2%, transparent 14.9% 42%, rgba(255,255,255,0.045) 42.2%, transparent 42.9%),
            linear-gradient(90deg, transparent, rgba(242,201,76,0.09), transparent),
            repeating-linear-gradient(90deg, rgba(242,201,76,0.035) 0 1px, transparent 1px 72px),
            repeating-linear-gradient(0deg, rgba(212,175,55,0.026) 0 1px, transparent 1px 96px),
            radial-gradient(ellipse at center 42vh, rgba(212,175,55,0.08), transparent 62%);
          opacity: 0.72;
          animation: atmosphereDrift 22s ease-in-out infinite alternate, gbHaze 12s ease-in-out infinite;
        }

        .wow-home > * {
          position: relative;
          z-index: 1;
        }

        .wow-hero {
          position: relative;
          min-height: calc(100vh - 80px);
          isolation: isolate;
          display: grid;
          align-items: center;
          padding: clamp(56px, 8vw, 96px) 0 clamp(48px, 7vw, 88px);
        }

        .wow-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -3;
          background:
            radial-gradient(ellipse at 52% 48%, rgba(242,201,76,0.2), transparent 42%),
            linear-gradient(104deg, transparent 8%, rgba(242,201,76,0.1) 31%, transparent 58%),
            repeating-linear-gradient(90deg, rgba(212,175,55,0.08) 0 1px, transparent 1px 74px);
          mask-image: radial-gradient(circle at 50% 42%, black, transparent 78%);
          opacity: 0.8;
        }

        .wow-hero::after {
          content: none;
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

        .studio-atmosphere {
          position: absolute;
          z-index: -1;
          pointer-events: none;
          opacity: 0.38;
          filter: blur(0.2px);
        }

        .studio-atmosphere::before,
        .studio-atmosphere::after {
          content: "";
          position: absolute;
          inset: 0;
          border: 1px solid rgba(212,175,55,0.1);
          transform: skewY(-10deg);
        }

        .atmosphere-left {
          width: min(34vw, 420px);
          height: min(52vw, 620px);
          left: 4vw;
          top: 18%;
          background:
            linear-gradient(90deg, rgba(255,255,255,0.04), transparent 26%),
            repeating-linear-gradient(180deg, rgba(212,175,55,0.08) 0 1px, transparent 1px 34px);
          animation: studioSweep 18s ease-in-out infinite alternate;
        }

        .atmosphere-right {
          width: min(38vw, 520px);
          height: min(48vw, 560px);
          right: 2vw;
          bottom: 8%;
          background:
            linear-gradient(270deg, rgba(244,212,122,0.08), transparent 30%),
            repeating-linear-gradient(180deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 42px);
          animation: studioSweep 21s ease-in-out infinite alternate-reverse;
        }

        @keyframes atmosphereDrift {
          0% { transform: translate3d(-1.5%, 0, 0); opacity: 0.54; }
          100% { transform: translate3d(1.5%, -1%, 0); opacity: 0.76; }
        }

        @keyframes studioSweep {
          0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.26; }
          100% { transform: translate3d(0, -18px, 0) scale(1.04); opacity: 0.44; }
        }

        @keyframes gbHaze {
          0%, 100% { transform: translate3d(-2%, 0, 0); opacity: 0.35; }
          50% { transform: translate3d(2%, -1%, 0); opacity: 0.65; }
        }

        .wow-hero-inner {
          display: grid;
          grid-template-columns: 1.2fr 0.95fr 0.85fr;
          gap: clamp(20px, 3.2vw, 44px);
          align-items: center;
        }

        .wow-kicker {
          display: inline-flex;
          width: fit-content;
          min-height: 36px;
          align-items: center;
          padding: 8px 15px;
          border: 1px solid rgba(212, 175, 55, 0.42);
          border-radius: 999px;
          color: var(--gb-gold-light);
          background: rgba(212, 175, 55, 0.08);
          box-shadow: 0 0 30px rgba(212, 175, 55, 0.08);
          font-size: 0.82rem;
          font-weight: 900;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        .wow-hero-copy h1 {
          max-width: 42rem;
          margin: 26px 0 18px;
          color: #fff;
          font-size: var(--home-display);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.035em;
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

        .hero-lead {
          max-width: 650px;
          color: rgba(248, 249, 250, 0.7);
          font-size: clamp(1.05rem, 1.3vw, 1.18rem);
          line-height: 1.78;
        }

        .hero-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 24px;
        }

        .hero-actions.center {
          justify-content: center;
        }

        .hero-btn {
          min-height: 52px;
          min-width: 168px;
          border-radius: 14px;
          box-shadow: 0 12px 36px rgba(0,0,0,0.24);
        }

        .hero-btn:hover {
          transform: translateY(-4px);
        }

        .ai-discovery-rail {
          position: relative;
          overflow: hidden;
          align-self: center;
          padding: 24px;
          border-radius: 28px;
          border: 1px solid rgba(242,201,76,0.2);
          background:
            linear-gradient(145deg, rgba(242,201,76,0.09), transparent 38%),
            rgba(0,0,0,0.35);
          box-shadow: 0 0 60px rgba(212,175,55,0.1), 0 28px 80px rgba(0,0,0,0.32);
          backdrop-filter: blur(18px);
        }

        .ai-discovery-rail::before {
          content: "";
          position: absolute;
          inset: 0 auto 0 0;
          width: 1px;
          background: linear-gradient(180deg, transparent, rgba(242,201,76,0.62), transparent);
          box-shadow: 0 0 28px rgba(242,201,76,0.44);
        }

        [dir="rtl"] .ai-discovery-rail::before {
          left: auto;
          right: 0;
        }

        .ai-rail-heading span {
          display: block;
          color: var(--gb-gold-light);
          font-size: 0.82rem;
          font-weight: 900;
          text-transform: uppercase;
        }

        .ai-rail-heading h3 {
          margin: 8px 0 8px;
          color: #fff;
          font-size: clamp(1.15rem, 1.45vw, 1.35rem);
          line-height: 1.18;
          letter-spacing: 0;
        }

        .ai-rail-heading p {
          margin: 0;
          color: rgba(248,249,250,0.66);
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .ai-rail-items {
          display: grid;
          gap: 12px;
          margin-top: 22px;
        }

        .ai-rail-items span {
          display: flex;
          min-height: 52px;
          align-items: center;
          justify-content: space-between;
          border-radius: 18px;
          padding: 12px 18px;
          color: rgba(248,249,250,0.82);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          font-size: 0.95rem;
          font-weight: 800;
          transition: transform 0.3s ease, border-color 0.3s ease, background 0.3s ease, color 0.3s ease;
        }

        .ai-rail-items span::after {
          content: "→";
          color: var(--gb-gold-light);
          transition: transform 0.3s ease;
        }

        [dir="rtl"] .ai-rail-items span::after {
          content: "←";
        }

        .ai-rail-items span:hover {
          transform: translateX(4px);
          border-color: rgba(242,201,76,0.4);
          background: rgba(242,201,76,0.1);
          color: #fff;
        }

        [dir="rtl"] .ai-rail-items span:hover {
          transform: translateX(-4px);
        }

        .wow-stage {
          position: relative;
          min-height: min(44vw, 440px);
          display: grid;
          place-items: center;
        }

        .hero-wave-field {
          position: absolute;
          left: -42%;
          right: -42%;
          top: 48%;
          z-index: 1;
          transform: translateY(-50%) rotate(-5deg);
          opacity: 0.38;
          filter: blur(0.2px);
          mask-image: linear-gradient(90deg, transparent, black 18%, black 82%, transparent);
        }

        .hero-wave-field .wow-wave {
          min-height: 240px;
        }

        .stage-frame {
          position: relative;
          width: min(100%, 460px);
          min-height: min(42vw, 420px);
          overflow: visible;
          border: 0;
          border-radius: 999px;
          background:
            radial-gradient(circle at 50% 47%, rgba(242, 201, 76, 0.18), transparent 28%),
            radial-gradient(circle at 72% 22%, rgba(212, 175, 55, 0.1), transparent 30%);
          box-shadow:
            0 0 100px rgba(242,201,76,0.12),
            0 30px 100px rgba(0,0,0,0.38);
        }

        .stage-frame::before {
          content: "";
          position: absolute;
          inset: 12% 8%;
          border-radius: 50%;
          border: 1px solid rgba(244,212,122,0.16);
          background:
            radial-gradient(circle at 50% 46%, rgba(212,175,55,0.12), transparent 46%),
            linear-gradient(135deg, rgba(255,255,255,0.08), transparent 28%, rgba(212,175,55,0.05));
          box-shadow: inset 0 0 90px rgba(212,175,55,0.06);
          pointer-events: none;
        }

        .stage-depth-lines {
          position: absolute;
          inset: 8% -18% -4%;
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
          width: min(32vw, 340px);
          aspect-ratio: 1;
          transform: translate(-50%, -50%);
          display: grid;
          place-items: center;
          z-index: 3;
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
            0 0 86px rgba(212,175,55,0.31),
            0 0 150px rgba(212,175,55,0.16),
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

        @keyframes gbPulse {
          0%, 100% { transform: scale(0.96); }
          50% { transform: scale(1.045); }
        }

        @keyframes coreBreath {
          0%, 100% { transform: scale(0.94); opacity: 0.72; }
          50% { transform: scale(1.06); opacity: 1; }
        }

        @keyframes ringBreath {
          0%, 100% { transform: scale(0.88); opacity: 0.28; }
          50% { transform: scale(1.08); opacity: 0.74; }
        }

        .wave-ribbon {
          position: absolute;
          left: -44%;
          right: -44%;
          top: 50%;
          z-index: 4;
          transform: translateY(-50%) rotate(-8deg);
          padding: 42px 0;
          mask-image: linear-gradient(90deg, transparent, black 16%, black 84%, transparent);
          animation: gbWaveDrift 7s ease-in-out infinite;
        }

        @keyframes gbWaveDrift {
          0%, 100% { transform: translateY(-50%) translateX(-2%) rotate(-8deg) scaleX(0.98); opacity: 0.74; }
          50% { transform: translateY(-50%) translateX(2%) rotate(-8deg) scaleX(1.04); opacity: 1; }
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
          padding: clamp(56px, 8vw, 96px) 0;
        }

        .pathway-section::before,
        .studios-cinema::before,
        .gear-cinema::before,
        .ecosystem-cinema::before,
        .final-wow::before {
          content: "";
          position: absolute;
          inset: -96px 0 auto;
          height: 192px;
          pointer-events: none;
          background: linear-gradient(180deg, transparent, rgba(212,175,55,0.045), transparent);
          opacity: 0.75;
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
          font-size: var(--home-section-title);
          line-height: 1.02;
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
          font-size: 0.84rem;
          font-weight: 900;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        .pathway-card h3,
        .studio-panel h3,
        .gear-podium-card h3,
        .dock-card h3 {
          position: relative;
          color: #fff;
          margin: 22px 0 12px;
          font-size: var(--home-card-title);
          line-height: 1.15;
          letter-spacing: 0;
        }

        .pathway-card p,
        .studio-panel p,
        .gear-podium-card p,
        .dock-card p {
          position: relative;
          color: rgba(248,249,250,0.64);
          line-height: 1.72;
          font-size: var(--home-body);
        }

        .pathway-card strong {
          position: relative;
          margin-top: 22px;
          color: var(--gb-gold-light);
          font-size: 0.98rem;
        }

        .studios-cinema {
          background:
            radial-gradient(circle at 12% 20%, rgba(212,175,55,0.08), transparent 34%),
            linear-gradient(180deg, transparent, rgba(0,0,0,0.14), transparent);
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

        .gear-icon {
          width: 44px;
          height: 44px;
          color: var(--gb-gold-light);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          filter: drop-shadow(0 0 8px rgba(244, 212, 122, 0.4));
        }

        .object-2 { border-radius: 999px; animation-delay: -1.4s; }
        .object-3 { border-radius: 20px 44px 20px 44px; animation-delay: -2.8s; }
        .object-4 { border-radius: 44px 20px 44px 20px; animation-delay: -4.2s; }

        .trust-cinema {
          padding: clamp(56px, 7vw, 88px) 0;
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
          font-size: 0.95rem;
          font-weight: 900;
        }

        .ecosystem-cinema {
          background: radial-gradient(circle at 50% 0%, rgba(212,175,55,0.055), transparent 40%);
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
          font-size: 0.84rem;
          font-weight: 900;
        }

        .final-wow {
          text-align: center;
          background:
            radial-gradient(circle at 50% 0%, rgba(212,175,55,0.16), transparent 48%),
            repeating-linear-gradient(90deg, rgba(212,175,55,0.03) 0 1px, transparent 1px 86px);
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
          .wow-home::before,
          .studio-atmosphere,
          .gold-shimmer,
          .beat-orb-core,
          .beat-orb-ring,
          .wow-wave span,
          .wave-ribbon,
          .gear-object,
          .ai-rail-items span,
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
            min-height: 470px;
          }

          .ai-discovery-rail {
            order: 3;
            max-width: 640px;
          }

          .stage-frame {
            min-height: 450px;
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

        @media (min-width: 640px) {
          .wow-home {
            --home-display: 2.15rem;
          }
        }

        @media (min-width: 768px) {
          .wow-home {
            --home-display: 2.75rem;
          }
        }

        @media (min-width: 1280px) {
          .wow-home {
            --home-display: 3.45rem;
          }
        }

        @media (max-width: 720px) {
          .wow-hero {
            min-height: auto;
            padding: 56px 0;
          }

          .wow-hero-copy h1 {
            font-size: var(--home-display);
            line-height: 1.15;
          }

          .hero-actions,
          .hero-actions .btn {
            width: 100%;
          }

          .wow-stage {
            min-height: 370px;
          }

          .stage-frame {
            width: 100%;
            min-height: 340px;
          }

          .hero-wave-field {
            left: -58%;
            right: -58%;
            opacity: 0.24;
          }

          .beat-orb {
            width: min(72vw, 280px);
          }

          .wave-ribbon {
            left: -58%;
            right: -58%;
          }

          .ai-discovery-rail {
            padding: 15px;
            border-radius: 20px;
          }

          .ai-rail-items {
            gap: 7px;
          }

          .ai-rail-items span {
            min-height: 44px;
            font-size: 0.9rem;
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
            font-size: clamp(1.95rem, 9vw, 2.6rem);
            line-height: 1.05;
          }

          /* Mobile Animation Dampening */
          .wow-home::before,
          .studio-atmosphere,
          .gold-shimmer,
          .beat-orb-core,
          .beat-orb-ring,
          .wow-wave span,
          .wave-ribbon,
          .gear-object,
          .ai-rail-items span,
          .floating-card {
            animation: none !important;
          }
        }

        [dir="rtl"] .wow-hero-copy,
        [dir="rtl"] .split-heading,
        [dir="rtl"] .section-title-row,
        [dir="rtl"] .panel-copy,
        [dir="rtl"] .gear-podium-card,
        [dir="rtl"] .pathway-card,
        [dir="rtl"] .dock-card,
        [dir="rtl"] .ai-rail-heading {
          direction: rtl;
          text-align: start;
        }

        [dir="rtl"] .gold-shimmer {
          margin-inline-start: auto;
        }
      `,
        }}
      />
    </CinematicJourneyShell>
  );
}
