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
        This is your customer area. Later we will add your bookings, favorites,
        reviews, payments, and profile settings here.
      </p>

      <div className="actions">
        <a href="/studios" className="btn">
          Browse studios
        </a>
      </div>
    </div>
  );
}
