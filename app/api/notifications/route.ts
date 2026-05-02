import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

type DbRow = Record<string, unknown>;

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

function normalizeNotification(row: DbRow) {
  return {
    id: readText(row, ["id"]),
    title: readText(row, ["title"]),
    body: readText(row, ["body"]),
    notificationType: readText(row, ["notification_type"], "general"),
    entityType: readText(row, ["entity_type"]),
    entityId: readText(row, ["entity_id"]),
    actionUrl: readText(row, ["action_url"]),
    isRead: Boolean(row.is_read),
    createdAt: readText(row, ["created_at"]),
  };
}

async function getUserAudience(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  appMetadataRole?: string,
  userMetadataRole?: string
) {
  if (appMetadataRole === "admin" || userMetadataRole === "admin") {
    return "admin";
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

  if (role === "admin" || role === "super_admin") return "admin";
  if (role === "owner" || role === "studio_owner") return "owner";
  if (role === "vendor" || role === "seller") return "vendor";

  return "customer";
}

export async function GET() {
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

  const audience = await getUserAudience(
    supabase,
    user.id,
    typeof user.app_metadata?.role === "string" ? user.app_metadata.role : "",
    typeof user.user_metadata?.role === "string" ? user.user_metadata.role : ""
  );

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .or(`user_id.eq.${user.id},audience.eq.${audience},audience.eq.user`)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({
      notifications: [],
      unreadCount: 0,
    });
  }

  const notifications = ((data || []) as DbRow[]).map(normalizeNotification);
  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return NextResponse.json({
    notifications,
    unreadCount,
  });
}
