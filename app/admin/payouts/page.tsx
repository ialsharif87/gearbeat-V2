import Link from "next/link";
import { redirect } from "next/navigation";
import AdminPayoutsReport, {
  type PayoutReportRow,
} from "../../../components/admin-payouts-report";
import { createClient } from "../../../lib/supabase/server";
import {
  requireAdminOrRedirect,
  readText,
  readNumber,
  type DbRow,
} from "../../../lib/auth-guards";

export const dynamic = "force-dynamic";

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
    sourceType: "studio_booking" | "marketplace_order";
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

  const serviceRule = activeSettings.find((setting) => {
    if (options.sourceType === "studio_booking") {
      return (
        setting.scopeType === "service_type" &&
        setting.scopeId === "studio_booking"
      );
    }

    return (
      setting.scopeType === "service_type" &&
      setting.scopeId === "marketplace_product"
    );
  });

  if (serviceRule) return serviceRule.commissionRate;

  const globalRule = activeSettings.find(
    (setting) => setting.scopeType === "global"
  );

  return globalRule?.commissionRate || 15;
}

async function fetchCommissionSettings(
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const { data, error } = await supabase
    .from("commission_settings")
    .select("*");

  if (error || !data) {
    return [];
  }

  return (data as DbRow[]).map(normalizeCommission);
}

async function fetchProfilesMap(
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const { data } = await supabase.from("profiles").select("*").limit(500);
  const map = new Map<string, DbRow>();

  for (const profile of (data || []) as DbRow[]) {
    const id = readText(profile, ["id", "user_id"]);

    if (id) {
      map.set(id, profile);
    }
  }

  return map;
}

async function fetchStudiosMap(
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const { data } = await supabase.from("studios").select("*").limit(500);
  const map = new Map<string, DbRow>();

  for (const studio of (data || []) as DbRow[]) {
    const id = readText(studio, ["id"]);

    if (id) {
      map.set(id, studio);
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

function buildBookingRows(
  bookings: DbRow[],
  settings: CommissionSetting[],
  studiosMap: Map<string, DbRow>,
  profilesMap: Map<string, DbRow>
): PayoutReportRow[] {
  return bookings.map((booking) => {
    const id = readText(booking, ["id"]);
    const studioId = readText(booking, ["studio_id"]);
    const studio = studiosMap.get(studioId);

    const ownerId = readText(studio, [
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
    ]);

    const commissionRate = getCommissionRate(settings, {
      sourceType: "studio_booking",
      studioId,
    });

    const commissionAmount = grossAmount * (commissionRate / 100);
    const netPayable = grossAmount - commissionAmount;

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
      paymentStatus: readText(
        booking,
        ["payment_status", "payment_state"],
        "pending"
      ),
      status: readText(booking, ["status"], "unknown"),
      createdAt: readText(booking, ["created_at"]),
    };
  });
}

function buildMarketplaceOrderRows(
  orders: DbRow[],
  settings: CommissionSetting[],
  profilesMap: Map<string, DbRow>
): PayoutReportRow[] {
  return orders.map((order) => {
    const id = readText(order, ["id"]);
    const vendorId = readText(order, [
      "vendor_id",
      "seller_id",
      "owner_id",
      "merchant_id",
    ]);

    const productId = readText(order, ["product_id", "main_product_id"]);

    const grossAmount = readNumber(order, [
      "total_amount",
      "grand_total",
      "total_price",
      "amount",
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
        ["payment_status", "payment_state"],
        "pending"
      ),
      status: readText(order, ["status"], "unknown"),
      createdAt: readText(order, ["created_at"]),
    };
  });
}

async function fetchBookingRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  settings: CommissionSetting[],
  studiosMap: Map<string, DbRow>,
  profilesMap: Map<string, DbRow>
) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error || !data) {
    return [];
  }

  return buildBookingRows((data || []) as DbRow[], settings, studiosMap, profilesMap);
}

async function fetchMarketplaceRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  settings: CommissionSetting[],
  profilesMap: Map<string, DbRow>
) {
  const { data, error } = await supabase
    .from("marketplace_orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error || !data) {
    return [];
  }

  return buildMarketplaceOrderRows((data || []) as DbRow[], settings, profilesMap);
}

export default async function AdminPayoutsPage() {
  const supabase = await createClient();

  await requireAdminOrRedirect(supabase);

  const [settings, profilesMap, studiosMap] = await Promise.all([
    fetchCommissionSettings(supabase),
    fetchProfilesMap(supabase),
    fetchStudiosMap(supabase),
  ]);

  const [bookingRows, marketplaceRows] = await Promise.all([
    fetchBookingRows(supabase, settings, studiosMap, profilesMap),
    fetchMarketplaceRows(supabase, settings, profilesMap),
  ]);

  const rows = [...bookingRows, ...marketplaceRows].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );

  return (
    <main className="gb-dashboard-page">
      <section className="gb-dashboard-header">
        <div>
          <p className="gb-eyebrow">Admin dashboard</p>
          <h1>Payouts & Settlement Reports</h1>
          <p className="gb-muted-text">
            Review gross revenue, GearBeat commission, and net payable amounts
            for studio owners and vendors.
          </p>
        </div>

        <Link href="/admin" className="gb-button gb-button-secondary">
          Back to admin dashboard
        </Link>
      </section>

      <AdminPayoutsReport rows={rows} />
    </main>
  );
}
