import { createClient } from "../../../../../lib/supabase/server";
import {
  requireAdminOrRedirect,
  readText,
  readNumber,
  type DbRow,
  type GearBeatRole,
} from "../../../../../lib/auth-guards";
import {
  jsonOk,
  jsonError,
  unauthorized,
  forbidden,
  serverError,
} from "../../../../../lib/api-responses";



type CommissionScopeType =
  | "global"
  | "studio"
  | "vendor"
  | "product"
  | "service_type";

const allowedScopeTypes = new Set<CommissionScopeType>([
  "global",
  "studio",
  "vendor",
  "product",
  "service_type",
]);



function normalizeSetting(row: DbRow) {
  return {
    id: readText(row, ["id"]),
    scopeType: readText(row, ["scope_type"]) as CommissionScopeType,
    scopeId: readText(row, ["scope_id"]),
    scopeLabel: readText(row, ["scope_label"]),
    commissionRate: readNumber(row, ["commission_rate"], 15),
    isActive: Boolean(row.is_active),
    notes: readText(row, ["notes"]),
  };
}



export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return unauthorized();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role || "") as GearBeatRole;

  if (role !== "admin" && role !== "super_admin") {
    return forbidden("Admin access required.");
  }

  const body = await request.json().catch(() => null);

  const id = typeof body?.id === "string" ? body.id.trim() : "";

  const scopeType =
    typeof body?.scopeType === "string"
      ? (body.scopeType.trim() as CommissionScopeType)
      : "global";

  const scopeId =
    scopeType === "global"
      ? ""
      : typeof body?.scopeId === "string"
        ? body.scopeId.trim()
        : "";

  const scopeLabel =
    typeof body?.scopeLabel === "string" ? body.scopeLabel.trim() : "";

  const commissionRate = Number(body?.commissionRate);

  const isActive =
    typeof body?.isActive === "boolean" ? body.isActive : true;

  const notes = typeof body?.notes === "string" ? body.notes.trim() : "";

  if (!allowedScopeTypes.has(scopeType)) {
    return jsonError("Invalid commission scope.");
  }

  if (scopeType !== "global" && !scopeId) {
    return jsonError("Target ID is required for this commission scope.");
  }

  if (
    Number.isNaN(commissionRate) ||
    commissionRate < 10 ||
    commissionRate > 30
  ) {
    return jsonError("Commission rate must be between 10% and 30%.");
  }

  const now = new Date().toISOString();

  let existingId = id;

  if (!existingId) {
    let existingQuery = supabase
      .from("commission_settings")
      .select("id")
      .eq("scope_type", scopeType);

    if (scopeType === "global") {
      existingQuery = existingQuery.is("scope_id", null);
    } else {
      existingQuery = existingQuery.eq("scope_id", scopeId);
    }

    const { data: existing } = await existingQuery.maybeSingle();

    existingId = readText((existing || null) as DbRow | null, ["id"]);
  }

  const payload = {
    scope_type: scopeType,
    scope_id: scopeType === "global" ? null : scopeId,
    scope_label:
      scopeType === "global"
        ? "Global default commission"
        : scopeLabel || scopeId,
    commission_rate: commissionRate,
    is_active: isActive,
    notes: notes || null,
    updated_by: user.id,
    updated_at: now,
  };

  if (existingId) {
    const { data: updatedSetting, error: updateError } = await supabase
      .from("commission_settings")
      .update(payload)
      .eq("id", existingId)
      .select("*")
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return jsonOk({
      setting: normalizeSetting(updatedSetting as DbRow),
    });
  }

  const { data: insertedSetting, error: insertError } = await supabase
    .from("commission_settings")
    .insert({
      ...payload,
      created_by: user.id,
      created_at: now,
    })
    .select("*")
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: insertError.message },
      { status: 500 }
    );
  }

  return jsonOk({
    setting: normalizeSetting(insertedSetting as DbRow),
  });
}
