import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import T from "@/components/t";
import BoostCalculator from "@/components/boost-calculator";

export const dynamic = "force-dynamic";

type DbRow = Record<string, any>;

function formatDateTime(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString("en-US", {
    dateStyle: "medium",
  });
}

export default async function OwnerBoostPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/portal/login");
  }

  // 1. Fetch owned studios
  const { data: studios } = await supabase
    .from("studios")
    .select("id, name")
    .eq("owner_auth_user_id", user.id);

  const ownedStudios = (studios || []) as DbRow[];
  const firstStudioId = ownedStudios[0]?.id;

  // 2. Fetch current active boost
  const { data: activeBoost } = await supabase
    .from("studio_boost_subscriptions")
    .select("*")
    .eq("owner_auth_user_id", user.id)
    .eq("status", "active")
    .gt("ends_at", new Date().toISOString())
    .maybeSingle();

  // 3. Fetch base commission
  const { data: commSettings } = await supabase
    .from("commission_settings")
    .select("base_rate")
    .eq("is_default", true)
    .maybeSingle();

  const baseRate = commSettings?.base_rate || 15;

  // 4. Fetch history
  const { data: history } = await supabase
    .from("studio_boost_subscriptions")
    .select(`
      *,
      studios(name)
    `)
    .eq("owner_auth_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <main className="gb-dashboard-page">
      <section className="gb-dashboard-header">
        <div>
          <p className="gb-eyebrow">
            <T en="Owner Portal" ar="بوابة المالك" />
          </p>
          <h1>
            <T en="Acceleration & Boost" ar="تعزيز الظهور" />
          </h1>
        </div>
        <Link href="/portal/studio" className="gb-button gb-button-secondary">
          <T en="Back" ar="رجوع" />
        </Link>
      </section>

      {/* SECTION 1: Current Status */}
      <section className="gb-card" style={{ marginBottom: '32px' }}>
        <div className="gb-card-header">
          <h3><T en="Boost Status" ar="حالة التعزيز" /></h3>
        </div>
        
        {activeBoost ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '16px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            <div style={{ fontSize: '2.5rem' }}>🚀</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <strong style={{ fontSize: '1.2rem' }}><T en="Active Boost" ar="تعزيز نشط" /></strong>
                <span className="gb-dash-badge gb-dash-badge-confirmed">
                  <T en="Active" ar="نشط" />
                </span>
              </div>
              <p className="gb-muted-text" style={{ margin: 0 }}>
                <T en="Total Commission" ar="إجمالي العمولة" />: <strong>{activeBoost.total_commission_percent}%</strong>
                <span style={{ margin: '0 10px', opacity: 0.3 }}>|</span>
                <T en="Ends at" ar="ينتهي في" />: <strong>{formatDateTime(activeBoost.ends_at)}</strong>
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--gb-gold)', fontWeight: 700, textTransform: 'uppercase' }}>
                <T en="Days Remaining" ar="الأيام المتبقية" />
              </span>
              <strong style={{ fontSize: '1.8rem' }}>
                {Math.ceil((new Date(activeBoost.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}
              </strong>
            </div>
          </div>
        ) : (
          <div className="gb-empty-state" style={{ padding: '40px' }}>
            <p><T en="No active boost. Increase your commission to get featured and rank higher in search." ar="لا يوجد تعزيز نشط. قم بزيادة عمولتك للظهور في النتائج الأولى." /></p>
          </div>
        )}
      </section>

      {/* SECTION 2 & 3: Calculator and Terms */}
      {!activeBoost && firstStudioId && (
        <BoostCalculator 
          studioId={firstStudioId} 
          baseRate={baseRate} 
          userId={user.id} 
        />
      )}

      {/* SECTION 4: Boost History */}
      <section className="gb-card" style={{ marginTop: '32px' }}>
        <div className="gb-card-header">
          <h3><T en="Boost History" ar="سجل التعزيز" /></h3>
        </div>
        
        {history && history.length > 0 ? (
          <div className="gb-table-wrap">
            <table className="gb-dash-table">
              <thead>
                <tr>
                  <th><T en="Studio" ar="الاستوديو" /></th>
                  <th><T en="Boost %" ar="إضافة %" /></th>
                  <th><T en="Total %" ar="الإجمالي %" /></th>
                  <th><T en="Duration" ar="المدة" /></th>
                  <th><T en="Start" ar="البداية" /></th>
                  <th><T en="End" ar="النهاية" /></th>
                  <th><T en="Status" ar="الحالة" /></th>
                </tr>
              </thead>
              <tbody>
                {history.map((row: any) => (
                  <tr key={row.id}>
                    <td>{row.studios?.name || "Studio"}</td>
                    <td style={{ color: 'var(--gb-gold)' }}>+{row.boost_commission_percent}%</td>
                    <td><strong>{row.total_commission_percent}%</strong></td>
                    <td>{row.duration_days} <T en="days" ar="أيام" /></td>
                    <td>{formatDateTime(row.starts_at)}</td>
                    <td>{formatDateTime(row.ends_at)}</td>
                    <td>
                      <span className={`gb-dash-badge ${row.status === 'active' ? 'gb-dash-badge-confirmed' : 'gb-dash-badge-cancelled'}`}>
                        {row.status === 'active' ? <T en="Active" ar="نشط" /> : <T en="Expired" ar="منتهي" />}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="gb-muted-text"><T en="No boost history yet." ar="لا يوجد سجل تعزيز بعد." /></p>
        )}
      </section>
    </main>
  );
}
