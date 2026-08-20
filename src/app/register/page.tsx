"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, User, Sparkles, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed");
        setLoading(false);
        return;
      }
      router.push("/account");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-cyan-700 dark:text-cyan-300">
            <Sparkles size={13} className="text-violet-600 dark:text-violet-300" /> Join the VIP club
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight">
            Create your <span className="text-gradient">account</span>
          </h1>
          <p className="mt-3 text-sm text-text-muted">
            One account for instant purchases, licenses, and support.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-strong mt-8 rounded-3xl p-7">
          <div>
            <label htmlFor="register-name" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
              Full name
            </label>
            <div className="relative">
              <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                id="register-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field pl-10"
                placeholder="Alex Rivera"
                autoComplete="name"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="register-email" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
              Email
            </label>
            <div className="relative">
              <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                id="register-email"
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

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="register-password" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="register-confirm" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
                Confirm
              </label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  id="register-confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  required
                />
              </div>
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
            {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={17} />}
            {loading ? "Creating account…" : "Create account"}
          </button>

          <p className="mt-4 text-center text-xs leading-5 text-text-muted">
            By creating an account you agree to our Terms of Service and
            acknowledge the 30-day refund policy.
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-violet-600 hover:text-cyan-700 dark:text-violet-300 dark:hover:text-cyan-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
