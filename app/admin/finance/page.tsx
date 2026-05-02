import Link from "next/link";
import AdminFinanceCenter, {
  type AdminFinanceRow,
} from "../../../components/admin-finance-center";
import { createClient } from "../../../lib/supabase/server";
import {
  requireAdminOrRedirect,
  readNumber,
  readText,
  type DbRow,
} from "../../../lib/auth-guards";

export const dynamic = "force-dynamic";

type SupabaseAny = any;

type CommissionSetting = {
  scopeType: string;
  scopeId: string;
  commissionRate: number;
  isActive: boolean;
};

function normalizeCommission(row: DbRow): CommissionSetting {
  return {
    scopeType: readText(row, ["scope_type"]),
    scopeId: readText(row, ["scope_id"]),
    commissionRate: readNumber(row, ["commission_rate"], 15),
    isActive: Boolean(row.is_active),
  };
}

function getCommissionRate(
  settings: CommissionSetting[],
  options: {
    sourceType: "marketplace_order" | "studio_booking";
    studioId?: string;
    vendorId?: string;
    productId?: string;
  }
) {
  const activeSettings = settings.filter((setting) => setting.isActive);

  if (options.sourceType === "studio_booking" && options.studioId) {
    const studioRule = activeSettings.find(
      (setting) =>
        setting.scopeType === "studio" && setting.scopeId === options.studioId
    );

    if (studioRule) return studioRule.commissionRate;
  }

  if (options.sourceType === "marketplace_order") {
    if (options.productId) {
      const productRule = activeSettings.find(
        (setting) =>
          setting.scopeType === "product" &&
          setting.scopeId === options.productId
      );

      if (productRule) return productRule.commissionRate;
    }

    if (options.vendorId) {
      const vendorRule = activeSettings.find(
        (setting) =>
          setting.scopeType === "vendor" && setting.scopeId === options.vendorId
      );

      if (vendorRule) return vendorRule.commissionRate;
    }
  }

  const serviceTypeId =
    options.sourceType === "studio_booking"
      ? "studio_booking"
      : "marketplace_product";

  const serviceRule = activeSettings.find(
    (setting) =>
      setting.scopeType === "service_type" && setting.scopeId === serviceTypeId
  );

  if (serviceRule) return serviceRule.commissionRate;

  const globalRule = activeSettings.find(
    (setting) => setting.scopeType === "global"
  );

  return globalRule?.commissionRate || 15;
}

async function fetchCommissionSettings(
  supabase: SupabaseAny
): Promise<CommissionSetting[]> {
  const { data, error } = await supabase
    .from("commission_settings")
    .select("*");

  if (error || !data) {
    return [];
  }

  return (data as DbRow[]).map(normalizeCommission);
}

async function fetchProfilesMap(supabase: SupabaseAny): Promise<Map<string, DbRow>> {
  const { data, error } = await supabase.from("profiles").select("*").limit(1000);
  const map = new Map<string, DbRow>();

  if (error || !data) {
    return map;
  }

  for (const profile of data as DbRow[]) {
    const id = readText(profile, ["id", "user_id"]);

    if (id) {
      map.set(id, profile);
    }
  }

  return map;
}

async function fetchStudiosMap(supabase: SupabaseAny): Promise<Map<string, DbRow>> {
  const { data, error } = await supabase.from("studios").select("*").limit(1000);
  const map = new Map<string, DbRow>();

  if (error || !data) {
    return map;
  }

  for (const studio of data as DbRow[]) {
    const id = readText(studio, ["id"]);

    if (id) {
      map.set(id, studio);
    }
  }

  return map;
}

async function fetchPaymentSessionsMap(
  supabase: SupabaseAny,
  bookingIds: string[]
): Promise<Map<string, DbRow>> {
  const map = new Map<string, DbRow>();

  if (bookingIds.length === 0) {
    return map;
  }

  const { data, error } = await supabase
    .from("checkout_payment_sessions")
    .select("*")
    .in("booking_id", bookingIds);

  if (error || !data) {
    return map;
  }

  for (const session of data as DbRow[]) {
    const bookingId = readText(session, ["booking_id"]);

    if (bookingId) {
      map.set(bookingId, session);
    }
  }

  return map;
}

function profileName(profile: DbRow | undefined, fallback = "Partner") {
  return readText(
    profile,
    ["full_name", "name", "display_name", "email"],
    fallback
  );
}

function studioName(studio: DbRow | undefined, fallback = "Studio") {
  return readText(studio, ["name", "title", "studio_name"], fallback);
}

