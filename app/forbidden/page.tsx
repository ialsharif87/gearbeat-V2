import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="card">
      <span className="badge">Access denied</span>

      <h1>Forbidden</h1>

      <p>
        You do not have permission to access this area. Please login with the
        correct account type.
      </p>

      <div className="actions">
        <Link href="/" className="btn">
          Back home
        </Link>

        <Link href="/login" className="btn btn-secondary">
          Login
        </Link>
      </div>
    </div>
  );
}
