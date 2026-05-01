import Link from "next/link";
import T from "@/components/t";

type CustomerMembershipCardProps = {
  fullName?: string | null;
  membershipNumber?: string | null;
  tierCode?: string | null;
  pointsBalance?: number | null;
  pendingPoints?: number | null;
  walletBalance?: number | null;
  currencyCode?: string | null;
  referralCode?: string | null;
  showRewardsLink?: boolean;
};

function formatMoney(value: number | null | undefined, currencyCode = "SAR") {
  const safeValue = Number(value || 0);

  return `${safeValue.toFixed(2)} ${currencyCode}`;
}

function getTierName(tierCode?: string | null) {
  if (!tierCode) {
    return "Listener";
  }

  const tierMap: Record<string, string> = {
    listener: "Listener",
    creator: "Creator",
    producer: "Producer",
    maestro: "Maestro",
    legend: "Legend",
  };

  return tierMap[tierCode] || tierCode;
}

export default function CustomerMembershipCard({
  fullName,
  membershipNumber,
  tierCode,
  pointsBalance,
  pendingPoints,
  walletBalance,
  currencyCode = "SAR",
  referralCode,
  showRewardsLink = false,
}: CustomerMembershipCardProps) {
  const tierName = getTierName(tierCode);

  return (
    <div
      className="card"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: 250,
        padding: 28,
        background:
          "radial-gradient(circle at top left, rgba(207,167,98,0.38), transparent 36%), linear-gradient(135deg, rgba(20,20,20,0.98), rgba(66,55,36,0.82))",
        border: "1px solid rgba(207,167,98,0.36)",
        boxShadow: "0 24px 70px rgba(0,0,0,0.38)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "auto -80px -120px auto",
          width: 260,
          height: 260,
          borderRadius: "999px",
          background: "rgba(207,167,98,0.12)",
          filter: "blur(4px)",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div>
            <span className="badge badge-gold">
              <T en="GearBeat Rewards" ar="مكافآت GearBeat" />
            </span>

            <h2 style={{ marginTop: 14, fontSize: "2rem" }}>
              {tierName}
            </h2>

            <p style={{ color: "var(--muted)", marginTop: 4 }}>
              {fullName || <T en="GearBeat Member" ar="عضو GearBeat" />}
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
              <T en="Member No." ar="رقم العضوية" />
            </div>

            <strong style={{ letterSpacing: 1.6 }}>
              {membershipNumber || "GB-PENDING"}
            </strong>
          </div>
        </div>

        <div
          className="grid grid-3"
          style={{
            marginTop: 32,
            gap: 14,
          }}
        >
          <div
            style={{
              padding: 14,
              borderRadius: 16,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
              <T en="Available Points" ar="النقاط المتاحة" />
            </div>
            <strong style={{ display: "block", marginTop: 8, fontSize: "1.35rem" }}>
              {Number(pointsBalance || 0).toLocaleString()}
            </strong>
          </div>

          <div
            style={{
              padding: 14,
              borderRadius: 16,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
              <T en="Pending Points" ar="نقاط معلقة" />
            </div>
            <strong style={{ display: "block", marginTop: 8, fontSize: "1.35rem" }}>
              {Number(pendingPoints || 0).toLocaleString()}
            </strong>
          </div>

          <div
            style={{
              padding: 14,
              borderRadius: 16,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
              <T en="Wallet" ar="المحفظة" />
            </div>
            <strong style={{ display: "block", marginTop: 8, fontSize: "1.35rem" }}>
              {formatMoney(walletBalance, currencyCode || "SAR")}
            </strong>
          </div>
        </div>

        {referralCode ? (
          <div
            style={{
              marginTop: 20,
              padding: 12,
              borderRadius: 14,
              background: "rgba(207,167,98,0.12)",
              border: "1px solid rgba(207,167,98,0.18)",
            }}
          >
            <span style={{ color: "var(--muted)" }}>
              <T en="Referral Code:" ar="كود الإحالة:" />
            </span>{" "}
            <strong>{referralCode}</strong>
          </div>
        ) : null}

        {showRewardsLink && (
          <div style={{ marginTop: 20, textAlign: "right" }}>
            <Link
              href="/customer/rewards"
              className="btn btn-primary"
              style={{ padding: "8px 16px", fontSize: "0.9rem" }}
            >
              <T en="View rewards detail" ar="عرض تفاصيل المكافآت" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
