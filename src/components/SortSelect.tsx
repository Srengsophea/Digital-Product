"use client";

import { useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "name", label: "Name A–Z" },
];

export function SortSelect({
  value,
  current,
}: {
  value: string;
  current: Record<string, string | null>;
}) {
  const router = useRouter();

  const handleChange = (v: string) => {
    const next = new URLSearchParams();
    for (const [k, val] of Object.entries(current)) {
      if (val && val !== "") next.set(k, val);
    }
    if (v !== "newest") next.set("sort", v);
    const str = next.toString();
    router.push(str ? `/products?${str}` : "/products");
  };

  return (
    <div className="flex items-center gap-2">
      <SlidersHorizontal size={16} className="text-text-muted" />
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="input-field w-auto cursor-pointer py-2.5"
        aria-label="Sort products"
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value} className="bg-[var(--bg-soft)] text-[var(--text-primary)]">
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
