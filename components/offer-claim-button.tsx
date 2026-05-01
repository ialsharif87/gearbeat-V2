"use client";

import { useState } from "react";
import T from "@/components/t";

type OfferClaimButtonProps = {
  offerId: string;
  couponCode?: string | null;
  className?: string;
};

export default function OfferClaimButton({
  offerId,
  couponCode,
  className = "btn btn-primary",
}: OfferClaimButtonProps) {
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [message, setMessage] = useState("");

  async function claimOffer() {
    if (!offerId) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/offers/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          offerId,
        }),
      });

      if (response.status === 401) {
        window.location.href = "/login?account=customer";
        return;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Could not claim offer.");
      }

      setClaimed(Boolean(data?.ok));
      setMessage(data?.message || "Offer claimed.");

      if (data?.couponCode) {
        try {
          await navigator.clipboard.writeText(data.couponCode);
        } catch {
          // Clipboard is optional.
        }
      }
    } catch (error) {
      console.error("Claim offer failed:", error);
      setMessage("Could not claim offer. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <button
        type="button"
        className={className}
        onClick={claimOffer}
        disabled={loading || claimed}
      >
        {loading ? (
          <T en="Claiming..." ar="جاري الحفظ..." />
        ) : claimed ? (
          <T en="Claimed" ar="تم حفظ العرض" />
        ) : couponCode ? (
          <T en="Claim & copy code" ar="احفظ وانسخ الكود" />
        ) : (
          <T en="Claim offer" ar="احفظ العرض" />
        )}
      </button>

      {message ? (
        <p
          style={{
            color: claimed ? "#00ff88" : "#ffb020",
            fontSize: "0.85rem",
            margin: 0,
          }}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
