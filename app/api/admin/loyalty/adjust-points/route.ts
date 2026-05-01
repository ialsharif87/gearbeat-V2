import { NextResponse } from "next/server";
import { requireAdminLayoutAccess } from "@/lib/route-guards";

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function cleanInteger(value: unknown) {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  return Math.trunc(numberValue);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const authUserId = cleanText(body.authUserId || body.auth_user_id);
    const points = cleanInteger(body.points);
    const reason = cleanText(body.reason) || "Admin loyalty adjustment";

    if (!authUserId) {
      return NextResponse.json(
        { error: "Customer auth user id is required." },
        { status: 400 }
      );
    }

    if (points === 0) {
      return NextResponse.json(
        { error: "Points adjustment cannot be zero." },
        { status: 400 }
      );
    }

    if (Math.abs(points) > 100000) {
      return NextResponse.json(
        { error: "Points adjustment is too large." },
        { status: 400 }
      );
    }

    const { supabaseAdmin } = await requireAdminLayoutAccess();

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("auth_user_id, full_name, email, role")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (profileError) {
      throw new Error(profileError.message);
    }

    if (!profile) {
      return NextResponse.json(
        { error: "Customer profile not found." },
        { status: 404 }
      );
    }

    if (profile.role !== "customer") {
      return NextResponse.json(
        { error: "Loyalty adjustments are only available for customers." },
        { status: 400 }
      );
    }

    const { data: walletId, error: walletError } = await supabaseAdmin.rpc(
      "ensure_customer_wallet",
      {
        p_auth_user_id: authUserId,
      }
    );

    if (walletError) {
      throw new Error(walletError.message);
    }

    if (!walletId) {
      return NextResponse.json(
        { error: "Could not create or find customer wallet." },
        { status: 500 }
      );
    }

    const { data: walletBefore, error: walletBeforeError } = await supabaseAdmin
      .from("customer_wallets")
      .select("id, points_balance, pending_points, tier_code")
      .eq("id", walletId)
      .maybeSingle();

    if (walletBeforeError) {
      throw new Error(walletBeforeError.message);
    }

    const { data: ledgerId, error: ledgerError } = await supabaseAdmin.rpc(
      "post_loyalty_points",
      {
        p_auth_user_id: authUserId,
        p_event_type: "admin_manual_adjustment",
        p_points: points,
        p_source_type: "admin_adjustment",
        p_source_id: null,
        p_status: "posted",
        p_description: reason,
        p_amount_basis: null,
        p_expires_at: null,
      }
    );

    if (ledgerError) {
      throw new Error(ledgerError.message);
    }

    const { data: newTier, error: tierError } = await supabaseAdmin.rpc(
      "refresh_customer_wallet_tier",
      {
        p_auth_user_id: authUserId,
      }
    );

    if (tierError) {
      console.warn("Tier refresh failed:", tierError.message);
    }

    const { data: walletAfter, error: walletAfterError } = await supabaseAdmin
      .from("customer_wallets")
      .select(`
        id,
        membership_number,
        tier_code,
        points_balance,
        pending_points,
        wallet_balance,
        lifetime_points,
        lifetime_spend,
        referral_code,
        updated_at
      `)
      .eq("id", walletId)
      .maybeSingle();

    if (walletAfterError) {
      throw new Error(walletAfterError.message);
    }

    return NextResponse.json({
      ok: true,
      ledgerId,
      customer: {
        authUserId: profile.auth_user_id,
        fullName: profile.full_name,
        email: profile.email,
      },
      adjustment: {
        points,
        reason,
      },
      walletBefore,
      walletAfter,
      newTier: newTier || walletAfter?.tier_code || null,
      message:
        points > 0
          ? "Loyalty points added successfully."
          : "Loyalty points removed successfully.",
    });
  } catch (error) {
    console.error("Admin loyalty adjustment error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not adjust loyalty points.",
      },
      { status: 500 }
    );
  }
}
