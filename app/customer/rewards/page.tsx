import Link from "next/link";
import { redirect } from "next/navigation";
import T from "@/components/t";
import CustomerMembershipCard from "@/components/customer-membership-card";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

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

function formatMoney(value: unknown, currency = "SAR") {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return `0.00 ${currency}`;
  }

  return `${numberValue.toFixed(2)} ${currency}`;
}

function formatPoints(value: unknown) {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return "0";
  }

  return numberValue.toLocaleString();
}

function getTierDisplayName(tierCode: string | null | undefined) {
  const tierMap: Record<string, string> = {
    listener: "Listener",
    creator: "Creator",
    producer: "Producer",
    maestro: "Maestro",
    legend: "Legend",
  };

  return tierMap[tierCode || "listener"] || "Listener";
}

function getNextTier({
  tiers,
  currentTierCode,
}: {
  tiers: any[];
  currentTierCode: string;
}) {
  const activeTiers = [...tiers].sort(
    (a: any, b: any) => Number(a.sort_order || 0) - Number(b.sort_order || 0)
  );

  const currentIndex = activeTiers.findIndex(
    (tier: any) => tier.code === currentTierCode
  );

  if (currentIndex < 0) {
    return activeTiers[1] || null;
  }

  return activeTiers[currentIndex + 1] || null;
}

function calculateProgress({
  wallet,
  nextTier,
}: {
  wallet: any;
  nextTier: any;
}) {
  if (!nextTier) {
    return 100;
  }

  const currentPoints = Number(wallet?.points_balance || 0);
  const targetPoints = Number(nextTier.min_points || 0);

  if (targetPoints <= 0) {
    return 100;
  }

  return Math.min(100, Math.round((currentPoints / targetPoints) * 100));
}

function buildReferralLink(referralCode: string | null | undefined) {
  if (!referralCode) {
    return "";
  }

  return `https://gearbeat-v2.vercel.app/signup?ref=${encodeURIComponent(
    referralCode
  )}`;
}

