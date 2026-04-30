import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  createOtpSessionPayload,
  generateOtpCode,
  isValidOtpPurpose,
  isValidOtpTargetType,
  isValidOtpTargetValue,
  normalizeOtpTargetValue,
  sendOtpWithConfiguredProvider,
  shouldReturnDevOtpCode,
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

    const targetType = String(body.targetType || "").trim();
    const rawTargetValue = String(body.targetValue || "").trim();
    const purpose = String(body.purpose || "verification").trim();

    if (!isValidOtpTargetType(targetType)) {
      return NextResponse.json(
        { error: "Invalid OTP target type." },
        { status: 400 }
      );
    }

    if (!isValidOtpPurpose(purpose)) {
      return NextResponse.json(
        { error: "Invalid OTP purpose." },
        { status: 400 }
      );
    }

    const targetValue = normalizeOtpTargetValue({
      targetType,
      targetValue: rawTargetValue,
    });

    if (!isValidOtpTargetValue({ targetType, targetValue })) {
      return NextResponse.json(
        { error: "Invalid OTP target value." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const code = generateOtpCode();

    await supabaseAdmin
      .from("otp_verification_sessions")
      .update({
        status: "expired",
      })
      .eq("target_type", targetType)
      .eq("target_value", targetValue)
      .eq("purpose", purpose)
      .eq("status", "pending");

    const { data: session, error: insertError } = await supabaseAdmin
      .from("otp_verification_sessions")
      .insert(
        createOtpSessionPayload(
          {
            authUserId: user?.id || null,
            targetType,
            targetValue,
            purpose,
          },
          code
        )
      )
      .select("id, expires_at")
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    const sendResult = await sendOtpWithConfiguredProvider({
      targetType,
      targetValue,
      code,
      purpose,
    });

    return NextResponse.json({
      ok: true,
      sessionId: session.id,
      expiresAt: session.expires_at,
      provider: sendResult.provider,
      delivered: sendResult.delivered,
      devCode: shouldReturnDevOtpCode() ? code : undefined,
    });
  } catch (error) {
    console.error("OTP send error:", error);

    return NextResponse.json(
      { error: "Could not send OTP." },
      { status: 500 }
    );
  }
}
