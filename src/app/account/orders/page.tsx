"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Package, Loader2 } from "lucide-react";
import { formatMoney } from "@/lib/utils";

interface Order {
  id: string;
  total_cents: number;
  status: string;
  created_at: string;
  item_count: number;
  items?: {
    product_id: string;
    title: string;
    price_cents: number;
    product_image: string;
  }[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    fetch("/api/account/orders")
      .then((r) => r.json())
      .then((d) => {
        if (d.orders) setOrders(d.orders);
        else setOrders([]);
      })
      .catch(() => setOrders([]));
  }, []);

  if (!orders) {
    return (
      <div className="flex flex-1 items-center justify-center py-40">
        <Loader2 size={28} className="animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/account"
        className="inline-flex items-center gap-2 text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowRight size={15} className="rotate-180" /> Back to dashboard
      </Link>
      <h1 className="mt-5 font-display text-3xl font-bold tracking-tight">
        My <span className="text-gradient">orders</span>
      </h1>
      <p className="mt-2 text-sm text-text-muted">
        All your purchases, licenses and receipts in one place.
      </p>

      {orders.length === 0 ? (
        <div className="mt-14 flex flex-col items-center rounded-3xl border border-dashed border-slate-200/80 py-20 text-center dark:border-white/10">
          <Package size={32} className="text-text-muted" />
          <p className="mt-4 font-display text-lg font-semibold text-text-primary">
            No orders yet
          </p>
          <Link href="/products" className="btn-secondary mt-5 text-sm">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {orders.map((o) => (
            <div key={o.id} className="glass rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-sm text-violet-700 dark:text-violet-300">
                    #{o.id.slice(-10)}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {new Date(o.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg font-bold text-text-primary">
                    {formatMoney(o.total_cents)}
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {o.status}
                  </span>
                  <Link
                    href={`/account/orders/${o.id}`}
                    className="btn-ghost px-3 py-1.5 text-xs"
                  >
                    View licenses <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              {o.items && o.items.length > 0 && (
                <div className="mt-4 border-t border-slate-200/80 pt-4 dark:border-white/5">
                  {o.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 py-1.5">
                      <span className="text-sm text-text-muted">{item.title}</span>
                      <span className="ml-auto text-sm text-text-primary">
                        {formatMoney(item.price_cents)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
