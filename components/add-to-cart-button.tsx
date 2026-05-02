"use client";

import { useState } from "react";
import T from "@/components/t";

type AddToCartButtonProps = {
  productId?: string;
  product?: any;
  disabled?: boolean;
  maxQuantity?: number;
};

export default function AddToCartButton({
  productId,
  product,
  disabled = false,
  maxQuantity,
}: AddToCartButtonProps) {
  const resolvedProductId = productId || product?.id || "";
  const resolvedMaxQuantity = Number(
    maxQuantity ?? product?.stock_quantity ?? product?.stockQuantity ?? 1
  );
  const resolvedDisabled =
    disabled || !resolvedProductId || resolvedMaxQuantity <= 0;

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function addToCart() {
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch("/api/marketplace/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: resolvedProductId,
          quantity,
        }),
      });

      if (response.status === 401) {
        window.location.href = "/login?account=customer";
        return;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Could not add to cart.");
      }

      setMessage(data?.message || "Product added to cart.");
      setIsError(false);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not add to cart."
      );
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <label style={{ color: "var(--muted)" }}>
          <T en="Quantity" ar="الكمية" />
        </label>

        <input
          className="input"
          type="number"
          min="1"
          max={Math.max(resolvedMaxQuantity, 1)}
          value={quantity}
          onChange={(event) => {
            const nextValue = Math.max(
              1,
              Math.min(
                Number(event.target.value || 1),
                Math.max(resolvedMaxQuantity, 1)
              )
            );
            setQuantity(nextValue);
          }}
          style={{ maxWidth: 110 }}
          disabled={resolvedDisabled || loading}
        />
      </div>

      <button
        type="button"
        className="btn btn-primary btn-large"
        onClick={addToCart}
        disabled={resolvedDisabled || loading}
      >
        {loading ? (
          <T en="Adding..." ar="جاري الإضافة..." />
        ) : (
          <T en="Add to cart" ar="أضف للسلة" />
        )}
      </button>

      {message ? (
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            color: isError ? "#ffb0b0" : "#baffd7",
            background: isError
              ? "rgba(255,77,77,0.08)"
              : "rgba(0,255,136,0.08)",
            border: isError
              ? "1px solid rgba(255,77,77,0.18)"
              : "1px solid rgba(0,255,136,0.18)",
          }}
        >
          {message}

          {!isError ? (
            <div style={{ marginTop: 8 }}>
              <a href="/marketplace/cart" className="btn btn-small">
                <T en="View cart" ar="عرض السلة" />
              </a>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
