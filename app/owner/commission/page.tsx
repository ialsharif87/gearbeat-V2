import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import T from "../../../components/t";

export default async function OwnerCommissionPage() {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?account=owner");
  }

  // Get all studios owned by this user
  const { data: studios } = await supabaseAdmin
    .from("studios")
    .select("id, name")
    .eq("owner_auth_user_id", user.id);

  const studiosList = studios || [];
  const studioIds = studiosList.map((s) => s.id);

  // Get commission settings
  const { data: globalSettings } = await supabaseAdmin
    .from("commission_settings")
    .select("default_percentage")
    .limit(1)
    .maybeSingle();

  const defaultCommission = globalSettings?.default_percentage || 15;

  // Get custom studio commissions if any
  const { data: customCommissions } = await supabaseAdmin
    .from("studio_commissions")
    .select("studio_id, commission_percentage")
    .in("studio_id", studioIds.length ? studioIds : ["00000000-0000-0000-0000-000000000000"]);

  const customCommMap = new Map();
  if (customCommissions) {
    customCommissions.forEach((c) => {
      customCommMap.set(c.studio_id, c.commission_percentage);
    });
  }

  // Get recent bookings with commission data
  const { data: recentBookings } = await supabaseAdmin
    .from("booking_commissions")
    .select(`
      id,
      booking_id,
      booking_subtotal,
      commission_percentage,
      commission_amount,
      studio_net_amount,
      created_at,
      bookings!inner (
        status,
        payment_status,
        studios (name)
      )
    `)
    .in("studio_id", studioIds.length ? studioIds : ["00000000-0000-0000-0000-000000000000"])
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <section className="page">
      <div className="container">
        <div className="section-head">
          <Link href="/owner" className="badge">
            ← <T en="Back to Dashboard" ar="العودة للوحة التحكم" />
          </Link>

          <h1>
            <T en="Commission & Fees" ar="العمولة والرسوم" />
          </h1>

          <p>
            <T
              en="View your current commission rates and see a breakdown of deductions on recent bookings."
              ar="عرض نسب العمولة الحالية وتفاصيل الخصومات على الحجوزات الأخيرة."
            />
          </p>
        </div>

        <div className="grid">
          <div className="card">
            <span className="badge">
              <T en="Default Rate" ar="النسبة الافتراضية" />
            </span>
            <h2>{defaultCommission}%</h2>
            <p>
              <T en="Global GearBeat commission rate." ar="نسبة عمولة جيربيت الافتراضية." />
            </p>
          </div>

          <div className="card" style={{ gridColumn: "span 2" }}>
            <span className="badge">
              <T en="How it works" ar="كيف تعمل العمولة" />
            </span>
            <h2>
              <T en="Calculation Rules" ar="قواعد الحساب" />
            </h2>
            <p>
              <T
                en="Commission is applied only to the booking subtotal (before external payment fees or VAT). If your booking is 1,000 SAR and commission is 15%, GearBeat deducts 150 SAR. Your net payout is 850 SAR."
                ar="تُطبق العمولة فقط على إجمالي الحجز (قبل رسوم الدفع الخارجية أو ضريبة القيمة المضافة). إذا كان حجزك 1,000 ريال والعمولة 15٪، تخصم جيربيت 150 ريال ويكون صافي مستحقاتك 850 ريال."
              />
            </p>
          </div>
        </div>

        {studiosList.length > 0 && (
          <>
            <div style={{ height: 40 }} />
            <h2 style={{ marginBottom: 20 }}>
              <T en="Your Studios Rates" ar="نسب استوديوهاتك" />
            </h2>
            <div className="grid">
              {studiosList.map((studio) => {
                const rate = customCommMap.get(studio.id) || defaultCommission;
                return (
                  <div className="card" key={studio.id}>
                    <h3>{studio.name}</h3>
                    <p style={{ fontSize: "2rem", fontWeight: "bold", margin: "10px 0", color: "var(--gb-gold)" }}>
                      {rate}%
                    </p>
                    <p style={{ color: "var(--gb-muted)" }}>
                      <T en="Current active rate" ar="النسبة الفعالة حاليًا" />
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div style={{ height: 40 }} />

        <h2>
          <T en="Recent Commission Deductions" ar="الخصومات الأخيرة" />
        </h2>

        {recentBookings && recentBookings.length > 0 ? (
          <div className="card" style={{ marginTop: 20, overflowX: "auto" }}>
            <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--gb-border)", color: "var(--gb-muted)" }}>
                  <th style={{ padding: 12 }}>Date</th>
                  <th style={{ padding: 12 }}>Studio</th>
                  <th style={{ padding: 12 }}>Gross Amount</th>
                  <th style={{ padding: 12 }}>Commission</th>
                  <th style={{ padding: 12 }}>Fee Amount</th>
                  <th style={{ padding: 12 }}>Net Payout</th>
                  <th style={{ padding: 12 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b: any) => (
                  <tr key={b.id} style={{ borderBottom: "1px solid var(--gb-border)" }}>
                    <td style={{ padding: 12 }}>{new Date(b.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: 12 }}>{b.bookings?.studios?.name}</td>
                    <td style={{ padding: 12 }}>{b.booking_subtotal} SAR</td>
                    <td style={{ padding: 12 }}>{b.commission_percentage}%</td>
                    <td style={{ padding: 12, color: "var(--gb-danger)" }}>-{b.commission_amount} SAR</td>
                    <td style={{ padding: 12, color: "var(--gb-success)" }}>{b.studio_net_amount} SAR</td>
                    <td style={{ padding: 12 }}>{b.bookings?.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card" style={{ marginTop: 20 }}>
            <p>
              <T en="No recent commission history found." ar="لا يوجد سجل خصومات حديث." />
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
