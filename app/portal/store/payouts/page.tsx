import Link from "next/link";
import VendorFinanceReport, {
  type VendorFinanceRow,
} from "@/components/vendor-finance-report";
import { createClient } from "@/lib/supabase/server";
import {
  requireVendorOrRedirect,
  readNumber,
  readText,
  type DbRow,
} from "@/lib/auth-guards";

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
    vendorId?: string;
    productId?: string;
  }
) {
  const activeSettings = settings.filter((setting) => setting.isActive);

  if (options.productId) {
    const productRule = activeSettings.find(
      (setting) =>
        setting.scopeType === "product" && setting.scopeId === options.productId
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

  const marketplaceRule = activeSettings.find(
    (setting) =>
      setting.scopeType === "service_type" &&
      setting.scopeId === "marketplace_product"
  );

  if (marketplaceRule) return marketplaceRule.commissionRate;

  const globalRule = activeSettings.find(
    (setting) => setting.scopeType === "global"
  );

  return globalRule?.commissionRate || 15;
}

async function fetchCommissionSettings(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<CommissionSetting[]> {
  const { data, error } = await supabase
    .from("commission_settings")
    .select("*");

  if (error || !data) {
    return [];
  }

  return (data as DbRow[]).map(normalizeCommission);
}

async function fetchVendorOrders(
  supabase: Awaited<ReturnType<typeof createClient>>,
  vendorId: string
): Promise<DbRow[]> {
  const vendorColumnCandidates = [
    "vendor_id",
    "seller_id",
    "owner_id",
    "merchant_id",
    "created_by",
    "user_id",
  ];

  for (const vendorColumn of vendorColumnCandidates) {
    const { data, error } = await supabase
      .from("marketplace_orders")
      .select("*")
      .eq(vendorColumn, vendorId)
      .order("created_at", { ascending: false })
      .limit(500);

    if (!error && data && data.length > 0) {
      return data as DbRow[];
    }
  }

  return [];
}

function normalizeOrderRow(
  order: DbRow,
  vendorId: string,
  settings: CommissionSetting[]
): VendorFinanceRow {
  const id = readText(order, ["id"]);

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
    vendorId,
    productId,
  });

  const commissionAmount = grossAmount * (commissionRate / 100);
  const netPayable = grossAmount - commissionAmount;

  return {
    id,
    orderLabel: readText(order, ["order_number", "reference", "id"], "Order"),
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
    orderStatus: readText(order, ["status", "order_status"], "unknown"),
    createdAt: readText(order, ["created_at"]),
  };
}

export default async function VendorFinancePage() {
  const supabase = await createClient();

  const { user } = await requireVendorOrRedirect(supabase);

  const [settings, orders] = await Promise.all([
    fetchCommissionSettings(supabase),
    fetchVendorOrders(supabase, user.id),
  ]);

  const rows = orders.map((order) =>
    normalizeOrderRow(order, user.id, settings)
  );

  return (
    <main className="gb-dashboard-page">
      <section className="gb-dashboard-header">
        <div>
          <p className="gb-eyebrow">Vendor dashboard</p>
          <h1>Finance</h1>
          <p className="gb-muted-text">
            Track your marketplace sales, estimated GearBeat commission, and net
            payable balance.
          </p>
        </div>

        <Link href="/portal/store" className="gb-button gb-button-secondary">
          Back to vendor dashboard
        </Link>
      </section>

      <VendorFinanceReport rows={rows} />
    </main>
  );
}
