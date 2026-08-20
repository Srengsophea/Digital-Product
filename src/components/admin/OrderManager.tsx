"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { formatMoney } from "@/lib/utils";

interface Order {
  id: string;
  email: string;
  name: string;
  total_cents: number;
  status: string;
  created_at: string;
  item_count: number;
}

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-400/10 text-emerald-400",
  fulfilled: "bg-cyan-400/10 text-cyan-400",
  refunded: "bg-amber-400/10 text-amber-400",
  cancelled: "bg-red-400/10 text-red-400",
};

export function OrderManager({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [updating, setUpdating] = useState<string | null>(null);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    }
    setUpdating(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-semibold text-text-primary">Orders</h2>
          <span className="rounded-full bg-slate-200/60 px-2 py-0.5 text-[11px] font-medium text-text-muted dark:bg-white/[0.06]">
            {orders.length}
          </span>
        </div>
        <button
          onClick={async () => {
            const res = await fetch("/api/admin/orders");
            if (res.ok) setOrders((await res.json()).orders);
          }}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200/80 px-2.5 py-1.5 text-xs text-text-muted transition-colors hover:border-slate-300 hover:text-text-primary dark:border-white/[0.08] dark:hover:border-white/[0.15] dark:hover:text-white"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200/80 dark:border-white/[0.07]">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-100/50 text-[11px] uppercase tracking-wider text-text-muted dark:border-white/[0.06] dark:bg-white/[0.03]">
              <th className="px-5 py-3.5 font-semibold">Order</th>
              <th className="px-5 py-3.5 font-semibold">Customer</th>
              <th className="px-5 py-3.5 font-semibold">Items</th>
              <th className="px-5 py-3.5 font-semibold">Total</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-slate-200/60 transition-colors hover:bg-slate-100/40 dark:border-white/5 dark:hover:bg-white/[0.03]">
                <td className="px-5 py-4 font-mono text-xs text-violet-700 dark:text-violet-300">
                  #{o.id.slice(-10)}
                </td>
                <td className="px-5 py-4">
                  <p className="font-medium text-text-primary">{o.name}</p>
                  <p className="text-xs text-text-muted">{o.email}</p>
                </td>
                <td className="px-5 py-4 text-text-muted">{o.item_count}</td>
                <td className="px-5 py-4 font-semibold text-text-primary">
                  {formatMoney(o.total_cents)}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[o.status] ?? "bg-white/10 text-white"}`}>
                      {o.status}
                    </span>
                    <select
                      value={o.status}
                      disabled={updating === o.id}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className={`cursor-pointer rounded-lg border border-slate-200/80 bg-slate-100/80 px-2 py-1 text-xs font-semibold outline-none transition-colors hover:border-violet-500/40 dark:border-white/10 dark:bg-[#0b0719] ${
                        o.status === "paid"
                          ? "text-amber-600 dark:text-amber-300"
                          : o.status === "fulfilled"
                            ? "text-cyan-600 dark:text-cyan-300"
                            : o.status === "refunded"
                              ? "text-violet-600 dark:text-violet-300"
                              : "text-red-600 dark:text-red-300"
                      }`}
                      aria-label={`Change status for order ${o.id}`}
                    >
                      <option value="paid">paid</option>
                      <option value="fulfilled">fulfilled</option>
                      <option value="refunded">refunded</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                    {updating === o.id && (
                      <Loader2 size={13} className="animate-spin text-violet-400" />
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-xs text-text-muted">
                  {new Date(o.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-text-muted">
                  No orders yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
