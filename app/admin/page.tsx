import { requireRole } from "@/lib/auth";

export default async function AdminPage() {
  const { profile } = await requireRole("admin");

  return (
    <div className="card">
      <span className="badge">Admin Area</span>

      <h1>Admin Dashboard</h1>

      <p>
        Welcome, <strong>{profile.full_name || profile.email}</strong>
      </p>

      <p>
        This is the platform admin area. Later we will add studio approvals,
        users management, bookings oversight, reports, support tickets, and
        platform settings here.
      </p>

      <div className="actions">
        <a href="/admin/studios" className="btn">
          Studio approvals
        </a>

        <a href="/admin/users" className="btn btn-secondary">
          Manage users
        </a>
      </div>
    </div>
  );
}
