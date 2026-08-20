import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogIn, Home } from "lucide-react";

export default function Forbidden() {
  return (
    <div className="relative flex min-h-[70vh] flex-1 items-center justify-center overflow-hidden px-4 py-16">
      {/* Aurora glow */}
      <div className="aurora-blob left-1/4 top-0 h-72 w-72 bg-violet-600/25" />
      <div className="aurora-blob bottom-0 right-1/4 h-72 w-72 bg-cyan-500/15" />

      <div className="relative mx-auto w-full max-w-xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-red-500/10 backdrop-blur-xl">
          <ShieldAlert size={38} className="text-red-400" />
        </div>

        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
          403 · Access denied
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Admin area is{" "}
          <span className="text-gradient-pink">restricted</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-text-secondary">
          Your account doesn&apos;t have admin privileges to view this page. If
          you believe this is a mistake, sign in with an admin account.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn-secondary inline-flex">
            <Home size={16} />
            Back to home
          </Link>
          <form action="/api/auth/logout" method="post">
            <input type="hidden" name="next" value="/login" />
            <button type="submit" className="btn-primary inline-flex w-full">
              <LogIn size={16} />
              Switch account
            </button>
          </form>
        </div>

        <Link
          href="/account"
          className="mt-8 inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-violet-300"
        >
          <ArrowLeft size={15} />
          Go to my customer dashboard instead
        </Link>
      </div>
    </div>
  );
}
