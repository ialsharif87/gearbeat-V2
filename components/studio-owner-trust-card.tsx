import T from "@/components/t";

type StudioOwnerTrustCardProps = {
  ownerName?: string | null;
  ownerEmail?: string | null;
  ownerRole?: string | null;
  phoneVerified?: boolean | null;
  emailVerified?: boolean | null;
  identityVerificationStatus?: string | null;
  studioVerified?: boolean | null;
  locationVerified?: boolean | null;
  businessVerified?: boolean | null;
  ownerTrustSummary?: string | null;
};

function TrustBadge({
  active,
  en,
  ar,
}: {
  active: boolean;
  en: string;
  ar: string;
}) {
  return (
    <span
      className={active ? "badge badge-success" : "badge"}
      style={{
        opacity: active ? 1 : 0.62,
      }}
    >
      {active ? "✓ " : "○ "}
      <T en={en} ar={ar} />
    </span>
  );
}

export default function StudioOwnerTrustCard({
  ownerName,
  ownerEmail,
  ownerRole,
  phoneVerified,
  emailVerified,
  identityVerificationStatus,
  studioVerified,
  locationVerified,
  businessVerified,
  ownerTrustSummary,
}: StudioOwnerTrustCardProps) {
  const identityVerified = identityVerificationStatus === "verified";

  return (
    <div className="card">
      <span className="badge badge-gold">
        <T en="Trust & Safety" ar="الثقة والأمان" />
      </span>

      <h2 style={{ marginTop: 10 }}>
        <T en="Hosted by" ar="المضيف" />{" "}
        {ownerName || <T en="GearBeat Studio Owner" ar="مالك استوديو GearBeat" />}
      </h2>

      <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
        {ownerTrustSummary || (
          <T
            en="GearBeat helps verify studio owners and studio information to create a safer booking experience for creators."
            ar="تساعد GearBeat في توثيق ملاك الاستوديوهات ومعلومات الاستوديو لتقديم تجربة حجز أكثر أمانًا للمبدعين."
          />
        )}
      </p>

      <div
        style={{
          marginTop: 16,
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <TrustBadge
          active={Boolean(studioVerified)}
          en="Studio verified"
          ar="الاستوديو موثق"
        />

        <TrustBadge
          active={Boolean(locationVerified)}
          en="Location verified"
          ar="الموقع موثق"
        />

        <TrustBadge
          active={Boolean(businessVerified)}
          en="Business verified"
          ar="المنشأة موثقة"
        />

        <TrustBadge
          active={Boolean(emailVerified)}
          en="Email verified"
          ar="البريد موثق"
        />

        <TrustBadge
          active={Boolean(phoneVerified)}
          en="Phone verified"
          ar="الجوال موثق"
        />

        <TrustBadge
          active={identityVerified}
          en="Identity verified"
          ar="الهوية موثقة"
        />
      </div>

      <div
        style={{
          marginTop: 20,
          padding: 16,
          borderRadius: 14,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "grid",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <span style={{ color: "var(--muted)" }}>
            <T en="Owner type" ar="نوع المالك" />
          </span>
          <strong>{ownerRole || "Studio Owner"}</strong>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <span style={{ color: "var(--muted)" }}>
            <T en="Response expectation" ar="وقت الاستجابة المتوقع" />
          </span>
          <strong>
            <T en="Usually within 24 hours" ar="عادة خلال 24 ساعة" />
          </strong>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <span style={{ color: "var(--muted)" }}>
            <T en="Support" ar="الدعم" />
          </span>
          <strong>
            <T en="GearBeat support available" ar="دعم GearBeat متاح" />
          </strong>
        </div>
      </div>

      {ownerEmail ? (
        <p style={{ marginTop: 14, color: "var(--muted)", fontSize: "0.85rem" }}>
          <T
            en="For privacy, direct contact details are only shared when booking rules allow it."
            ar="حفاظًا على الخصوصية، تتم مشاركة بيانات التواصل المباشر فقط حسب قواعد الحجز."
          />
        </p>
      ) : null}
    </div>
  );
}
