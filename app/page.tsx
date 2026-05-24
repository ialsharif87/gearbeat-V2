import Link from "next/link";
import type { ReactNode } from "react";

const pathways = [
  {
    eyebrow: "Rooms",
    number: "01",
    title: "Book Studios",
    body: "Step into rooms shaped for vocals, podcasts, production, and focused sound work.",
    action: "Browse rooms",
    href: "/studios",
  },
  {
    eyebrow: "Gear",
    number: "02",
    title: "Marketplace",
    body: "Explore audio tools and creative gear prepared for serious creators.",
    action: "Explore gear",
    href: "/marketplace",
  },
  {
    eyebrow: "Trust",
    number: "03",
    title: "Certified Studios",
    body: "A premium review layer for studios ready to build deeper creator confidence.",
    action: "See the standard",
    href: "/gearbeat-certified",
  },
  {
    eyebrow: "Membership",
    number: "04",
    title: "Rewards",
    body: "A customer experience foundation for future loyalty, access, and creator benefits.",
    action: "View membership",
    href: "/customer/rewards",
  },
];

const studioPreview = [
  {
    title: "Vocal-ready rooms",
    body: "Preview rooms shaped for voice, podcast, and creative fit before opening studio details.",
  },
  {
    title: "Production suites",
    body: "Move from idea to arrangement with spaces built for longer creative focus.",
  },
  {
    title: "Certified discovery",
    body: "A cleaner path to compare studios with review-ready presentation and trust cues.",
  },
];

const gearPreview = [
  {
    title: "Microphones",
    body: "Voice, podcast, and recording essentials.",
  },
  {
    title: "Studio monitors",
    body: "Reference listening and room-building categories.",
  },
  {
    title: "Interfaces",
    body: "Signal flow tools for modern creator setups.",
  },
  {
    title: "Accessories",
    body: "Practical details that make sessions smoother.",
  },
];

const preparedPaths = [
  {
    status: "Coming Soon",
    title: "GearBeat Academy",
    body: "Unlock masterclasses, certified sound learning, and direct mentoring from industry-leading producers.",
  },
  {
    status: "Under Development",
    title: "Professional Services",
    body: "Hire verified mixing engineers, session musicians, voice talent, and music producers directly.",
  },
  {
    status: "Coming Soon",
    title: "Event Ticketing",
    body: "Browse and book entry to live recording sessions, gear demo workshops, and local sound experiences.",
  },
  {
    status: "Coming Soon",
    title: "Creative Experiences",
    body: "Immerse yourself in specialized listening sessions, creative retreats, and studio tours across the region.",
  },
  {
    status: "Under Development",
    title: "Partner Programs",
    body: "Unified registration for hardware vendors, educators, and organizers to offer products and services.",
  },
];

const trustItems = [
  "Verified listings",
  "Manual review readiness",
  "Creator-first experience",
  "Support-ready journey",
];

const discoveryPrompts = [
  "Find a vocal room",
  "Compare studio prices",
  "Plan a podcast setup",
  "Discover trusted gear",
];

function HeroWave() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-20 h-40 overflow-hidden opacity-95">
      <svg
        className="absolute left-1/2 top-1/2 h-full w-[120%] -translate-x-1/2 -translate-y-1/2 animate-[gbWaveDrift_8s_ease-in-out_infinite]"
        viewBox="0 0 1400 260"
        preserveAspectRatio="none"
      >
        <path
          d="M0 152 C120 70 190 230 310 142 S520 62 700 150 S930 236 1080 140 S1280 68 1400 148"
          fill="none"
          stroke="rgba(242,201,76,.88)"
          strokeLinecap="round"
          strokeWidth="8"
        />
        <path
          d="M0 182 C160 118 230 218 390 174 S590 100 760 178 S1010 230 1190 158 S1320 118 1400 166"
          fill="none"
          stroke="rgba(212,175,55,.45)"
          strokeLinecap="round"
          strokeWidth="3"
        />
      </svg>
    </div>
  );
}

