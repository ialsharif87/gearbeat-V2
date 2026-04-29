import { Cairo, Space_Grotesk } from "next/font/google";
import styles from "./brand-preview.module.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

const studios = [
  {
    name: "Echo Room Studios",
    city: "Riyadh",
    price: "180 SAR / hour",
    rating: "4.9",
    description:
      "Premium vocal recording room with treated acoustics and engineer support.",
  },
  {
    name: "The Mix House",
    city: "Jeddah",
    price: "220 SAR / hour",
    rating: "4.8",
    description:
      "High-end production space for music, podcasts, and creative sessions.",
  },
  {
    name: "Desert Sound Lab",
    city: "Khobar",
    price: "160 SAR / hour",
    rating: "4.7",
    description:
      "Comfortable studio designed for creators, producers, and voice artists.",
  },
];

const palette = [
  { name: "Midnight Navy", hex: "#0B0F16", className: styles.swatchMidnight },
  { name: "Charcoal", hex: "#151A22", className: styles.swatchCharcoal },
  { name: "Champagne Gold", hex: "#D4AF37", className: styles.swatchGold },
  { name: "Emerald Teal", hex: "#0FA08A", className: styles.swatchTeal },
  { name: "Ivory", hex: "#F2EFE9", className: styles.swatchIvory },
  { name: "Steel Gray", hex: "#6B7280", className: styles.swatchSteel },
];

