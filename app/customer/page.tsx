import Link from "next/link";
import { requireRole } from "../../lib/auth";

export default async function CustomerPage() {
  const { profile } = await requireRole("customer");

  return (
    <div className="card">
      <span className="badge">Customer Area</span>

      <h1>Customer Dashboard</h1>

      <p>
        Welcome, <strong>{profile.full_name || profile.email}</strong>
      </p>

      <p>
        This is your customer area. You can browse studios, check your bookings,
        and later we will add favorites, reviews, payments, and profile settings.
      </p>

      <div className="actions">
        <Link href="/studios" className="btn">
          Browse studios
        </Link>

        <Link href="/customer/bookings" className="btn btn-secondary">
          My Bookings
        </Link>
      </div>
    </div>
  );
}
