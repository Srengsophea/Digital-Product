"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CartItem {
  productId: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: Omit<CartItem, "qty">) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "digi_vip_cart";

function loadInitialCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  // Lazy initializer reads localStorage exactly once (client-only)
  const [items, setItems] = useState<CartItem[]>(loadInitialCart);

  // Persist on change (skip the very first render before hydration flag)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable
    }
  }, [items]);

  const addItem = (item: Omit<CartItem, "qty">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateQty = (productId: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, qty } : i))
    );
  };

  const clear = () => setItems([]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((acc, i) => acc + i.qty, 0);
    const total = items.reduce((acc, i) => acc + i.qty * i.price, 0);
    return { items, count, total, addItem, removeItem, updateQty, clear };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
