import Link from "next/link";
import { redirect } from "next/navigation";
import T from "@/components/t";
import CustomerMembershipCard from "@/components/customer-membership-card";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireCustomerOrRedirect } from "@/lib/auth-guards";
import PhoneVerificationManager from "@/components/phone-verification-manager";

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
        <div className="animate-up">
          <p className="gb-eyebrow">
            <T en="Customer Dashboard" ar="لوحة العميل" />
          </p>

          <h1 style={{ fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: '-1px' }}>
            <T en="Welcome back" ar="أهلًا بعودتك" />,{" "}
            {profile.full_name || "Creator"}
          </h1>

          <p className="text-muted" style={{ maxWidth: 600, fontSize: '1.1rem' }}>
            <T
              en="Manage your bookings, rewards, and verified studio sessions from your premium dashboard."
              ar="تابع حجوزاتك، مكافآتك، وجلسات الاستوديو الموثقة من لوحتك الفخمة."
            />
          </p>
        </div>

        <div className="flex gap-12" style={{ flexWrap: "wrap" }}>
          <Link href="/studios/near-me" className="btn btn-primary shadow-gold">
            <T en="Studios near me" ar="استوديوهات قريبة مني" />
          </Link>

          <Link href="/offers" className="btn btn-outline">
            <T en="View Offers" ar="عرض العروض" />
          </Link>
        </div>
      </section>

      <div className="gb-customer-shell">
        <section style={{ marginTop: 28 }}>
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

        <section className="gb-dash-grid animate-up" style={{ animationDelay: '0.1s' }}>
          <div className="gb-dash-card">
            <div style={{ fontSize: "1.8rem", marginBottom: 12 }}>🎙️</div>
            <div>
              <p className="gb-eyebrow" style={{ fontSize: '0.65rem' }}>
                <T en="Upcoming Bookings" ar="الحجوزات القادمة" />
              </p>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "white" }}>{upcomingBookings.length}</div>
            </div>
          </div>

          <div className="gb-dash-card">
            <div style={{ fontSize: "1.8rem", marginBottom: 12 }}>❤️</div>
            <div>
              <p className="gb-eyebrow" style={{ fontSize: '0.65rem' }}>
                <T en="Saved Items" ar="المفضلة" />
              </p>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "white" }}>{favoriteRows.length}</div>
            </div>
          </div>

          <div className="gb-dash-card">
            <div style={{ fontSize: "1.8rem", marginBottom: 12 }}>⭐</div>
            <div>
              <p className="gb-eyebrow" style={{ fontSize: '0.65rem' }}>
                <T en="Rewards Points" ar="نقاط المكافآت" />
              </p>
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--gb-gold)" }}>
                {Number(wallet?.points_balance || 0).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="gb-dash-card">
            <div style={{ fontSize: "1.8rem", marginBottom: 12 }}>🪪</div>
            <div>
              <p className="gb-eyebrow" style={{ fontSize: '0.65rem' }}>
                <T en="Verification" ar="التحقق" />
              </p>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "white", textTransform: 'uppercase', letterSpacing: 1 }}>
                {profile.identity_verification_status || "not_started"}
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            marginTop: 28,
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.35fr) minmax(320px, 0.65fr)",
            gap: 22,
            alignItems: "start",
          }}
          className="gb-dashboard-stack"
        >
          <div style={{ display: "grid", gap: 22 }}>
            <div className="card-premium">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                  marginBottom: 24
                }}
              >
                <div>
                  <h2 style={{ fontWeight: 800 }}>
                    <T en="Upcoming Bookings" ar="الحجوزات القادمة" />
                  </h2>
                  <p className="text-muted">
                    <T
                      en="Your confirmed studio sessions."
                      ar="جلسات الاستوديو المؤكدة."
                    />
                  </p>
                </div>

                <Link href="/customer/bookings" className="btn btn-outline btn-sm">
                  <T en="View all" ar="عرض الكل" />
                </Link>
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                {upcomingBookings.length === 0 ? (
                  <div className="gb-empty-state" style={{ textAlign: "center", padding: '40px 20px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔇</div>
                    <h3>
                      <T en="No upcoming bookings" ar="لا توجد حجوزات قادمة" />
                    </h3>

                    <p className="text-muted mb-24">
                      <T
                        en="Find your next creative space and start booking."
                        ar="اكتشف مساحتك الإبداعية القادمة وابدأ الحجز."
                      />
                    </p>

                    <Link
                      href="/studios"
                      className="btn btn-primary shadow-gold"
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
                        className="gb-dash-card"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 16,
                          flexWrap: "wrap",
                          padding: 16
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{studioName}</h3>
                          <p className="text-muted" style={{ marginTop: 4, fontSize: '0.9rem' }}>
                            📅 {formatDate(booking.booking_date || booking.created_at)}
                            {booking.start_time ? ` · ${booking.start_time}` : ""}
                          </p>
                          {location ? (
                            <p className="text-muted" style={{ marginTop: 2, fontSize: '0.85rem' }}>
                              📍 {location}
                            </p>
                          ) : null}
                        </div>

                        <div className="text-end">
                          <span className={`badge ${booking.status === 'confirmed' ? 'badge-success' : ''}`}>{booking.status || "pending"}</span>
                          <div style={{ marginTop: 8, fontWeight: 900, color: 'var(--gb-gold)' }}>
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
            <section className="card-premium">
              <div className="gb-card-header mb-24">
                <p className="gb-eyebrow"><T en="Quick access" ar="وصول سريع" /></p>
                <h2 style={{ fontWeight: 800 }}>
                  <T en="Account Hub" ar="مركز الحساب" />
                </h2>
              </div>

              <div className="grid grid-2 gap-16">
                <Link href="/customer/bookings" className="gb-dash-card" style={{ padding: 20 }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: 8 }}>🎙️</div>
                  <strong style={{ display: 'block', marginBottom: 4 }}><T en="My Bookings" ar="حجوزاتي" /></strong>
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}><T en="View sessions." ar="عرض الجلسات." /></span>
                </Link>

                <Link href="/customer/marketplace-orders" className="gb-dash-card" style={{ padding: 20 }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: 8 }}>🛒</div>
                  <strong style={{ display: 'block', marginBottom: 4 }}><T en="My Orders" ar="طلباتي" /></strong>
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}><T en="Marketplace." ar="المتجر." /></span>
                </Link>

                <Link href="/customer/payments" className="gb-dash-card" style={{ padding: 20 }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: 8 }}>💳</div>
                  <strong style={{ display: 'block', marginBottom: 4 }}><T en="Payments" ar="المدفوعات" /></strong>
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}><T en="Receipts." ar="الإيصالات." /></span>
                </Link>

                <Link href="/customer/rewards" className="gb-dash-card" style={{ padding: 20 }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: 8 }}>🎁</div>
                  <strong style={{ display: 'block', marginBottom: 4 }}><T en="Rewards" ar="المكافآت" /></strong>
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}><T en="Points." ar="النقاط." /></span>
                </Link>
              </div>
            </section>

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
                <span className={user.email_confirmed_at ? "badge badge-success" : "badge"}>
                  {user.email_confirmed_at ? "✓" : "○"} Email verified
                </span>

                <span className={user.phone_confirmed_at ? "badge badge-success" : "badge"}>
                  {user.phone_confirmed_at ? "✓" : "○"} Phone verified
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

              {!user.phone_confirmed_at && (
                <PhoneVerificationManager 
                  phone={profile.phone_e164 || profile.phone || user.phone || ""} 
                  isVerified={false} 
                />
              )}

              <Link
                href="/profile"
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
          </aside>
        </section>
      </div>
    </main>
  );
}
