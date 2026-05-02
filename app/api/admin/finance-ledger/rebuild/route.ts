import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import {
  requireAdminOrRedirect,
  readNumber,
  readText,
  type DbRow,
} from "../../../../../lib/auth-guards";
import {
  financeLedgerStatusFromPayment,
  roundMoney,
  upsertFinanceLedgerEntries,
  type FinanceLedgerEntryInput,
} from "../../../../../lib/finance-ledger";

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

async function fetchProfilesMap(
  supabase: SupabaseAny
): Promise<Map<string, DbRow>> {
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

async function fetchPaymentSessionsByBookingId(
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

function buildMarketplaceLedgerEntries(
  orders: DbRow[],
  settings: CommissionSetting[],
  profilesMap: Map<string, DbRow>,
  userId: string
): FinanceLedgerEntryInput[] {
  const entries: FinanceLedgerEntryInput[] = [];

  for (const order of orders) {
    const orderId = readText(order, ["id"]);

    if (!orderId) {
      continue;
    }

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

    if (grossAmount <= 0) {
      continue;
    }

    const paymentStatus = readText(
      order,
      ["payment_status", "payment_state", "paymentStatus"],
      "pending"
    );

    const orderStatus = readText(order, ["status", "order_status"], "unknown");
    const ledgerStatus = financeLedgerStatusFromPayment(
      paymentStatus,
      orderStatus
    );

    const commissionRate = getCommissionRate(settings, {
      sourceType: "marketplace_order",
      vendorId,
      productId,
    });

    const commissionAmount = roundMoney(grossAmount * (commissionRate / 100));
    const netPayable = roundMoney(grossAmount - commissionAmount);

    const currency = readText(order, ["currency"], "SAR");
    const sourceLabel = readText(
      order,
      ["order_number", "reference", "id"],
      "Marketplace order"
    );

    const createdAt = readText(order, ["created_at"]) || new Date().toISOString();
    const vendorName = profileName(profilesMap.get(vendorId), "Vendor");

    entries.push({
      entryType: "customer_payment",
      entryGroup: "payment",
      sourceType: "marketplace_order",
      sourceId: orderId,
      sourceLabel,
      partnerType: "platform",
      partnerId: "gearbeat",
      partnerLabel: "GearBeat",
      amount: grossAmount,
      currency,
      status: ledgerStatus,
      transactionDate: createdAt,
      userId,
      metadata: {
        paymentStatus,
        orderStatus,
      },
    });

    entries.push({
      entryType: "platform_commission",
      entryGroup: "commission",
      sourceType: "marketplace_order",
      sourceId: orderId,
      sourceLabel,
      partnerType: "platform",
      partnerId: "gearbeat",
      partnerLabel: "GearBeat",
      amount: commissionAmount,
      currency,
      status: ledgerStatus,
      transactionDate: createdAt,
      userId,
      metadata: {
        commissionRate,
        paymentStatus,
        orderStatus,
      },
    });

    entries.push({
      entryType: "vendor_payable",
      entryGroup: "payable",
      sourceType: "marketplace_order",
      sourceId: orderId,
      sourceLabel,
      partnerType: "vendor",
      partnerId: vendorId,
      partnerLabel: vendorName,
      amount: netPayable,
      currency,
      status: ledgerStatus,
      transactionDate: createdAt,
      userId,
      metadata: {
        commissionRate,
        grossAmount,
        commissionAmount,
        paymentStatus,
        orderStatus,
      },
    });
  }

  return entries;
}

function buildBookingLedgerEntries(
  bookings: DbRow[],
  settings: CommissionSetting[],
  studiosMap: Map<string, DbRow>,
  profilesMap: Map<string, DbRow>,
  paymentSessionsMap: Map<string, DbRow>,
  userId: string
): FinanceLedgerEntryInput[] {
  const entries: FinanceLedgerEntryInput[] = [];

  for (const booking of bookings) {
    const bookingId = readText(booking, ["id"]);

    if (!bookingId) {
      continue;
    }

    const studioId = readText(booking, ["studio_id"]);
    const studio = studiosMap.get(studioId);

    const ownerId = readText(studio, [
      "owner_id",
      "user_id",
      "created_by",
      "profile_id",
      "owner_auth_user_id",
    ]);

    const grossAmount = readNumber(booking, [
      "total_amount",
      "total_price",
      "amount",
      "price",
      "subtotal",
    ]);

    if (grossAmount <= 0) {
      continue;
    }

    const paymentSession = paymentSessionsMap.get(bookingId);

    const paymentStatus =
      readText(booking, ["payment_status", "payment_state"]) ||
      readText(paymentSession, ["status", "payment_status"]) ||
      "pending";

    const bookingStatus = readText(booking, ["status"], "unknown");
    const ledgerStatus = financeLedgerStatusFromPayment(
      paymentStatus,
      bookingStatus
    );

    const commissionRate = getCommissionRate(settings, {
      sourceType: "studio_booking",
      studioId,
    });

    const commissionAmount = roundMoney(grossAmount * (commissionRate / 100));
    const netPayable = roundMoney(grossAmount - commissionAmount);

    const currency = readText(booking, ["currency"], "SAR");
    const sourceLabel = studioName(studio, "Studio booking");
    const createdAt = readText(booking, ["created_at"]) || new Date().toISOString();
    const ownerName = profileName(profilesMap.get(ownerId), sourceLabel);

    entries.push({
      entryType: "customer_payment",
      entryGroup: "payment",
      sourceType: "studio_booking",
      sourceId: bookingId,
      sourceLabel,
      partnerType: "platform",
      partnerId: "gearbeat",
      partnerLabel: "GearBeat",
      amount: grossAmount,
      currency,
      status: ledgerStatus,
      transactionDate: createdAt,
      userId,
      metadata: {
        studioId,
        paymentStatus,
        bookingStatus,
      },
    });

    entries.push({
      entryType: "platform_commission",
      entryGroup: "commission",
      sourceType: "studio_booking",
      sourceId: bookingId,
      sourceLabel,
      partnerType: "platform",
      partnerId: "gearbeat",
      partnerLabel: "GearBeat",
      amount: commissionAmount,
      currency,
      status: ledgerStatus,
      transactionDate: createdAt,
      userId,
      metadata: {
        studioId,
        commissionRate,
        paymentStatus,
        bookingStatus,
      },
    });

    entries.push({
      entryType: "owner_payable",
      entryGroup: "payable",
      sourceType: "studio_booking",
      sourceId: bookingId,
      sourceLabel,
      partnerType: "studio_owner",
      partnerId: ownerId || studioId,
      partnerLabel: ownerName,
      amount: netPayable,
      currency,
      status: ledgerStatus,
      transactionDate: createdAt,
      userId,
      metadata: {
        studioId,
        commissionRate,
        grossAmount,
        commissionAmount,
        paymentStatus,
        bookingStatus,
      },
    });
  }

  return entries;
}

export async function POST() {
  const supabase = await createClient();

  const { user } = await requireAdminOrRedirect(supabase);

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

  const paymentSessionsMap = await fetchPaymentSessionsByBookingId(
    supabase,
    bookingIds
  );

  const entries: FinanceLedgerEntryInput[] = [
    ...buildMarketplaceLedgerEntries(orders, settings, profilesMap, user.id),
    ...buildBookingLedgerEntries(
      bookings,
      settings,
      studiosMap,
      profilesMap,
      paymentSessionsMap,
      user.id
    ),
  ];

  const { count, error } = await upsertFinanceLedgerEntries(supabase, entries);

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json({
    ok: true,
    entryCount: count,
    marketplaceOrders: orders.length,
    bookings: bookings.length,
  });
}
