import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group flex items-center gap-2.5 shrink-0 ${className}`}
      aria-label="DIGI VIP home"
    >
      {/* Animated SVG Diamond Crystal Icon */}
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-violet-500/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-violet-500/50">
        <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-600 via-pink-500 to-cyan-400 opacity-60 blur-md transition-opacity duration-300 group-hover:opacity-100 animate-pulse" />
        <span className="relative flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950/90 backdrop-blur-xs">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 transition-transform duration-500 group-hover:rotate-12"
          >
            <defs>
              <linearGradient id="logo-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="logo-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>
            <path
              d="M12 2L19 9L12 22L5 9L12 2Z"
              fill="url(#logo-grad-1)"
              opacity="0.9"
            />
            <path
              d="M12 2L19 9H5L12 2Z"
              fill="url(#logo-grad-2)"
              opacity="0.95"
            />
            <circle cx="12" cy="9" r="1.5" fill="#ffffff" className="animate-ping" />
            <path
              d="M12 6.5L12.8 8.2L14.5 9L12.8 9.8L12 11.5L11.2 9.8L9.5 9L11.2 8.2L12 6.5Z"
              fill="#ffffff"
            />
          </svg>
        </span>
      </span>

      <span className="flex flex-col leading-none whitespace-nowrap">
        <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          DIGI<span className="text-gradient"> VIP</span>
        </span>
        <span className="hidden text-[10px] font-bold uppercase tracking-[0.22em] text-slate-600 xl:block dark:text-slate-400">
          Digital Marketplace
        </span>
      </span>
    </Link>
  );
}
