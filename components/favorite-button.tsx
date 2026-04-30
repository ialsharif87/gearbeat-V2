"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type FavoriteButtonProps = {
  type: "studio" | "product" | "vendor";
  studioId?: string;
  productId?: string;
  vendorId?: string;
  className?: string;
};

export default function FavoriteButton({
  type,
  studioId,
  productId,
  vendorId,
  className = "btn",
}: FavoriteButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadFavorite() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      setAuthUserId(user.id);

      let query = supabase
        .from("customer_favorites")
        .select("id")
        .eq("auth_user_id", user.id)
        .eq("favorite_type", type)
        .limit(1);

      if (type === "studio" && studioId) {
        query = query.eq("studio_id", studioId);
      }

      if (type === "product" && productId) {
        query = query.eq("product_id", productId);
      }

      if (type === "vendor" && vendorId) {
        query = query.eq("vendor_id", vendorId);
      }

      const { data, error } = await query.maybeSingle();

      if (!error && data) {
        setIsSaved(true);
      }
    }

    loadFavorite();
  }, [type, studioId, productId, vendorId]);

  async function toggleFavorite() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login?account=customer";
      return;
    }

    setAuthUserId(user.id);
    setLoading(true);

    try {
      if (isSaved) {
        let deleteQuery = supabase
          .from("customer_favorites")
          .delete()
          .eq("auth_user_id", user.id)
          .eq("favorite_type", type);

        if (type === "studio" && studioId) {
          deleteQuery = deleteQuery.eq("studio_id", studioId);
        }

        if (type === "product" && productId) {
          deleteQuery = deleteQuery.eq("product_id", productId);
        }

        if (type === "vendor" && vendorId) {
          deleteQuery = deleteQuery.eq("vendor_id", vendorId);
        }

        const { error } = await deleteQuery;

        if (error) {
          throw new Error(error.message);
        }

        setIsSaved(false);
        return;
      }

      const { error } = await supabase.from("customer_favorites").insert({
        auth_user_id: user.id,
        favorite_type: type,
        studio_id: type === "studio" ? studioId : null,
        product_id: type === "product" ? productId : null,
        vendor_id: type === "vendor" ? vendorId : null,
      });

      if (error) {
        throw new Error(error.message);
      }

      setIsSaved(true);
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
      disabled={loading}
      aria-pressed={isSaved}
    >
      <span aria-hidden="true">{isSaved ? "♥" : "♡"}</span>{" "}
      {isSaved ? "Saved" : "Save"}
    </button>
  );
}
