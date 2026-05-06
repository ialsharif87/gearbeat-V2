import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import T from "@/components/t";

export default async function OwnerCommissionPage() {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login");
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
    <main className="gb-dashboard-page container">
      <section className="gb-dashboard-header">
        <div>
          <Link href="/portal/studio" className="gb-dash-badge" style={{ marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <span>←</span> <T en="Back to Dashboard" ar="العودة للوحة التحكم" />
          </Link>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', margin: '8px 0 0' }}>
            <T en="Commission & Fees" ar="العمولة والرسوم" />
          </h1>

          <p className="gb-muted-text">
            <T
              en="View your current commission rates and see a breakdown of deductions on recent bookings."
              ar="عرض نسب العمولة الحالية وتفاصيل الخصومات على الحجوزات الأخيرة."
            />
          </p>
        </div>
      </section>

      <div className="gb-dash-grid-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="gb-card" style={{ padding: '32px' }}>
          <span className="gb-dash-badge" style={{ marginBottom: '20px' }}>
            <T en="Default Rate" ar="النسبة الافتراضية" />
          </span>
          <h2 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--gb-gold)', margin: '12px 0' }}>{defaultCommission}%</h2>
          <p className="gb-muted-text" style={{ fontSize: '0.9rem', margin: 0 }}>
            <T en="Global GearBeat commission rate." ar="نسبة عمولة جيربيت الافتراضية." />
          </p>
        </div>

        <div className="gb-card" style={{ gridColumn: "span 2", padding: '32px' }}>
          <span className="gb-dash-badge" style={{ marginBottom: '20px' }}>
            <T en="How it works" ar="كيف تعمل العمولة" />
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
            <T en="Calculation Rules" ar="قواعد الحساب" />
          </h2>
          <p className="gb-muted-text" style={{ fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>
            <T
              en="Commission is applied only to the booking subtotal (before external payment fees or VAT). If your booking is 1,000 SAR and commission is 15%, GearBeat deducts 150 SAR. Your net payout is 850 SAR."
              ar="تُطبق العمولة فقط على إجمالي الحجز (قبل رسوم الدفع الخارجية أو ضريبة القيمة المضافة). إذا كان حجزك 1,000 ريال والعمولة 15٪، تخصم جيربيت 150 ريال ويكون صافي مستحقاتك 850 ريال."
            />
          </p>
        </div>
      </div>

      {studiosList.length > 0 && (
        <>
          <div style={{ height: 48 }} />
          <h2 style={{ marginBottom: 24, fontSize: '1.75rem', fontWeight: 900, color: 'white' }}>
            <T en="Your Studios Rates" ar="نسب استوديوهاتك" />
          </h2>
          <div className="gb-dash-grid-4">
            {studiosList.map((studio) => {
              const rate = customCommMap.get(studio.id) || defaultCommission;
              return (
                <div className="gb-card" key={studio.id} style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>{studio.name}</h3>
                  <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--gb-gold)", marginBottom: '8px' }}>
                    {rate}%
                  </div>
                  <span className="gb-muted-text" style={{ fontSize: '0.85rem' }}>
                    <T en="Current active rate" ar="النسبة الفعالة حاليًا" />
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div style={{ height: 48 }} />

      <h2 style={{ marginBottom: 24, fontSize: '1.75rem', fontWeight: 900, color: 'white' }}>
        <T en="Recent Commission Deductions" ar="الخصومات الأخيرة" />
      </h2>

      {recentBookings && recentBookings.length > 0 ? (
        <div className="gb-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="gb-table-wrap">
            <table className="gb-table">
              <thead>
                <tr>
                  <th><T en="Date" ar="التاريخ" /></th>
                  <th><T en="Studio" ar="الاستوديو" /></th>
                  <th><T en="Gross Amount" ar="الإجمالي" /></th>
                  <th><T en="Commission" ar="العمولة" /></th>
                  <th><T en="Fee Amount" ar="مبلغ الخصم" /></th>
                  <th><T en="Net Payout" ar="صافي المستحق" /></th>
                  <th><T en="Status" ar="الحالة" /></th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b: any) => (
                  <tr key={b.id}>
                    <td className="gb-muted-text">{new Date(b.created_at).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 700, color: 'white' }}>{b.bookings?.studios?.name}</td>
                    <td style={{ fontWeight: 700 }}>{b.booking_subtotal} SAR</td>
                    <td style={{ color: 'var(--gb-gold)', fontWeight: 800 }}>{b.commission_percentage}%</td>
                    <td style={{ color: "#ef4444", fontWeight: 800 }}>-{b.commission_amount} SAR</td>
                    <td style={{ color: "var(--gb-teal)", fontWeight: 900 }}>{b.studio_net_amount} SAR</td>
                    <td>
                      <span className="gb-dash-badge" style={{ 
                        background: b.bookings?.status === 'completed' ? 'rgba(15, 160, 138, 0.1)' : 'rgba(212, 175, 55, 0.1)',
                        color: b.bookings?.status === 'completed' ? 'var(--gb-teal)' : 'var(--gb-gold)'
                      }}>
                        {b.bookings?.status?.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="gb-card" style={{ padding: '40px', textAlign: 'center' }}>
          <p className="gb-muted-text" style={{ margin: 0 }}>
            <T en="No recent commission history found." ar="لا يوجد سجل خصومات حديث." />
          </p>
        </div>
      )}
    </main>
  );
}
