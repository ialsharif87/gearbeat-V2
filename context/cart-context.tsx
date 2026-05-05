"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

type CartItem = {
  id: string;
  name_en: string;
  name_ar: string;
  price: number;
  image: string;
  quantity: number;
  variantId?: string;
  vendorId?: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (product: any, variant?: any) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  syncWithDB: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('gb_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to load cart", e);
      }
    }
    setIsLoading(false);
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('gb_cart', JSON.stringify(items));
  }, [items]);

  const syncWithDB = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || items.length === 0) return;

    try {
      // Create or get active cart
      const response = await fetch('/api/marketplace/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sync_items: items.map(i => ({
            productId: i.id,
            variantId: i.variantId,
            quantity: i.quantity
          }))
        })
      });
      
      if (response.ok) {
        console.log("Cart synced with DB successfully");
      }
    } catch (error) {
      console.error("Cart sync failed:", error);
    }
  }, [items, supabase]);

  const addItem = (product: any, variant?: any) => {
    setItems(current => {
      const existing = current.find(i => i.id === product.id && i.variantId === variant?.id);
      if (existing) {
        return current.map(i => 
          (i.id === product.id && i.variantId === variant?.id) ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...current, {
        id: product.id,
        name_en: product.name_en,
        name_ar: product.name_ar,
        price: variant ? (product.base_price + (variant.price_adjustment || 0)) : (product.sale_price || product.base_price),
        image: product.images?.[0]?.image_url || product.cover_image_url || '',
        quantity: 1,
        variantId: variant?.id,
        vendorId: product.vendor_id
      }];
    });
  };

  const removeItem = (id: string) => {
    setItems(current => current.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(current => current.map(i => i.id === id ? { ...i, quantity } : i));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('gb_cart');
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, syncWithDB, totalItems, totalPrice, isLoading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
