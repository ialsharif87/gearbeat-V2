import { redirect } from "next/navigation";
import T from "@/components/t";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function formatDate(value: unknown) {
  if (!value) return "—";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-SA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatMoney(value: unknown, currency = "SAR") {
  const numberValue = Number(value || 0);
  if (!Number.isFinite(numberValue)) return `0.00 ${currency}`;
  return `${numberValue.toFixed(2)} ${currency}`;
}

function getBadgeClass(status: string | null | undefined) {
  switch (status) {
    case "confirmed":
    case "paid":
    case "completed":
    case "accepted":
      return "badge badge-success";
    case "pending":
    case "pending_payment":
      return "badge badge-warning";
    case "rejected":
    case "cancelled":
    case "canceled":
    case "expired":
      return "badge badge-danger";
    default:
      return "badge";
  }
}

export default async function OwnerBookingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?account=owner");
  }

  const supabaseAdmin = createAdminClient();

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!profile || !["owner", "admin"].includes(profile.role)) {
    redirect("/forbidden");
  }

  let query = supabaseAdmin
    .from("bookings")
    .select(`
      id,
      booking_number,
      customer_name,
      customer_email,
      booking_date,
      start_time,
      end_time,
      duration_hours,
      status,
      payment_status,
      total_amount,
      currency_code,
      owner_notes,
      created_at,
      studio:studios(
        id,
        name,
        name_en,
        name_ar
      )
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (profile.role !== "admin") {
    query = query.eq("owner_auth_user_id", user.id);
  }

  const { data: bookings, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const totalRevenue = (bookings || [])
    .filter((b: any) => b.payment_status === "paid" || b.status === "completed")
    .reduce((sum: number, b: any) => sum + Number(b.total_amount || 0), 0);

  return (
    <main className="dashboard-page" style={{ maxWidth: 1200, margin: "0 auto" }}>
      <section style={{ marginTop: 24 }}>
        <span className="badge badge-gold">
          <T en="Bookings" ar="الحجوزات" />
        </span>

        <h1 style={{ marginTop: 10 }}>
          <T en="Manage studio bookings" ar="إدارة حجوزات الاستوديو" />
        </h1>

        <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
          <T
            en="Review and update the status of studio bookings from your customers."
            ar="راجع وحدث حالة حجوزات الاستوديو من عملائك."
          />
        </p>
      </section>

      <section className="stats-grid" style={{ marginTop: 26 }}>
        <div className="card stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <label>Total Bookings</label>
            <div className="stat-value">{bookings?.length || 0}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <label>Confirmed Revenue</label>
            <div className="stat-value">{formatMoney(totalRevenue)}</div>
          </div>
        </div>
      </section>

      <section className="card" style={{ marginTop: 30 }}>
        <h2>
          <T en="Recent bookings" ar="الحجوزات الأخيرة" />
        </h2>

        <div className="table-responsive" style={{ marginTop: 20 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Booking</th>
                <th>Studio</th>
                <th>Customer</th>
                <th>Date & Time</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {!bookings || bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 40 }}>
                    <T en="No bookings found." ar="لا توجد حجوزات." />
                  </td>
                </tr>
              ) : (
                bookings.map((booking: any) => {
                  const studio = Array.isArray(booking.studio)
                    ? booking.studio[0]
                    : booking.studio;

                  return (
                    <tr key={booking.id}>
                      <td>
                        <div style={{ fontWeight: 800 }}>
                          {booking.booking_number}
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                          {formatDate(booking.created_at)}
                        </div>
                      </td>

                      <td>
                        {studio?.name_en || studio?.name || studio?.name_ar || "—"}
                      </td>

                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {booking.customer_name || "—"}
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                          {booking.customer_email || "—"}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {formatDate(booking.booking_date)}
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                          {booking.start_time} - {booking.end_time} ({booking.duration_hours}h)
                        </div>
                      </td>

                      <td>
                        {formatMoney(booking.total_amount, booking.currency_code)}
                      </td>

                      <td>
                        <span className={getBadgeClass(booking.status)}>
                          {booking.status}
                        </span>
                        <div style={{ marginTop: 4 }}>
                          <span className={getBadgeClass(booking.payment_status)}>
                            {booking.payment_status}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: "grid", gap: 6 }}>
                          <select
                            className="input"
                            defaultValue={booking.status}
                            style={{ padding: "4px 8px", fontSize: "0.85rem" }}
                            data-booking-status-select
                          >
                            <option value="pending">pending</option>
                            <option value="accepted">accepted</option>
                            <option value="rejected">rejected</option>
                            <option value="confirmed">confirmed</option>
                            <option value="cancelled">cancelled</option>
                            <option value="completed">completed</option>
                          </select>

                          <button
                            type="button"
                            className="btn btn-small btn-primary"
                            data-booking-update-btn
                            data-booking-id={booking.id}
                          >
                            Save
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener("click", async function(event) {
              const button = event.target.closest("[data-booking-update-btn]");
              if (!button) return;

              const bookingId = button.getAttribute("data-booking-id");
              const container = button.closest("td");
              const select = container.querySelector("[data-booking-status-select]");
              const status = select.value;

              const response = await fetch("/api/owner/bookings/update-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId, status })
              });

              if (response.ok) {
                window.location.reload();
              } else {
                const data = await response.json().catch(() => null);
                alert(data && data.error ? data.error : "Could not update status.");
              }
            });
          `,
        }}
      />
    </main>
  );
}
