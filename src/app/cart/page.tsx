"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useCart } from "@/components/CartContext";
import { useIsMounted } from "@/lib/useIsMounted";
import { formatMoney } from "@/lib/utils";

export default function CartPage() {
  const { items, total, updateQty, removeItem, count } = useCart();
  const router = useRouter();
  // Gate cart content behind mount to prevent hydration mismatch (server
  // renders an empty cart since localStorage is client-only).
  const mounted = useIsMounted();

  if (!mounted) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-white/5" />
        <div className="mt-10 h-64 animate-pulse rounded-2xl bg-white/5" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-28 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5">
          <ShoppingBag size={32} className="text-text-muted" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">
          Your cart is <span className="text-gradient">empty</span>
        </h1>
        <p className="mt-3 max-w-sm text-text-muted">
          Browse the catalog and add some premium digital products — they&apos;ll
          be delivered to you instantly.
        </p>
        <Link href="/products" className="btn-primary mt-8">
          Browse products <ArrowRight size={17} />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">
        Review
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
        Your <span className="text-gradient">cart</span>
      </h1>
      <p className="mt-2 text-sm text-text-muted">
        {count} item{count === 1 ? "" : "s"} ready for checkout
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="glass flex gap-4 rounded-2xl p-4 sm:items-center"
            >
              <Link
                href={`/products/${item.slug}`}
                className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <Link
                  href={`/products/${item.slug}`}
                  className="truncate font-semibold text-text-primary hover:text-violet-600 dark:text-white dark:hover:text-violet-300"
                >
                  {item.title}
                </Link>
                <p className="mt-0.5 text-sm text-text-muted">
                  {formatMoney(item.price * 100)} each
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
                    <button
                      onClick={() => updateQty(item.productId, item.qty - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-white/10 hover:text-white"
                      aria-label={`Decrease quantity of ${item.title}`}
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-text-primary dark:text-white">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.productId, item.qty + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-white/10 hover:text-white"
                      aria-label={`Increase quantity of ${item.title}`}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="flex items-center gap-1.5 text-xs font-medium text-text-muted transition-colors hover:text-red-400"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>

              <div className="text-right">
                <p className="font-display text-lg font-bold text-text-primary dark:text-white">
                  {formatMoney(item.price * item.qty * 100)}
                </p>
              </div>
            </div>
          ))}

          <Link
            href="/products"
            className="inline-flex items-center gap-2 pt-2 text-sm font-medium text-violet-600 transition-colors hover:text-cyan-700 dark:text-violet-300 dark:hover:text-cyan-300"
          >
            <ArrowRight size={14} className="rotate-180" /> Continue shopping
          </Link>
        </div>

        {/* Summary */}
        <div className="h-fit rounded-2xl border border-slate-200/80 bg-slate-50/80 p-6 lg:sticky lg:top-24 dark:border-white/10 dark:bg-white/[0.03]">
          <h2 className="font-display text-lg font-bold text-text-primary">
            Order summary
          </h2>

          <div className="mt-5 space-y-3 border-b border-slate-200/80 pb-5 text-sm dark:border-white/10">
            <div className="flex justify-between text-text-muted">
              <span>Subtotal</span>
              <span className="font-semibold text-text-primary">
                {formatMoney(total * 100)}
              </span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Delivery</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Instant · Free</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Taxes</span>
              <span className="font-semibold text-text-primary">$0.00</span>
            </div>
          </div>

          <div className="flex justify-between pt-5">
            <span className="text-sm font-medium text-text-muted">Total</span>
            <span className="font-display text-2xl font-bold text-text-primary">
              {formatMoney(total * 100)}
            </span>
          </div>

          <button
            onClick={() => router.push("/checkout")}
            className="btn-primary mt-6 w-full text-base"
          >
            Proceed to checkout <ArrowRight size={17} />
          </button>

          <div className="mt-5 space-y-2.5">
            <p className="flex items-center gap-2 text-xs text-text-muted">
              <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
              Secure encrypted checkout
            </p>
            <p className="flex items-center gap-2 text-xs text-text-muted">
              <Zap size={14} className="text-amber-500" />
              License keys delivered instantly
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