function buildMarketplaceRows(
  orders: DbRow[],
  settings: CommissionSetting[],
  profilesMap: Map<string, DbRow>
): AdminFinanceRow[] {
  return orders.map((order) => {
    const id = readText(order, ["id"]);

    const vendorId = readText(order, [
      "vendor_id",
      "seller_id",
      "owner_id",
      "merchant_id",
      "created_by",
      "user_id",
    ]);

    const productId = readText(order, [
      "product_id",
      "main_product_id",
      "marketplace_product_id",
    ]);

    const grossAmount = readNumber(order, [
      "total_amount",
      "grand_total",
      "total_price",
      "amount",
      "subtotal",
    ]);

    const commissionRate = getCommissionRate(settings, {
      sourceType: "marketplace_order",
      vendorId,
      productId,
    });

    const commissionAmount = grossAmount * (commissionRate / 100);
    const netPayable = grossAmount - commissionAmount;

    return {
      id,
      sourceType: "marketplace_order",
      sourceLabel: readText(order, ["order_number", "reference", "id"], "Order"),
      partnerType: "vendor",
      partnerId: vendorId,
      partnerName: profileName(profilesMap.get(vendorId), "Vendor"),
      grossAmount,
      commissionRate,
      commissionAmount,
      netPayable,
      currency: readText(order, ["currency"], "SAR"),
      paymentStatus: readText(
        order,
        ["payment_status", "payment_state", "paymentStatus"],
        "pending"
      ),
      status: readText(order, ["status", "order_status"], "unknown"),
      createdAt: readText(order, ["created_at"]),
    };
  });
}

function buildBookingRows(
  bookings: DbRow[],
  settings: CommissionSetting[],
  studiosMap: Map<string, DbRow>,
  profilesMap: Map<string, DbRow>,
  paymentSessionsMap: Map<string, DbRow>
): AdminFinanceRow[] {
  return bookings.map((booking) => {
    const id = readText(booking, ["id"]);
    const studioId = readText(booking, ["studio_id"]);
    const studio = studiosMap.get(studioId);

    const ownerId = readText(studio, [
      "owner_auth_user_id",
      "owner_id",
      "user_id",
      "created_by",
      "profile_id",
    ]);

    const grossAmount = readNumber(booking, [
      "total_amount",
      "total_price",
      "amount",
      "price",
      "subtotal",
    ]);

    const commissionRate = getCommissionRate(settings, {
      sourceType: "studio_booking",
      studioId,
    });

    const commissionAmount = grossAmount * (commissionRate / 100);
    const netPayable = grossAmount - commissionAmount;
    const paymentSession = paymentSessionsMap.get(id);

    const paymentStatus =
      readText(booking, ["payment_status", "payment_state"]) ||
      readText(paymentSession, ["status", "payment_status"]) ||
      "pending";

    return {
      id,
      sourceType: "studio_booking",
      sourceLabel: studioName(studio, "Studio booking"),
      partnerType: "studio_owner",
      partnerId: ownerId || studioId,
      partnerName: profileName(profilesMap.get(ownerId), studioName(studio)),
      grossAmount,
      commissionRate,
      commissionAmount,
      netPayable,
      currency: readText(booking, ["currency"], "SAR"),
      paymentStatus,
      status: readText(booking, ["status"], "unknown"),
      createdAt: readText(booking, ["created_at"]),
    };
  });
}

async function fetchMarketplaceOrders(supabase: SupabaseAny): Promise<DbRow[]> {
  const { data, error } = await supabase
    .from("marketplace_orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error || !data) {
    return [];
  }

  return data as DbRow[];
}

async function fetchBookings(supabase: SupabaseAny): Promise<DbRow[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error || !data) {
    return [];
  }

  return data as DbRow[];
}

export default async function AdminFinancePage() {
  const supabase = await createClient();

  await requireAdminOrRedirect(supabase);

  const [settings, profilesMap, studiosMap, orders, bookings] =
    await Promise.all([
      fetchCommissionSettings(supabase),
      fetchProfilesMap(supabase),
      fetchStudiosMap(supabase),
      fetchMarketplaceOrders(supabase),
      fetchBookings(supabase),
    ]);

  const bookingIds = bookings
    .map((booking) => readText(booking, ["id"]))
    .filter(Boolean) as string[];

  const paymentSessionsMap = await fetchPaymentSessionsMap(
    supabase,
    bookingIds
  );

  const rows: AdminFinanceRow[] = [
    ...buildMarketplaceRows(orders, settings, profilesMap),
    ...buildBookingRows(
      bookings,
      settings,
      studiosMap,
      profilesMap,
      paymentSessionsMap
    ),
  ].sort((a, b) => {
    const dateA = a.createdAt || "";
    const dateB = b.createdAt || "";
    return dateB.localeCompare(dateA);
  });

  return (
    <main className="gb-dashboard-page">
      <section className="gb-dashboard-header">
        <div>
          <p className="gb-eyebrow">Admin dashboard</p>
          <h1>Finance Center</h1>
          <p className="gb-muted-text">
            Monitor GearBeat GMV, commission revenue, payable balances,
            marketplace orders, and studio booking financial performance.
          </p>
        </div>

        <div className="gb-action-row">
          <Link href="/admin/payouts" className="gb-button">
            View payouts
          </Link>

          <Link href="/admin" className="gb-button gb-button-secondary">
            Back to admin dashboard
          </Link>
        </div>
      </section>

      <AdminFinanceCenter rows={rows} />
    </main>
  );
}
