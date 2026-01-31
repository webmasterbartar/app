import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, CartItem } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';

interface CartContextType {
  items: CartItem[];
  addToCart: (productId: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Live query automatically updates the component when DB changes
  const items = useLiveQuery(() => db.cart.toArray()) || [];
  
  const addToCart = async (productId: number) => {
    const existing = await db.cart.where('productId').equals(productId).first();
    if (existing && existing.id) {
      await db.cart.update(existing.id, { quantity: existing.quantity + 1 });
    } else {
      await db.cart.add({ productId, quantity: 1 });
    }
  };

  const removeFromCart = async (productId: number) => {
     const existing = await db.cart.where('productId').equals(productId).first();
     if(existing && existing.id) {
        await db.cart.delete(existing.id);
     }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};