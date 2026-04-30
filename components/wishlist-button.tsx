"use client";

import { useState, useEffect } from "react";
import { createClient } from "../lib/supabase/client";
import { useRouter } from "next/navigation";

export default function WishlistButton({ productId }: { productId: string }) {
  const [isWished, setIsWished] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function checkStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("marketplace_wishlists")
        .select("id")
        .eq("product_id", productId)
        .eq("customer_auth_user_id", user.id)
        .maybeSingle();

      setIsWished(!!data);
      setLoading(false);
    }
    checkStatus();
  }, [productId]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    if (isWished) {
      await supabase
        .from("marketplace_wishlists")
        .delete()
        .eq("product_id", productId)
        .eq("customer_auth_user_id", user.id);
      setIsWished(false);
    } else {
      await supabase
        .from("marketplace_wishlists")
        .insert({ product_id: productId, customer_auth_user_id: user.id });
      setIsWished(true);
    }
  };

  if (loading) return <div className="wishlist-skeleton" />;

  return (
    <button 
      onClick={toggleWishlist} 
      className={`wishlist-btn ${isWished ? 'active' : ''}`}
      aria-label="Toggle Wishlist"
    >
      {isWished ? "❤️" : "🤍"}
    </button>
  );
}
