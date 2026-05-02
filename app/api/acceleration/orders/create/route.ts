import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { readNumber, readText, type DbRow } from "../../../../lib/auth-guards";

function orderNumber() {
  return `ACC-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  const packageId =
    typeof body?.packageId === "string" ? body.packageId.trim() : "";
  const partnerType =
    body?.partnerType === "studio_owner" ? "studio_owner" : "vendor";

  if (!packageId) {
    return NextResponse.json({ error: "Package is required." }, { status: 400 });
  }

  const { data: packageData, error: packageError } = await supabase
    .from("acceleration_packages")
    .select("*")
    .eq("id", packageId)
    .eq("is_active", true)
    .maybeSingle();

  if (packageError || !packageData) {
    return NextResponse.json({ error: "Package not found." }, { status: 404 });
  }

  const pkg = packageData as DbRow;

  const { error } = await supabase.from("acceleration_orders").insert({
    order_number: orderNumber(),
    package_id: packageId,
    partner_type: partnerType,
    partner_id: user.id,
    partner_label: user.email || user.id,
    amount: readNumber(pkg, ["price"]),
    currency: readText(pkg, ["currency"], "SAR"),
    status: "pending",
    payment_status: "pending",
    created_by: user.id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
