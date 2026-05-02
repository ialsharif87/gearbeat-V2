import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../../lib/supabase/server";
import { requireAdminOrRedirect } from "../../../../../../lib/auth-guards";
import { createFinanceAuditLog } from "../../../../../../lib/finance-audit";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { user } = await requireAdminOrRedirect(supabase);

  const body = await request.json().catch(() => null);

  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const description =
    typeof body?.description === "string" ? body.description.trim() : "";
  const partnerType =
    body?.partnerType === "vendor" || body?.partnerType === "studio_owner"
      ? body.partnerType
      : "all";
  const price = Number(body?.price || 0);
  const durationDays = Number(body?.durationDays || 7);
  const placement = typeof body?.placement === "string" ? body.placement : "featured";

  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  if (price <= 0) {
    return NextResponse.json({ error: "Price must be greater than zero." }, { status: 400 });
  }

  const { error } = await supabase.from("acceleration_packages").insert({
    title,
    description: description || null,
    partner_type: partnerType,
    price,
    currency: "SAR",
    duration_days: durationDays,
    placement,
    is_active: true,
    created_by: user.id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await createFinanceAuditLog(supabase, {
    actionType: "created",
    entityType: "acceleration_package",
    entityId: title,
    entityLabel: title,
    actorUserId: user.id,
    actorEmail: typeof user.email === "string" ? user.email : null,
    reason: "Admin created acceleration package.",
    afterData: {
      title,
      partnerType,
      price,
      durationDays,
      placement,
    },
  });

  return NextResponse.json({ ok: true });
}
