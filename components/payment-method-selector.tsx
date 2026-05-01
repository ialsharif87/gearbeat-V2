"use client";

import { useEffect, useMemo, useState } from "react";
import T from "@/components/t";

type PaymentProviderOption = {
  providerCode: string;
  providerName: string;
  displayNameEn: string;
  displayNameAr: string;
  providerType: string;
  status: string;
  checkoutEnabled: boolean;
  testModeEnabled: boolean;
  supportsCard: boolean;
  supportsApplePay: boolean;
  supportsMada: boolean;
  supportsInstallments: boolean;
  supportsRefunds: boolean;
  supportsWebhooks: boolean;
  supportedCurrencies: string[];
  currencySupported: boolean;
  selectable: boolean;
  comingSoon: boolean;
  notes?: string | null;
};

type PaymentMethodSelectorProps = {
  currencyCode?: string;
  defaultProviderCode?: string;
  providerInputName?: string;
  paymentMethodInputName?: string;
  installmentProviderInputName?: string;
  compact?: boolean;
};

function getPaymentMethodForProvider(provider: PaymentProviderOption | null) {
  if (!provider) {
    return "";
  }

  if (provider.providerType === "installment") {
    return "installment";
  }

  if (provider.supportsCard || provider.supportsMada || provider.supportsApplePay) {
    return "card";
  }

  if (provider.providerType === "manual") {
    return "manual";
  }

  return provider.providerType || "payment";
}

function getInstallmentProvider(provider: PaymentProviderOption | null) {
  if (!provider) {
    return "";
  }

  if (provider.providerType === "installment") {
    return provider.providerCode;
  }

  return "";
}

function getProviderIcon(providerCode: string) {
  if (providerCode === "tabby") {
    return "🟩";
  }

  if (providerCode === "tamara") {
    return "🟪";
  }

  if (providerCode === "manual") {
    return "🧪";
  }

  if (providerCode === "network_international") {
    return "💳";
  }

  if (providerCode === "card_gateway") {
    return "💳";
  }

  return "💰";
}

