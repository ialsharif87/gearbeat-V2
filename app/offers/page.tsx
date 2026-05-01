import Link from "next/link";
import T from "@/components/t";
import ShareButton from "@/components/share-button";
import OfferClaimButton from "@/components/offer-claim-button";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type OfferRow = {
  id: string;
  title_en: string | null;
  title_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  offer_type: string | null;
  offer_scope: string | null;
  discount_type: string | null;
  discount_value: number | null;
  max_discount_amount: number | null;
  min_order_amount: number | null;
  coupon_id: string | null;
  coupon_code: string | null;
  studio_id: string | null;
  product_id: string | null;
  vendor_id: string | null;
  country_code: string | null;
  city_id: string | null;
  tier_code: string | null;
  image_url: string | null;
  badge_label_en: string | null;
  badge_label_ar: string | null;
  starts_at: string | null;
  ends_at: string | null;
  priority: number | null;
  is_featured: boolean | null;
  is_member_only: boolean | null;
  status: string | null;
  created_at: string | null;
};

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

function formatDiscount(offer: OfferRow) {
  const value = Number(offer.discount_value || 0);

  if (!value) {
    return "Special offer";
  }

  if (offer.discount_type === "percent" || offer.discount_type === "percentage") {
    return `${value.toFixed(0)}% OFF`;
  }

  if (offer.discount_type === "fixed" || offer.discount_type === "amount") {
    return `${value.toFixed(0)} OFF`;
  }

  return "Special offer";
}

function getOfferTitle(offer: OfferRow) {
  return offer.title_en || offer.title_ar || "GearBeat Offer";
}

function getOfferDescription(offer: OfferRow) {
  return (
    offer.description_en ||
    offer.description_ar ||
    "Limited GearBeat offer for creators."
  );
}

function getOfferActionHref(offer: OfferRow) {
  if (offer.offer_scope === "studio_booking" || offer.studio_id) {
    return "/studios";
  }

  if (offer.offer_scope === "marketplace_order" || offer.product_id || offer.vendor_id) {
    return "/marketplace";
  }

  return "/customer/rewards";
}

function getOfferActionLabel(offer: OfferRow) {
  if (offer.offer_scope === "studio_booking" || offer.studio_id) {
    return {
      en: "Explore studios",
      ar: "استكشف الاستوديوهات",
    };
  }

  if (offer.offer_scope === "marketplace_order" || offer.product_id || offer.vendor_id) {
    return {
      en: "Shop gear",
      ar: "تسوق المعدات",
    };
  }

  return {
    en: "Open rewards",
    ar: "افتح المكافآت",
  };
}

