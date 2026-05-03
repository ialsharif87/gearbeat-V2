import { TAP_CONFIG, isTapConfigured } from "./config";

export async function createTapCharge({
  amount,
  customerId,
  customerEmail,
  customerName,
  customerPhone,
  bookingId,
  studioId,
  studioDestinationId,
  platformCommissionPercent = 15,
  redirectUrl,
}: {
  amount: number;
  customerId: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  bookingId: string;
  studioId: string;
  studioDestinationId?: string;
  platformCommissionPercent?: number;
  redirectUrl: string;
}) {
  if (!isTapConfigured()) {
    return {
      success: false,
      error: "Tap not configured",
      fallback: true,
    };
  }

  const platformAmount = Math.round(amount * platformCommissionPercent) / 100;
  const destinationAmount = amount - platformAmount;

  const chargePayload = {
    amount,
    currency: TAP_CONFIG.currency,
    customer_initiated: true,
    threeDSecure: true,
    save_card: false,
    description: `GearBeat Studio Booking - ${bookingId}`,
    metadata: {
      booking_id: bookingId,
      studio_id: studioId,
      customer_id: customerId,
    },
    reference: {
      transaction: bookingId,
      order: bookingId,
    },
    receipt: {
      email: true,
      sms: false,
    },
    customer: {
      first_name: customerName.split(" ")[0] || customerName,
      last_name: customerName.split(" ").slice(1).join(" ") || "",
      email: customerEmail,
      phone: customerPhone
        ? {
            country_code: "966",
            number: customerPhone,
          }
        : undefined,
    },
    source: { id: "src_all" },
    post: { url: (process.env.NEXT_PUBLIC_SITE_URL || "") + "/api/tap/webhook" },
    redirect: { url: redirectUrl },
    destinations: studioDestinationId
      ? {
          destination: [
            {
              id: studioDestinationId,
              amount: destinationAmount,
              currency: TAP_CONFIG.currency,
            },
          ],
        }
      : undefined,
  };

  try {
    const response = await fetch(`${TAP_CONFIG.baseUrl}/charges`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TAP_CONFIG.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chargePayload),
    });
    const data = await response.json();
    return { success: true, charge: data };
  } catch (error) {
    return { success: false, error };
  }
}
