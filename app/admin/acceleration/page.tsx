import Link from "next/link";
import AccelerationPackagesPanel, {
  type AccelerationOrder,
  type AccelerationPackage,
} from "../../../components/acceleration-packages-panel";
import { createClient } from "../../../lib/supabase/server";
import {
  requireAdminOrRedirect,
  readNumber,
  readText,
  type DbRow,
} from "../../../lib/auth-guards";

export const dynamic = "force-dynamic";

function pkg(row: DbRow): AccelerationPackage {
  return {
    id: readText(row, ["id"]),
    title: readText(row, ["title"]),
    description: readText(row, ["description"]),
    partnerType: readText(row, ["partner_type"], "all"),
    price: readNumber(row, ["price"]),
    currency: readText(row, ["currency"], "SAR"),
    durationDays: readNumber(row, ["duration_days"], 7),
    placement: readText(row, ["placement"], "featured"),
    isActive: Boolean(row.is_active),
  };
}

function order(row: DbRow): AccelerationOrder {
  return {
    id: readText(row, ["id"]),
    orderNumber: readText(row, ["order_number"]),
    packageTitle: readText(row, ["package_title", "title"], "Acceleration"),
    partnerType: readText(row, ["partner_type"]),
    amount: readNumber(row, ["amount"]),
    currency: readText(row, ["currency"], "SAR"),
    status: readText(row, ["status"]),
    paymentStatus: readText(row, ["payment_status"]),
    createdAt: readText(row, ["created_at"]),
  };
}

export default async function AdminAccelerationPage() {
  const supabase = await createClient();
  await requireAdminOrRedirect(supabase);

  const { data: packageRows } = await supabase
    .from("acceleration_packages")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: orderRows } = await supabase
    .from("acceleration_orders")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="gb-dashboard-page">
      <section className="gb-dashboard-header">
        <div>
          <p className="gb-eyebrow">Admin finance</p>
          <h1>Acceleration Finance</h1>
        </div>
        <div className="gb-action-row">
          <Link href="/admin/finance" className="gb-button gb-button-secondary">
            Finance center
          </Link>
        </div>
      </section>

      <AccelerationPackagesPanel
        mode="admin"
        packages={((packageRows || []) as DbRow[]).map(pkg)}
        orders={((orderRows || []) as DbRow[]).map(order)}
      />
    </main>
  );
}
