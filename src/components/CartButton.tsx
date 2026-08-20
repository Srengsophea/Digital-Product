"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./CartContext";
import { useIsMounted } from "@/lib/useIsMounted";

export function CartButton() {
  const { count } = useCart();
  // Only render cart-derived UI after mount so the server HTML (count = 0)
  // matches the client's first render — prevents hydration mismatches.
  const mounted = useIsMounted();

  const displayCount = mounted ? count : 0;

  return (
    <Link
      href="/cart"
      aria-label={`Cart with ${displayCount} item${displayCount === 1 ? "" : "s"}`}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-slate-800 transition-colors hover:border-violet-600 hover:bg-slate-200 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-white"
    >
      <ShoppingBag size={18} />
      {displayCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-1 text-[10px] font-bold text-white shadow-lg shadow-violet-500/40">
          {displayCount > 99 ? "99+" : displayCount}
        </span>
      )}
    </Link>
  );
}
