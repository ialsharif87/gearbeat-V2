import Link from "next/link";
import { redirect } from "next/navigation";
import T from "@/components/t";
import CustomerMembershipCard from "@/components/customer-membership-card";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireCustomerOrRedirect } from "@/lib/auth-guards";
import { getNextTierInfo } from "@/lib/loyalty/rewards";

export const dynamic = "force-dynamic";

async function safeQuery<T>(
  queryPromise: PromiseLike<{ data: T | null; error: any }>
): Promise<T | null> {
  const { data, error } = await queryPromise;

  if (error) {
    console.warn("Customer rewards page optional query failed:", error.message);
    return null;
  }

  return data;
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

function generateDisplayMembershipNumber(authUserId: string) {
  return `GB-${new Date().getFullYear()}-${authUserId.slice(0, 8).toUpperCase()}`;
}

export default async function CustomerRewardsPage() {
  const supabase = await createClient();

  const { user } = await requireCustomerOrRedirect(supabase);

  const supabaseAdmin = createAdminClient();

  const [profile, wallet, bookings, ledgerResult] = await Promise.all([
    safeQuery<any>(
      supabaseAdmin
        .from("profiles")
        .select(`
          id,
          auth_user_id,
          full_name,
          membership_number,
          referral_code,
          preferred_currency
        `)
        .eq("auth_user_id", user.id)
        .maybeSingle()
    ),

    safeQuery<any>(
      supabaseAdmin
        .from("customer_wallets")
        .select(`
          id,
          membership_number,
          tier_code,
          points_balance,
          pending_points,
          wallet_balance,
          currency_code,
          lifetime_points,
          referral_code
        `)
        .eq("auth_user_id", user.id)
        .maybeSingle()
    ),

    safeQuery<any[]>(
      supabaseAdmin
        .from("bookings")
        .select("id, status")
        .eq("customer_auth_user_id", user.id)
    ),

    safeQuery<any[]>(
      supabaseAdmin
        .from("loyalty_points_ledger")
        .select(`
          id,
          event_type,
          source_type,
          source_id,
          points,
          status,
          description,
          created_at
        `)
        .eq("auth_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)
    ),
  ]);

  if (!profile) {
    redirect("/login?account=customer");
  }

  const pointsBalance = wallet?.points_balance || 0;
  const pendingPoints = wallet?.pending_points || 0;
  const walletBalance = wallet?.wallet_balance || 0;
  const currency = wallet?.currency_code || profile.preferred_currency || "SAR";

  const membershipNumber =
    wallet?.membership_number ||
    profile.membership_number ||
    generateDisplayMembershipNumber(user.id);

  const referralCode =
    wallet?.referral_code ||
    profile.referral_code ||
    null;

  const currentPoints = wallet?.lifetime_points || wallet?.points_balance || 0;
  const tierInfo = getNextTierInfo(currentPoints);

  const currentTierNameEn = tierInfo.currentTier.name_en;
  const currentTierNameAr = tierInfo.currentTier.name_ar;

  const nextTierNameEn = tierInfo.nextTier ? tierInfo.nextTier.name_en : "";
  const nextTierNameAr = tierInfo.nextTier ? tierInfo.nextTier.name_ar : "";

  const progressPercent = tierInfo.progress;

  const completedBookings = bookings?.filter((b: any) => b.status === "completed") || [];
  const hasCompletedBooking = completedBookings.length > 0;
  const welcomeKitProgress = hasCompletedBooking ? 100 : 0;

  const welcomeKitStatusEn = hasCompletedBooking ? "ELIGIBLE FOR REDEMPTION" : "INCOMPLETE";
  const welcomeKitStatusAr = hasCompletedBooking ? "مؤهل للاستلام" : "غير مكتمل";

  const ledgerRows = ledgerResult || [];

  return (
    <main className="gb-customer-page">
      <section className="gb-customer-header">
        <div className="flex-between">
          <div>
            <p className="gb-eyebrow">
              <T en="GearBeat Rewards" ar="مكافآت GearBeat" />
            </p>
            <h1 style={{ marginTop: 10 }}>
              <T en="Membership & Rewards" ar="العضوية والمكافآت" />
            </h1>
            <p className="gb-muted-text" style={{ maxWidth: 760 }}>
              <T
                en="Track your membership level, points, wallet balance, and rewards. Our loyalty system is currently in active beta for pilot members."
                ar="تابع مستوى عضويتك، نقاطك، رصيد المحفظة، والمكافآت. نظام الولاء لدينا حالياً في المرحلة التجريبية النشطة للأعضاء المشاركين."
              />
            </p>
          </div>
          <div className="foundation-badge">
             <T en="BETA PREVIEW — PILOT ACCESS" ar="معاينة تجريبية — وصول خاص" />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24 }}>
          <Link href="/customer" className="btn">
            <T en="Dashboard" ar="لوحة العميل" />
          </Link>
          <Link href="/offers" className="btn btn-primary">
            <T en="View offers" ar="عرض العروض" />
          </Link>
        </div>
      </section>

      <div className="gb-customer-shell">
        <section style={{ marginTop: 28 }}>
          <CustomerMembershipCard
            fullName={profile.full_name}
            membershipNumber={membershipNumber}
            tierCode={wallet?.tier_code || "listener"}
            pointsBalance={pointsBalance}
            pendingPoints={pendingPoints}
            walletBalance={walletBalance}
            currencyCode={currency}
            referralCode={referralCode}
          />
        </section>

        <section className="gb-customer-grid" style={{ marginTop: 28 }}>
          <div className="gb-customer-card">
            <div style={{ fontSize: "1.5rem" }}>⭐</div>
            <div>
              <label style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                <T en="Available Points" ar="النقاط المتاحة" />
              </label>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--gb-gold)" }}>
                {Number(pointsBalance).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="gb-customer-card">
            <div style={{ fontSize: "1.5rem" }}>⏳</div>
            <div>
              <label style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                <T en="Pending Points" ar="النقاط المعلقة" />
              </label>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--gb-gold)" }}>
                {Number(pendingPoints).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="gb-customer-card">
            <div style={{ fontSize: "1.5rem" }}>🏦</div>
            <div>
              <label style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                <T en="Wallet Balance" ar="رصيد المحفظة" />
              </label>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--gb-gold)" }}>
                {Number(walletBalance).toFixed(2)} {currency}
              </div>
            </div>
          </div>

          <div className="gb-customer-card">
            <div style={{ fontSize: "1.5rem" }}>🎖️</div>
            <div>
              <label style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                <T en="Current Level" ar="المستوى الحالي" />
              </label>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--gb-gold)" }}>
                <T en={currentTierNameEn} ar={currentTierNameAr} />
              </div>
            </div>
          </div>
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
                <T en="Progress to next level" ar="التقدم للمستوى التالي" />
              </h2>
              {tierInfo.nextTier ? (
                <>
                  <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
                    <T
                      en={`You are currently ${currentTierNameEn}. Reach ${nextTierNameEn} to unlock premium rewards.`}
                      ar={`أنت الآن في مستوى ${currentTierNameAr}. صل إلى ${nextTierNameAr} لفتح مكافآت مميزة.`}
                    />
                  </p>
                  <div
                    style={{
                      marginTop: 18,
                      height: 14,
                      borderRadius: 999,
                      overflow: "hidden",
                      background: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <div
                      style={{
                        width: `${progressPercent}%`,
                        height: "100%",
                        borderRadius: 999,
                        background: "linear-gradient(90deg, rgba(207,167,98,0.9), rgba(255,255,255,0.65))",
                      }}
                    />
                  </div>
                  <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", color: "var(--muted)" }}>
                    <span>{Math.round(progressPercent)}%</span>
                    <span>
                      <T 
                        en={`Target: ${tierInfo.nextTier.min_points.toLocaleString()} points`} 
                        ar={`الهدف: ${tierInfo.nextTier.min_points.toLocaleString()} نقطة`} 
                      />
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
                    <T
                      en={`Congratulations! You have reached the maximum level: ${currentTierNameEn}.`}
                      ar={`تهانينا! لقد وصلت إلى الحد الأقصى للمستوى: ${currentTierNameAr}.`}
                    />
                  </p>
                  <div
                    style={{
                      marginTop: 18,
                      height: 14,
                      borderRadius: 999,
                      overflow: "hidden",
                      background: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 999,
                        background: "linear-gradient(90deg, rgba(207,167,98,0.9), rgba(255,255,255,0.65))",
                      }}
                    />
                  </div>
                  <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", color: "var(--muted)" }}>
                    <span>100%</span>
                    <span>
                      <T en="Maximum level reached" ar="تم الوصول للحد الأقصى للمستوى" />
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="card" style={{ border: '1px solid rgba(207, 168, 110, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>
                  <T en="Welcome Kit Progress" ar="تقدم حقيبة الترحيب" />
                </h2>
                <span className="badge-beta" style={{ fontSize: '0.6rem', opacity: 0.5 }}>COMING SOON</span>
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.9rem' }}>
                  <T en="First Booking Welcome Kit" ar="حقيبة ترحيب الحجز الأول" />
                  <span style={{ color: 'var(--gb-gold)' }}>{welcomeKitProgress}%</span>
                </div>
                <div style={{ height: 8, background: '#222', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${welcomeKitProgress}%`, height: '100%', background: 'var(--gb-gold)' }} />
                </div>
                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: 12 }}>
                  <T
                    en="Complete your first studio booking to unlock your GearBeat Welcome Kit."
                    ar="أكمل أول حجز استوديو لك لفتح حقيبة ترحيب GearBeat."
                  />
                </p>
                <div style={{ marginTop: 20, padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid #1a1a1a' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}><T en="Fulfillment Status" ar="حالة التنفيذ" /></span>
                    <span className="pill" style={{ 
                      fontSize: '0.65rem', 
                      background: hasCompletedBooking ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                      color: hasCompletedBooking ? 'var(--gb-gold)' : '#888', 
                      padding: '2px 8px', 
                      borderRadius: 4 
                    }}>
                      <T en={welcomeKitStatusEn} ar={welcomeKitStatusAr} />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h2><T en="Recent Activity" ar="النشاط الأخير" /></h2>
              {ledgerRows.length === 0 ? (
                <div style={{
                  marginTop: 16,
                  padding: "32px 16px",
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.01)",
                  border: "1px dashed rgba(255,255,255,0.08)",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "2rem", marginBottom: 12 }}>⏳</div>
                  <h4 style={{ color: "var(--muted)", margin: 0, fontWeight: 500, fontSize: "0.95rem" }}>
                    <T en="Rewards will appear after completed eligible actions." ar="ستظهر المكافآت بعد إتمام الإجراءات المؤهلة." />
                  </h4>
                  <p style={{ color: "#555", fontSize: "0.85rem", marginTop: 8, maxWidth: 480, marginInline: "auto", lineHeight: 1.5 }}>
                    <T 
                      en="Points are earned only from real completed bookings, orders, or approved campaigns." 
                      ar="تُكتسب النقاط فقط من حجوزات أو طلبات حقيقية مكتملة، أو حملات معتمدة." 
                    />
                  </p>
                </div>
              ) : (
                <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                  {ledgerRows.map((row: any) => (
                    <div
                      key={row.id}
                      style={{
                        padding: 14,
                        borderRadius: 14,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <strong>{row.description || row.event_type}</strong>
                        <p style={{ color: "var(--muted)", marginTop: 4, fontSize: "0.8rem" }}>
                          {formatDate(row.created_at)} · {row.status}
                        </p>
                      </div>
                      <strong style={{ color: Number(row.points) >= 0 ? "#00ff88" : "#ff7070" }}>
                        {Number(row.points) >= 0 ? "+" : ""}
                        {Number(row.points).toLocaleString()}
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside style={{ display: "grid", gap: 22 }}>
            <div className="card">
              <h2><T en="Referral code" ar="كود الإحالة" /></h2>
              {referralCode ? (
                <div style={{ marginTop: 16, padding: 16, borderRadius: 16, background: "rgba(207,167,98,0.1)", border: "1px solid rgba(207,167,98,0.22)", textAlign: "center" }}>
                  <strong style={{ display: "block", letterSpacing: 1.4, fontSize: "1.3rem" }}>{referralCode}</strong>
                </div>
              ) : (
                <div style={{ 
                  marginTop: 16, 
                  padding: 16, 
                  borderRadius: 16, 
                  background: "rgba(255,255,255,0.02)", 
                  border: "1px dashed rgba(255,255,255,0.08)",
                  textAlign: "center"
                }}>
                  <p style={{ color: "var(--muted)", fontSize: "0.8rem", margin: 0 }}>
                    <T 
                      en="A referral code will be generated for you after your first completed action." 
                      ar="سيتم إنشاء كود الإحالة الخاص بك بعد أول إجراء مكتمل." 
                    />
                  </p>
                </div>
              )}
              <p style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: 12 }}>
                <T en="Referral rewards will be activated in a later phase." ar="سيتم تفعيل مكافآت الإحالة في مرحلة لاحقة." />
              </p>
            </div>

            <div className="card" style={{ border: "1px dashed rgba(207,167,98,0.4)", background: "rgba(207,167,98,0.02)" }}>
              <h2><T en="Future Loyalty Engine" ar="محرك الولاء المستقبلي" /></h2>
              <span className="badge badge-gold" style={{ marginTop: 8, display: 'inline-block', fontSize: '0.65rem' }}>
                <T en="BETA PREVIEW" ar="معاينة تجريبية" />
              </span>
              <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: 16, lineHeight: 1.6 }}>
                <T
                  en="The unified GearBeat Loyalty Engine will soon allow you to earn and redeem points across the entire ecosystem:"
                  ar="سيتيح لك محرك ولاء جيربيت الموحد قريباً اكتساب واستبدال النقاط عبر النظام البيئي بأكمله:"
                />
              </p>
              <ul style={{ paddingInlineStart: 20, color: "var(--muted)", fontSize: "0.85rem", marginTop: 12, lineHeight: 1.6 }}>
                <li><strong style={{ color: 'var(--gb-gold)' }}><T en="Studios:" ar="الاستوديوهات:" /></strong> <T en="Earn on completed bookings." ar="اكتسب من الحجوزات المكتملة." /></li>
                <li><strong style={{ color: 'var(--gb-gold)' }}><T en="Marketplace:" ar="السوق:" /></strong> <T en="Earn on verified gear purchases." ar="اكتسب من مشتريات المعدات الموثقة." /></li>
                <li><strong style={{ color: 'var(--gb-gold)' }}><T en="Ticketing:" ar="التذاكر:" /></strong> <T en="Earn on event check-ins." ar="اكتسب من تسجيل الدخول للفعاليات." /></li>
              </ul>
            </div>

            <div className="card" style={{ border: "1px solid rgba(255,255,255,0.05)", background: "linear-gradient(135deg, rgba(207,167,98,0.05), transparent)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: "1.5rem" }}>📱</span>
                <h3 style={{ fontSize: "1.1rem" }}><T en="Mobile App Readiness" ar="جاهزية تطبيق الجوال" /></h3>
              </div>
              <p style={{ color: "var(--muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>
                <T
                  en="GearBeat is preparing native mobile wallet integration. Soon, you'll be able to tap to redeem points and scan QR codes for event entry directly from your device."
                  ar="تقوم جيربيت بإعداد دمج محافظ الجوال الأصلية. قريباً، ستتمكن من النقر لاستبدال النقاط ومسح رموز QR لدخول الفعاليات مباشرة من جهازك."
                />
              </p>
            </div>
          </aside>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .gb-customer-page { padding: 40px; color: #fff; }
        .gb-customer-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .gb-customer-card { padding: 24px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; display: flex; align-items: center; gap: 20px; }
        .foundation-badge { background: rgba(207, 168, 110, 0.1); border: 1px solid var(--gb-gold); color: var(--gb-gold); padding: 6px 12px; border-radius: 4px; font-size: 0.7rem; font-weight: 900; }
        .badge-beta { font-weight: 900; letter-spacing: 1px; color: var(--gb-gold); }
      `}} />
    </main>
  );
}
