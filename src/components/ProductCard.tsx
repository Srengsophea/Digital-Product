import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { formatMoney } from "@/lib/utils";

export interface ProductSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  price_cents: number;
  image: string;
  category: { slug: string; name: string };
  featured: number;
}

export function ProductCard({
  product,
  index = 0,
}: {
  product: ProductSummary;
  index?: number;
}) {
  // First two rows of the grid are above the fold — eager-load those for a fast LCP.
  const eager = index < 8;
  return (
    <Link
      href={`/products/${product.slug}`}
      className={`glass group relative flex flex-col overflow-hidden rounded-2xl card-hover ${
        index % 2 === 0 ? "animate-fade-up" : "animate-fade-up-delay-1"
      }`}
      style={{ animationDelay: `${Math.min(index * 60, 480)}ms` }}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={product.image}
          alt={product.title}
          fill
          priority={eager}
          loading={eager ? "eager" : "lazy"}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="img-scrim absolute inset-0" />
        <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
          {product.category.name}
        </span>
        {product.featured === 1 && (
          <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-3 py-1 text-[11px] font-bold text-white shadow-lg shadow-violet-500/40">
            Featured
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-text-primary transition-colors group-hover:text-violet-600 dark:group-hover:text-violet-400">
          {product.title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-text-muted">
          {product.description}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-slate-200/70 pt-4 dark:border-white/5">
          <span className="font-display text-lg font-bold text-text-primary">
            {formatMoney(product.price_cents)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 transition-all group-hover:gap-2.5 group-hover:text-violet-800 dark:text-violet-300 dark:group-hover:text-cyan-300">
            <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
            Instant
            <ArrowRight size={15} />
          </span>
        </div>
      </div>
    </Link>
  );
}
