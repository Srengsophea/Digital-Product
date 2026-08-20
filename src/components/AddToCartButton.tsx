"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Check, Lock } from "lucide-react";
import { useCart, type CartItem } from "./CartContext";

interface AddToCartButtonProps {
  product: Omit<CartItem, "qty">;
  isAuthenticated: boolean;
}

export function AddToCartButton({
  product,
  isAuthenticated,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);

  // Redirect unauthenticated users to login, then return to this product.
  const requireAuth = () => {
    router.push(`/login?next=/products/${product.slug}`);
  };

  const handleAdd = () => {
    if (!isAuthenticated) {
      requireAuth();
      return;
    }
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      requireAuth();
      return;
    }
    addItem(product);
    router.push("/checkout");
  };

  return (
    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
      <button
        onClick={handleAdd}
        className={`btn-primary flex-1 text-base ${added ? "!bg-gradient-to-r !from-emerald-500 !to-teal-500" : ""}`}
      >
        {added ? (
          <>
            <Check size={18} /> Added to cart
          </>
        ) : (
          <>
            <ShoppingBag size={18} /> Add to cart
          </>
        )}
      </button>
      <button
        onClick={handleBuyNow}
        className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border-2 border-slate-900 bg-slate-900 px-5 py-3.5 text-base font-bold text-white shadow-md transition-all hover:bg-slate-800 hover:border-slate-800 dark:border-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
      >
        <Lock size={16} /> Buy now
      </button>
    </div>
  );
}
