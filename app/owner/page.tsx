import Link from "next/link";
import { requireRole } from "../../lib/auth";

export default async function OwnerPage() {
  const { profile } = await requireRole("owner");

  return (
    <div className="card">
      <span className="badge">Studio Owner Area</span>

      <h1>Owner Dashboard</h1>

      <p>
        Welcome, <strong>{profile.full_name || profile.email}</strong>
      </p>

      <p>
        This is your studio owner area. You can create studios, manage your
        studios, review bookings, and later we will add pricing, availability,
        and earnings here.
      </p>

      <div className="actions">
        <Link href="/owner/create-studio" className="btn">
          Create Studio
        </Link>

        <Link href="/owner/studios" className="btn btn-secondary">
          My Studios
        </Link>

        <Link href="/owner/bookings" className="btn btn-secondary">
          View Bookings
        </Link>
      </div>
    </div>
  );
}
