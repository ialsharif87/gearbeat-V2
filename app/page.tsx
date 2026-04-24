import Link from "next/link";

export default function HomePage() {
  return (
    <section className="hero">
      <div className="card">
        <span className="badge">Premium Studio Marketplace</span>

        <h1>Book creative studios with confidence.</h1>

        <p>
          GearBeat helps artists, producers, podcasters, and creators discover
          premium recording studios, podcast rooms, rehearsal spaces, and
          production rooms.
        </p>

        <div className="actions">
          <Link href="/studios" className="btn">
            Browse studios
          </Link>

          <Link href="/signup" className="btn btn-secondary">
            Create account
          </Link>
        </div>
      </div>
    </section>
  );
}
