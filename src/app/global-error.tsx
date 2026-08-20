"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ background: "#06030f", color: "#f3f0ff", fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
          <div className="aurora-blob left-1/4 top-0 h-72 w-72 bg-violet-600/25" />
          <div className="aurora-blob bottom-0 right-1/4 h-72 w-72 bg-cyan-500/15" />

          <div className="relative mx-auto w-full max-w-xl text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5">
              <AlertTriangle size={36} className="text-amber-400" />
            </div>
            <h1 className="mt-8 font-display text-4xl font-bold tracking-tight text-white">
              Something went <span className="text-gradient-pink">wrong</span>
            </h1>
            <p className="mx-auto mt-4 max-w-md text-base leading-7 text-text-secondary">
              An unexpected error occurred. Please try again, or head back home.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button onClick={reset} className="btn-primary inline-flex">
                <RotateCcw size={16} />
                Try again
              </button>
              <Link href="/" className="btn-secondary inline-flex">
                <Home size={16} />
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