function OfferCard({ offer, featured = false }: { offer: OfferRow; featured?: boolean }) {
  const title = getOfferTitle(offer);
  const description = getOfferDescription(offer);
  const actionHref = getOfferActionHref(offer);
  const actionLabel = getOfferActionLabel(offer);

  return (
    <article
      className="card"
      style={{
        overflow: "hidden",
        borderColor: featured
          ? "rgba(207,167,98,0.42)"
          : "rgba(255,255,255,0.08)",
        background: featured
          ? "linear-gradient(135deg, rgba(207,167,98,0.16), rgba(255,255,255,0.04))"
          : "rgba(255,255,255,0.035)",
      }}
    >
      <div
        style={{
          minHeight: featured ? 240 : 170,
          borderRadius: 20,
          background: offer.image_url
            ? `linear-gradient(rgba(0,0,0,0.18), rgba(0,0,0,0.56)), url(${offer.image_url}) center/cover`
            : "radial-gradient(circle at top left, rgba(207,167,98,0.32), transparent 34%), linear-gradient(135deg, rgba(24,24,24,0.96), rgba(70,56,32,0.78))",
          padding: 18,
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        <div>
          <span className="badge badge-gold">
            {offer.badge_label_en || formatDiscount(offer)}
          </span>

          {offer.is_member_only ? (
            <span className="badge" style={{ marginInlineStart: 8 }}>
              <T en="Members only" ar="للأعضاء فقط" />
            </span>
          ) : null}
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <div>
            <span className="badge">{offer.offer_type || "offer"}</span>

            <h2 style={{ marginTop: 10 }}>{title}</h2>
          </div>

          <ShareButton
            title={title}
            text={description}
            shareType="offer"
            className="btn"
          />
        </div>

        <p style={{ color: "var(--muted)", lineHeight: 1.8, marginTop: 10 }}>
          {description}
        </p>

        <div
          style={{
            marginTop: 16,
            display: "grid",
            gap: 8,
            color: "var(--muted)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>
              <T en="Minimum spend" ar="الحد الأدنى" />
            </span>
            <strong>
              {Number(offer.min_order_amount || 0).toFixed(2)}
            </strong>
          </div>

          {offer.max_discount_amount ? (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>
                <T en="Max discount" ar="أقصى خصم" />
              </span>
              <strong>{Number(offer.max_discount_amount).toFixed(2)}</strong>
            </div>
          ) : null}

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>
              <T en="Valid until" ar="صالح حتى" />
            </span>
            <strong>{formatDate(offer.ends_at)}</strong>
          </div>
        </div>

        {offer.coupon_code ? (
          <div
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 14,
              background: "rgba(207,167,98,0.1)",
              border: "1px solid rgba(207,167,98,0.2)",
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span style={{ color: "var(--muted)" }}>
              <T en="Coupon code" ar="كود الخصم" />
            </span>

            <strong style={{ letterSpacing: 1.2 }}>{offer.coupon_code}</strong>
          </div>
        ) : null}

        <div
          style={{
            marginTop: 18,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Link href={actionHref} className="btn btn-primary">
            <T en={actionLabel.en} ar={actionLabel.ar} />
          </Link>

          <OfferClaimButton
            offerId={offer.id}
            couponCode={offer.coupon_code}
            className="btn"
          />
        </div>
      </div>
    </article>
  );
}

export default async function OffersPage() {
  const supabaseAdmin = createAdminClient();

  const { data: offers, error } = await supabaseAdmin
    .from("live_offers")
    .select(`
      id,
      title_en,
      title_ar,
      description_en,
      description_ar,
      offer_type,
      offer_scope,
      discount_type,
      discount_value,
      max_discount_amount,
      min_order_amount,
      coupon_id,
      coupon_code,
      studio_id,
      product_id,
      vendor_id,
      country_code,
      city_id,
      tier_code,
      image_url,
      badge_label_en,
      badge_label_ar,
      starts_at,
      ends_at,
      priority,
      is_featured,
      is_member_only,
      status,
      created_at
    `)
    .order("is_featured", { ascending: false })
    .order("priority", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const offerRows = (offers || []) as OfferRow[];
  const featuredOffers = offerRows.filter((offer) => offer.is_featured).slice(0, 3);
  const regularOffers = offerRows.filter((offer) => !offer.is_featured);

  return (
    <main className="dashboard-page" style={{ maxWidth: 1180, margin: "0 auto" }}>
      <section
        className="card"
        style={{
          marginTop: 24,
          padding: 34,
          background:
            "radial-gradient(circle at top left, rgba(207,167,98,0.26), transparent 35%), linear-gradient(135deg, rgba(20,20,20,0.98), rgba(58,47,30,0.76))",
          border: "1px solid rgba(207,167,98,0.28)",
        }}
      >
        <span className="badge badge-gold">
          <T en="GearBeat Offers" ar="عروض GearBeat" />
        </span>

        <h1 style={{ marginTop: 12 }}>
          <T en="Deals for creators" ar="عروض للمبدعين" />
        </h1>

        <p style={{ color: "var(--muted)", lineHeight: 1.8, maxWidth: 760 }}>
          <T
            en="Find studio deals, gear discounts, member-only offers, and seasonal promotions."
            ar="اكتشف عروض الاستوديوهات، خصومات المعدات، عروض الأعضاء، والعروض الموسمية."
          />
        </p>

        <div style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/studios" className="btn btn-primary">
            <T en="Explore studios" ar="استكشف الاستوديوهات" />
          </Link>

          <Link href="/marketplace" className="btn">
            <T en="Shop gear" ar="تسوق المعدات" />
          </Link>

          <Link href="/customer/rewards" className="btn">
            <T en="Rewards" ar="المكافآت" />
          </Link>
        </div>
      </section>

      {offerRows.length === 0 ? (
        <section
          className="card"
          style={{
            marginTop: 28,
            textAlign: "center",
            padding: 44,
          }}
        >
          <h2>
            <T en="No live offers right now" ar="لا توجد عروض فعالة حاليًا" />
          </h2>

          <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
            <T
              en="New offers will appear here once the GearBeat team activates them."
              ar="ستظهر العروض هنا بمجرد أن يقوم فريق GearBeat بتفعيلها."
            />
          </p>

          <Link href="/studios" className="btn btn-primary" style={{ marginTop: 14 }}>
            <T en="Browse studios" ar="تصفح الاستوديوهات" />
          </Link>
        </section>
      ) : null}

      {featuredOffers.length > 0 ? (
        <section style={{ marginTop: 28 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            <div>
              <h2>
                <T en="Featured offers" ar="عروض مميزة" />
              </h2>

              <p style={{ color: "var(--muted)" }}>
                <T
                  en="Top campaigns selected for GearBeat creators."
                  ar="أفضل الحملات المختارة لمبدعي GearBeat."
                />
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 18,
            }}
          >
            {featuredOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} featured />
            ))}
          </div>
        </section>
      ) : null}

      {regularOffers.length > 0 ? (
        <section style={{ marginTop: 32 }}>
          <h2>
            <T en="All offers" ar="كل العروض" />
          </h2>

          <div
            style={{
              marginTop: 16,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 18,
            }}
          >
            {regularOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
