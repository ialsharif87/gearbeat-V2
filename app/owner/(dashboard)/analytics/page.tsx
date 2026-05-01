import Link from "next/link";
import { redirect } from "next/navigation";
import T from "@/components/t";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type SafeResult<T> = {
  data: T | null;
  error: any;
};

async function safeQuery<T>(
  queryPromise: PromiseLike<SafeResult<T>>
): Promise<T | null> {
  const { data, error } = await queryPromise;

  if (error) {
    console.warn("Owner analytics optional query failed:", error.message);
    return null;
  }

  return data;
}

function formatMoney(value: unknown, currency = "SAR") {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return `0.00 ${currency}`;
  }

  return `${numberValue.toFixed(2)} ${currency}`;
}

function formatDate(value: unknown) {
  if (!value) {
    return "—";
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-SA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function getStudioName(studio: any) {
  return studio?.name_en || studio?.name || studio?.name_ar || "Studio";
}

function normalizeStatus(value: unknown) {
  return String(value || "pending").toLowerCase();
}

function getBookingAmount(booking: any) {
  return Number(
    booking.total_amount ||
      booking.total_price ||
      booking.amount ||
      booking.price ||
      booking.final_amount ||
      0
  );
}

function getCommissionAmount(booking: any, grossAmount: number) {
  const directCommission = Number(
    booking.commission_amount ||
      booking.platform_commission_amount ||
      booking.admin_commission_amount ||
      0
  );

  if (directCommission > 0) {
    return directCommission;
  }

  const commissionRate = Number(
    booking.commission_rate ||
      booking.platform_commission_rate ||
      0
  );

  if (commissionRate > 0) {
    return grossAmount * (commissionRate / 100);
  }

  return 0;
}

function getNetAmount(booking: any, grossAmount: number, commissionAmount: number) {
  const directNet = Number(
    booking.net_amount ||
      booking.owner_net_amount ||
      booking.payout_amount ||
      0
  );

  if (directNet > 0) {
    return directNet;
  }

  return Math.max(grossAmount - commissionAmount, 0);
}

function getBookingDateValue(booking: any) {
  return booking.booking_date || booking.date || booking.start_date || booking.created_at;
}

function isUpcomingBooking(booking: any) {
  const status = normalizeStatus(booking.status);

  if (["cancelled", "canceled", "refunded", "rejected", "completed"].includes(status)) {
    return false;
  }

  const rawDate = getBookingDateValue(booking);

  if (!rawDate) {
    return false;
  }

  const bookingDate = new Date(String(rawDate));
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return !Number.isNaN(bookingDate.getTime()) && bookingDate >= today;
}

function isCompletedBooking(booking: any) {
  const status = normalizeStatus(booking.status);

  return ["completed", "done", "paid", "confirmed"].includes(status);
}

function isCancelledBooking(booking: any) {
  const status = normalizeStatus(booking.status);

  return ["cancelled", "canceled", "refunded", "rejected"].includes(status);
}

function StatCard({
  icon,
  labelEn,
  labelAr,
  value,
  hint,
}: {
  icon: string;
  labelEn: string;
  labelAr: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="card stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <label>
          <T en={labelEn} ar={labelAr} />
        </label>
        <div className="stat-value">{value}</div>
        {hint ? (
          <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            {hint}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PerformanceBar({
  label,
  value,
  maxValue,
  currency,
}: {
  label: string;
  value: number;
  maxValue: number;
  currency: string;
}) {
  const percent =
    maxValue > 0 ? Math.min(100, Math.round((value / maxValue) * 100)) : 0;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <span>{label}</span>
        <strong>{formatMoney(value, currency)}</strong>
      </div>

      <div
        style={{
          height: 12,
          borderRadius: 999,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            borderRadius: 999,
            background:
              "linear-gradient(90deg, rgba(207,167,98,0.95), rgba(255,255,255,0.6))",
          }}
        />
      </div>
    </div>
  );
}

export default async function OwnerAnalyticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?account=owner");
  }

  const supabaseAdmin = createAdminClient();

  const profile = await safeQuery<any>(
    supabaseAdmin
      .from("profiles")
      .select("auth_user_id, full_name, email, role, preferred_currency")
      .eq("auth_user_id", user.id)
      .maybeSingle()
  );

  if (!profile) {
    redirect("/login?account=owner");
  }

  const allowedRoles = ["owner", "studio_owner", "admin"];

  if (!allowedRoles.includes(profile.role)) {
    redirect("/forbidden");
  }

  const currency = profile.preferred_currency || "SAR";

  const studios = await safeQuery<any[]>(
    supabaseAdmin
      .from("studios")
      .select(`
        id,
        slug,
        owner_auth_user_id,
        name,
        name_en,
        name_ar,
        city,
        city_name,
        district,
        status,
        verified,
        verified_location,
        booking_enabled,
        price_from,
        created_at
      `)
      .eq("owner_auth_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100)
  );

  const studioRows = studios || [];
  const studioIds = studioRows.map((studio: any) => studio.id).filter(Boolean);

  const bookings = studioIds.length
    ? await safeQuery<any[]>(
        supabaseAdmin
          .from("bookings")
          .select(`
            id,
            studio_id,
            customer_auth_user_id,
            status,
            booking_date,
            date,
            start_date,
            start_time,
            end_time,
            total_amount,
            total_price,
            amount,
            price,
            final_amount,
            commission_amount,
            platform_commission_amount,
            admin_commission_amount,
            commission_rate,
            platform_commission_rate,
            net_amount,
            owner_net_amount,
            payout_amount,
            payment_status,
            created_at,
            studio:studios(
              id,
              slug,
              name,
              name_en,
              name_ar,
              city,
              city_name,
              district
            )
          `)
          .in("studio_id", studioIds)
          .order("created_at", { ascending: false })
          .limit(200)
      )
    : [];

  const bookingRows = bookings || [];

  const enrichedBookings = bookingRows.map((booking: any) => {
    const grossAmount = getBookingAmount(booking);
    const commissionAmount = getCommissionAmount(booking, grossAmount);
    const netAmount = getNetAmount(booking, grossAmount, commissionAmount);

    return {
      ...booking,
      grossAmount,
      commissionAmount,
      netAmount,
      normalizedStatus: normalizeStatus(booking.status),
    };
  });

  const completedBookings = enrichedBookings.filter(isCompletedBooking);
  const upcomingBookings = enrichedBookings.filter(isUpcomingBooking);
  const cancelledBookings = enrichedBookings.filter(isCancelledBooking);
  const pendingBookings = enrichedBookings.filter((booking: any) =>
    ["pending", "created", "processing"].includes(booking.normalizedStatus)
  );

  const grossRevenue = completedBookings.reduce(
    (sum: number, booking: any) => sum + Number(booking.grossAmount || 0),
    0
  );

  const pendingRevenue = pendingBookings.reduce(
    (sum: number, booking: any) => sum + Number(booking.grossAmount || 0),
    0
  );

  const commissionTotal = completedBookings.reduce(
    (sum: number, booking: any) => sum + Number(booking.commissionAmount || 0),
    0
  );

  const netPayout = completedBookings.reduce(
    (sum: number, booking: any) => sum + Number(booking.netAmount || 0),
    0
  );

  const studioPerformanceMap = new Map<
    string,
    {
      studioId: string;
      studioName: string;
      bookings: number;
      grossAmount: number;
      netAmount: number;
    }
  >();

  for (const booking of enrichedBookings) {
    const studio = Array.isArray(booking.studio)
      ? booking.studio[0]
      : booking.studio;

    const studioId = String(booking.studio_id || studio?.id || "unknown");
    const studioName = getStudioName(studio);

    const existing = studioPerformanceMap.get(studioId);

    if (!existing) {
      studioPerformanceMap.set(studioId, {
        studioId,
        studioName,
        bookings: 1,
        grossAmount: Number(booking.grossAmount || 0),
        netAmount: Number(booking.netAmount || 0),
      });
    } else {
      existing.bookings += 1;
      existing.grossAmount += Number(booking.grossAmount || 0);
      existing.netAmount += Number(booking.netAmount || 0);
    }
  }

  const studioPerformance = Array.from(studioPerformanceMap.values())
    .sort((a, b) => b.grossAmount - a.grossAmount)
    .slice(0, 8);

  const maxStudioGross = studioPerformance.reduce(
    (max, item) => Math.max(max, item.grossAmount),
    0
  );

  return (
    <main className="dashboard-page" style={{ maxWidth: 1240, margin: "0 auto" }}>
      <section
        style={{
          marginTop: 24,
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <div>
          <span className="badge badge-gold">
            <T en="Studio Owner Analytics" ar="تحليلات صاحب الاستوديو" />
          </span>

          <h1 style={{ marginTop: 10 }}>
            <T en="Studio revenue dashboard" ar="لوحة أرباح الاستوديو" />
          </h1>

          <p style={{ color: "var(--muted)", lineHeight: 1.8, maxWidth: 780 }}>
            <T
              en="Track studio bookings, revenue, estimated commission, net payout, and studio performance."
              ar="تابع حجوزات الاستوديو، الإيرادات، العمولة المتوقعة، صافي الأرباح، وأداء الاستوديوهات."
            />
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/owner/studios" className="btn">
            <T en="My studios" ar="استوديوهاتي" />
          </Link>

          <Link href="/owner/bookings" className="btn btn-primary">
            <T en="Bookings" ar="الحجوزات" />
          </Link>
        </div>
      </section>

      <section className="stats-grid" style={{ marginTop: 28 }}>
        <StatCard
          icon="💰"
          labelEn="Gross Revenue"
          labelAr="إجمالي الإيرادات"
          value={formatMoney(grossRevenue, currency)}
          hint="Completed / paid bookings"
        />

        <StatCard
          icon="🏦"
          labelEn="Net Payout"
          labelAr="صافي الأرباح"
          value={formatMoney(netPayout, currency)}
          hint="Estimated owner net"
        />

        <StatCard
          icon="📊"
          labelEn="Commission"
          labelAr="العمولة"
          value={formatMoney(commissionTotal, currency)}
          hint="Estimated platform commission"
        />

        <StatCard
          icon="⏳"
          labelEn="Pending Revenue"
          labelAr="إيرادات معلقة"
          value={formatMoney(pendingRevenue, currency)}
          hint={`${pendingBookings.length} pending bookings`}
        />
      </section>

      <section className="stats-grid" style={{ marginTop: 18 }}>
        <StatCard
          icon="🎙️"
          labelEn="Studios"
          labelAr="الاستوديوهات"
          value={studioRows.length}
        />

        <StatCard
          icon="📅"
          labelEn="Upcoming"
          labelAr="قادمة"
          value={upcomingBookings.length}
        />

        <StatCard
          icon="✅"
          labelEn="Completed"
          labelAr="مكتملة"
          value={completedBookings.length}
        />

        <StatCard
          icon="↩️"
          labelEn="Cancelled / Refunded"
          labelAr="ملغاة / مستردة"
          value={cancelledBookings.length}
        />
      </section>

      <section
        style={{
          marginTop: 28,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 360px",
          gap: 22,
          alignItems: "start",
        }}
      >
        <div style={{ display: "grid", gap: 22 }}>
          <div className="card">
            <h2>
              <T en="Studio performance" ar="أداء الاستوديوهات" />
            </h2>

            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              <T
                en="Simple revenue bars based on recent booking data."
                ar="مؤشرات بسيطة حسب بيانات الحجوزات الأخيرة."
              />
            </p>

            <div style={{ marginTop: 18, display: "grid", gap: 16 }}>
              {studioPerformance.length === 0 ? (
                <div
                  style={{
                    padding: 24,
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.04)",
                    textAlign: "center",
                    color: "var(--muted)",
                  }}
                >
                  <T
                    en="No studio booking revenue data yet."
                    ar="لا توجد بيانات إيرادات حجوزات بعد."
                  />
                </div>
              ) : (
                studioPerformance.map((studio) => (
                  <PerformanceBar
                    key={studio.studioId}
                    label={`${studio.studioName} · ${studio.bookings} bookings`}
                    value={studio.grossAmount}
                    maxValue={maxStudioGross}
                    currency={currency}
                  />
                ))
              )}
            </div>
          </div>

          <div className="card">
            <h2>
              <T en="Recent bookings" ar="آخر الحجوزات" />
            </h2>

            <div className="table-responsive" style={{ marginTop: 18 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Studio</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Gross</th>
                    <th>Commission</th>
                    <th>Net</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {enrichedBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: 30 }}>
                        <T en="No bookings found." ar="لا توجد حجوزات." />
                      </td>
                    </tr>
                  ) : (
                    enrichedBookings.slice(0, 30).map((booking: any) => {
                      const studio = Array.isArray(booking.studio)
                        ? booking.studio[0]
                        : booking.studio;

                      return (
                        <tr key={booking.id}>
                          <td>
                            <div style={{ fontWeight: 800 }}>
                              {getStudioName(studio)}
                            </div>
                            <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                              {studio?.district || studio?.city_name || studio?.city || "—"}
                            </div>
                          </td>

                          <td>
                            <span className="badge">{booking.normalizedStatus}</span>
                          </td>

                          <td>
                            <span className="badge">
                              {booking.payment_status || "unpaid"}
                            </span>
                          </td>

                          <td>{formatMoney(booking.grossAmount, currency)}</td>
                          <td>{formatMoney(booking.commissionAmount, currency)}</td>
                          <td>
                            <strong>{formatMoney(booking.netAmount, currency)}</strong>
                          </td>
                          <td>{formatDate(getBookingDateValue(booking))}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside style={{ display: "grid", gap: 22 }}>
          <div
            className="card"
            style={{
              background:
                "radial-gradient(circle at top left, rgba(207,167,98,0.20), transparent 35%), rgba(255,255,255,0.035)",
              border: "1px solid rgba(207,167,98,0.22)",
            }}
          >
            <span className="badge badge-gold">
              <T en="Owner status" ar="حالة المالك" />
            </span>

            <h2 style={{ marginTop: 10 }}>
              {profile.full_name || "Studio Owner"}
            </h2>

            <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>
                  <T en="Role" ar="الدور" />
                </span>
                <strong>{profile.role}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>
                  <T en="Studios" ar="الاستوديوهات" />
                </span>
                <strong>{studioRows.length}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>
                  <T en="Verified studios" ar="استوديوهات موثقة" />
                </span>
                <strong>
                  {studioRows.filter((studio: any) => studio.verified).length}
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>
                  <T en="Booking enabled" ar="الحجز مفعل" />
                </span>
                <strong>
                  {studioRows.filter((studio: any) => studio.booking_enabled).length}
                </strong>
              </div>
            </div>
          </div>

          <div className="card">
            <h2>
              <T en="Revenue explanation" ar="شرح الأرباح" />
            </h2>

            <ul style={{ color: "var(--muted)", lineHeight: 1.9 }}>
              <li>
                <T
                  en="Gross revenue is based on completed or paid bookings."
                  ar="إجمالي الإيرادات يعتمد على الحجوزات المكتملة أو المدفوعة."
                />
              </li>
              <li>
                <T
                  en="Commission is estimated from booking commission fields when available."
                  ar="العمولة تقديرية حسب حقول العمولة في الحجز عند توفرها."
                />
              </li>
              <li>
                <T
                  en="Net payout is estimated and not a final finance settlement."
                  ar="صافي الأرباح تقديري وليس تسوية مالية نهائية."
                />
              </li>
            </ul>
          </div>

          <div className="card">
            <h2>
              <T en="Quick actions" ar="إجراءات سريعة" />
            </h2>

            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              <Link href="/owner/studios" className="btn">
                <T en="Manage studios" ar="إدارة الاستوديوهات" />
              </Link>

              <Link href="/owner/bookings" className="btn">
                <T en="Manage bookings" ar="إدارة الحجوزات" />
              </Link>

              <Link href="/owner/profile" className="btn">
                <T en="Owner profile" ar="ملف المالك" />
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