export default async function CustomerRewardsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?account=customer");
  }

  const supabaseAdmin = createAdminClient();

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select(`
      auth_user_id,
      full_name,
      email,
      role,
      membership_number,
      referral_code,
      preferred_currency,
      identity_verification_status,
      phone_verified,
      email_verified
    `)
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (!profile) {
    redirect("/login?account=customer");
  }

  if (profile.role !== "customer") {
    redirect("/forbidden");
  }

  await supabaseAdmin.rpc("ensure_customer_wallet", {
    p_auth_user_id: user.id,
  });

  const [
    { data: wallet, error: walletError },
    { data: tiers, error: tiersError },
    { data: ledgerRows, error: ledgerError },
  ] = await Promise.all([
    supabaseAdmin
      .from("customer_wallets")
      .select(`
        id,
        auth_user_id,
        membership_number,
        tier_code,
        points_balance,
        pending_points,
        wallet_balance,
        currency_code,
        lifetime_points,
        lifetime_spend,
        referral_code,
        membership_card_status,
        card_style_code,
        joined_at,
        updated_at
      `)
      .eq("auth_user_id", user.id)
      .maybeSingle(),

    supabaseAdmin
      .from("loyalty_tiers")
      .select(`
        code,
        name_en,
        name_ar,
        min_points,
        min_lifetime_spend,
        earn_multiplier,
        redemption_cap_percent,
        sort_order,
        is_active
      `)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),

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
        expires_at,
        created_at
      `)
      .eq("auth_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  if (walletError) {
    throw new Error(walletError.message);
  }

  if (tiersError) {
    throw new Error(tiersError.message);
  }

  if (ledgerError) {
    throw new Error(ledgerError.message);
  }

  const tierRows = tiers || [];
  const activityRows = ledgerRows || [];
  const currentTierCode = wallet?.tier_code || "listener";
  const currentTierName = getTierDisplayName(currentTierCode);
  const nextTier = getNextTier({
    tiers: tierRows,
    currentTierCode,
  });

  const progressPercent = calculateProgress({
    wallet,
    nextTier,
  });

  const currency =
    wallet?.currency_code ||
    profile.preferred_currency ||
    "SAR";

  const membershipNumber =
    wallet?.membership_number ||
    profile.membership_number ||
    "GB-PENDING";

  const referralCode =
    wallet?.referral_code ||
    profile.referral_code ||
    "";

  const referralLink = buildReferralLink(referralCode);

  return (
    <main className="gb-customer-page">
      <section className="gb-customer-header">
        <div>
          <p className="gb-eyebrow">
            <T en="GearBeat Rewards" ar="مكافآت GearBeat" />
          </p>

          <h1 style={{ marginTop: 10 }}>
            <T en="Membership & Rewards" ar="العضوية والمكافآت" />
          </h1>

          <p className="gb-muted-text" style={{ maxWidth: 760 }}>
            <T
              en="Track your membership level, points, wallet balance, referral code, and rewards activity."
              ar="تابع مستوى عضويتك، نقاطك، رصيد المحفظة، كود الإحالة، ونشاط المكافآت."
            />
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
            tierCode={currentTierCode}
            pointsBalance={wallet?.points_balance || 0}
            pendingPoints={wallet?.pending_points || 0}
            walletBalance={wallet?.wallet_balance || 0}
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
                {formatPoints(wallet?.points_balance)}
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
                {formatPoints(wallet?.pending_points)}
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
                {formatMoney(wallet?.wallet_balance, currency)}
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
                {currentTierName}
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

            {nextTier ? (
              <>
                <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
                  <T
                    en={`You are currently ${currentTierName}. Keep booking studios and buying gear to reach ${nextTier.name_en}.`}
                    ar={`أنت الآن في مستوى ${currentTierName}. استمر في حجز الاستوديوهات وشراء المعدات للوصول إلى ${nextTier.name_ar || nextTier.name_en}.`}
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
                      background:
                        "linear-gradient(90deg, rgba(207,167,98,0.9), rgba(255,255,255,0.65))",
                    }}
                  />
                </div>

                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    color: "var(--muted)",
                  }}
                >
                  <span>{progressPercent}%</span>
                  <span>
                    <T en="Target:" ar="الهدف:" />{" "}
                    {formatPoints(nextTier.min_points)}{" "}
                    <T en="points" ar="نقطة" />
                  </span>
                </div>
              </>
            ) : (
              <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
                <T
                  en="You are at the highest GearBeat Rewards level."
                  ar="أنت في أعلى مستوى من مكافآت GearBeat."
                />
              </p>
            )}
          </div>

          <div className="card">
            <h2>
              <T en="How to earn points" ar="كيف تكسب النقاط" />
            </h2>

            <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
              {[
                {
                  icon: "🎙️",
                  en: "Book a studio session",
                  ar: "احجز جلسة استوديو",
                },
                {
                  icon: "🎛️",
                  en: "Buy gear from the marketplace",
                  ar: "اشترِ معدات من المتجر",
                },
                {
                  icon: "⭐",
                  en: "Leave a review after booking",
                  ar: "اكتب تقييمًا بعد الحجز",
                },
                {
                  icon: "🪪",
                  en: "Complete account verification",
                  ar: "أكمل توثيق الحساب",
                },
                {
                  icon: "🤝",
                  en: "Invite friends using your referral code",
                  ar: "ادعُ أصدقاءك باستخدام كود الإحالة",
                },
              ].map((item) => (
                <div
                  key={item.en}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    padding: 14,
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span style={{ fontSize: "1.4rem" }}>{item.icon}</span>
                  <strong>
                    <T en={item.en} ar={item.ar} />
                  </strong>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2>
              <T en="Recent rewards activity" ar="آخر نشاط المكافآت" />
            </h2>

            <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
              {activityRows.length === 0 ? (
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
                    en="No rewards activity yet. Start booking or shopping to earn points."
                    ar="لا يوجد نشاط مكافآت حتى الآن. ابدأ بالحجز أو التسوق لكسب النقاط."
                  />
                </div>
              ) : (
                activityRows.map((activity: any) => (
                  <div
                    key={activity.id}
                    style={{
                      padding: 14,
                      borderRadius: 14,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <strong>
                        {activity.description || activity.event_type}
                      </strong>

                      <p style={{ color: "var(--muted)", marginTop: 4 }}>
                        {formatDate(activity.created_at)} · {activity.status}
                      </p>
                    </div>

                    <strong
                      style={{
                        color: Number(activity.points || 0) >= 0
                          ? "#00ff88"
                          : "#ff4d4d",
                      }}
                    >
                      {Number(activity.points || 0) >= 0 ? "+" : ""}
                      {formatPoints(activity.points)}
                    </strong>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <aside style={{ display: "grid", gap: 22 }}>
          <div className="card">
            <h2>
              <T en="Referral code" ar="كود الإحالة" />
            </h2>

            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              <T
                en="Share your referral code with friends. Referral rewards will be activated in a later patch."
                ar="شارك كود الإحالة مع أصدقائك. سيتم تفعيل مكافآت الإحالة في باتش لاحق."
              />
            </p>

            <div
              style={{
                marginTop: 16,
                padding: 16,
                borderRadius: 16,
                background: "rgba(207,167,98,0.1)",
                border: "1px solid rgba(207,167,98,0.22)",
              }}
            >
              <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                <T en="Your code" ar="كودك" />
              </div>

              <strong
                style={{
                  display: "block",
                  marginTop: 8,
                  letterSpacing: 1.4,
                  fontSize: "1.3rem",
                }}
              >
                {referralCode || "COMING-SOON"}
              </strong>
            </div>

            {referralLink ? (
              <div
                style={{
                  marginTop: 14,
                  padding: 12,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                  color: "var(--muted)",
                  fontSize: "0.85rem",
                  overflowWrap: "anywhere",
                }}
              >
                {referralLink}
              </div>
            ) : null}
          </div>

          <div className="card">
            <h2>
              <T en="How to redeem" ar="كيف تستخدم النقاط" />
            </h2>

            <ul style={{ color: "var(--muted)", lineHeight: 1.9 }}>
              <li>
                <T
                  en="Use points for studio booking discounts."
                  ar="استخدم النقاط لخصومات حجز الاستوديو."
                />
              </li>
              <li>
                <T
                  en="Use wallet credit during checkout."
                  ar="استخدم رصيد المحفظة عند الدفع."
                />
              </li>
              <li>
                <T
                  en="Unlock better offers at higher levels."
                  ar="افتح عروضًا أفضل عند المستويات الأعلى."
                />
              </li>
              <li>
                <T
                  en="Redemption will be activated with checkout patches."
                  ar="سيتم تفعيل الاستبدال مع باتشات الدفع."
                />
              </li>
            </ul>
          </div>

          <div className="card">
            <h2>
              <T en="Membership status" ar="حالة العضوية" />
            </h2>

            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>
                  <T en="Card" ar="الكرت" />
                </span>
                <strong>{wallet?.membership_card_status || "active"}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>
                  <T en="Joined" ar="تاريخ الانضمام" />
                </span>
                <strong>{formatDate(wallet?.joined_at)}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>
                  <T en="Lifetime spend" ar="إجمالي الإنفاق" />
                </span>
                <strong>{formatMoney(wallet?.lifetime_spend, currency)}</strong>
              </div>
            </div>
          </div>

          <div className="card">
            <h2>
              <T en="Quick links" ar="روابط سريعة" />
            </h2>

            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              <Link href="/studios" className="btn">
                <T en="Book a studio" ar="احجز استوديو" />
              </Link>

              <Link href="/marketplace" className="btn">
                <T en="Shop gear" ar="تسوق المعدات" />
              </Link>

              <Link href="/offers" className="btn">
                <T en="Offers" ar="العروض" />
              </Link>

              <Link href="/customer/saved" className="btn">
                <T en="Saved" ar="المفضلة" />
              </Link>
            </div>
          </div>
        </aside>
      </section>
      </div>
    </main>
  );
}
