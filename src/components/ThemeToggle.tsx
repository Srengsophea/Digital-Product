"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { useIsMounted } from "@/lib/useIsMounted";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const mounted = useIsMounted();

  const isLight = mounted ? theme === "light" : true;

  return (
    <button
      onClick={toggle}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-slate-800 transition-colors hover:border-violet-600 hover:bg-slate-200 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
    >
      {isLight ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  );
}
