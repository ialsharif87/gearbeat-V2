import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function cleanText(value: unknown) {
  return String(value || "").trim();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const currencyCode = cleanText(searchParams.get("currency") || "SAR");

    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin
      .from("payment_provider_configs")
      .select(`
        provider_code,
        provider_name,
        display_name_en,
        display_name_ar,
        provider_type,
        status,
        checkout_enabled,
        test_mode_enabled,
        supports_card,
        supports_apple_pay,
        supports_mada,
        supports_installments,
        supports_refunds,
        supports_webhooks,
        supported_currencies,
        display_order,
        notes
      `)
      .in("status", ["enabled", "planned"])
      .order("display_order", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    const providers = (data || []).map((provider: any) => {
      const supportedCurrencies = Array.isArray(provider.supported_currencies)
        ? provider.supported_currencies
        : [];

      const currencySupported =
        supportedCurrencies.length === 0 ||
        supportedCurrencies.includes(currencyCode);

      const selectable =
        provider.status === "enabled" &&
        provider.checkout_enabled === true &&
        currencySupported;

      return {
        providerCode: provider.provider_code,
        providerName: provider.provider_name,
        displayNameEn:
          provider.display_name_en || provider.provider_name || provider.provider_code,
        displayNameAr:
          provider.display_name_ar || provider.provider_name || provider.provider_code,
        providerType: provider.provider_type || "payment",
        status: provider.status,
        checkoutEnabled: Boolean(provider.checkout_enabled),
        testModeEnabled: Boolean(provider.test_mode_enabled),
        supportsCard: Boolean(provider.supports_card),
        supportsApplePay: Boolean(provider.supports_apple_pay),
        supportsMada: Boolean(provider.supports_mada),
        supportsInstallments: Boolean(provider.supports_installments),
        supportsRefunds: Boolean(provider.supports_refunds),
        supportsWebhooks: Boolean(provider.supports_webhooks),
        supportedCurrencies,
        currencySupported,
        selectable,
        comingSoon: !selectable,
        notes: provider.notes,
      };
    });

    return NextResponse.json({
      ok: true,
      currencyCode,
      providers,
    });
  } catch (error) {
    console.error("Payment providers API error:", error);

    return NextResponse.json(
      { error: "Could not load payment providers." },
      { status: 500 }
    );
  }
}
