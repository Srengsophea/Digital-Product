"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Mail,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Edit3,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  // Step 1 = Form, Step 2 = Verify Code
  const [step, setStep] = useState<"form" | "verify">("form");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const codeInputRef = useRef<HTMLInputElement>(null);

  // Auto redirect if already logged in
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          router.replace(d.user.role === "admin" ? "/admin" : "/account");
        }
      })
      .catch(() => {});
  }, [router]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Focus code input when entering step 2
  useEffect(() => {
    if (step === "verify") {
      setTimeout(() => codeInputRef.current?.focus(), 150);
    }
  }, [step]);

  // Step 1: Send Verification Code
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

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
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to send verification code.");
        setLoading(false);
        return;
      }

      setStep("verify");
      setSuccessMsg(`We sent a 6-digit code to ${email}`);
      setResendTimer(60);
      setLoading(false);
    } catch {
      setError("Network error — please check your internet and try again.");
      setLoading(false);
    }
  };

  // Step 2: Verify Code & Create Account
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (code.trim().length !== 6) {
      setError("Please enter the full 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Verification failed. Please try again.");
        setLoading(false);
        return;
      }

      setSuccessMsg("Account verified successfully! Redirecting...");
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
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
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

  const handleGoogleSignIn = () => {
    setLoading(true);
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-cyan-700 dark:text-cyan-300">
            <Sparkles size={13} className="text-violet-600 dark:text-violet-300" /> Join DIGI VIP
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight">
            {step === "form" ? (
              <>
                Create your <span className="text-gradient">account</span>
              </>
            ) : (
              <>
                Check your <span className="text-gradient">email</span>
              </>
            )}
          </h1>
          <p className="mt-3 text-sm text-text-muted">
            {step === "form"
              ? "One account for instant purchases, licenses, and support."
              : `We sent a 6-digit verification code to ${email}`}
          </p>
        </div>

        <div className="glass-strong mt-8 rounded-3xl p-7">
          {step === "form" ? (
            /* STEP 1: Registration Form */
            <>
              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-400 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Continue with Google
              </button>

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Or with email</span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
              </div>

              <form onSubmit={handleSendCode}>
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
                    Email address
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
                        placeholder="Min 8 chars"
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
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Sending verification code…
                    </>
                  ) : (
                    <>
                      Send Verification Code <ArrowRight size={17} />
                    </>
                  )}
                </button>

                <p className="mt-4 text-center text-xs leading-5 text-text-muted">
                  We will send a 6-digit OTP code to your email to verify your address.
                </p>
              </form>
            </>
          ) : (
            /* STEP 2: Verification Code Input */
            <form onSubmit={handleVerifyCode}>
              <div className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 dark:border-white/10 dark:bg-white/5">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Verifying Email
                  </p>
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                    {email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
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
                  htmlFor="verify-code"
                  className="mb-2 block text-center text-xs font-bold uppercase tracking-widest text-text-muted"
                >
                  Enter 6-digit Code
                </label>
                <div className="relative">
                  <input
                    ref={codeInputRef}
                    id="verify-code"
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
                    <Loader2 size={18} className="animate-spin" /> Verifying…
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} /> Verify & Create Account
                  </>
                )}
              </button>

              <div className="mt-5 text-center">
                {resendTimer > 0 ? (
                  <p className="text-xs text-text-muted">
                    Resend code in <strong className="text-violet-500">{resendTimer}s</strong>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-cyan-700 dark:text-violet-300 dark:hover:text-cyan-300"
                  >
                    <RotateCcw size={13} /> Resend verification code
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

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
