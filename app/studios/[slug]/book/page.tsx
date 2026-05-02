import Link from "next/link";
import { notFound } from "next/navigation";
import T from "@/components/t";
import StudioBookingBox from "@/components/studio-booking-box";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function formatMoney(value: unknown, currency = "SAR") {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return `0.00 ${currency}`;
  }

  return `${numberValue.toFixed(2)} ${currency}`;
}

function getStudioName(studio: any) {
  return studio?.name_en || studio?.name || studio?.name_ar || "Studio";
}

function getStudioPrice(studio: any) {
  const price = Number(
    studio?.hourly_rate ||
      studio?.price_per_hour ||
      studio?.price_from ||
      studio?.base_price ||
      0
  );

  if (!Number.isFinite(price)) {
    return 0;
  }

  return price;
}

async function getStudioBySlugOrId(slug: string) {
  const supabaseAdmin = createAdminClient();

  const baseSelect = `
    id,
    slug,
    owner_auth_user_id,
    name,
    name_en,
    name_ar,
    description,
    description_en,
    description_ar,
    city,
    city_name,
    district,
    address,
    status,
    verified,
    verified_location,
    booking_enabled,
    price_from,
    hourly_rate,
    price_per_hour,
    base_price,
    currency_code,
    images,
    created_at
  `;

  const bySlug = await supabaseAdmin
    .from("studios")
    .select(baseSelect)
    .eq("slug", slug)
    .maybeSingle();

  if (bySlug.error) {
    throw new Error(bySlug.error.message);
  }

  if (bySlug.data) {
    return bySlug.data;
  }

  if (!isUuid(slug)) {
    return null;
  }

  const byId = await supabaseAdmin
    .from("studios")
    .select(baseSelect)
    .eq("id", slug)
    .maybeSingle();

  if (byId.error) {
    throw new Error(byId.error.message);
  }

  return byId.data;
}

export default async function StudioBookPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolvedParams = await params;
  const studio = await getStudioBySlugOrId(resolvedParams.slug);

  if (!studio) {
    notFound();
  }

  const studioPrice = getStudioPrice(studio);
  const currencyCode = studio.currency_code || "SAR";

  if (studio.booking_enabled === false) {
    notFound();
  }

  return (
    <main className="dashboard-page" style={{ maxWidth: 1160, margin: "0 auto" }}>
      <section style={{ marginTop: 24 }}>
        <Link href={`/studios/${studio.slug || studio.id}`} className="btn">
          <T en="Back to studio" ar="الرجوع للاستوديو" />
        </Link>
      </section>

      <section
        style={{
          marginTop: 24,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 420px",
          gap: 24,
          alignItems: "start",
        }}
      >
        <div className="card">
          <span className="badge badge-gold">
            <T en="Book Studio" ar="احجز الاستوديو" />
          </span>

          <h1 style={{ marginTop: 10 }}>{getStudioName(studio)}</h1>

          <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
            {studio.description_en ||
              studio.description ||
              studio.description_ar ||
              "Choose your booking details and confirm a manual test payment."}
          </p>

          <div
            style={{
              marginTop: 20,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            <div className="card">
              <strong>
                <T en="Location" ar="الموقع" />
              </strong>
              <p style={{ color: "var(--muted)", marginBottom: 0 }}>
                {studio.district || studio.city_name || studio.city || "—"}
              </p>
            </div>

            <div className="card">
              <strong>
                <T en="Price" ar="السعر" />
              </strong>
              <p style={{ color: "var(--muted)", marginBottom: 0 }}>
                {formatMoney(studioPrice, currencyCode)} / hour
              </p>
            </div>

            <div className="card">
              <strong>
                <T en="Status" ar="الحالة" />
              </strong>
              <p style={{ color: "var(--muted)", marginBottom: 0 }}>
                {studio.verified ? "Verified" : studio.status || "Available"}
              </p>
            </div>
          </div>

          <div className="card" style={{ marginTop: 20 }}>
            <h2>
              <T en="Booking notes" ar="ملاحظات الحجز" />
            </h2>

            <ul style={{ color: "var(--muted)", lineHeight: 1.9 }}>
              <li>
                <T
                  en="This booking uses manual test payment for now."
                  ar="هذا الحجز يستخدم الدفع التجريبي اليدوي حاليًا."
                />
              </li>
              <li>
                <T
                  en="Advanced availability calendar will be improved in the next patches."
                  ar="سيتم تطوير تقويم التوفر في الباتشات القادمة."
                />
              </li>
              <li>
                <T
                  en="Paid bookings will appear in customer and owner dashboards."
                  ar="الحجوزات المدفوعة ستظهر في لوحة العميل وصاحب الاستوديو."
                />
              </li>
            </ul>
          </div>
        </div>

        <StudioBookingBox
          studioId={studio.id}
          studioName={getStudioName(studio)}
          hourlyPrice={studioPrice}
          currencyCode={currencyCode}
        />
      </section>
    </main>
  );
}
