"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyKeyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <button
      onClick={copy}
      aria-label="Copy license key"
      className="ml-1 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold text-violet-600 transition-colors hover:bg-violet-500/15 dark:text-violet-300 dark:hover:bg-violet-500/20"
    >
      {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
