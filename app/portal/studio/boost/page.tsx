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

function formatDateTimeFull(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} - ${hours}:${minutes}`;
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
          <div
            style={{
              background: "#111",
              border: "1px solid rgba(207, 168, 110, 0.3)",
              borderRadius: "16px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {/* ROW 1: Status Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                className="gb-dash-badge"
                style={{
                  background: "rgba(207, 168, 110, 0.1)",
                  color: "var(--gb-gold)",
                  border: "1px solid var(--gb-gold)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#22c55e",
                  }}
                ></span>
                <T en="Active Boost" ar="تعزيز نشط" />
              </span>
            </div>

            {/* ROW 2: Commission Info */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "20px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                paddingBottom: "24px",
              }}
            >
              <div
                style={{
                  borderInlineEnd: "1px solid rgba(255,255,255,0.05)",
                  paddingInlineEnd: "20px",
                }}
              >
                <span className="gb-detail-label">
                  <T en="Base Commission" ar="العمولة الأساسية" />
                </span>
                <strong
                  style={{ display: "block", fontSize: "1.2rem", color: "white" }}
                >
                  {activeBoost.base_commission_percent}%
                </strong>
              </div>
              <div
                style={{
                  borderInlineEnd: "1px solid rgba(255,255,255,0.05)",
                  paddingInlineEnd: "20px",
                }}
              >
                <span className="gb-detail-label">
                  <T en="Your Boost" ar="إضافتك" />
                </span>
                <strong
                  style={{
                    display: "block",
                    fontSize: "1.2rem",
                    color: "#cfa86e",
                  }}
                >
                  +{activeBoost.boost_commission_percent}%
                </strong>
              </div>
              <div>
                <span className="gb-detail-label">
                  <T en="Total Now" ar="الإجمالي الآن" />
                </span>
                <strong
                  style={{
                    display: "block",
                    fontSize: "1.5rem",
                    color: "#cfa86e",
                  }}
                >
                  {activeBoost.total_commission_percent}%
                </strong>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--gb-gold)",
                    opacity: 0.8,
                  }}
                >
                  <T en="Applied to all bookings" ar="مطبق على كل الحجوزات" />
                </span>
              </div>
            </div>

            {/* ROW 3: Time Info */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "15px",
              }}
            >
              <div>
                <span className="gb-detail-label">
                  <T en="Started" ar="بدأ في" />
                </span>
                <strong style={{ display: "block", fontSize: "0.9rem" }}>
                  {formatDateTimeFull(activeBoost.starts_at)}
                </strong>
              </div>
              <div>
                <span className="gb-detail-label">
                  <T en="Ends" ar="ينتهي في" />
                </span>
                <strong style={{ display: "block", fontSize: "0.9rem" }}>
                  {formatDateTimeFull(activeBoost.ends_at)}
                </strong>
              </div>
              <div>
                <span className="gb-detail-label">
                  <T en="Duration" ar="المدة" />
                </span>
                <strong style={{ display: "block", fontSize: "0.9rem" }}>
                  {activeBoost.duration_days} <T en="days" ar="يوم" />
                </strong>
              </div>
              <div>
                <span className="gb-detail-label">
                  <T en="Days Remaining" ar="الأيام المتبقية" />
                </span>
                {(() => {
                  const daysLeft = Math.ceil(
                    (new Date(activeBoost.ends_at).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24)
                  );
                  let color = "#22c55e";
                  if (daysLeft <= 1) color = "#ef4444";
                  else if (daysLeft <= 7) color = "#f59e0b";
                  return (
                    <strong
                      style={{ display: "block", fontSize: "1.2rem", color }}
                    >
                      {daysLeft}
                    </strong>
                  );
                })()}
              </div>
            </div>

            {/* ROW 4: Info Note */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                padding: "12px 16px",
                borderRadius: "8px",
                borderInlineStart: "3px solid var(--gb-gold)",
              }}
            >
              <p
                style={{ margin: 0, fontSize: "0.85rem", color: "var(--gb-muted)" }}
              >
                <T
                  en={`This boost will expire automatically on ${formatDateTime(
                    activeBoost.ends_at
                  )}. Commission will return to ${
                    activeBoost.base_commission_percent
                  }% automatically.`}
                  ar={`سينتهي هذا التعزيز تلقائياً في ${formatDateTime(
                    activeBoost.ends_at
                  )}. ستعود العمولة تلقائياً إلى ${
                    activeBoost.base_commission_percent
                  }% .`}
                />
              </p>
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
