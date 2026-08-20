"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock, Mail, KeyRound, Sparkles } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed");
        setLoading(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail("demo@digivip.io");
    setPassword("demo123");
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-violet-700 dark:text-violet-300">
            <Sparkles size={13} className="text-cyan-600 dark:text-cyan-300" /> Welcome back
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight">
            Sign in to <span className="text-gradient">DIGI VIP</span>
          </h1>
          <p className="mt-3 text-sm text-text-muted">
            Access your licenses, orders, and instant downloads.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-strong mt-8 rounded-3xl p-7">
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
              Email
            </label>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="login-password" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-6 w-full text-base"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={17} />}
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <button
            type="button"
            onClick={fillDemo}
            className="btn-ghost mt-3 w-full text-xs text-text-muted hover:text-violet-600 dark:hover:text-violet-300"
          >
            Use demo account (demo@digivip.io)
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          New to DIGI VIP?{" "}
          <Link href="/register" className="font-semibold text-violet-600 hover:text-cyan-700 dark:text-violet-300 dark:hover:text-cyan-300">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center py-40"><Loader2 size={28} className="animate-spin text-violet-400" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
