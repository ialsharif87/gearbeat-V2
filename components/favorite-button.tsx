"use client";

import { useEffect, useMemo, useState } from "react";

type FavoriteType = "studio" | "product" | "vendor";

type FavoriteButtonProps = {
  type: FavoriteType;
  studioId?: string;
  productId?: string;
  vendorId?: string;
  className?: string;
  compact?: boolean;
};

function getTargetId({
  type,
  studioId,
  productId,
  vendorId,
}: {
  type: FavoriteType;
  studioId?: string;
  productId?: string;
  vendorId?: string;
}) {
  if (type === "studio") {
    return studioId || "";
  }

  if (type === "product") {
    return productId || "";
  }

  return vendorId || "";
}

export default function FavoriteButton({
  type,
  studioId,
  productId,
  vendorId,
  className = "btn",
  compact = false,
}: FavoriteButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const targetId = useMemo(
    () =>
      getTargetId({
        type,
        studioId,
        productId,
        vendorId,
      }),
    [type, studioId, productId, vendorId]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadFavoriteStatus() {
      if (!targetId) {
        return;
      }

      try {
        const response = await fetch("/api/favorites/status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            favoriteType: type,
            targetId,
          }),
        });

        const result = await response.json().catch(() => null);

        if (!isMounted || !result) {
          return;
        }

        setIsSaved(Boolean(result.saved));
      } catch (error) {
        console.warn("Could not load favorite status:", error);
      }
    }

    loadFavoriteStatus();

    return () => {
      isMounted = false;
    };
  }, [type, targetId]);

  async function toggleFavorite() {
    if (!targetId) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/favorites/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          favoriteType: type,
          targetId,
        }),
      });

      if (response.status === 401) {
        window.location.href = "/login?account=customer";
        return;
      }

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error || "Could not update favorite.");
      }

      setIsSaved(Boolean(result?.saved));
    } catch (error) {
      console.error("Favorite toggle failed:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className={className}
      onClick={toggleFavorite}
      disabled={loading || !targetId}
      aria-pressed={isSaved}
      aria-label={isSaved ? "Remove from saved" : "Save"}
      title={isSaved ? "Saved" : "Save"}
    >
      <span aria-hidden="true">{isSaved ? "♥" : "♡"}</span>
      {compact ? null : (
        <>
          {" "}
          {isSaved ? "Saved" : "Save"}
        </>
      )}
    </button>
  );
}
