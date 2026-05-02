import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";

type DbRow = Record<string, unknown>;

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

function readText(row: DbRow | null | undefined, keys: string[], fallback = "") {
  if (!row) return fallback;

  for (const key of keys) {
    const value = row[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return fallback;
}

function readNumber(row: DbRow | null | undefined, keys: string[], fallback = 0) {
  if (!row) return fallback;

  for (const key of keys) {
    const value = row[key];

    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);

      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  return fallback;
}

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

async function isAdminUser(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  appMetadataRole?: string,
  userMetadataRole?: string
) {
  if (appMetadataRole === "admin" || userMetadataRole === "admin") {
    return true;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  const profileRow = (profile || null) as DbRow | null;

  const role = readText(profileRow, [
    "role",
    "user_role",
    "account_type",
    "type",
  ]);

  return role === "admin" || role === "super_admin";
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in." },
      { status: 401 }
    );
  }

  const isAdmin = await isAdminUser(
    supabase,
    user.id,
    typeof user.app_metadata?.role === "string" ? user.app_metadata.role : "",
    typeof user.user_metadata?.role === "string" ? user.user_metadata.role : ""
  );

  if (!isAdmin) {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 403 }
    );
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
    return NextResponse.json(
      { error: "Invalid commission scope." },
      { status: 400 }
    );
  }

  if (scopeType !== "global" && !scopeId) {
    return NextResponse.json(
      { error: "Target ID is required for this commission scope." },
      { status: 400 }
    );
  }

  if (
    Number.isNaN(commissionRate) ||
    commissionRate < 10 ||
    commissionRate > 30
  ) {
    return NextResponse.json(
      { error: "Commission rate must be between 10% and 30%." },
      { status: 400 }
    );
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

    return NextResponse.json({
      ok: true,
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

  return NextResponse.json({
    ok: true,
    setting: normalizeSetting(insertedSetting as DbRow),
  });
}
