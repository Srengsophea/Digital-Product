import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group flex items-center gap-2.5 ${className}`}
      aria-label="DIGI VIP home"
    >
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/30 transition-transform group-hover:scale-105">
        <Sparkles className="h-4.5 w-4.5 text-white" size={18} strokeWidth={2.2} />
        <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 opacity-50 blur-md transition-opacity group-hover:opacity-80" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          DIGI<span className="text-gradient"> VIP</span>
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-600 dark:text-slate-400">
          Digital Marketplace
        </span>
      </span>
    </Link>
  );
}
