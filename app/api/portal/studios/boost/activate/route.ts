import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { studioId, boostAddition, duration, baseRate, userId } = await request.json();

  if (!studioId || !userId) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  // Security check: ensure user owns the studio
  const { data: studio } = await supabase
    .from("studios")
    .select("id")
    .eq("id", studioId)
    .eq("owner_auth_user_id", user.id)
    .maybeSingle();

  if (!studio) {
    return NextResponse.json({ error: "Studio not found or unauthorized" }, { status: 403 });
  }

  // Check if there is already an active boost
  const { data: existingBoost } = await supabase
    .from("studio_boost_subscriptions")
    .select("id")
    .eq("studio_id", studioId)
    .eq("status", "active")
    .gt("ends_at", new Date().toISOString())
    .maybeSingle();

  if (existingBoost) {
    return NextResponse.json({ error: "Studio already has an active boost" }, { status: 400 });
  }

  // Insert new boost
  const { error } = await supabase
    .from("studio_boost_subscriptions")
    .insert({
      studio_id: studioId,
      owner_auth_user_id: user.id,
      base_commission_percent: baseRate,
      boost_commission_percent: boostAddition,
      duration_days: duration,
      terms_accepted: true,
      terms_accepted_at: new Date().toISOString(),
      status: 'active'
    });

  if (error) {
    console.error("Boost activation error:", error);
    return NextResponse.json({ error: "Failed to activate boost" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
