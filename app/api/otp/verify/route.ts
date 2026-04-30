import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  hashOtpCode,
  isValidOtpCode,
  isValidOtpPurpose,
  isValidOtpTargetType,
  normalizeOtpTargetValue,
} from "@/lib/otp/provider";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const sessionId = String(body.sessionId || "").trim();
    const code = String(body.code || "").trim();
    const rawTargetType = String(body.targetType || "").trim();
    const rawTargetValue = String(body.targetValue || "").trim();
    const rawPurpose = String(body.purpose || "verification").trim();

    if (!isValidOtpCode(code)) {
      return NextResponse.json(
        { error: "Invalid OTP code." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let query = supabaseAdmin
      .from("otp_verification_sessions")
      .select(
        "id, auth_user_id, target_type, target_value, purpose, code_hash, status, attempt_count, max_attempts, expires_at"
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1);

    if (sessionId) {
      query = query.eq("id", sessionId);
    } else {
      if (!isValidOtpTargetType(rawTargetType)) {
        return NextResponse.json(
          { error: "Invalid OTP target type." },
          { status: 400 }
        );
      }

      if (!isValidOtpPurpose(rawPurpose)) {
        return NextResponse.json(
          { error: "Invalid OTP purpose." },
          { status: 400 }
        );
      }

      const targetValue = normalizeOtpTargetValue({
        targetType: rawTargetType,
        targetValue: rawTargetValue,
      });

      query = query
        .eq("target_type", rawTargetType)
        .eq("target_value", targetValue)
        .eq("purpose", rawPurpose);
    }

    const { data: sessions, error: sessionError } = await query;

    if (sessionError) {
      throw new Error(sessionError.message);
    }

    const session = sessions?.[0];

    if (!session) {
      return NextResponse.json(
        { error: "OTP session not found or expired." },
        { status: 404 }
      );
    }

    if (new Date(session.expires_at).getTime() < Date.now()) {
      await supabaseAdmin
        .from("otp_verification_sessions")
        .update({ status: "expired" })
        .eq("id", session.id);

      return NextResponse.json(
        { error: "OTP code expired." },
        { status: 400 }
      );
    }

    if (Number(session.attempt_count || 0) >= Number(session.max_attempts || 5)) {
      await supabaseAdmin
        .from("otp_verification_sessions")
        .update({ status: "failed" })
        .eq("id", session.id);

      return NextResponse.json(
        { error: "Maximum OTP attempts reached." },
        { status: 429 }
      );
    }

    const codeHash = hashOtpCode(code);
    const isMatch = codeHash === session.code_hash;

    if (!isMatch) {
      await supabaseAdmin
        .from("otp_verification_sessions")
        .update({
          attempt_count: Number(session.attempt_count || 0) + 1,
        })
        .eq("id", session.id);

      return NextResponse.json(
        { error: "Incorrect OTP code." },
        { status: 400 }
      );
    }

    await supabaseAdmin
      .from("otp_verification_sessions")
      .update({
        status: "verified",
        verified_at: new Date().toISOString(),
      })
      .eq("id", session.id);

    const authUserId = user?.id || session.auth_user_id;

    if (authUserId && session.target_type === "phone") {
      await supabaseAdmin
        .from("profiles")
        .update({
          phone_e164: session.target_value,
          phone_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq("auth_user_id", authUserId);
    }

    if (authUserId && session.target_type === "email") {
      await supabaseAdmin
        .from("profiles")
        .update({
          email_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq("auth_user_id", authUserId);
    }

    return NextResponse.json({
      ok: true,
      verified: true,
      targetType: session.target_type,
    });
  } catch (error) {
    console.error("OTP verify error:", error);

    return NextResponse.json(
      { error: "Could not verify OTP." },
      { status: 500 }
    );
  }
}
