"use client";

import { useCart } from "../context/cart-context";
import Link from "next/link";

export default function CartBadge() {
  const { totalItems } = useCart();

  return (
    <Link href="/cart" className="gb-cart-link" aria-label="Cart">
      <span className="icon">🛒</span>
      <span className="badge">{totalItems}</span>
    </Link>
  );
}
