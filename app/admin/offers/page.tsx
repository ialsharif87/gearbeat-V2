import { revalidatePath } from "next/cache";
import T from "@/components/t";
import { requireAdminLayoutAccess } from "@/lib/route-guards";

export const dynamic = "force-dynamic";

const OFFER_TYPES = [
  "general",
  "welcome",
  "weekend",
  "seasonal",
  "member_exclusive",
  "studio_deal",
  "gear_deal",
  "city_deal",
];

const OFFER_SCOPES = [
  "all",
  "studio_booking",
  "marketplace_order",
];

const DISCOUNT_TYPES = [
  "percent",
  "fixed",
];

const OFFER_STATUSES = [
  "draft",
  "active",
  "published",
  "archived",
];

function getText(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function getNumber(formData: FormData, key: string) {
  const value = Number(formData.get(key) || 0);

  if (!Number.isFinite(value)) {
    return 0;
  }

  return value;
}

function getNullableText(formData: FormData, key: string) {
  const value = getText(formData, key);

  return value || null;
}

function getNullableNumber(formData: FormData, key: string) {
  const rawValue = getText(formData, key);

  if (!rawValue) {
    return null;
  }

  const value = Number(rawValue);

  if (!Number.isFinite(value)) {
    return null;
  }

  return value;
}

function getNullableDate(formData: FormData, key: string) {
  const value = getText(formData, key);

  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}

function getCheckbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function isAllowedValue(value: string, allowed: string[]) {
  return allowed.includes(value);
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

function getBadgeClass(status: string | null | undefined) {
  if (status === "active" || status === "published") {
    return "badge badge-success";
  }

  if (status === "draft") {
    return "badge badge-warning";
  }

  if (status === "archived") {
    return "badge badge-danger";
  }

  return "badge";
}

function buildOfferPayload(formData: FormData) {
  const titleEn = getText(formData, "title_en");
  const titleAr = getText(formData, "title_ar");
  const offerType = getText(formData, "offer_type") || "general";
  const offerScope = getText(formData, "offer_scope") || "all";
  const discountType = getText(formData, "discount_type") || "percent";
  const status = getText(formData, "status") || "draft";

  if (!titleEn || titleEn.length < 2) {
    throw new Error("English offer title is required.");
  }

  if (!titleAr || titleAr.length < 2) {
    throw new Error("Arabic offer title is required.");
  }

  if (!isAllowedValue(offerType, OFFER_TYPES)) {
    throw new Error("Invalid offer type.");
  }

  if (!isAllowedValue(offerScope, OFFER_SCOPES)) {
    throw new Error("Invalid offer scope.");
  }

  if (!isAllowedValue(discountType, DISCOUNT_TYPES)) {
    throw new Error("Invalid discount type.");
  }

  if (!isAllowedValue(status, OFFER_STATUSES)) {
    throw new Error("Invalid offer status.");
  }

  const discountValue = getNumber(formData, "discount_value");

  if (discountValue < 0) {
    throw new Error("Discount value cannot be negative.");
  }

  const isActive = status === "active" || status === "published";

  return {
    title_en: titleEn,
    title_ar: titleAr,
    description_en: getNullableText(formData, "description_en"),
    description_ar: getNullableText(formData, "description_ar"),
    offer_type: offerType,
    offer_scope: offerScope,
    discount_type: discountType,
    discount_value: discountValue,
    max_discount_amount: getNullableNumber(formData, "max_discount_amount"),
    min_order_amount: getNumber(formData, "min_order_amount"),
    coupon_id: getNullableText(formData, "coupon_id"),
    country_code: getNullableText(formData, "country_code"),
    city_id: getNullableText(formData, "city_id"),
    tier_code: getNullableText(formData, "tier_code"),
    image_url: getNullableText(formData, "image_url"),
    badge_label_en: getNullableText(formData, "badge_label_en"),
    badge_label_ar: getNullableText(formData, "badge_label_ar"),
    starts_at: getNullableDate(formData, "starts_at"),
    ends_at: getNullableDate(formData, "ends_at"),
    priority: getNumber(formData, "priority") || 100,
    is_featured: getCheckbox(formData, "is_featured"),
    is_member_only: getCheckbox(formData, "is_member_only"),
    is_active: isActive,
    status,
    updated_at: new Date().toISOString(),
  };
}

export default async function AdminOffersPage() {
  const { supabaseAdmin } = await requireAdminLayoutAccess();

  const [
    offersResult,
    couponsResult,
    countriesResult,
    citiesResult,
    tiersResult,
  ] = await Promise.all([
    supabaseAdmin
      .from("offers")
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
        is_active,
        status,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false })
      .limit(80),

    supabaseAdmin
      .from("coupons")
      .select("id, code, title_en, title_ar, status, is_active")
      .order("created_at", { ascending: false })
      .limit(100),

    supabaseAdmin
      .from("countries")
      .select("country_code, name_en, name_ar")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),

    supabaseAdmin
      .from("cities")
      .select("id, country_code, name_en, name_ar")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),

    supabaseAdmin
      .from("loyalty_tiers")
      .select("code, name_en, name_ar, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (offersResult.error) {
    throw new Error(offersResult.error.message);
  }

  if (couponsResult.error) {
    throw new Error(couponsResult.error.message);
  }

  if (countriesResult.error) {
    throw new Error(countriesResult.error.message);
  }

  if (citiesResult.error) {
    throw new Error(citiesResult.error.message);
  }

  if (tiersResult.error) {
    throw new Error(tiersResult.error.message);
  }

  const offers = offersResult.data || [];
  const coupons = couponsResult.data || [];
  const countries = countriesResult.data || [];
  const cities = citiesResult.data || [];
  const tiers = tiersResult.data || [];

  async function createOffer(formData: FormData) {
    "use server";

    const { supabaseAdmin } = await requireAdminLayoutAccess();
    const payload = buildOfferPayload(formData);

    const { error } = await supabaseAdmin
      .from("offers")
      .insert({
        ...payload,
        created_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/offers");
    revalidatePath("/offers");
  }

  async function updateOffer(formData: FormData) {
    "use server";

    const { supabaseAdmin } = await requireAdminLayoutAccess();
    const offerId = getText(formData, "offer_id");

    if (!offerId) {
      throw new Error("Offer id is required.");
    }

    const payload = buildOfferPayload(formData);

    const { error } = await supabaseAdmin
      .from("offers")
      .update(payload)
      .eq("id", offerId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/offers");
    revalidatePath("/offers");
  }

  async function setOfferStatus(formData: FormData) {
    "use server";

    const { supabaseAdmin } = await requireAdminLayoutAccess();

    const offerId = getText(formData, "offer_id");
    const status = getText(formData, "status");

    if (!offerId) {
      throw new Error("Offer id is required.");
    }

    if (!isAllowedValue(status, OFFER_STATUSES)) {
      throw new Error("Invalid offer status.");
    }

    const isActive = status === "active" || status === "published";

    const { error } = await supabaseAdmin
      .from("offers")
      .update({
        status,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", offerId);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/offers");
    revalidatePath("/offers");
  }

  const liveCount = offers.filter(
    (offer: any) =>
      offer.is_active &&
      (offer.status === "active" || offer.status === "published")
  ).length;

  const draftCount = offers.filter((offer: any) => offer.status === "draft")
    .length;

  const featuredCount = offers.filter((offer: any) => offer.is_featured).length;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <span className="badge badge-gold">
          <T en="Offers Management" ar="إدارة العروض" />
        </span>

        <h1>
          <T en="Admin Offers Management" ar="إدارة عروض GearBeat" />
        </h1>

        <p>
          <T
            en="Create, publish, unpublish, and manage promotional offers across studios, marketplace, cities, and loyalty tiers."
            ar="أنشئ وانشر وأوقف عروض GearBeat للاستوديوهات والمتجر والمدن ومستويات العضوية."
          />
        </p>
      </div>

      <div className="stats-grid" style={{ marginTop: 30 }}>
        <div className="card stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <label>
              <T en="Live Offers" ar="عروض فعالة" />
            </label>
            <div className="stat-value">{liveCount}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <label>
              <T en="Draft Offers" ar="مسودات" />
            </label>
            <div className="stat-value">{draftCount}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <label>
              <T en="Featured" ar="مميزة" />
            </label>
            <div className="stat-value">{featuredCount}</div>
          </div>
        </div>
      </div>

      <section className="card" style={{ marginTop: 30 }}>
        <h2>
          <T en="Create new offer" ar="إنشاء عرض جديد" />
        </h2>

        <form action={createOffer} style={{ marginTop: 20, display: "grid", gap: 18 }}>
          <div className="grid grid-2">
            <div>
              <label>Title English</label>
              <input name="title_en" className="input" required placeholder="Weekend Studio Deal" />
            </div>

            <div>
              <label>Title Arabic</label>
              <input name="title_ar" className="input" required placeholder="عرض استوديو نهاية الأسبوع" />
            </div>
          </div>

          <div className="grid grid-2">
            <div>
              <label>Description English</label>
              <textarea name="description_en" className="input" rows={4} placeholder="Offer description..." />
            </div>

            <div>
              <label>Description Arabic</label>
              <textarea name="description_ar" className="input" rows={4} placeholder="وصف العرض..." />
            </div>
          </div>

          <div className="grid grid-4">
            <div>
              <label>Offer type</label>
              <select name="offer_type" className="input" defaultValue="general">
                {OFFER_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Offer scope</label>
              <select name="offer_scope" className="input" defaultValue="all">
                {OFFER_SCOPES.map((scope) => (
                  <option key={scope} value={scope}>{scope}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Status</label>
              <select name="status" className="input" defaultValue="draft">
                {OFFER_STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Priority</label>
              <input name="priority" className="input" type="number" defaultValue={100} />
            </div>
          </div>

          <div className="grid grid-4">
            <div>
              <label>Discount type</label>
              <select name="discount_type" className="input" defaultValue="percent">
                {DISCOUNT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Discount value</label>
              <input name="discount_value" className="input" type="number" step="0.01" defaultValue={0} />
            </div>

            <div>
              <label>Max discount</label>
              <input name="max_discount_amount" className="input" type="number" step="0.01" />
            </div>

            <div>
              <label>Minimum order</label>
              <input name="min_order_amount" className="input" type="number" step="0.01" defaultValue={0} />
            </div>
          </div>

          <div className="grid grid-4">
            <div>
              <label>Coupon</label>
              <select name="coupon_id" className="input" defaultValue="">
                <option value="">No coupon</option>
                {coupons.map((coupon: any) => (
                  <option key={coupon.id} value={coupon.id}>
                    {coupon.code} — {coupon.title_en || coupon.title_ar || coupon.status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Country</label>
              <select name="country_code" className="input" defaultValue="">
                <option value="">All countries</option>
                {countries.map((country: any) => (
                  <option key={country.country_code} value={country.country_code}>
                    {country.name_en} / {country.name_ar}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>City</label>
              <select name="city_id" className="input" defaultValue="">
                <option value="">All cities</option>
                {cities.map((city: any) => (
                  <option key={city.id} value={city.id}>
                    {city.name_en} / {city.name_ar}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Loyalty tier</label>
              <select name="tier_code" className="input" defaultValue="">
                <option value="">All tiers</option>
                {tiers.map((tier: any) => (
                  <option key={tier.code} value={tier.code}>
                    {tier.name_en} / {tier.name_ar}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-3">
            <div>
              <label>Badge English</label>
              <input name="badge_label_en" className="input" placeholder="Weekend" />
            </div>

            <div>
              <label>Badge Arabic</label>
              <input name="badge_label_ar" className="input" placeholder="نهاية الأسبوع" />
            </div>

            <div>
              <label>Image URL</label>
              <input name="image_url" className="input" placeholder="https://..." />
            </div>
          </div>

          <div className="grid grid-2">
            <div>
              <label>Starts at</label>
              <input name="starts_at" className="input" type="datetime-local" />
            </div>

            <div>
              <label>Ends at</label>
              <input name="ends_at" className="input" type="datetime-local" />
            </div>
          </div>

          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input name="is_featured" type="checkbox" />
              Featured offer
            </label>

            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input name="is_member_only" type="checkbox" />
              Member only
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-large">
            <T en="Create Offer" ar="إنشاء العرض" />
          </button>
        </form>
      </section>

      <section className="card" style={{ marginTop: 30 }}>
        <h2>
          <T en="All offers" ar="كل العروض" />
        </h2>

        <div className="table-responsive" style={{ marginTop: 20 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Offer</th>
                <th>Scope</th>
                <th>Discount</th>
                <th>Targeting</th>
                <th>Status</th>
                <th>Dates</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {offers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 30 }}>
                    <T en="No offers found." ar="لا توجد عروض." />
                  </td>
                </tr>
              ) : (
                offers.map((offer: any) => (
                  <tr key={offer.id}>
                    <td>
                      <div style={{ fontWeight: 800 }}>{offer.title_en}</div>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        {offer.title_ar}
                      </div>
                      <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {offer.is_featured ? <span className="badge badge-gold">featured</span> : null}
                        {offer.is_member_only ? <span className="badge">member only</span> : null}
                      </div>
                    </td>

                    <td>
                      <div>{offer.offer_type}</div>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        {offer.offer_scope}
                      </div>
                    </td>

                    <td>
                      <div>
                        {offer.discount_type} {offer.discount_value}
                      </div>
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                        Min: {offer.min_order_amount || 0}
                      </div>
                    </td>

                    <td>
                      <div>Country: {offer.country_code || "all"}</div>
                      <div>Tier: {offer.tier_code || "all"}</div>
                    </td>

                    <td>
                      <span className={getBadgeClass(offer.status)}>
                        {offer.status}
                      </span>
                    </td>

                    <td>
                      <div>Start: {formatDate(offer.starts_at)}</div>
                      <div>End: {formatDate(offer.ends_at)}</div>
                    </td>

                    <td>
                      <div style={{ display: "grid", gap: 8 }}>
                        <form action={setOfferStatus}>
                          <input type="hidden" name="offer_id" value={offer.id} />
                          <input type="hidden" name="status" value="active" />
                          <button type="submit" className="btn btn-small btn-success">
                            Publish
                          </button>
                        </form>

                        <form action={setOfferStatus}>
                          <input type="hidden" name="offer_id" value={offer.id} />
                          <input type="hidden" name="status" value="draft" />
                          <button type="submit" className="btn btn-small">
                            Unpublish
                          </button>
                        </form>

                        <form action={setOfferStatus}>
                          <input type="hidden" name="offer_id" value={offer.id} />
                          <input type="hidden" name="status" value="archived" />
                          <button type="submit" className="btn btn-small btn-danger">
                            Archive
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginTop: 30 }}>
        <h2>
          <T en="Edit offers" ar="تعديل العروض" />
        </h2>

        <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
          <T
            en="Use the compact forms below to update existing offer details."
            ar="استخدم النماذج المختصرة أدناه لتعديل تفاصيل العروض الحالية."
          />
        </p>

        <div style={{ marginTop: 20, display: "grid", gap: 18 }}>
          {offers.map((offer: any) => (
            <details key={offer.id} className="card">
              <summary style={{ cursor: "pointer", fontWeight: 800 }}>
                {offer.title_en} — {offer.status}
              </summary>

              <form action={updateOffer} style={{ marginTop: 18, display: "grid", gap: 16 }}>
                <input type="hidden" name="offer_id" value={offer.id} />

                <div className="grid grid-2">
                  <div>
                    <label>Title English</label>
                    <input name="title_en" className="input" required defaultValue={offer.title_en || ""} />
                  </div>

                  <div>
                    <label>Title Arabic</label>
                    <input name="title_ar" className="input" required defaultValue={offer.title_ar || ""} />
                  </div>
                </div>

                <div className="grid grid-2">
                  <div>
                    <label>Description English</label>
                    <textarea name="description_en" className="input" rows={3} defaultValue={offer.description_en || ""} />
                  </div>

                  <div>
                    <label>Description Arabic</label>
                    <textarea name="description_ar" className="input" rows={3} defaultValue={offer.description_ar || ""} />
                  </div>
                </div>

                <div className="grid grid-4">
                  <div>
                    <label>Offer type</label>
                    <select name="offer_type" className="input" defaultValue={offer.offer_type || "general"}>
                      {OFFER_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Offer scope</label>
                    <select name="offer_scope" className="input" defaultValue={offer.offer_scope || "all"}>
                      {OFFER_SCOPES.map((scope) => (
                        <option key={scope} value={scope}>{scope}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Status</label>
                    <select name="status" className="input" defaultValue={offer.status || "draft"}>
                      {OFFER_STATUSES.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Priority</label>
                    <input name="priority" className="input" type="number" defaultValue={offer.priority || 100} />
                  </div>
                </div>

                <div className="grid grid-4">
                  <div>
                    <label>Discount type</label>
                    <select name="discount_type" className="input" defaultValue={offer.discount_type || "percent"}>
                      {DISCOUNT_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Discount value</label>
                    <input name="discount_value" className="input" type="number" step="0.01" defaultValue={offer.discount_value || 0} />
                  </div>

                  <div>
                    <label>Max discount</label>
                    <input name="max_discount_amount" className="input" type="number" step="0.01" defaultValue={offer.max_discount_amount || ""} />
                  </div>

                  <div>
                    <label>Minimum order</label>
                    <input name="min_order_amount" className="input" type="number" step="0.01" defaultValue={offer.min_order_amount || 0} />
                  </div>
                </div>

                <div className="grid grid-4">
                  <div>
                    <label>Coupon</label>
                    <select name="coupon_id" className="input" defaultValue={offer.coupon_id || ""}>
                      <option value="">No coupon</option>
                      {coupons.map((coupon: any) => (
                        <option key={coupon.id} value={coupon.id}>
                          {coupon.code} — {coupon.title_en || coupon.title_ar || coupon.status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Country</label>
                    <select name="country_code" className="input" defaultValue={offer.country_code || ""}>
                      <option value="">All countries</option>
                      {countries.map((country: any) => (
                        <option key={country.country_code} value={country.country_code}>
                          {country.name_en} / {country.name_ar}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>City</label>
                    <select name="city_id" className="input" defaultValue={offer.city_id || ""}>
                      <option value="">All cities</option>
                      {cities.map((city: any) => (
                        <option key={city.id} value={city.id}>
                          {city.name_en} / {city.name_ar}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Loyalty tier</label>
                    <select name="tier_code" className="input" defaultValue={offer.tier_code || ""}>
                      <option value="">All tiers</option>
                      {tiers.map((tier: any) => (
                        <option key={tier.code} value={tier.code}>
                          {tier.name_en} / {tier.name_ar}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-3">
                  <div>
                    <label>Badge English</label>
                    <input name="badge_label_en" className="input" defaultValue={offer.badge_label_en || ""} />
                  </div>

                  <div>
                    <label>Badge Arabic</label>
                    <input name="badge_label_ar" className="input" defaultValue={offer.badge_label_ar || ""} />
                  </div>

                  <div>
                    <label>Image URL</label>
                    <input name="image_url" className="input" defaultValue={offer.image_url || ""} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                  <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input name="is_featured" type="checkbox" defaultChecked={Boolean(offer.is_featured)} />
                    Featured offer
                  </label>

                  <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input name="is_member_only" type="checkbox" defaultChecked={Boolean(offer.is_member_only)} />
                    Member only
                  </label>
                </div>

                <button type="submit" className="btn btn-primary">
                  <T en="Save Changes" ar="حفظ التعديلات" />
                </button>
              </form>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
