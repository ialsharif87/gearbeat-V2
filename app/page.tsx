import Link from "next/link";

function Waveform() {
  return (
    <div className="waveform" aria-hidden="true">
      {Array.from({ length: 36 }).map((_, index) => (
        <i key={index} />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-content">
            <span className="badge">Premium Music Studio Marketplace</span>

            <h1 className="glow-title">
              Find Your Perfect <span className="neon-text">Sound Space</span>
            </h1>

            <p>
              Book recording studios, podcast rooms, rehearsal spaces, and
              production rooms with a premium music-tech experience built for
              creators, artists, and studio owners.
            </p>

            <div className="visual-search">
              <span>Advanced search for studios, city, vibe, or price...</span>
              <span className="search-icon">⌕</span>
            </div>

            <div className="actions">
              <Link href="/studios" className="btn">
                Book Your Next Studio
              </Link>

              <Link href="/signup" className="btn btn-secondary">
                Join GearBeat
              </Link>
            </div>
          </div>

          <div className="card wave-card">
            <span className="badge">Live Studio Pulse</span>
            <h2>Creator demand is moving fast.</h2>
            <p>
              Track bookings, studio activity, payment status, and owner
              confirmations from one clean marketplace flow.
            </p>

            <Waveform />

            <div className="stats-row">
              <div className="stat">
                <b>24/7</b>
                <span>Booking access</span>
              </div>

              <div className="stat">
                <b>3</b>
                <span>User roles</span>
              </div>

              <div className="stat">
                <b>Live</b>
                <span>Supabase data</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-grid">
        <div className="section-head">
          <span className="badge">Featured Experience</span>
          <h1>Built for music spaces.</h1>
          <p>
            GearBeat connects customers and studio owners in one booking flow:
            discover, request, confirm, and pay.
          </p>
        </div>

        <div className="grid">
          <article className="card">
            <div className="studio-cover">
              <img
                src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04"
                alt="Recording studio"
              />
            </div>

            <h2>The Echo Chamber</h2>
            <p>Premium recording room with neon ambience and studio-grade gear.</p>
            <p>
              Price: <strong>From 250 SAR</strong>
            </p>

            <Link href="/studios" className="btn btn-small">
              View Details
            </Link>
          </article>

          <article className="card">
            <div className="studio-cover">
              <img
                src="https://images.unsplash.com/photo-1520523839897-bd0b52f945a0"
                alt="Music production room"
              />
            </div>

            <h2>Producer Suite</h2>
            <p>Creative production space for artists, producers, and writers.</p>
            <p>
              Price: <strong>From 300 SAR</strong>
            </p>

            <Link href="/studios" className="btn btn-small">
              View Details
            </Link>
          </article>

          <article className="card">
            <div className="studio-cover">
              <img
                src="https://images.unsplash.com/photo-1516280440614-37939bbacd81"
                alt="Podcast studio"
              />
            </div>

            <h2>Podcast Lab</h2>
            <p>Clean spoken-word studio for podcasts, interviews, and content.</p>
            <p>
              Price: <strong>From 180 SAR</strong>
            </p>

            <Link href="/studios" className="btn btn-small">
              View Details
            </Link>
          </article>
        </div>
      </section>

      <section className="pulse-panel">
        <div className="card">
          <span className="badge">For Customers</span>
          <h2>Book with confidence.</h2>
          <p>
            Browse studios, create booking requests, track confirmation status,
            and simulate payment after owner approval.
          </p>

          <Link href="/studios" className="btn">
            Browse Studios
          </Link>
        </div>

        <div className="card">
          <span className="badge">For Studio Owners</span>
          <h2>Manage your studio flow.</h2>
          <p>
            Create studios, review booking requests, confirm or cancel bookings,
            and track customer payment status.
          </p>

          <Link href="/signup" className="btn btn-secondary">
            Create Owner Account
          </Link>
        </div>
      </section>
    </>
  );
}
