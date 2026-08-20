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
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-800 backdrop-blur-md shadow-xs dark:border-white/15 dark:bg-slate-900/80 dark:text-white">
          <svg className="h-3 w-3 text-violet-600 animate-spin-slow dark:text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          {product.category.name}
        </span>
        {product.featured === 1 && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 via-pink-500 to-cyan-500 px-3 py-1 text-[11px] font-bold text-white shadow-lg shadow-violet-500/40">
            <svg className="h-3 w-3 fill-white animate-pulse" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
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
            <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            Instant Delivery
            <ArrowRight size={15} />
          </span>
        </div>
      </div>
    </Link>
  );
}