export default function BrandPreviewPage() {
  return (
    <main className={`${styles.page} ${spaceGrotesk.variable} ${cairo.variable}`}>
      <section className={styles.shell}>
        <nav className={styles.navbar}>
          <a href="/brand-preview" className={styles.logo}>
            <span className={styles.logoMark}>G</span>
            <span className={styles.logoText}>
              <strong>GearBeat</strong>
              <small>STUDIO. SOUND. CONNECTED.</small>
            </span>
          </a>

          <div className={styles.navLinks}>
            <a href="#studios">Studios</a>
            <a href="#booking">Booking</a>
            <a href="#brand">Brand</a>
          </div>

          <div className={styles.navActions}>
            <button className={styles.ghostButton}>عربي</button>
            <button className={styles.smallGoldButton}>List Studio</button>
          </div>
        </nav>

        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>STUDIO. SOUND. CONNECTED.</p>

            <h1>Book premium creative studios across Saudi Arabia.</h1>

            <p className={styles.heroText}>
              GearBeat connects audio creators with verified studios, clear pricing,
              and a smoother booking experience built for the Saudi and GCC market.
            </p>

            <div className={styles.arabicBox} dir="rtl" lang="ar">
              <h2>منصة حجز الاستديوهات والمعدات الصوتية</h2>
              <p>احجز مساحتك الإبداعية بثقة واحترافية.</p>
            </div>

            <div className={styles.ctaRow}>
              <a href="#studios" className={styles.primaryButton}>
                Browse Studios / تصفح الاستوديوهات
              </a>
              <a href="#booking" className={styles.secondaryButton}>
                List Your Studio / أضف استوديوك
              </a>
            </div>
          </div>

          <aside className={styles.previewCard}>
            <div className={styles.phoneTop}>
              <span className={styles.miniLogo}>G</span>
              <div>
                <small>GearBeat</small>
                <strong>Find the perfect studio</strong>
              </div>
            </div>

            <div className={styles.searchPanel}>
              <span>Location</span>
              <strong>Riyadh</strong>
            </div>

            <div className={styles.searchPanel}>
              <span>Studio Type</span>
              <strong>Recording Studio</strong>
            </div>

            <div className={styles.miniStudio}>
              <div>
                <strong>Echo Room Studios</strong>
                <span>Riyadh · 4.9 rating</span>
              </div>
              <b>180 SAR</b>
            </div>

            <div className={styles.miniStudio}>
              <div>
                <strong>The Mix House</strong>
                <span>Jeddah · Verified</span>
              </div>
              <b>220 SAR</b>
            </div>
          </aside>
        </section>

        <section className={styles.valueStrip}>
          <div>
            <strong>Sound First</strong>
            <span>Built for creators.</span>
          </div>
          <div>
            <strong>Connect</strong>
            <span>Talent with the right space.</span>
          </div>
          <div>
            <strong>Trust</strong>
            <span>Verified studios.</span>
          </div>
          <div>
            <strong>GCC Focused</strong>
            <span>Saudi-ready platform.</span>
          </div>
        </section>

        <section id="studios" className={styles.section}>
          <div className={styles.sectionHeader}>
            <span>Featured Studios</span>
            <h2>Premium spaces for serious creators.</h2>
            <p>
              Example cards showing how studio results can look using the new
              GearBeat identity.
            </p>
          </div>

          <div className={styles.studioGrid}>
            {studios.map((studio) => (
              <article className={styles.studioCard} key={studio.name}>
                <div className={styles.studioVisual}>
                  <span className={styles.wave} />
                  <span className={styles.bigMark}>G</span>
                </div>

                <div className={styles.studioBody}>
                  <div className={styles.cardTop}>
                    <div>
                      <h3>{studio.name}</h3>
                      <p>{studio.city}</p>
                    </div>
                    <span className={styles.rating}>★ {studio.rating}</span>
                  </div>

                  <p className={styles.description}>{studio.description}</p>

                  <div className={styles.metaRow}>
                    <strong>{studio.price}</strong>
                    <span>Verified</span>
                  </div>

                  <button className={styles.bookButton}>Book now</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="booking" className={styles.section}>
          <div className={styles.bookingGrid}>
            <div className={styles.sectionHeader}>
              <span>Booking Card</span>
              <h2>Clear pricing. Clear trust. Clear action.</h2>
              <p>
                The booking interface should feel premium but still simple enough
                for quick decisions.
              </p>
            </div>

            <article className={styles.bookingCard}>
              <div className={styles.bookingHeader}>
                <div>
                  <span className={styles.verifiedBadge}>Verified Studio</span>
                  <h3>Echo Room Studios</h3>
                  <p>Riyadh · Vocal recording · Podcast · Mixing</p>
                </div>

                <div className={styles.priceBox}>
                  <strong>180</strong>
                  <span>SAR / hour</span>
                </div>
              </div>

              <div className={styles.bookingDetails}>
                <div>
                  <span>Date</span>
                  <strong>Today</strong>
                </div>
                <div>
                  <span>Time</span>
                  <strong>7:00 PM</strong>
                </div>
                <div>
                  <span>Duration</span>
                  <strong>2 hours</strong>
                </div>
              </div>

              <div className={styles.totalRow}>
                <span>Estimated total</span>
                <strong>360 SAR</strong>
              </div>

              <button className={styles.fullButton}>Confirm booking</button>
            </article>
          </div>
        </section>

        <section id="brand" className={styles.section}>
          <div className={styles.sectionHeader}>
            <span>Brand Palette</span>
            <h2>Dark, premium, and sound-first.</h2>
            <p>
              Gold is used for premium action. Teal is used for subtle highlights
              and success states.
            </p>
          </div>

          <div className={styles.paletteGrid}>
            {palette.map((color) => (
              <article className={styles.paletteCard} key={color.hex}>
                <div className={`${styles.swatch} ${color.className}`} />
                <h3>{color.hex}</h3>
                <p>{color.name}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.typePanel}>
            <div>
              <span>English Typeface</span>
              <h2>Space Grotesk</h2>
              <p>
                Premium studio booking marketplace for music, podcasts, audio,
                and creative production.
              </p>
            </div>

            <div dir="rtl" lang="ar">
              <span>Arabic Typeface</span>
              <h2>خط Cairo</h2>
              <p>
                منصة فاخرة لحجز الاستوديوهات الصوتية والموسيقية في السعودية والخليج.
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
