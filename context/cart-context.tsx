"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type CartItem = {
  id: string;
  name_en: string;
  name_ar: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (product: any) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

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
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('gb_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product: any) => {
    setItems(current => {
      const existing = current.find(i => i.id === product.id);
      if (existing) {
        return current.map(i => 
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...current, {
        id: product.id,
        name_en: product.name_en,
        name_ar: product.name_ar,
        price: product.base_price,
        image: product.images?.[0]?.image_url || '',
        quantity: 1
      }];
    });
  };

  const removeItem = (id: string) => {
    setItems(current => current.filter(i => i.id !== id));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, totalItems, totalPrice }}>
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
