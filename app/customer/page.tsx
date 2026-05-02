import Link from "next/link";
import { redirect } from "next/navigation";
import T from "@/components/t";
import CustomerMembershipCard from "@/components/customer-membership-card";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import DashboardQuickLinks from "@/components/dashboard-quick-links";
import { customerDashboardLinks } from "@/lib/dashboard-links";
import { requireCustomerOrRedirect } from "@/lib/auth-guards";

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

function generateDisplayMembershipNumber(authUserId: string) {
  return `GB-${new Date().getFullYear()}-${authUserId.slice(0, 8).toUpperCase()}`;
}

async function safeQuery<T>(
  queryPromise: PromiseLike<{ data: T | null; error: any }>
): Promise<T | null> {
  const { data, error } = await queryPromise;

  if (error) {
    console.warn("Customer dashboard optional query failed:", error.message);
    return null;
  }

  return data;
}

export default async function CustomerDashboardPage() {
  const supabase = await createClient();

  const { user } = await requireCustomerOrRedirect(supabase);

  const supabaseAdmin = createAdminClient();

  const profile = await safeQuery<any>(
    supabaseAdmin
      .from("profiles")
      .select(`
        id,
        auth_user_id,
        full_name,
        email,
        phone_e164,
        phone_verified,
        email_verified,
        identity_verification_status,
        membership_number,
        referral_code,
        preferred_currency,
        role,
        account_status
      `)
      .eq("auth_user_id", user.id)
      .maybeSingle()
  );

  if (!profile) {
    redirect("/login?account=customer");
  }

  const [wallet, favorites, bookings, offers] = await Promise.all([
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
          lifetime_spend,
          referral_code
        `)
        .eq("auth_user_id", user.id)
        .maybeSingle()
    ),

    safeQuery<any[]>(
      supabaseAdmin
        .from("customer_favorites")
        .select("id, favorite_type, studio_id, product_id, vendor_id, created_at")
        .eq("auth_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(6)
    ),

    safeQuery<any[]>(
      supabaseAdmin
        .from("bookings")
        .select(`
          id,
          status,
          booking_date,
          start_time,
          end_time,
          total_amount,
          created_at,
          studio:studios(
            id,
            slug,
            name,
            name_en,
            name_ar,
            city,
            city_name,
            district,
            cover_image_url
          )
        `)
        .eq("customer_auth_user_id", user.id)
        .order("booking_date", { ascending: false })
        .limit(8)
    ),

    safeQuery<any[]>(
      supabaseAdmin
        .from("offers")
        .select(`
          id,
          title_en,
          title_ar,
          description_en,
          description_ar,
          offer_type,
          discount_type,
          discount_value,
          starts_at,
          ends_at,
          is_featured,
          is_active
        `)
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(4)
    ),
  ]);

  const bookingRows = bookings || [];
  const favoriteRows = favorites || [];
  const offerRows = offers || [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBookings = bookingRows.filter((booking: any) => {
    const date = new Date(String(booking.booking_date || booking.created_at));
    return date >= today && booking.status !== "cancelled";
  });

  const pastBookings = bookingRows.filter((booking: any) => {
    const date = new Date(String(booking.booking_date || booking.created_at));
    return date < today || booking.status === "completed";
  });

  const cancelledBookings = bookingRows.filter(
    (booking: any) => booking.status === "cancelled"
  );

  const currency =
    wallet?.currency_code ||
    profile.preferred_currency ||
    "SAR";

  const membershipNumber =
    wallet?.membership_number ||
    profile.membership_number ||
    generateDisplayMembershipNumber(user.id);

  const referralCode =
    wallet?.referral_code ||
    profile.referral_code ||
    membershipNumber.replace("GB-", "REF-");

  return (
    <main className="gb-dashboard-page">
      <section className="gb-dashboard-header">
        <div>
          <p className="gb-eyebrow">
            <T en="Customer Dashboard" ar="لوحة العميل" />
          </p>

          <h1>
            <T en="Welcome back" ar="أهلًا بعودتك" />,{" "}
            {profile.full_name || "Creator"}
          </h1>

          <p className="gb-muted-text">
            <T
              en="Manage your bookings, rewards, saved studios, saved gear, and account verification."
              ar="تابع حجوزاتك، مكافآتك، الاستوديوهات المحفوظة، المعدات المحفوظة، وحالة التحقق."
            />
          </p>
        </div>

        <div className="gb-action-row">
          <Link href="/studios/near-me" className="gb-button">
            <T en="Studios near me" ar="استوديوهات قريبة مني" />
          </Link>

          <Link href="/offers" className="gb-button gb-button-secondary">
            <T en="Offers" ar="العروض" />
          </Link>
        </div>
      </section>

      <div className="gb-dashboard-stack">
        <DashboardQuickLinks
          eyebrow="Customer navigation"
          title="Customer quick links"
          description="Access marketplace orders, marketplace browsing, and studio booking."
          links={customerDashboardLinks}
        />

      <section>
        <CustomerMembershipCard
          fullName={profile.full_name}
          membershipNumber={membershipNumber}
          tierCode={wallet?.tier_code || "listener"}
          pointsBalance={wallet?.points_balance || 0}
          pendingPoints={wallet?.pending_points || 0}
          walletBalance={wallet?.wallet_balance || 0}
          currencyCode={currency}
          referralCode={referralCode}
          showRewardsLink={true}
        />
      </section>

        <div className="gb-kpi-grid">
          <div className="gb-kpi-card">
            <span><T en="Upcoming Bookings" ar="الحجوزات القادمة" /></span>
            <strong>{upcomingBookings.length}</strong>
          </div>

          <div className="gb-kpi-card">
            <span><T en="Saved Items" ar="المفضلة" /></span>
            <strong>{favoriteRows.length}</strong>
          </div>

          <div className="gb-kpi-card">
            <span><T en="Rewards Points" ar="نقاط المكافآت" /></span>
            <strong>{Number(wallet?.points_balance || 0).toLocaleString()}</strong>
          </div>

          <div className="gb-kpi-card">
            <span><T en="Verification" ar="التحقق" /></span>
            <strong>{profile.identity_verification_status || "not_started"}</strong>
          </div>
        </div>

      <section
        style={{
          marginTop: 28,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.35fr) minmax(320px, 0.65fr)",
          gap: 22,
          alignItems: "start",
        }}
      >
        <div style={{ display: "grid", gap: 22 }}>
          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2>
                  <T en="Upcoming Bookings" ar="الحجوزات القادمة" />
                </h2>
                <p style={{ color: "var(--muted)" }}>
                  <T
                    en="Your current and upcoming studio sessions."
                    ar="جلسات الاستوديو الحالية والقادمة."
                  />
                </p>
              </div>

              <Link href="/customer/bookings" className="btn">
                <T en="View all" ar="عرض الكل" />
              </Link>
            </div>

            <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
              {upcomingBookings.length === 0 ? (
                <div
                  style={{
                    padding: 24,
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.04)",
                    textAlign: "center",
                  }}
                >
                  <h3>
                    <T en="No upcoming bookings" ar="لا توجد حجوزات قادمة" />
                  </h3>

                  <p style={{ color: "var(--muted)" }}>
                    <T
                      en="Find your next creative space and start booking."
                      ar="اكتشف مساحتك الإبداعية القادمة وابدأ الحجز."
                    />
                  </p>

                  <Link
                    href="/studios"
                    className="btn btn-primary"
                    style={{ marginTop: 12 }}
                  >
                    <T en="Explore studios" ar="استكشف الاستوديوهات" />
                  </Link>
                </div>
              ) : (
                upcomingBookings.slice(0, 3).map((booking: any) => {
                  const studio = Array.isArray(booking.studio)
                    ? booking.studio[0]
                    : booking.studio;

                  const studioName =
                    studio?.name_en ||
                    studio?.name ||
                    studio?.name_ar ||
                    "Studio";

                  const location = [studio?.district, studio?.city_name || studio?.city]
                    .filter(Boolean)
                    .join(", ");

                  return (
                    <div
                      key={booking.id}
                      style={{
                        padding: 16,
                        borderRadius: 16,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.04)",
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 14,
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <h3>{studioName}</h3>
                        <p style={{ color: "var(--muted)", marginTop: 4 }}>
                          {formatDate(booking.booking_date || booking.created_at)}
                          {booking.start_time ? ` · ${booking.start_time}` : ""}
                          {booking.end_time ? ` - ${booking.end_time}` : ""}
                        </p>
                        {location ? (
                          <p style={{ color: "var(--muted)", marginTop: 4 }}>
                            {location}
                          </p>
                        ) : null}
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <span className="badge">{booking.status || "pending"}</span>
                        <div style={{ marginTop: 8, fontWeight: 700 }}>
                          {formatMoney(booking.total_amount, currency)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2>
                  <T en="Offers for you" ar="عروض لك" />
                </h2>
                <p style={{ color: "var(--muted)" }}>
                  <T
                    en="Featured offers, coupons, and rewards."
                    ar="عروض مميزة، قسائم، ومكافآت."
                  />
                </p>
              </div>

              <Link href="/offers" className="btn">
                <T en="All offers" ar="كل العروض" />
              </Link>
            </div>

            <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
              {offerRows.length === 0 ? (
                <p style={{ color: "var(--muted)" }}>
                  <T
                    en="Offers will appear here soon."
                    ar="ستظهر العروض هنا قريبًا."
                  />
                </p>
              ) : (
                offerRows.map((offer: any) => (
                  <div
                    key={offer.id}
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      border: "1px solid rgba(207,167,98,0.18)",
                      background: "rgba(207,167,98,0.08)",
                    }}
                  >
                    <span className="badge badge-gold">
                      {offer.offer_type || "offer"}
                    </span>

                    <h3 style={{ marginTop: 10 }}>
                      {offer.title_en || offer.title_ar}
                    </h3>

                    <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
                      {offer.description_en ||
                        offer.description_ar ||
                        "Special GearBeat offer."}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <aside style={{ display: "grid", gap: 22 }}>
          <div className="card">
            <h2>
              <T en="Account Verification" ar="توثيق الحساب" />
            </h2>

            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              <T
                en="Verified customers may unlock better trust, faster bookings, and future loyalty benefits."
                ar="توثيق الحساب قد يفتح مزايا ثقة أعلى، حجوزات أسرع، ومزايا ولاء مستقبلية."
              />
            </p>

            <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
              <span className={profile.email_verified ? "badge badge-success" : "badge"}>
                {profile.email_verified ? "✓" : "○"} Email verified
              </span>

              <span className={profile.phone_verified ? "badge badge-success" : "badge"}>
                {profile.phone_verified ? "✓" : "○"} Phone verified
              </span>

              <span
                className={
                  profile.identity_verification_status === "verified"
                    ? "badge badge-success"
                    : "badge"
                }
              >
                {profile.identity_verification_status === "verified" ? "✓" : "○"}{" "}
                Identity {profile.identity_verification_status || "not_started"}
              </span>
            </div>

            <Link
              href="/customer/verification"
              className="btn btn-primary"
              style={{ marginTop: 18 }}
            >
              <T en="Manage verification" ar="إدارة التحقق" />
            </Link>
          </div>

          <div className="card">
            <h2>
              <T en="Saved" ar="المفضلة" />
            </h2>

            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              <T
                en="Your saved studios, gear, and vendors will appear here."
                ar="ستظهر هنا الاستوديوهات والمعدات والتجار المحفوظة."
              />
            </p>

            <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Studios</span>
                <strong>
                  {
                    favoriteRows.filter(
                      (item: any) => item.favorite_type === "studio"
                    ).length
                  }
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Gear</span>
                <strong>
                  {
                    favoriteRows.filter(
                      (item: any) => item.favorite_type === "product"
                    ).length
                  }
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Vendors</span>
                <strong>
                  {
                    favoriteRows.filter(
                      (item: any) => item.favorite_type === "vendor"
                    ).length
                  }
                </strong>
              </div>
            </div>

            <Link href="/customer/saved" className="btn" style={{ marginTop: 18 }}>
              <T en="Open saved" ar="فتح المفضلة" />
            </Link>
          </div>

          <div className="card">
            <h2>
              <T en="Quick Actions" ar="إجراءات سريعة" />
            </h2>

            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              <Link href="/studios" className="btn">
                <T en="Book a studio" ar="احجز استوديو" />
              </Link>

              <Link href="/marketplace" className="btn">
                <T en="Shop gear" ar="تسوق المعدات" />
              </Link>

              <Link href="/customer/payments" className="btn">
                <T en="Payments & receipts" ar="المدفوعات والإيصالات" />
              </Link>

              <Link href="/customer/rewards" className="btn">
                <T en="Rewards" ar="المكافآت" />
              </Link>

              <Link href="/help" className="btn">
                <T en="Help & Support" ar="المساعدة والدعم" />
              </Link>
            </div>
          </div>
        </aside>
      </section>
      </div>
    </main>
  );
}