export default function PaymentMethodSelector({
  currencyCode = "SAR",
  defaultProviderCode = "manual",
  providerInputName = "payment_provider",
  paymentMethodInputName = "payment_method",
  installmentProviderInputName = "installment_provider",
  compact = false,
}: PaymentMethodSelectorProps) {
  const [providers, setProviders] = useState<PaymentProviderOption[]>([]);
  const [selectedProviderCode, setSelectedProviderCode] =
    useState(defaultProviderCode);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProviders() {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await fetch(
          `/api/payments/providers?currency=${encodeURIComponent(currencyCode)}`
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.error || "Could not load payment methods.");
        }

        const nextProviders = Array.isArray(data?.providers)
          ? data.providers
          : [];

        if (!isMounted) {
          return;
        }

        setProviders(nextProviders);

        const defaultProvider = nextProviders.find(
          (provider: PaymentProviderOption) =>
            provider.providerCode === defaultProviderCode && provider.selectable
        );

        const firstSelectableProvider = nextProviders.find(
          (provider: PaymentProviderOption) => provider.selectable
        );

        setSelectedProviderCode(
          defaultProvider?.providerCode ||
            firstSelectableProvider?.providerCode ||
            ""
        );
      } catch (error) {
        console.error("Payment providers load failed:", error);

        if (isMounted) {
          setErrorMessage("Could not load payment methods.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProviders();

    return () => {
      isMounted = false;
    };
  }, [currencyCode, defaultProviderCode]);

  const selectedProvider = useMemo(
    () =>
      providers.find(
        (provider) => provider.providerCode === selectedProviderCode
      ) || null,
    [providers, selectedProviderCode]
  );

  const paymentMethod = getPaymentMethodForProvider(selectedProvider);
  const installmentProvider = getInstallmentProvider(selectedProvider);

  return (
    <div
      className="card"
      style={{
        padding: compact ? 16 : 22,
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <input
        type="hidden"
        name={providerInputName}
        value={selectedProvider?.providerCode || ""}
        readOnly
      />

      <input
        type="hidden"
        name={paymentMethodInputName}
        value={paymentMethod}
        readOnly
      />

      <input
        type="hidden"
        name={installmentProviderInputName}
        value={installmentProvider}
        readOnly
      />

      <div>
        <span className="badge badge-gold">
          <T en="Payment" ar="الدفع" />
        </span>

        <h3 style={{ marginTop: 10 }}>
          <T en="Choose payment method" ar="اختر طريقة الدفع" />
        </h3>

        {!compact ? (
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            <T
              en="Some payment methods are prepared for future activation and may appear as coming soon."
              ar="بعض طرق الدفع مجهزة للتفعيل لاحقًا وقد تظهر كخيارات قادمة."
            />
          </p>
        ) : null}
      </div>

      {loading ? (
        <div
          style={{
            marginTop: 16,
            padding: 18,
            borderRadius: 14,
            background: "rgba(255,255,255,0.04)",
            color: "var(--muted)",
          }}
        >
          <T en="Loading payment methods..." ar="جاري تحميل طرق الدفع..." />
        </div>
      ) : null}

      {errorMessage ? (
        <div
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 14,
            background: "rgba(255,77,77,0.08)",
            border: "1px solid rgba(255,77,77,0.18)",
            color: "#ffb0b0",
          }}
        >
          {errorMessage}
        </div>
      ) : null}

      {!loading && providers.length > 0 ? (
        <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
          {providers.map((provider) => {
            const isSelected = selectedProviderCode === provider.providerCode;
            const disabled = !provider.selectable;

            return (
              <button
                key={provider.providerCode}
                type="button"
                disabled={disabled}
                onClick={() => {
                  if (!disabled) {
                    setSelectedProviderCode(provider.providerCode);
                  }
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: 16,
                  borderRadius: 16,
                  border: isSelected
                    ? "1px solid rgba(207,167,98,0.75)"
                    : "1px solid rgba(255,255,255,0.08)",
                  background: isSelected
                    ? "rgba(207,167,98,0.12)"
                    : "rgba(255,255,255,0.04)",
                  color: disabled ? "rgba(255,255,255,0.45)" : "white",
                  cursor: disabled ? "not-allowed" : "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: "1.4rem" }}>
                    {getProviderIcon(provider.providerCode)}
                  </span>

                  <span>
                    <strong>
                      {provider.displayNameEn} / {provider.displayNameAr}
                    </strong>

                    <span
                      style={{
                        display: "block",
                        color: "var(--muted)",
                        fontSize: "0.85rem",
                        marginTop: 4,
                      }}
                    >
                      {provider.supportsInstallments ? (
                        <T
                          en="Installment payment placeholder"
                          ar="خيار تقسيط مجهز لاحقًا"
                        />
                      ) : provider.providerType === "manual" ? (
                        <T
                          en="Manual/testing payment"
                          ar="دفع يدوي / اختبار"
                        />
                      ) : (
                        <T
                          en="Card payment placeholder"
                          ar="خيار دفع بالبطاقة مجهز لاحقًا"
                        />
                      )}
                    </span>
                  </span>
                </span>

                <span>
                  {provider.selectable ? (
                    isSelected ? (
                      <span className="badge badge-success">
                        <T en="Selected" ar="مختار" />
                      </span>
                    ) : (
                      <span className="badge">
                        <T en="Available" ar="متاح" />
                      </span>
                    )
                  ) : (
                    <span className="badge">
                      <T en="Coming soon" ar="قريبًا" />
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {!loading && providers.length === 0 ? (
        <div
          style={{
            marginTop: 16,
            padding: 18,
            borderRadius: 14,
            background: "rgba(255,176,32,0.08)",
            border: "1px solid rgba(255,176,32,0.18)",
            color: "#ffdd99",
          }}
        >
          <T
            en="No payment methods are configured yet."
            ar="لا توجد طرق دفع مفعلة حاليًا."
          />
        </div>
      ) : null}

      {!compact ? (
        <p style={{ marginTop: 14, color: "var(--muted)", fontSize: "0.85rem" }}>
          <T
            en="Tabby and Tamara are placeholders until commercial activation and provider integration are completed."
            ar="تابي وتمارا خيارات جاهزة لاحقًا إلى أن يتم التفعيل التجاري والربط التقني."
          />
        </p>
      ) : null}
    </div>
  );
}