function BeatOrb() {
  return (
    <div className="pointer-events-none absolute right-[8%] top-[28%] hidden h-72 w-72 lg:block">
      <div className="absolute inset-0 rounded-full bg-[#f2c94c]/10 blur-[80px]" />
      <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 animate-[gbPulse_4.8s_ease-in-out_infinite] rounded-full border border-[#f2c94c]/20 bg-[radial-gradient(circle,rgba(242,201,76,.28),rgba(212,175,55,.10)_35%,transparent_70%)] shadow-[0_0_120px_rgba(242,201,76,.22)]" />
      <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f2c94c]/80 blur-sm shadow-[0_0_80px_rgba(242,201,76,.55)]" />
    </div>
  );
}

function PremiumCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`group rounded-[1.75rem] border border-[#d4af37]/22 bg-[#05080a]/72 p-6 shadow-[0_24px_80px_rgba(0,0,0,.35)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-[#f2c94c]/45 hover:bg-[#081014]/82 hover:shadow-[0_28px_90px_rgba(212,175,55,.13)] ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  action,
  href,
}: {
  eyebrow: string;
  title: string;
  action?: string;
  href?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="mb-3 inline-flex rounded-full border border-[#f2c94c]/25 bg-[#f2c94c]/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#f2c94c]">
          {eyebrow}
        </p>
        <h2 className="max-w-3xl text-[2rem] font-black leading-[1.05] tracking-[-0.04em] text-white sm:text-[2.45rem] lg:text-[3rem]">
          {title}
        </h2>
      </div>

      {href && action ? (
        <Link
          href={href}
          className="inline-flex w-fit items-center justify-center rounded-full border border-white/12 bg-black/35 px-5 py-3 text-sm font-semibold text-white/86 transition hover:border-[#f2c94c]/45 hover:text-[#f2c94c]"
        >
          {action}
          <span className="ml-2 text-[#f2c94c]">-&gt;</span>
        </Link>
      ) : null}
    </div>
  );
}

function CinematicHero() {
  return (
    <section className="relative min-h-[760px] overflow-hidden px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={{ backgroundImage: "url('/brand/studio-placeholder.jpg')" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(242,201,76,.22),transparent_32%),radial-gradient(circle_at_76%_20%,rgba(212,175,55,.16),transparent_34%),linear-gradient(180deg,rgba(3,5,6,.62)_0%,rgba(3,5,6,.88)_62%,#030506_100%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(242,201,76,.20)_1px,transparent_1px),linear-gradient(90deg,rgba(242,201,76,.15)_1px,transparent_1px)] [background-size:88px_88px]" />
        <div className="absolute left-[-15%] top-[8%] h-[80vh] w-[45vw] rotate-12 animate-[gbHaze_11s_ease-in-out_infinite] bg-[linear-gradient(90deg,transparent,rgba(242,201,76,.12),transparent)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1380px]">
        <div className="relative overflow-hidden rounded-[2rem] border border-[#d4af37]/22 bg-black/24 px-5 py-12 shadow-[0_28px_120px_rgba(0,0,0,.55)] backdrop-blur-[2px] sm:px-8 lg:px-12 lg:py-16">
          <HeroWave />
          <BeatOrb />

          <div className="relative z-10 grid min-h-[560px] items-center gap-10 lg:grid-cols-[1fr_.88fr]">
            <div className="max-w-[700px]">
              <p className="mb-5 inline-flex rounded-full border border-[#f2c94c]/25 bg-[#f2c94c]/10 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#f2c94c]">
                Saudi creator marketplace
              </p>

              <h1 className="max-w-[760px] text-[2.65rem] font-black leading-[1.03] tracking-[-0.045em] text-white sm:text-[3.4rem] md:text-[4.1rem] xl:text-[4.8rem]">
                <span className="block">Book the space.</span>
                <span className="block">Buy the gear.</span>
                <span className="block bg-gradient-to-r from-[#f2c94c] via-[#ffe7a3] to-[#d4af37] bg-clip-text text-transparent">
                  Create the sound.
                </span>
              </h1>

              <p className="mt-6 max-w-[580px] text-base leading-8 text-white/72 sm:text-lg">
                GearBeat connects creators with trusted studios, curated gear discovery,
                and premium music experiences across Saudi Arabia and the GCC.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/studios"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#f2c94c] to-[#d4af37] px-7 py-3.5 text-sm font-black text-black shadow-[0_18px_60px_rgba(242,201,76,.22)] transition hover:-translate-y-0.5"
                >
                  Book a Studio
                  <span className="ml-2">-&gt;</span>
                </Link>
                <Link
                  href="/marketplace"
                  className="inline-flex items-center justify-center rounded-full border border-[#f2c94c]/38 bg-black/35 px-7 py-3.5 text-sm font-bold text-white transition hover:border-[#f2c94c]/70 hover:text-[#f2c94c]"
                >
                  Explore Marketplace
                </Link>
              </div>
            </div>

            <aside className="relative ml-auto w-full max-w-[360px] rounded-[1.7rem] border border-[#f2c94c]/22 bg-black/42 p-5 shadow-[0_24px_90px_rgba(0,0,0,.45)] backdrop-blur-xl">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#f2c94c]">
                Ask GearBeat
              </p>
              <h3 className="mt-2 text-2xl font-black text-white">Discovery assistant</h3>
              <p className="mt-3 text-sm leading-6 text-white/64">
                Start with what you need, then explore studios, gear, and creator paths.
              </p>

              <div className="mt-5 space-y-2.5">
                {discoveryPrompts.map((item) => (
                  <button
                    key={item}
                    className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-left text-sm font-semibold text-white/78 transition hover:border-[#f2c94c]/45 hover:bg-[#f2c94c]/10 hover:text-white"
                    type="button"
                  >
                    <span>{item}</span>
                    <span className="text-[#f2c94c] transition group-hover:translate-x-1">-&gt;</span>
                  </button>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

function PathwaySection() {
  return (
    <section className="relative px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <SectionHeader eyebrow="Choose your next move" title="Four ways into the GearBeat world." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pathways.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-[1.5rem] border border-[#d4af37]/25 bg-[#05080a]/72 p-6 backdrop-blur-md transition hover:-translate-y-1 hover:border-[#f2c94c]/50 hover:bg-[#091014]/80"
            >
              <div className="mb-8 flex items-center justify-between">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#f2c94c]">
                  {item.eyebrow}
                </p>
                <span className="text-3xl font-black text-[#f2c94c]/35">{item.number}</span>
              </div>
              <h3 className="text-xl font-black text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/62">{item.body}</p>
              <p className="mt-5 text-sm font-bold text-[#f2c94c]">{item.action} -&gt;</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function StudiosPreview() {
  return (
    <section className="relative px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <SectionHeader
          action="View Studios"
          eyebrow="Featured studios preview"
          href="/studios"
          title="Browse the atmosphere before booking."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {studioPreview.map((studio) => (
            <PremiumCard key={studio.title} className="min-h-[320px] overflow-hidden p-0">
              <div className="h-48 bg-[radial-gradient(circle_at_50%_50%,rgba(242,201,76,.25),transparent_34%),linear-gradient(135deg,#101820,#030506)]">
                <div className="flex h-full items-center justify-center">
                  <svg className="h-24 w-4/5 opacity-70" preserveAspectRatio="none" viewBox="0 0 500 120">
                    <path
                      d="M0 72 C60 20 95 115 150 62 S260 14 330 70 S430 112 500 58"
                      fill="none"
                      stroke="rgba(242,201,76,.70)"
                      strokeLinecap="round"
                      strokeWidth="7"
                    />
                  </svg>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-black text-white">{studio.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/62">{studio.body}</p>
              </div>
            </PremiumCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function MarketplacePreview() {
  return (
    <section className="relative px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <SectionHeader
          action="Explore Marketplace"
          eyebrow="Featured gear preview"
          href="/marketplace"
          title="Audio gear discovery with a premium pulse."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {gearPreview.map((gear) => (
            <PremiumCard key={gear.title} className="min-h-[250px]">
              <div className="mb-8 h-24 w-24 rounded-[1.5rem] border border-[#f2c94c]/20 bg-[radial-gradient(circle,rgba(242,201,76,.28),rgba(212,175,55,.10)_44%,#030506_78%)] shadow-[0_0_55px_rgba(242,201,76,.12)]" />
              <h3 className="text-lg font-black text-white">{gear.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/62">{gear.body}</p>
            </PremiumCard>
          ))}
        </div>

        <div className="mt-10 grid gap-3 rounded-2xl border border-white/10 bg-black/32 p-3 backdrop-blur md:grid-cols-4">
          {trustItems.map((item) => (
            <div
              key={item}
              className="rounded-xl bg-white/[0.035] px-4 py-3 text-center text-sm font-semibold text-white/70"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PreparedPaths() {
  return (
    <section className="relative px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-10 text-center">
          <p className="mb-3 inline-flex rounded-full border border-[#f2c94c]/25 bg-[#f2c94c]/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#f2c94c]">
            Controlled expansion
          </p>
          <h2 className="mx-auto max-w-3xl text-[2rem] font-black leading-[1.08] tracking-[-0.04em] text-white sm:text-[2.45rem] lg:text-[3rem]">
            More creative paths are being prepared.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {preparedPaths.map((path) => (
            <PremiumCard key={path.title}>
              <span className="inline-flex rounded-full border border-[#f2c94c]/25 bg-[#f2c94c]/10 px-3 py-1 text-[0.68rem] font-bold text-[#f2c94c]">
                {path.status}
              </span>
              <h3 className="mt-5 text-xl font-black text-white">{path.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/62">{path.body}</p>
            </PremiumCard>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1100px] rounded-[2rem] border border-[#d4af37]/18 bg-[radial-gradient(circle_at_50%_0%,rgba(242,201,76,.14),transparent_45%),rgba(0,0,0,.45)] px-6 py-16 text-center shadow-[0_30px_110px_rgba(0,0,0,.45)] backdrop-blur">
        <p className="mb-4 inline-flex rounded-full border border-[#f2c94c]/25 bg-[#f2c94c]/10 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#f2c94c]">
          Ready when the beat starts
        </p>
        <h2 className="mx-auto max-w-3xl text-[2.1rem] font-black leading-[1.05] tracking-[-0.04em] text-white sm:text-[2.7rem]">
          Your sound deserves a better stage.
        </h2>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-full bg-gradient-to-r from-[#f2c94c] to-[#d4af37] px-7 py-3.5 text-sm font-black text-black"
          >
            Create Account
          </Link>
          <Link
            href="/support"
            className="rounded-full border border-white/14 bg-black/35 px-7 py-3.5 text-sm font-bold text-white hover:border-[#f2c94c]/45 hover:text-[#f2c94c]"
          >
            Talk to GearBeat
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="relative isolate overflow-hidden bg-[#030506] text-white">
      <div className="pointer-events-none fixed inset-0 -z-20">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.13]"
          style={{ backgroundImage: "url('/brand/studio-placeholder.jpg')" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(242,201,76,0.16),transparent_32%),radial-gradient(circle_at_78%_18%,rgba(212,175,55,0.12),transparent_34%),linear-gradient(180deg,rgba(3,5,6,.88)_0%,rgba(3,5,6,.96)_44%,#030506_100%)]" />
        <div className="absolute inset-0 opacity-[0.055] [background-image:linear-gradient(rgba(242,201,76,.20)_1px,transparent_1px),linear-gradient(90deg,rgba(242,201,76,.15)_1px,transparent_1px)] [background-size:96px_96px]" />
        <div className="absolute left-[-20%] top-[6%] h-[90vh] w-[55vw] rotate-12 animate-[gbHaze_10s_ease-in-out_infinite] bg-[linear-gradient(90deg,transparent,rgba(242,201,76,.10),transparent)] blur-3xl" />
      </div>

      <CinematicHero />
      <PathwaySection />
      <StudiosPreview />
      <MarketplacePreview />
      <PreparedPaths />
      <FinalCTA />
    </main>
  );
}
