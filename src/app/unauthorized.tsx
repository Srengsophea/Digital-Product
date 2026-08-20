import Link from "next/link";
import { Lock, ArrowRight, Home } from "lucide-react";

export default function Unauthorized() {
  return (
    <div className="relative flex min-h-[70vh] flex-1 items-center justify-center overflow-hidden px-4 py-16">
      {/* Aurora glow */}
      <div className="aurora-blob left-1/4 top-0 h-72 w-72 bg-violet-600/25" />
      <div className="aurora-blob bottom-0 right-1/4 h-72 w-72 bg-cyan-500/15" />

      <div className="relative mx-auto w-full max-w-xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-slate-200/80 bg-slate-100/50 shadow-2xl shadow-violet-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <Lock size={34} className="text-violet-600 dark:text-violet-400" />
        </div>

        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-violet-600 dark:text-violet-400">
          401 · Sign in required
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
          This page is{" "}
          <span className="text-gradient">members only</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-text-secondary">
          You need to be signed in to access this page. Create a free account
          or sign in to continue.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn-secondary inline-flex">
            <Home size={16} />
            Back to home
          </Link>
          <Link href="/login" className="btn-primary inline-flex">
            Sign in
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
