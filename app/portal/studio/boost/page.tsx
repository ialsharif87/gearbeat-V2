import Link from "next/link";
import AccelerationPackagesPanel, {
  type AccelerationOrder,
  type AccelerationPackage,
} from "@/components/acceleration-packages-panel";
import { createClient } from "@/lib/supabase/server";
import {
  requireOwnerOrRedirect,
  readNumber,
  readText,
  type DbRow,
} from "@/lib/auth-guards";

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

export default async function OwnerAccelerationPage() {
  const supabase = await createClient();
  const { user } = await requireOwnerOrRedirect(supabase);

  const { data: packageRows } = await supabase
    .from("acceleration_packages")
    .select("*")
    .in("partner_type", ["all", "studio_owner"])
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const { data: orderRows } = await supabase
    .from("acceleration_orders")
    .select("*")
    .eq("partner_type", "studio_owner")
    .eq("partner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="gb-dashboard-page">
      <section className="gb-dashboard-header">
        <div>
          <p className="gb-eyebrow">Owner dashboard</p>
          <h1>Acceleration</h1>
        </div>
        <Link href="/portal/studio" className="gb-button gb-button-secondary">
          Back to owner dashboard
        </Link>
      </section>

      <AccelerationPackagesPanel
        mode="owner"
        partnerType="studio_owner"
        packages={((packageRows || []) as DbRow[]).map(pkg)}
        orders={((orderRows || []) as DbRow[]).map(order)}
      />
    </main>
  );
}
