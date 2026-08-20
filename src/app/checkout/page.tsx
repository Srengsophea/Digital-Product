"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Lock,
  ShieldCheck,
  CreditCard,
  KeyRound,
  User,
} from "lucide-react";
import { useCart } from "@/components/CartContext";
import { formatMoney } from "@/lib/utils";

interface CheckoutResponse {
  order: {
    id: string;
    total_cents: number;
    status: string;
    created_at: string;
  };
  licenses: {
    id: string;
    key: string;
    qr_secret: string;
    product_id: string;
    product_title: string;
    product_image: string;
  }[];
}

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const router = useRouter();

  const [sessionUser, setSessionUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setSessionUser(data.user);
          setName(data.user.name);
          setEmail(data.user.email);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const formatCard = (v: string) =>
    v
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ");

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!sessionUser) {
      router.push(`/login?next=/checkout`);
      return;
    }
    if (!name.trim() || !email.trim()) {
      setError("Please provide your name and email.");
      return;
    }
    if (cardNumber.replace(/\s/g, "").length < 16) {
      setError("Please enter a valid 16-digit card number.");
      return;
    }
    if (cardExpiry.length < 5) {
      setError("Please enter a valid expiry date (MM/YY).");
      return;
    }
    if (cardCvc.length < 3) {
      setError("Please enter a valid CVC.");
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?next=/checkout`);
          return;
        }
        setError(data.error ?? "Something went wrong. Please try again.");
        setProcessing(false);
        return;
      }

      clear();
      router.push(`/account/orders/${(data as CheckoutResponse).order.id}`);
    } catch {
      setError("Network error — please try again.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-40">
        <Loader2 className="animate-spin text-violet-400" size={28} />
      </div>
    );
  }

  if (items.length === 0 && !processing) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-28 text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Nothing to <span className="text-gradient">check out</span>
        </h1>
        <p className="mt-3 text-text-muted">Your cart is empty.</p>
        <Link href="/products" className="btn-primary mt-8">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft size={15} /> Back to cart
      </Link>

      <h1 className="mt-6 font-display text-3xl font-bold tracking-tight sm:text-4xl">
        Secure <span className="text-gradient">checkout</span>
      </h1>
      <p className="mt-2 flex items-center gap-2 text-sm text-text-muted">
        <Lock size={14} className="text-emerald-600 dark:text-emerald-400" />
        This is a demo checkout — no real payment is processed.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Form */}
        <form onSubmit={handlePay} className="space-y-6">
          {/* Contact */}
          <section className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-6 dark:border-white/10 dark:bg-white/[0.03]">
            <h2 className="flex items-center gap-2 font-display font-bold text-text-primary">
              <User size={17} className="text-violet-600 dark:text-violet-400" /> Contact details
            </h2>
            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="checkout-name" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
                  Full name
                </label>
                <input
                  id="checkout-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Alex Rivera"
                  autoComplete="name"
                />
              </div>
              <div>
                <label htmlFor="checkout-email" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
                  Email (licenses are sent here)
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="alex@example.com"
                  autoComplete="email"
                />
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-6 dark:border-white/10 dark:bg-white/[0.03]">
            <h2 className="flex items-center gap-2 font-display font-bold text-text-primary">
              <CreditCard size={17} className="text-cyan-600 dark:text-cyan-400" /> Payment method
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="card-number" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
                  Card number
                </label>
                <input
                  id="card-number"
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCard(e.target.value))}
                  className="input-field font-mono tracking-widest"
                  placeholder="4242 4242 4242 4242"
                  autoComplete="cc-number"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="card-expiry" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
                    Expiry
                  </label>
                  <input
                    id="card-expiry"
                    inputMode="numeric"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    className="input-field font-mono"
                    placeholder="MM/YY"
                    autoComplete="cc-exp"
                  />
                </div>
                <div>
                  <label htmlFor="card-cvc" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
                    CVC
                  </label>
                  <input
                    id="card-cvc"
                    inputMode="numeric"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="input-field font-mono"
                    placeholder="123"
                    autoComplete="cc-csc"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs leading-5 text-amber-800 dark:text-amber-200/80">
                <strong className="font-semibold text-amber-700 dark:text-amber-300">Demo mode:</strong>{" "}
                use any card digits. Nothing is charged and no real payment
                happens.
              </div>
            </div>
          </section>

          {error && (
            <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full text-base" disabled={processing}>
            {processing ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Processing payment…
              </>
            ) : (
              <>
                <Lock size={17} /> Pay {formatMoney(total * 100)}
              </>
            )}
          </button>
        </form>

        {/* Summary */}
        <div className="h-fit rounded-2xl border border-slate-200/80 bg-slate-50/80 p-6 lg:sticky lg:top-24 dark:border-white/10 dark:bg-white/[0.03]">
          <h2 className="font-display text-lg font-bold text-text-primary">Order summary</h2>
          <div className="mt-5 space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg">
                  <Image src={item.image} alt={item.title} fill sizes="64px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text-primary">{item.title}</p>
                  <p className="text-xs text-text-muted">Qty {item.qty}</p>
                </div>
                <span className="text-sm font-semibold text-text-primary">
                  {formatMoney(item.price * item.qty * 100)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2.5 border-t border-slate-200/80 pt-4 text-sm dark:border-white/10">
            <div className="flex justify-between text-text-muted">
              <span>Subtotal</span>
              <span className="text-text-primary">{formatMoney(total * 100)}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Delivery</span>
              <span className="text-emerald-600 dark:text-emerald-400">Instant · Free</span>
            </div>
          </div>

          <div className="mt-4 flex justify-between border-t border-slate-200/80 pt-4 dark:border-white/10">
            <span className="font-medium text-text-muted">Total</span>
            <span className="font-display text-2xl font-bold text-text-primary">
              {formatMoney(total * 100)}
            </span>
          </div>

          <div className="mt-5 space-y-2">
            <p className="flex items-center gap-2 text-xs text-text-muted">
              <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
              Encrypted connection
            </p>
            <p className="flex items-center gap-2 text-xs text-text-muted">
              <KeyRound size={14} className="text-violet-600 dark:text-violet-400" />
              License keys delivered instantly after payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
