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

  const userInitials =
    (profile.full_name || "")
      .trim()
      .split(/\s+/)
      .map((part: string) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    profile.email?.charAt(0)?.toUpperCase() ||
    user.email?.charAt(0)?.toUpperCase() ||
    "U";

  const maxTierPoints = 5000;
  const currentPoints = Number(wallet?.points_balance || 0);
  const percentage = Math.min((currentPoints / maxTierPoints) * 100, 100);
  const radius = 25;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const tierCodeClean = String(wallet?.tier_code || "listener").toLowerCase();

  return (
    <main className="gb-dashboard-page">
      <style dangerouslySetInnerHTML={{ __html: `
        .gb-dashboard-page {
          padding: 34px 24px 40px;
          display: flex;
          flex-direction: column;
          gap: 30px;
          min-height: 100vh;
        }
        .gb-premium-hero-card {
          background: radial-gradient(circle at top left, rgba(212, 175, 55, 0.12), transparent 45%),
                      linear-gradient(135deg, rgba(15, 22, 33, 0.95), rgba(11, 15, 22, 0.98));
          border: 1px solid rgba(212, 175, 55, 0.2);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 35px rgba(212, 175, 55, 0.02);
          border-radius: 26px;
          padding: clamp(24px, 3vw, 40px);
          display: flex;
          justify-content: space-between;
          align-items: stretch;
          gap: 28px;
          flex-wrap: wrap;
          position: relative;
          overflow: hidden;
        }
        .gb-premium-hero-card::before {
          content: '';
          position: absolute;
          bottom: 0;
          right: 0;
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.04) 0%, transparent 70%);
          z-index: 0;
          pointer-events: none;
        }
        .gb-avatar-container {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-start;
          gap: 18px;
          flex-wrap: wrap;
          flex: 1 1 560px;
          min-width: 0;
        }
        .gb-avatar-circle {
          width: clamp(72px, 7vw, 88px);
          height: clamp(72px, 7vw, 88px);
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.25), rgba(212, 175, 55, 0.05));
          border: 2px solid var(--gb-gold);
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: var(--gb-gold-light);
          text-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.1), inset 0 0 18px rgba(255, 255, 255, 0.04);
          animation: gbAvatarPulse 3s infinite ease-in-out;
          margin-top: 2px;
        }
        @keyframes gbAvatarPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.1); border-color: var(--gb-gold); }
          50% { box-shadow: 0 0 35px rgba(212, 175, 55, 0.25); border-color: var(--gb-gold-light); }
        }
        .gb-hero-info {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 0;
          max-width: 760px;
        }
        .gb-hero-name {
          font-size: clamp(1.6rem, 4vw, 2.4rem);
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.5px;
          margin: 0;
          line-height: 1.2;
        }
        .gb-badge-row {
          display: flex;
          align-items: center;
          gap: 10px;
          row-gap: 8px;
          flex-wrap: wrap;
          margin-top: 0;
        }
        .gb-premium-badge {
          min-height: 28px;
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.4);
          color: var(--gb-gold-light);
          display: inline-flex;
          align-items: center;
        }
        [dir="rtl"] .gb-premium-badge {
          letter-spacing: 0;
        }
        .gb-status-badge {
          min-height: 28px;
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ccc;
          display: inline-flex;
          align-items: center;
        }
        .gb-verified-chip {
          min-height: 28px;
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 700;
          background: rgba(15, 160, 138, 0.15);
          border: 1px solid rgba(15, 160, 138, 0.4);
          color: #4ade80;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .gb-unverified-chip {
          min-height: 28px;
          padding: 5px 12px;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 700;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .gb-hero-meta {
          font-size: 0.85rem;
          color: var(--gb-text-muted);
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 2px;
        }
        .gb-hero-actions {
          display: flex;
          gap: 10px;
          z-index: 1;
          flex-wrap: wrap;
          align-items: stretch;
          align-self: center;
          justify-content: flex-end;
          min-width: 190px;
          margin-left: auto;
        }
        [dir="rtl"] .gb-hero-actions {
          margin-left: 0;
          margin-right: auto;
        }
        .gb-hero-actions .btn {
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .gb-referral-widget {
          background: rgba(212, 175, 55, 0.08);
          border: 1px dashed rgba(212, 175, 55, 0.25);
          border-radius: 10px;
          padding: 6px 12px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          margin-top: 0;
          min-height: 32px;
        }
        .gb-referral-code {
          font-weight: 800;
          color: var(--gb-gold-light);
          letter-spacing: 1px;
        }
        .gb-metric-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
          gap: 18px;
        }
        .gb-metric-card {
          background: linear-gradient(135deg, rgba(15, 22, 33, 0.85), rgba(11, 15, 22, 0.95));
          border: 1px solid rgba(212, 175, 55, 0.1);
          border-radius: 18px;
          padding: 20px 20px 18px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 18px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          min-height: 154px;
          color: inherit;
          text-decoration: none;
        }
        .gb-metric-card:hover {
          transform: translateY(-5px);
          border-color: rgba(212, 175, 55, 0.35);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(212, 175, 55, 0.05);
        }
        .gb-metric-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, rgba(212, 175, 55, 0.02), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .gb-metric-card:hover::after {
          opacity: 1;
        }
        .gb-metric-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          min-height: 38px;
        }
        .gb-metric-title {
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--gb-text-muted);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          line-height: 1.35;
        }
        [dir="rtl"] .gb-metric-title {
          letter-spacing: 0;
        }
        .gb-metric-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(212, 175, 55, 0.08);
          border: 1px solid rgba(212, 175, 55, 0.15);
          color: var(--gb-gold);
          font-size: 1.1rem;
          transition: all 0.3s;
        }
        .gb-metric-card:hover .gb-metric-icon-wrap {
          background: rgba(212, 175, 55, 0.18);
          color: var(--gb-gold-light);
          transform: scale(1.1);
        }
        .gb-metric-body {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 12px;
          margin-top: auto;
        }
        .gb-metric-value {
          font-size: clamp(1.9rem, 3vw, 2.25rem);
          font-weight: 900;
          color: #fff;
          line-height: 1;
          font-family: 'Space Grotesk', 'Cairo', sans-serif;
        }
        .gb-metric-value-gold {
          color: var(--gb-gold-light);
          text-shadow: 0 0 15px rgba(212, 175, 55, 0.25);
        }
        .gb-metric-subtext {
          font-size: 0.75rem;
          color: var(--gb-text-muted);
          margin-top: 6px;
          line-height: 1.35;
          min-height: 1.1em;
        }
        .gb-points-ring-container {
          position: relative;
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 64px;
        }
        .gb-points-ring-svg {
          transform: rotate(-90deg);
          width: 64px;
          height: 64px;
        }
        .gb-points-ring-circle-bg {
          fill: none;
          stroke: rgba(255, 255, 255, 0.05);
          stroke-width: 5;
        }
        .gb-points-ring-circle-fill {
          fill: none;
          stroke: url(#goldGradientDashboard);
          stroke-width: 5;
          stroke-linecap: round;
          transition: stroke-dashoffset 0.6s ease;
        }
        .gb-points-ring-pulse {
          position: absolute;
          width: 54px;
          height: 54px;
          border-radius: 50%;
          border: 1px solid rgba(212, 175, 55, 0.3);
          animation: ringPulseDashboard 2s infinite ease-out;
          pointer-events: none;
        }
        @keyframes ringPulseDashboard {
          0% { transform: scale(0.9); opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        .gb-action-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 14px;
        }
        .gb-action-card {
          background: linear-gradient(145deg, rgba(15, 22, 33, 0.72), rgba(8, 12, 18, 0.92));
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 14px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 8px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          min-height: 124px;
          color: inherit;
          text-decoration: none;
        }
        .gb-action-card:hover {
          transform: translateY(-4px);
          border-color: rgba(212, 175, 55, 0.25);
          background: rgba(212, 175, 55, 0.03);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }
        .gb-action-icon {
          font-size: 1.25rem;
          width: 38px;
          height: 38px;
          border-radius: 11px;
          display: grid;
          place-items: center;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s;
        }
        .gb-action-card:hover .gb-action-icon {
          background: rgba(212, 175, 55, 0.1);
          border-color: rgba(212, 175, 55, 0.3);
          color: var(--gb-gold-light);
          transform: rotate(5deg) scale(1.05);
        }
        .gb-action-label {
          font-weight: 800;
          font-size: 0.84rem;
          color: #fff;
          line-height: 1.25;
        }
        .gb-action-desc {
          font-size: 0.68rem;
          color: var(--gb-text-muted);
          line-height: 1.35;
        }
        .gb-premium-empty {
          text-align: center;
          padding: 30px 24px;
          background: linear-gradient(145deg, rgba(15, 22, 33, 0.46), rgba(7, 11, 18, 0.76));
          border-radius: 18px;
          border: 1px dashed rgba(212, 175, 55, 0.22);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 11px;
          transition: all 0.3s;
          min-height: 218px;
          position: relative;
          overflow: hidden;
        }
        .gb-premium-empty::before {
          content: '';
          position: absolute;
          inset: 12px;
          border-radius: 14px;
          background: radial-gradient(circle at top, rgba(212, 175, 55, 0.08), transparent 55%);
          pointer-events: none;
        }
        .gb-premium-empty:hover {
          border-color: rgba(212, 175, 55, 0.3);
          background: rgba(15, 22, 33, 0.5);
        }
        .gb-empty-icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          font-size: 1.85rem;
          background: rgba(212, 175, 55, 0.08);
          border: 1px solid rgba(212, 175, 55, 0.18);
          animation: floatEmptyDashboard 4s infinite ease-in-out;
          position: relative;
          z-index: 1;
        }
        @keyframes floatEmptyDashboard {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .gb-empty-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #fff;
          position: relative;
          z-index: 1;
        }
        .gb-empty-desc {
          font-size: 0.85rem;
          color: var(--gb-text-muted);
          max-width: 360px;
          line-height: 1.6;
          position: relative;
          z-index: 1;
        }
        .gb-premium-empty .btn {
          position: relative;
          z-index: 1;
        }
        .gb-trust-card {
          background: linear-gradient(135deg, rgba(15, 22, 33, 0.9), rgba(11, 15, 22, 0.95));
          border: 1px solid rgba(212, 175, 55, 0.15);
          border-radius: 22px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
          overflow: hidden;
        }
        .gb-trust-card::before {
          content: '';
          position: absolute;
          top: -40px;
          right: -40px;
          width: 120px;
          height: 120px;
          background: radial-gradient(circle, rgba(15, 160, 138, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .gb-trust-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .gb-trust-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(15, 160, 138, 0.1);
          border: 1px solid rgba(15, 160, 138, 0.25);
          color: #0fa08a;
          display: grid;
          place-items: center;
          font-size: 1.2rem;
        }
        .gb-trust-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: #fff;
          line-height: 1.25;
        }
        .gb-trust-desc {
          font-size: 0.85rem;
          color: var(--gb-text-muted);
          line-height: 1.6;
          margin: 0;
        }
        .gb-trust-list {
          display: grid;
          gap: 10px;
        }
        .gb-trust-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 13px;
          gap: 12px;
          min-height: 48px;
        }
        .gb-trust-item .badge {
          flex: 0 0 auto;
          white-space: nowrap;
        }
        .gb-trust-item-label {
          font-weight: 700;
          font-size: 0.85rem;
          color: #eee;
          line-height: 1.35;
        }
        .gb-trust-phone-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .gb-dashboard-stack {
          width: 100%;
        }
        @media (max-width: 980px) {
          .gb-dashboard-stack {
            grid-template-columns: 1fr !important;
          }
          .gb-hero-actions {
            width: 100%;
            justify-content: flex-start;
            margin-left: 0;
            margin-right: 0;
          }
        }
        @media (max-width: 680px) {
          .gb-dashboard-page {
            padding: 22px 14px 32px;
            gap: 22px;
          }
          .gb-premium-hero-card {
            padding: 22px;
            gap: 22px;
          }
          .gb-avatar-container {
            flex-direction: column;
            align-items: center;
            text-align: center;
            width: 100%;
          }
          .gb-badge-row,
          .gb-hero-meta {
            justify-content: center;
          }
          .gb-referral-widget {
            width: 100%;
            justify-content: center;
          }
          .gb-hero-actions {
            flex-direction: column;
          }
          .gb-hero-actions .btn {
            width: 100%;
          }
          .gb-metric-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .gb-metric-card {
            min-height: 136px;
          }
          .gb-action-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .gb-trust-phone-row,
          .gb-trust-item {
            align-items: stretch;
          }
          .gb-trust-item {
            flex-direction: column;
          }
          .gb-trust-phone-row {
            flex-direction: column;
          }
        }
        @media (max-width: 420px) {
          .gb-action-grid {
            grid-template-columns: 1fr;
          }
          .gb-metric-body {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}} />

      {/* 1. Premium Profile Hero Card */}
      <section className="gb-premium-hero-card animate-up">
        <div className="gb-avatar-container">
          <div className="gb-avatar-circle">
            {userInitials}
          </div>

          <div className="gb-hero-info">
            <h1 className="gb-hero-name">
              <T en="Welcome back" ar="أهلاً بعودتك" />, {profile.full_name || "Creator"}
            </h1>

            <div className="gb-badge-row">
              <span className="gb-premium-badge">
                {tierCodeClean === "listener" && <T en="Listener" ar="مستمع" />}
                {tierCodeClean === "creator" && <T en="Creator" ar="مبدع" />}
                {tierCodeClean === "producer" && <T en="Producer" ar="منتج" />}
                {tierCodeClean === "maestro" && <T en="Maestro" ar="مايسترو" />}
                {tierCodeClean === "legend" && <T en="Legend" ar="أسطورة" />}
              </span>

              <span className="gb-status-badge">
                {profile.account_status === "active" ? (
                  <T en="Active" ar="نشط" />
                ) : (
                  profile.account_status || "Active"
                )}
              </span>

              {user.email_confirmed_at ? (
                <span className="gb-verified-chip">
                  ✓ <T en="Email Verified" ar="البريد موثق" />
                </span>
              ) : (
                <span className="gb-unverified-chip">
                  ○ <T en="Email Unverified" ar="البريد غير موثق" />
                </span>
              )}
            </div>

            <div className="gb-hero-meta">
              <span>
                <strong><T en="Member No." ar="رقم العضوية" />:</strong> {membershipNumber}
              </span>
              <div className="gb-referral-widget">
                <span><T en="Referral Code:" ar="كود الإحالة:" /></span>
                <strong className="gb-referral-code">{referralCode}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="gb-hero-actions">
          <Link href="/studios" className="btn btn-primary shadow-gold">
            <T en="Explore Studios" ar="استكشف الاستوديوهات" />
          </Link>

          <Link href="/profile" className="btn btn-outline">
            <T en="Manage Profile" ar="إدارة الملف الشخصي" />
          </Link>
        </div>
      </section>

      {/* 2. Interactive Metric Cards */}
      <section className="gb-metric-grid animate-up" style={{ animationDelay: '0.1s' }}>
        {/* Rewards points card */}
        <Link href="/customer/rewards" className="gb-metric-card">
          <div className="gb-metric-header">
            <span className="gb-metric-title">
              <T en="Rewards Points" ar="نقاط المكافآت" />
            </span>
            <div className="gb-points-ring-container">
              <div className="gb-points-ring-pulse"></div>
              <svg className="gb-points-ring-svg" viewBox="0 0 64 64" aria-hidden="true">
                <defs>
                  <linearGradient id="goldGradientDashboard" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F4D47A" />
                    <stop offset="100%" stopColor="#D4AF37" />
                  </linearGradient>
                </defs>
                <circle className="gb-points-ring-circle-bg" cx="32" cy="32" r={radius} />
                <circle
                  className="gb-points-ring-circle-fill"
                  cx="32"
                  cy="32"
                  r={radius}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <span style={{ position: 'absolute', fontSize: '0.85rem', fontWeight: 900, color: 'var(--gb-gold-light)' }}>
                ★
              </span>
            </div>
          </div>
          <div className="gb-metric-body">
            <div>
              <div className="gb-metric-value gb-metric-value-gold">
                {Number(wallet?.points_balance || 0).toLocaleString()}
              </div>
              <div className="gb-metric-subtext">
                <T en="Available Points" ar="النقاط المتاحة" />
              </div>
            </div>
            {Number(wallet?.pending_points || 0) > 0 && (
              <span className="badge badge-gold" style={{ fontSize: '0.65rem', padding: '4px 8px' }}>
                +{Number(wallet?.pending_points).toLocaleString()} <T en="pending" ar="معلقة" />
              </span>
            )}
          </div>
        </Link>

        {/* Upcoming bookings card */}
        <a href="#bookings-section" className="gb-metric-card">
          <div className="gb-metric-header">
            <span className="gb-metric-title">
              <T en="Upcoming Bookings" ar="الحجوزات القادمة" />
            </span>
            <div className="gb-metric-icon-wrap">🎙️</div>
          </div>
          <div className="gb-metric-body">
            <div>
              <div className="gb-metric-value">
                {upcomingBookings.length}
              </div>
              <div className="gb-metric-subtext">
                <T en="Active Sessions" ar="جلسات نشطة" />
              </div>
            </div>
          </div>
        </a>

        {/* Favorites card */}
        <a href="#saved-section" className="gb-metric-card">
          <div className="gb-metric-header">
            <span className="gb-metric-title">
              <T en="Favorites" ar="المفضلة" />
            </span>
            <div className="gb-metric-icon-wrap">❤️</div>
          </div>
          <div className="gb-metric-body">
            <div>
              <div className="gb-metric-value">
                {favoriteRows.length}
              </div>
              <div className="gb-metric-subtext">
                <T en="Saved Items" ar="عناصر محفوظة" />
              </div>
            </div>
          </div>
        </a>

        {/* Wallet balance card */}
        <Link href="/customer/payments" className="gb-metric-card">
          <div className="gb-metric-header">
            <span className="gb-metric-title">
              <T en="Wallet Balance" ar="رصيد المحفظة" />
            </span>
            <div className="gb-metric-icon-wrap">💳</div>
          </div>
          <div className="gb-metric-body">
            <div>
              <div className="gb-metric-value gb-metric-value-gold" style={{ fontSize: '1.8rem' }}>
                {formatMoney(wallet?.wallet_balance, currency)}
              </div>
              <div className="gb-metric-subtext">
                <T en="Available Balance" ar="الرصيد المتاح" />
              </div>
            </div>
          </div>
        </Link>

        {/* Total Bookings / Sessions Count */}
        <Link href="/customer/bookings" className="gb-metric-card">
          <div className="gb-metric-header">
            <span className="gb-metric-title">
              <T en="Total Bookings" ar="إجمالي الحجوزات" />
            </span>
            <div className="gb-metric-icon-wrap">📅</div>
          </div>
          <div className="gb-metric-body">
            <div>
              <div className="gb-metric-value">
                {bookingRows.length}
              </div>
              <div className="gb-metric-subtext">
                <T en="All Sessions" ar="كل الجلسات" />
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* 3. Main Stack & Sidebar */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.35fr) minmax(320px, 0.65fr)",
          gap: 24,
          alignItems: "start",
        }}
        className="gb-dashboard-stack"
      >
        {/* Main Content Column */}
        <div style={{ display: "grid", gap: 24 }}>
          {/* Upcoming bookings list */}
          <div className="card-premium" id="bookings-section">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: 20
              }}
            >
              <div>
                <h2 style={{ fontWeight: 800 }}>
                  <T en="Upcoming Bookings" ar="الحجوزات القادمة" />
                </h2>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                  <T en="Your confirmed studio sessions." ar="جلسات الاستوديو المؤكدة." />
                </p>
              </div>

              <Link href="/customer/bookings" className="btn btn-outline btn-sm">
                <T en="View all" ar="عرض الكل" />
              </Link>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {upcomingBookings.length === 0 ? (
                <div className="gb-premium-empty">
                  <div className="gb-empty-icon">🔇</div>
                  <h3 className="gb-empty-title">
                    <T en="No upcoming bookings" ar="لا توجد حجوزات قادمة" />
                  </h3>
                  <p className="gb-empty-desc">
                    <T
                      en="Find your next creative space, book high-end gear, and start recording."
                      ar="اكتشف مساحتك الإبداعية القادمة، واحجز معدات فاخرة، وابدأ التسجيل."
                    />
                  </p>
                  <Link href="/studios" className="btn btn-primary shadow-gold" style={{ marginTop: 8 }}>
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
                        <span className={`badge ${booking.status === 'confirmed' ? 'badge-success' : ''}`}>
                          {booking.status || "pending"}
                        </span>
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

          {/* Offers list */}
          <div className="card-premium">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: 20
              }}
            >
              <div>
                <h2>
                  <T en="Offers for you" ar="عروض لك" />
                </h2>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                  <T en="Featured offers, coupons, and rewards." ar="عروض مميزة، قسائم، ومكافآت." />
                </p>
              </div>

              <Link href="/offers" className="btn btn-outline btn-sm">
                <T en="All offers" ar="كل العروض" />
              </Link>
            </div>

            <div className="gb-trust-list">
              {offerRows.length === 0 ? (
                <div className="gb-premium-empty">
                  <div className="gb-empty-icon">🎁</div>
                  <h3 className="gb-empty-title">
                    <T en="No Active Offers" ar="لا توجد عروض نشطة" />
                  </h3>
                  <p className="gb-empty-desc">
                    <T
                      en="Personalized discounts and studio rewards will appear here soon."
                      ar="ستظهر الخصومات الشخصية ومكافآت الاستوديو هنا قريباً."
                    />
                  </p>
                </div>
              ) : (
                offerRows.map((offer: any) => (
                  <div
                    key={offer.id}
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      border: "1px solid rgba(207,167,98,0.18)",
                      background: "rgba(207,167,98,0.08)",
                      transition: "border-color 0.3s",
                    }}
                    className="gb-dash-card"
                  >
                    <span className="badge badge-gold">
                      {offer.offer_type || "offer"}
                    </span>

                    <h3 style={{ marginTop: 10, fontSize: '1.1rem', fontWeight: 800 }}>
                      {offer.title_en || offer.title_ar}
                    </h3>

                    <p style={{ color: "var(--muted)", lineHeight: 1.6, marginTop: 4, fontSize: '0.9rem' }}>
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

        {/* Sidebar Content Column */}
        <div style={{ display: "grid", gap: 24 }}>
          {/* Quick Actions Card */}
          <section className="card-premium">
            <div className="gb-card-header mb-16">
              <div>
                <p className="gb-eyebrow" style={{ fontSize: '0.65rem' }}>
                  <T en="Quick access" ar="وصول سريع" />
                </p>
                <h2 style={{ fontWeight: 800, fontSize: '1.3rem' }}>
                  <T en="Account Hub" ar="مركز الحساب" />
                </h2>
              </div>
            </div>

            <div className="gb-action-grid">
              <Link href="/customer/bookings" className="gb-action-card">
                <div className="gb-action-icon">🎙️</div>
                <div className="gb-action-label"><T en="My Bookings" ar="حجوزاتي" /></div>
                <div className="gb-action-desc"><T en="View sessions" ar="عرض الجلسات" /></div>
              </Link>

              <Link href="/customer/marketplace-orders" className="gb-action-card">
                <div className="gb-action-icon">🛒</div>
                <div className="gb-action-label"><T en="My Orders" ar="طلباتي" /></div>
                <div className="gb-action-desc"><T en="Marketplace" ar="طلبات المتجر" /></div>
              </Link>

              <Link href="/customer/payments" className="gb-action-card">
                <div className="gb-action-icon">💳</div>
                <div className="gb-action-label"><T en="Payments" ar="المدفوعات" /></div>
                <div className="gb-action-desc"><T en="Receipts & credit" ar="الإيصالات والرصيد" /></div>
              </Link>

              <Link href="/customer/rewards" className="gb-action-card">
                <div className="gb-action-icon">🎁</div>
                <div className="gb-action-label"><T en="Rewards" ar="المكافآت" /></div>
                <div className="gb-action-desc"><T en="Points & tier" ar="النقاط والمستوى" /></div>
              </Link>
            </div>
          </section>

          {/* Account Verification Redesigned Security Card */}
          <div className="gb-trust-card">
            <div className="gb-trust-header">
              <div className="gb-trust-icon">🛡️</div>
              <h2 className="gb-trust-title">
                <T en="Trust & Verification" ar="التوثيق والأمان" />
              </h2>
            </div>

            <p className="gb-trust-desc">
              <T
                en="Verified members secure instant booking approvals, exclusive platform trust, and elite rewards tier access."
                ar="الأعضاء الموثقون يحصلون على موافقة فورية للحجوزات، وثقة إضافية في المنصة، ومكافآت حصرية."
              />
            </p>

            <div style={{ display: "grid", gap: 12 }}>
              <div className="gb-trust-item">
                <span className="gb-trust-item-label">
                  <T en="Email Verification" ar="توثيق البريد الإلكتروني" />
                </span>
                {user.email_confirmed_at ? (
                  <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>✓ <T en="Verified" ar="موثق" /></span>
                ) : (
                  <span className="badge" style={{ fontSize: '0.75rem', background: '#333' }}><T en="Pending" ar="معلق" /></span>
                )}
              </div>

              <div className="gb-trust-item" style={{ flexDirection: "column", alignItems: "stretch", gap: 8 }}>
                <div className="gb-trust-phone-row">
                  <span className="gb-trust-item-label">
                    <T en="Phone Verification" ar="توثيق رقم الجوال" />
                  </span>
                  {user.phone_confirmed_at ? (
                    <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>✓ <T en="Verified" ar="موثق" /></span>
                  ) : (
                    <span className="badge" style={{ fontSize: '0.75rem', background: '#333' }}><T en="Unverified" ar="غير موثق" /></span>
                  )}
                </div>

                {!user.phone_confirmed_at && (
                  <div style={{ marginTop: 4 }}>
                    <PhoneVerificationManager 
                      phone={profile.phone_e164 || profile.phone || user.phone || ""} 
                      isVerified={false} 
                    />
                  </div>
                )}
              </div>

              <div className="gb-trust-item">
                <span className="gb-trust-item-label">
                  <T en="Identity Verification" ar="توثيق الهوية" />
                </span>
                {profile.identity_verification_status === "verified" ? (
                  <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>✓ <T en="Verified" ar="موثق" /></span>
                ) : profile.identity_verification_status === "pending" ? (
                  <span className="badge" style={{ fontSize: '0.75rem', background: '#c9a24d', color: '#000' }}>
                    <T en="In Review" ar="قيد المراجعة" />
                  </span>
                ) : (
                  <span className="badge" style={{ fontSize: '0.75rem', background: '#333' }}>
                    <T en="Not Started" ar="لم يبدأ" />
                  </span>
                )}
              </div>
            </div>

            <Link
              href="/profile"
              className="btn btn-primary"
              style={{ marginTop: 8, width: "100%", textAlign: "center" }}
            >
              <T en="Manage Verification" ar="إدارة التحقق والتوثيق" />
            </Link>
          </div>

          {/* Saved Items card list */}
          <div className="card-premium" id="saved-section">
            <div className="gb-card-header mb-16">
              <div>
                <h2>
                  <T en="Favorites" ar="المفضلة" />
                </h2>
              </div>
            </div>

            {favoriteRows.length === 0 ? (
              <div className="gb-premium-empty" style={{ padding: '24px 16px' }}>
                <div className="gb-empty-icon" style={{ fontSize: '2rem' }}>❤️</div>
                <h3 className="gb-empty-title" style={{ fontSize: '1rem' }}>
                  <T en="Favorites List Empty" ar="المفضلة فارغة" />
                </h3>
                <p className="gb-empty-desc" style={{ fontSize: '0.8rem' }}>
                  <T en="Bookmark studios, gear, and vendors to easily find them here." ar="احفظ الاستوديوهات والمعدات والتجار لتجدها بسهولة هنا." />
                </p>
                <Link href="/studios" className="btn btn-outline" style={{ marginTop: 8, padding: '8px 16px', fontSize: '0.85rem' }}>
                  <T en="Browse Studios" ar="تصفح الاستوديوهات" />
                </Link>
              </div>
            ) : (
              <>
                <p className="text-muted" style={{ fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 12 }}>
                  <T
                    en="Quick overview of your bookmarked items."
                    ar="نظرة سريعة على العناصر المحفوظة في مفضلتك."
                  />
                </p>

                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 10 }}>
                    <span style={{ fontSize: '0.9rem' }}><T en="Studios" ar="الاستوديوهات" /></span>
                    <strong style={{ color: 'var(--gb-gold-light)' }}>
                      {favoriteRows.filter((item: any) => item.favorite_type === "studio").length}
                    </strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 10 }}>
                    <span style={{ fontSize: '0.9rem' }}><T en="Gear" ar="المعدات" /></span>
                    <strong style={{ color: 'var(--gb-gold-light)' }}>
                      {favoriteRows.filter((item: any) => item.favorite_type === "product").length}
                    </strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 10 }}>
                    <span style={{ fontSize: '0.9rem' }}><T en="Vendors" ar="التجار" /></span>
                    <strong style={{ color: 'var(--gb-gold-light)' }}>
                      {favoriteRows.filter((item: any) => item.favorite_type === "vendor").length}
                    </strong>
                  </div>
                </div>

                <Link href="/customer/saved" className="btn btn-outline" style={{ marginTop: 16, width: "100%", textAlign: "center" }}>
                  <T en="Open Saved" ar="فتح المفضلة كاملة" />
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

