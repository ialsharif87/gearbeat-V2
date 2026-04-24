import { requireRole } from "@/lib/auth";

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
        This is your studio owner area. Later we will add studio onboarding,
        studio management, pricing, availability, bookings, and earnings here.
      </p>

      <div className="actions">
        <a href="/owner/create-studio" className="btn">
          Create studio
        </a>

        <a href="/owner/bookings" className="btn btn-secondary">
          View bookings
        </a>
      </div>
    </div>
  );
}
