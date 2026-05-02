import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

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

  const body = await request.json().catch(() => null);
  const notificationId =
    typeof body?.notificationId === "string" ? body.notificationId.trim() : "";

  if (!notificationId) {
    return NextResponse.json(
      { error: "Notification ID is required." },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      read_at: now,
    })
    .eq("id", notificationId)
    .or(`user_id.eq.${user.id},user_id.is.null`);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
  });
}
