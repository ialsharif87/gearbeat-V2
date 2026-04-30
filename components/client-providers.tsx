"use client";

import { CartProvider } from "../context/cart-context";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
}
