# Homepage Backup Before Patch 130B

- Branch at snapshot: patch-130b-homepage-cinematic-visual-system
- Snapshot date: 2026-05-24 17:44:35 +03:00
- Purpose: rollback/reference snapshot only. Do not treat this as implementation documentation.
- Backup branch: backup-homepage-before-130b

```tsx
import Link from "next/link";
import T from "../components/t";
import AskGearBeatPreview from "../components/ask-gearbeat-preview";
import { publicFeatureFlags } from "../lib/public-feature-flags";

export default function HomePage() {
  return (
    <main className="home-root">
      {/* 1. CINEMATIC HERO */}
      <section className="hero-section">
        <div className="container hero-container animate-up">
          <div className="hero-content">
            <div className="badge-gold mb-16">
              <T en="Saudi-First Creative Marketplace" ar="Ù…Ù†ØµØ© Ø¥Ø¨Ø¯Ø§Ø¹ÙŠØ© ØµÙˆØªÙŠØ© Ø³Ø¹ÙˆØ¯ÙŠØ© Ø£ÙˆÙ„Ø§Ù‹" />
            </div>
            <h1 className="text-balance" style={{ fontWeight: 900 }}>
              <T
                en="The global pulse of studio sound."
                ar="Ø§Ù„Ù†Ø¨Ø¶ Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠ Ù„ØµÙˆØª Ø§Ù„Ø§Ø³ØªÙˆØ¯ÙŠÙˆÙ‡Ø§Øª."
              />
            </h1>
            <p className="lead mb-40">
              <T
                en="Built for Saudi launch, GCC expansion, and global reach. Explore now. Full commercial activation coming in controlled phases. Payments and sensitive onboarding are activated only after compliance readiness."
                ar="Ù…ØµÙ…Ù…Ø© Ù„Ù„Ø¥Ø·Ù„Ø§Ù‚ ÙÙŠ Ø§Ù„Ù…Ù…Ù„ÙƒØ© Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© Ø§Ù„Ø³Ø¹ÙˆØ¯ÙŠØ©ØŒ ÙˆØ§Ù„ØªÙˆØ³Ø¹ ÙÙŠ Ø§Ù„Ø®Ù„ÙŠØ¬ØŒ ÙˆØ§Ù„ÙˆØµÙˆÙ„ Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠ. Ø§Ø³ØªÙƒØ´Ù Ø§Ù„Ø¢Ù†. Ø§Ù„ØªÙØ¹ÙŠÙ„ Ø§Ù„ØªØ¬Ø§Ø±ÙŠ Ø§Ù„ÙƒØ§Ù…Ù„ ÙŠØ£ØªÙŠ ÙÙŠ Ù…Ø±Ø§Ø­Ù„ Ø®Ø§Ø¶Ø¹Ø© Ù„Ù„Ø±Ù‚Ø§Ø¨Ø©. ÙŠØªÙ… ØªÙ†Ø´ÙŠØ· Ø§Ù„Ù…Ø¯ÙÙˆØ¹Ø§Øª ÙˆØ§Ù„ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø­Ø³Ø§Ø³ Ù„Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª ÙÙ‚Ø· Ø¨Ø¹Ø¯ Ø¬Ø§Ù‡Ø²ÙŠØ© Ø§Ù„Ø§Ù…ØªØ«Ø§Ù„."
              />
            </p>
            <div className="hero-actions">
              <Link href="/studios" className="btn btn-primary btn-lg shadow-gold">
                <T en="Book a Studio" ar="Ø§Ø­Ø¬Ø² Ø§Ø³ØªÙˆØ¯ÙŠÙˆ" />
              </Link>
              <Link href="/marketplace" className="btn btn-outline btn-lg">
                <T en="Shop Gear" ar="ØªØ³ÙˆÙ‚ Ù…Ø¹Ø¯Ø§Øª" />
              </Link>
            </div>
            <div style={{ marginTop: 24, fontSize: '0.8rem', color: 'var(--gb-gold-light)', display: 'flex', alignItems: 'center', gap: 8, opacity: 0.8 }}>
              <span>ðŸ›¡ï¸</span>
              <T
                en="Verified listings and partner review before full activation."
                ar="Ù‚ÙˆØ§Ø¦Ù… Ù…ÙˆØ«Ù‚Ø© ÙˆÙ…Ø±Ø§Ø¬Ø¹Ø© Ù„Ù„Ø´Ø±ÙƒØ§Ø¡ Ù‚Ø¨Ù„ Ø§Ù„ØªÙØ¹ÙŠÙ„ Ø§Ù„ÙƒØ§Ù…Ù„ Ù„Ù„Ø®Ø¯Ù…Ø§Øª."
              />
            </div>
          </div>
          <div className="hero-visual">
            <div className="ambient-glow"></div>
            <div className="pulse-halo halo-1"></div>
            <div className="pulse-halo halo-2"></div>
            <div className="pulse-ring ring-1"></div>
            <div className="pulse-ring ring-2"></div>
            <div className="pulse-ring ring-3"></div>

            <div className="abstract-orb">
              <div className="orb-inner-glow"></div>
              <div className="soundwave-container">
                <div className="sw-line sw-1"></div>
                <div className="sw-line sw-2"></div>
                <div className="sw-line sw-3"></div>
                <div className="sw-line sw-4"></div>
                <div className="sw-line sw-5"></div>
                <div className="sw-line sw-6"></div>
                <div className="sw-line sw-7"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AskGearBeatPreview />

      {/* 2. CHOOSE YOUR PATH */}
      <section className="section-padding">
        <div className="container">
          <div className="section-head text-center">
            <span className="badge-gold"><T en="Network Status: Operational" ar="Ø­Ø§Ù„Ø© Ø§Ù„Ø´Ø¨ÙƒØ©: ØªØ¹Ù…Ù„" /></span>
            <h2><T en="Join the Ecosystem" ar="Ø§Ù†Ø¶Ù… Ø¥Ù„Ù‰ Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ø¨ÙŠØ¦ÙŠ" /></h2>
          </div>

          <div className="grid grid-3 path-grid">
            <Link href="/studios" className="card-premium path-card hover-lift">
              <div className="path-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="22"></line>
                </svg>
              </div>
              <h3><T en="Creators & Artists" ar="Ø§Ù„Ù…Ø¨Ø¯Ø¹ÙˆÙ† ÙˆØ§Ù„ÙÙ†Ø§Ù†ÙˆÙ†" /></h3>
              <p><T en="Discover world-class studios, browse verified equipment, and book your next session with confidence." ar="Ø§ÙƒØªØ´Ù Ø§Ø³ØªÙˆØ¯ÙŠÙˆÙ‡Ø§Øª Ø¹Ø§Ù„Ù…ÙŠØ©ØŒ ØªØµÙØ­ Ù…Ø¹Ø¯Ø§Øª Ù…ÙˆØ«Ù‚Ø©ØŒ ÙˆØ§Ø­Ø¬Ø² Ø¬Ù„Ø³ØªÙƒ Ø§Ù„Ù‚Ø§Ø¯Ù…Ø© Ø¨ÙƒÙ„ Ø«Ù‚Ø©." /></p>
              <span className="path-cta text-gold font-bold"><T en="Book a Studio" ar="Ø§Ø­Ø¬Ø² Ø§Ø³ØªÙˆØ¯ÙŠÙˆ" /> â†’</span>
            </Link>

            <Link href="/join/studio" className="card-premium path-card active-border hover-lift">
              <div className="path-icon text-gold">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3a9 9 0 0 0-9 9v7a2 2 0 0 0 2 2h2v-6H5v-3a7 7 0 0 1 14 0v3h-2v6h2a2 2 0 0 0 2-2v-7a9 9 0 0 0-9-9z"/>
                </svg>
              </div>
              <h3><T en="Studio Owners" ar="Ø£ØµØ­Ø§Ø¨ Ø§Ù„Ø§Ø³ØªÙˆØ¯ÙŠÙˆÙ‡Ø§Øª" /></h3>
              <p><T en="Monetize your space, simplify bookings, and apply for 'GearBeat Certified' status." ar="Ø§Ø³ØªØ«Ù…Ø± Ù…Ø³Ø§Ø­ØªÙƒØŒ Ø¨Ø³Ø· Ø­Ø¬ÙˆØ²Ø§ØªÙƒØŒ ÙˆÙ‚Ø¯Ù… Ø·Ù„Ø¨Ø§Ù‹ Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø­Ø§Ù„Ø© 'GearBeat Certified'." /></p>
              <span className="path-cta text-gold font-bold"><T en="Become a Partner" ar="Ø§Ù†Ø¶Ù… ÙƒØ´Ø±ÙŠÙƒ" /> â†’</span>
            </Link>

            <Link href="/join/seller" className="card-premium path-card hover-lift">
              <div className="path-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
              </div>
              <h3><T en="Certified Vendors" ar="Ø§Ù„ØªØ¬Ø§Ø± Ø§Ù„Ù…Ø¹ØªÙ…Ø¯ÙˆÙ†" /></h3>
              <p><T en="Join the elite marketplace. List professional audio gear with integrated logistics and verified status." ar="Ø§Ù†Ø¶Ù… Ø¥Ù„Ù‰ Ø§Ù„Ø³ÙˆÙ‚ Ø§Ù„Ù…ØªÙ…ÙŠØ². Ø§Ø¹Ø±Ø¶ Ù…Ø¹Ø¯Ø§Øª Ø§Ù„ØµÙˆØª Ø§Ù„Ø§Ø­ØªØ±Ø§ÙÙŠØ© Ù…Ø¹ Ø®Ø¯Ù…Ø§Øª Ù„ÙˆØ¬Ø³ØªÙŠØ© Ù…ØªÙƒØ§Ù…Ù„Ø© ÙˆØ­Ø§Ù„Ø© Ù…ÙˆØ«Ù‚Ø©." /></p>
              <span className="path-cta text-gold font-bold"><T en="Become a Partner" ar="Ø§Ù†Ø¶Ù… ÙƒØ´Ø±ÙŠÙƒ" /> â†’</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. TRUST / WHY GEARBEAT */}
      <section className="trust-section border-y border-white/5" style={{ padding: '60px 0' }}>
        <div className="container">
          <div className="grid grid-2 items-center gap-40">
            <div className="trust-text">
              <div className="badge-gold mb-12"><T en="Verified Integrity" ar="Ù†Ø²Ø§Ù‡Ø© Ù…ÙˆØ«Ù‚Ø©" /></div>
              <h2 className="mb-16 text-balance" style={{ fontSize: '2.2rem' }}><T en="The benchmark for trust in audio." ar="Ø§Ù„Ù…Ø¹ÙŠØ§Ø± Ø§Ù„Ù…Ø±Ø¬Ø¹ÙŠ Ù„Ù„Ø«Ù‚Ø© ÙÙŠ Ø¹Ø§Ù„Ù… Ø§Ù„ØµÙˆØª." /></h2>
              <p className="text-muted leading-relaxed" style={{ maxWidth: 450, fontSize: '0.95rem' }}>
                <T
                  en="GearBeat is setting the global standard for studio operations. From verified equipment to secure session booking, we ensure a seamless professional environment for every artist."
                  ar="ØªØ¶Ø¹ GearBeat Ø§Ù„Ù…Ø¹ÙŠØ§Ø± Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠ Ù„Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ø§Ø³ØªÙˆØ¯ÙŠÙˆ. Ù…Ù† Ø§Ù„Ù…Ø¹Ø¯Ø§Øª Ø§Ù„Ù…ÙˆØ«Ù‚Ø© Ø¥Ù„Ù‰ Ø­Ø¬Ø² Ø§Ù„Ø¬Ù„Ø³Ø§Øª Ø§Ù„Ø¢Ù…Ù†ØŒ Ù†Ø¶Ù…Ù† Ø¨ÙŠØ¦Ø© Ø§Ø­ØªØ±Ø§ÙÙŠØ© Ø³Ù„Ø³Ø© Ù„ÙƒÙ„ ÙÙ†Ø§Ù†."
                />
              </p>
            </div>
            <div className="grid grid-3 gap-12">
              {[
                { icon: 'ðŸ›¡ï¸', en: 'Verified Gear', ar: 'Ù…Ø¹Ø¯Ø§Øª Ù…ÙˆØ«Ù‚Ø©' },
                { icon: 'ðŸŽšï¸', en: 'Studio Grade', ar: 'Ø¬ÙˆØ¯Ø© Ø§Ø³ØªÙˆØ¯ÙŠÙˆ' },
                { icon: 'â­', en: 'Top Talent', ar: 'Ù…ÙˆØ§Ù‡Ø¨ Ù…ØªÙ…ÙŠØ²Ø©' },
                { icon: 'ðŸ”’', en: 'Secure Escrow', ar: 'Ø¶Ù…Ø§Ù† Ø¢Ù…Ù†' },
                { icon: 'ðŸŒ', en: 'Global Reach', ar: 'ÙˆØµÙˆÙ„ Ø¹Ø§Ù„Ù…ÙŠ' },
                { icon: 'ðŸ›ï¸', en: 'Certified Network', ar: 'Ø´Ø¨ÙƒØ© Ù…Ø¹ØªÙ…Ø¯Ø©' },
              ].map(item => (
                <div key={item.en} className="trust-item-compact hover-lift" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '16px 12px',
                  background: 'rgba(212, 175, 55, 0.03)',
                  border: '1px solid rgba(212, 175, 55, 0.1)',
                  borderRadius: '16px',
                  textAlign: 'center'
                }}>
                  <div className="trust-icon-mini" style={{ fontSize: '1.2rem', marginBottom: 8 }}>{item.icon}</div>
                  <h4 style={{ fontSize: '0.65rem', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--gb-gold-light)' }}>
                    <T en={item.en} ar={item.ar} />
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED STUDIOS PREVIEW */}
      <section className="section-padding bg-darker overflow-hidden">
        <div className="container">
          <div className="flex-between section-head items-center mb-60">
            <div>
              <span className="badge-gold"><T en="Curated Selection" ar="Ù…Ø®ØªØ§Ø±Ø§Øª Ù…Ø®ØªØ§Ø±Ø©" /></span>
              <h2 className="mt-8"><T en="Elite Studios" ar="Ø§Ø³ØªÙˆØ¯ÙŠÙˆÙ‡Ø§Øª Ø§Ù„Ù†Ø®Ø¨Ø©" /></h2>
            </div>
            <Link href="/studios" className="btn btn-outline btn-sm"><T en="Book a Studio" ar="Ø§Ø­Ø¬Ø² Ø§Ø³ØªÙˆØ¯ÙŠÙˆ" /> â†’</Link>
          </div>
          <div className="grid grid-3 gap-32">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-premium studio-preview-card hover-lift p-0 overflow-hidden">
                <div className="studio-thumb-placeholder relative" style={{
                  height: 250,
                  background: 'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.08) 0%, #080b10 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottom: '1px solid rgba(212, 175, 55, 0.15)'
                }}>
                  {/* Subtle CSS Abstract soundwave graphic inside placeholder */}
                  <div className="abstract-card-visual" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <span style={{ width: 4, height: 24, background: 'var(--gb-gold)', borderRadius: 2, opacity: 0.4 }}></span>
                    <span style={{ width: 4, height: 40, background: 'var(--gb-gold)', borderRadius: 2, opacity: 0.7 }}></span>
                    <span style={{ width: 4, height: 64, background: 'var(--gb-gold)', borderRadius: 2, opacity: 1, filter: 'drop-shadow(0 0 8px var(--gb-gold))' }}></span>
                    <span style={{ width: 4, height: 40, background: 'var(--gb-gold)', borderRadius: 2, opacity: 0.7 }}></span>
                    <span style={{ width: 4, height: 24, background: 'var(--gb-gold)', borderRadius: 2, opacity: 0.4 }}></span>
                  </div>
                  <div className="absolute top-16 right-16" style={{ zIndex: 1 }}>
                     <span className="badge badge-gold">Certified</span>
                  </div>
                </div>
                <div style={{ padding: 24 }}>
                  <div className="flex-between mb-8">
                    <h4 className="m-0">Global Sound Station {i}</h4>
                    <span className="text-gold font-bold">5.0 â˜…</span>
                  </div>
                  <p className="text-muted text-sm mb-20">Verified Partner â€¢ Riyadh</p>
                  <Link href="/studios" className="btn btn-outline btn-sm w-full">
                    <T en="Book a Studio" ar="Ø§Ø­Ø¬Ø² Ø§Ø³ØªÙˆØ¯ÙŠÙˆ" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. GEAR MARKETPLACE PREVIEW */}
      <section className="section-padding">
        <div className="container">
          <div className="flex-between section-head items-center mb-60">
             <div>
               <span className="badge-gold"><T en="Boutique Inventory" ar="Ù…Ø®Ø²ÙˆÙ† ÙØ§Ø®Ø±" /></span>
               <h2 className="mt-8"><T en="Verified Marketplace" ar="Ø³ÙˆÙ‚ Ù…ÙˆØ«Ù‚" /></h2>
             </div>
             <Link href="/marketplace" className="btn btn-outline btn-sm"><T en="Shop Gear" ar="ØªØ³ÙˆÙ‚ Ù…Ø¹Ø¯Ø§Øª" /> â†’</Link>
          </div>
          <div className="grid grid-4 category-grid gap-24">
            {[
              { name: 'Microphones', ar: 'Ù…ÙŠÙƒØ±ÙˆÙÙˆÙ†Ø§Øª', icon: 'ðŸŽ™ï¸' },
              { name: 'Analog Outboard', ar: 'Ø£Ø¬Ù‡Ø²Ø© ØªÙ…Ø§Ø«Ù„ÙŠØ©', icon: 'ðŸŽ›ï¸' },
              { name: 'Studio Monitors', ar: 'Ø³Ù…Ø§Ø¹Ø§Øª Ø§Ø³ØªÙˆØ¯ÙŠÙˆ', icon: 'ðŸ”Š' },
              { name: 'Instruments', ar: 'Ø¢Ù„Ø§Øª Ù…ÙˆØ³ÙŠÙ‚ÙŠØ©', icon: 'ðŸŽ¸' }
            ].map((cat) => (
              <div key={cat.name} className="card-premium cat-card hover-lift text-center" style={{ padding: 40 }}>
                <div className="cat-icon" style={{ fontSize: '2.5rem', marginBottom: 20 }}>
                  {cat.icon}
                </div>
                <h4 className="m-0"><T en={cat.name} ar={cat.ar} /></h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5B. COMING SOON PRODUCT SECTIONS */}
      <section className="section-padding bg-darker relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--gb-gold) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="container relative z-10">
          <div className="section-head text-center mb-60">
            <span className="badge-gold">
              <T en="Ecosystem Expansion" ar="ØªÙˆØ³ÙŠØ¹ Ø§Ù„Ù†Ø¸Ø§Ù… Ø§Ù„Ø¨ÙŠØ¦ÙŠ" />
            </span>
            <h2 className="mt-8">
              <T en="Coming Soon at GearBeat" ar="Ù‚Ø§Ø¯Ù… Ù‚Ø±ÙŠØ¨Ù‹Ø§ ÙÙŠ GearBeat" />
            </h2>
            <p className="text-muted mt-12" style={{ maxWidth: 600, marginInline: 'auto' }}>
              <T
                en="We are building the ultimate creative home for music and sound. The following verticals are currently in active preparation and will launch in upcoming phases."
                ar="Ù†Ø­Ù† Ù†Ø¨Ù†ÙŠ Ø§Ù„Ù…ÙˆØ·Ù† Ø§Ù„Ø¥Ø¨Ø¯Ø§Ø¹ÙŠ Ø§Ù„Ø£Ù…Ø«Ù„ Ù„Ù„Ù…ÙˆØ³ÙŠÙ‚Ù‰ ÙˆØ§Ù„ØµÙˆØª. Ø§Ù„Ù‚Ø·Ø§Ø¹Ø§Øª Ø§Ù„ØªØ§Ù„ÙŠØ© Ù‚ÙŠØ¯ Ø§Ù„ØªØ­Ø¶ÙŠØ± Ø§Ù„Ù†Ø´Ø· Ø­Ø§Ù„ÙŠØ§Ù‹ ÙˆØ³ÙŠØªÙ… Ø¥Ø·Ù„Ø§Ù‚Ù‡Ø§ ÙÙŠ Ø§Ù„Ù…Ø±Ø§Ø­Ù„ Ø§Ù„Ù‚Ø§Ø¯Ù…Ø©."
              />
            </p>
          </div>

          <div className="grid grid-3 gap-24 coming-soon-grid">
            {publicFeatureFlags
              .filter((flag) => flag.showOnHomepage)
              .map((flag) => (
                <div key={flag.key} className="card-premium coming-soon-card">
                  <div className="coming-soon-badge-container">
                    <span className="badge badge-gold">
                      <T en={flag.safeStatusLabel.en} ar={flag.safeStatusLabel.ar} />
                    </span>
                  </div>
                  <div className="card-icon-emoji">{flag.iconEmoji}</div>
                  <h3>
                    <T en={flag.enLabel} ar={flag.arLabel} />
                  </h3>
                  <p>
                    <T en={flag.description.en} ar={flag.description.ar} />
                  </p>
                  <div className="card-status-indicator">
                    <T en={flag.safeStatusIndicator.en} ar={flag.safeStatusIndicator.ar} />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="section-padding final-cta text-center py-120">
        <div className="container animate-up">
          <div className="badge-gold mb-24"><T en="Ready to Start?" ar="Ù‡Ù„ Ø£Ù†Øª Ù…Ø³ØªØ¹Ø¯ Ù„Ù„Ø¨Ø¯Ø¡ØŸ" /></div>
          <h2 className="mb-60 text-balance" style={{ marginInline: 'auto' }}><T en="The future of sound belongs to you." ar="Ù…Ø³ØªÙ‚Ø¨Ù„ Ø§Ù„ØµÙˆØª Ù…Ù„Ùƒ Ù„Ùƒ." /></h2>
          <div className="cta-actions" style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
            <Link href="/signup" className="btn btn-primary btn-lg shadow-gold">
              <T en="Create Account" ar="Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨" />
            </Link>
            <Link href="/support" className="btn btn-outline btn-lg">
               <T en="Speak to an Expert" ar="ØªØ­Ø¯Ø« Ù…Ø¹ Ø®Ø¨ÙŠØ±" />
            </Link>
          </div>
        </div>
      </section>


      <style dangerouslySetInnerHTML={{ __html: `
        .home-root { overflow-x: hidden; }

        /* HERO */
        .hero-section {
          padding: 140px 0 100px;
          background: radial-gradient(circle at 80% 20%, rgba(201, 162, 77, 0.08) 0%, transparent 40%);
          position: relative;
        }

        .hero-container {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 60px;
          align-items: center;
        }

        .hero-content h1 {
          font-size: clamp(2.5rem, 6vw, 4.8rem);
          margin: 24px 0;
          color: #fff;
        }

        .hero-content .lead {
          font-size: 1.25rem;
          color: var(--gb-text-muted);
          margin-bottom: 48px;
          max-width: 600px;
        }

        .hero-actions { display: flex; gap: 16px; }

        .hero-visual {
          position: relative;
          height: 450px;
          display: flex;
          justify-content: center;
          align-items: center;
          perspective: 1000px;
        }

        .ambient-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%);
          filter: blur(80px);
          pointer-events: none;
        }

        .pulse-halo {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.05) 0%, transparent 70%);
          animation: halo-pulse 6s infinite ease-in-out;
          pointer-events: none;
        }
        .halo-1 { width: 500px; height: 500px; animation-delay: 0s; }
        .halo-2 { width: 500px; height: 500px; animation-delay: -3s; }

        @keyframes halo-pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.6; }
        }

        .pulse-ring {
          position: absolute;
          border: 2px solid rgba(212, 175, 55, 0.3);
          border-radius: 50%;
          animation: elegant-pulse 8s infinite cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.1);
        }

        .ring-1 { width: 300px; height: 300px; animation-delay: 0s; }
        .ring-2 { width: 300px; height: 300px; animation-delay: -2.66s; }
        .ring-3 { width: 300px; height: 300px; animation-delay: -5.33s; }

        @keyframes elegant-pulse {
          0% { transform: scale(0.8); opacity: 0; }
          20% { opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }

        .abstract-orb {
          position: relative;
          width: 280px;
          height: 280px;
          background: radial-gradient(circle at 30% 30%, #151c29 0%, #000 100%);
          border: 2.5px solid rgba(212, 175, 55, 0.6);
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          box-shadow:
            0 0 60px rgba(0,0,0,0.9),
            0 0 30px rgba(212, 175, 55, 0.2),
            inset 0 0 40px rgba(212, 175, 55, 0.15);
          z-index: 10;
        }

        .orb-inner-glow {
          position: absolute;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 60%);
          animation: orb-drift 12s infinite linear;
        }

        @keyframes orb-drift {
          0% { transform: translate(-20%, -20%); }
          50% { transform: translate(10%, 10%); }
          100% { transform: translate(-20%, -20%); }
        }

        .soundwave-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          width: 180px;
          z-index: 20;
        }

        .sw-line {
          height: 2.5px;
          background: linear-gradient(to right, transparent, var(--gb-gold-light), transparent);
          border-radius: 4px;
          animation: sw-horizontal-vibrate 1.5s infinite ease-in-out;
          filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.5));
        }

        .sw-1 { width: 80px; animation-delay: 0s; opacity: 0.4; }
        .sw-2 { width: 130px; animation-delay: 0.1s; opacity: 0.6; }
        .sw-3 { width: 170px; animation-delay: 0.2s; opacity: 0.9; }
        .sw-4 { width: 140px; animation-delay: 0.3s; opacity: 0.7; }
        .sw-5 { width: 160px; animation-delay: 0.4s; opacity: 0.8; }
        .sw-6 { width: 110px; animation-delay: 0.5s; opacity: 0.5; }
        .sw-7 { width: 70px; animation-delay: 0.6s; opacity: 0.3; }

        @keyframes sw-horizontal-vibrate {
          0%, 100% { transform: scaleX(1); }
          50% { transform: scaleX(1.2); }
        }

        /* PATH SECTION */
        .section-head { margin-bottom: 60px; }
        .section-head h2 { font-size: 3rem; margin-top: 24px; }
        .text-center { text-align: center; }

        .path-card { text-align: center; }
        .path-icon { font-size: 3.5rem; margin-bottom: 24px; }
        .path-card h3 { margin-bottom: 16px; font-size: 1.5rem; }
        .path-card p { color: var(--gb-text-muted); margin-bottom: 30px; font-size: 0.95rem; line-height: 1.7; }
        .path-cta { color: var(--gb-gold); font-weight: 800; font-size: 0.9rem; }

        .active-border { border-color: var(--gb-gold); }

        /* COMING SOON SECTION */
        .coming-soon-grid {
          justify-content: center;
        }
        .coming-soon-card {
          position: relative;
          padding: 48px 32px 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.04);
          transition: border-color 0.3s, transform 0.3s;
        }
        .coming-soon-card:hover {
          border-color: rgba(212, 175, 55, 0.15);
          transform: translateY(-4px);
        }
        .coming-soon-badge-container {
          position: absolute;
          top: 16px;
          right: 16px;
        }
        [dir="rtl"] .coming-soon-badge-container {
          right: auto;
          left: 16px;
        }
        .card-icon-emoji {
          font-size: 3rem;
          margin-bottom: 24px;
        }
        .coming-soon-card h3 {
          font-size: 1.35rem;
          font-weight: 700;
          margin-bottom: 12px;
          color: #fff;
        }
        .coming-soon-card p {
          color: var(--gb-text-muted);
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 24px;
          flex-grow: 1;
        }
        .card-status-indicator {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 99px;
          font-size: 0.8rem;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.4);
          cursor: default;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* TRUST SECTION */
        .trust-section { background: #080b0e; }
        .trust-item-compact { transition: var(--transition); }

        /* STUDIO PREVIEW */
        .bg-darker { background: #030507; }
        .flex-between { display: flex; justify-content: space-between; gap: 20px; align-items: flex-end; }
        .studio-thumb-placeholder { height: 220px; background: #1a222c; border-radius: 16px; }
        .w-full { width: 100%; }
        .mt-20 { margin-top: 20px; }

        /* CATEGORY CARDS */
        .cat-card { text-align: center; padding: 30px 20px; }
        .cat-icon { font-size: 2rem; margin-bottom: 12px; color: var(--gb-gold); }

        /* FINAL CTA */
        .final-cta { background: linear-gradient(to bottom, #05080B, #000); }
        .final-cta h2 { font-size: 3.5rem; max-width: 800px; margin: 0 auto; }

        .btn-lg { padding: 18px 48px; font-size: 1.1rem; }

        @media (max-width: 1000px) {
          .hero-container { grid-template-columns: 1fr; text-align: center; }
          .hero-content .lead { margin: 24px auto 48px; }
          .hero-actions { justify-content: center; }
          .hero-visual { height: 200px; order: -1; }
          .hero-section { padding-top: 80px; }
          .grid-2 { grid-template-columns: 1fr; }
          .section-head h2 { font-size: 2.2rem; }
          .final-cta h2 { font-size: 2.2rem; }
        }

        @media (max-width: 600px) {
          .hero-actions { flex-direction: column; width: 100%; }
          .cta-actions { flex-direction: column; width: 100%; }
          .hero-content h1 { font-size: 2.2rem; }
          .section-padding { padding: 60px 0; }
        }

        /* RTL HELPER */
        [dir="rtl"] .hero-container { direction: rtl; }
        [dir="rtl"] .hero-content { text-align: right; }
        [dir="rtl"] .section-head { text-align: right; }
        [dir="rtl"] .text-center { text-align: center; }
      `}} />
    </main>
  );
}
```
