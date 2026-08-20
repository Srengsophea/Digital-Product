"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Edit3,
  ArrowLeft,
  KeyRound,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Step 1 = Request code, Step 2 = Enter code & new password
  const [step, setStep] = useState<"request" | "reset">("request");

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const codeInputRef = useRef<HTMLInputElement>(null);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Focus code input on entering step 2
  useEffect(() => {
    if (step === "reset") {
      setTimeout(() => codeInputRef.current?.focus(), 150);
    }
  }, [step]);

  // Step 1: Send Reset Code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to send password reset code.");
        setLoading(false);
        return;
      }

      setStep("reset");
      setSuccessMsg(`We sent a 6-digit code to ${email}`);
      setResendTimer(60);
      setLoading(false);
    } catch {
      setError("Network error — please check your internet and try again.");
      setLoading(false);
    }
  };

  // Step 2: Reset Password & Sign In
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (code.trim().length !== 6) {
      setError("Please enter the full 6-digit verification code.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code.trim(), newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to reset password.");
        setLoading(false);
        return;
      }

      setSuccessMsg("Password reset successfully! Redirecting...");
      setTimeout(() => {
        router.push(data.redirect || "/account");
        router.refresh();
      }, 700);
    } catch {
      setError("Network error — please try again.");
      setLoading(false);
    }
  };

  // Resend code action
  const handleResend = async () => {
    if (resendTimer > 0 || loading) return;
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to resend code.");
        setLoading(false);
        return;
      }

      setSuccessMsg(`New code sent to ${email}`);
      setResendTimer(60);
      setLoading(false);
    } catch {
      setError("Network error — please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-violet-700 dark:text-violet-300">
            <Sparkles size={13} className="text-cyan-600 dark:text-cyan-300" /> Account Recovery
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight">
            {step === "request" ? (
              <>
                Reset your <span className="text-gradient">password</span>
              </>
            ) : (
              <>
                Enter <span className="text-gradient">verification code</span>
              </>
            )}
          </h1>
          <p className="mt-3 text-sm text-text-muted">
            {step === "request"
              ? "Enter your email address and we'll send you a 6-digit code to reset your password."
              : `We sent a 6-digit verification code to ${email}`}
          </p>
        </div>

        <div className="glass-strong mt-8 rounded-3xl p-7">
          {step === "request" ? (
            /* STEP 1: Request Reset Code */
            <form onSubmit={handleRequestCode}>
              <div>
                <label htmlFor="reset-email" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
                  Your Account Email
                </label>
                <div className="relative">
                  <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    id="reset-email"
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
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Sending reset code…
                  </>
                ) : (
                  <>
                    Send Reset Code <ArrowRight size={17} />
                  </>
                )}
              </button>

              <div className="mt-5 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors"
                >
                  <ArrowLeft size={13} /> Back to sign in
                </Link>
              </div>
            </form>
          ) : (
            /* STEP 2: Enter Code & New Password */
            <form onSubmit={handleResetPassword}>
              <div className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 dark:border-white/10 dark:bg-white/5">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Resetting Password For
                  </p>
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                    {email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep("request");
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-violet-600 hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-white/10"
                >
                  <Edit3 size={13} /> Change
                </button>
              </div>

              <div>
                <label
                  htmlFor="reset-code"
                  className="mb-2 block text-center text-xs font-bold uppercase tracking-widest text-text-muted"
                >
                  Enter 6-Digit Code
                </label>
                <div className="relative">
                  <input
                    ref={codeInputRef}
                    id="reset-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="••••••"
                    className="input-field text-center font-mono text-3xl font-bold tracking-[0.4em] py-3.5"
                    required
                  />
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Min 8 characters"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirm-new-password"
                    className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      id="confirm-new-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Repeat new password"
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

              {successMsg && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
                  <CheckCircle2 size={16} className="shrink-0" />
                  {successMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || code.trim().length !== 6}
                className="btn-primary mt-6 w-full text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Resetting…
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} /> Reset Password & Sign In
                  </>
                )}
              </button>

              <div className="mt-5 flex items-center justify-between text-xs">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 font-semibold text-text-muted hover:text-text-primary transition-colors"
                >
                  <ArrowLeft size={12} /> Back to sign in
                </Link>

                {resendTimer > 0 ? (
                  <span className="text-text-muted">
                    Resend in <strong className="text-violet-500">{resendTimer}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="inline-flex items-center gap-1 font-semibold text-violet-600 hover:text-cyan-700 dark:text-violet-300 dark:hover:text-cyan-300"
                  >
                    <RotateCcw size={12} /> Resend code
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
