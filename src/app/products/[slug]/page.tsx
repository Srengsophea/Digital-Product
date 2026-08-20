import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Zap,
  KeyRound,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Star,
  Users,
  RotateCcw,
} from "lucide-react";
import { db, initDb, formatMoney } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { AddToCartButton } from "@/components/AddToCartButton";
import type { ProductSummary } from "@/components/ProductCard";

initDb();

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = db
    .prepare(
      `SELECT p.*, c.name AS category_name FROM products p
       JOIN categories c ON c.id = p.category_id WHERE p.slug = ?`
    )
    .get(slug) as Record<string, unknown> | undefined;

  if (!product) return { title: "Product not found" };
  return {
    title: product.title as string,
    description: (product.description as string).slice(0, 155),
  };
}

async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = db
    .prepare(
      `SELECT p.*, c.slug AS category_slug, c.name AS category_name
       FROM products p JOIN categories c ON c.id = p.category_id
       WHERE p.slug = ?`
    )
    .get(slug) as
    | (Record<string, unknown> & {
        id: string;
        slug: string;
        title: string;
        description: string;
        price_cents: number;
        image: string;
        license_payload: string;
        category_slug: string;
        category_name: string;
      })
    | undefined;

  if (!product) notFound();

  const session = await getSession();
  const isAuthenticated = !!session;

  const related = db
    .prepare(
      `SELECT p.*, c.slug AS category_slug, c.name AS category_name
       FROM products p JOIN categories c ON c.id = p.category_id
       WHERE p.category_id = ? AND p.id != ?
       ORDER BY p.created_at DESC LIMIT 4`
    )
    .all(product.category_id, product.id)
    .map((row) => {
      const r = row as Record<string, unknown>;
      return {
        ...r,
        category: { slug: r.category_slug, name: r.category_name },
      } as ProductSummary;
    });

  const features = [
    {
      icon: Zap,
      title: "Instant delivery",
      desc: "License key arrives immediately after checkout.",
      color: "text-amber-400",
    },
    {
      icon: KeyRound,
      title: "One license per purchase",
      desc: `${product.license_payload} license issued to your account.`,
      color: "text-cyan-400",
    },
    {
      icon: ShieldCheck,
      title: "Secure & verified",
      desc: "Reviewed by our team. Buyer protection included.",
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft size={15} /> Back to catalog
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="glass group relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl sm:p-12 dark:border-white/10 dark:bg-slate-900/60">
          <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-2xl">
            <Image
              src={product.image}
              alt={product.title}
              fill
              priority
              unoptimized
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <span className="absolute left-4 top-4 rounded-full border border-slate-200/80 bg-slate-100/90 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-800 backdrop-blur-md shadow-xs dark:border-white/15 dark:bg-black/60 dark:text-white">
            {product.category_name}
          </span>
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {product.title}
          </h1>

          <div className="mt-4 flex items-center gap-4 text-sm text-text-muted">
            <span className="flex items-center gap-1.5">
              <Star size={15} className="fill-amber-400 text-amber-400" />
              <span className="font-semibold text-text-primary">4.9</span> (312)
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={15} className="text-cyan-600 dark:text-cyan-400" /> 2,400+ customers
            </span>
          </div>

          <p className="mt-6 text-lg leading-8 text-text-secondary">
            {product.description}
          </p>

          <div className="mt-8 space-y-4">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-3.5">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-100/50 dark:border-white/10 dark:bg-white/5">
                  <f.icon size={17} className={f.color} />
                </div>
                <div>
                  <p className="font-semibold text-text-primary">{f.title}</p>
                  <p className="mt-0.5 text-sm text-text-muted">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Price + CTA */}
          <div className="mt-10 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-6 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                  One-time purchase
                </p>
                <p className="mt-1 font-display text-4xl font-bold text-text-primary">
                  {formatMoney(product.price_cents)}
                </p>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={14} /> In stock
              </div>
            </div>

            <AddToCartButton
              isAuthenticated={isAuthenticated}
              product={{
                productId: product.id,
                slug: product.slug,
                title: product.title,
                price: product.price_cents / 100,
                image: product.image,
              }}
            />

            <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-text-muted">
              <RotateCcw size={13} className="text-violet-600 dark:text-violet-400" />
              30-day money-back guarantee · Secure checkout
            </p>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold tracking-tight">
            More in <span className="text-gradient">{product.category_name}</span>
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="glass group overflow-hidden rounded-2xl border border-slate-200/80 transition-all hover:-translate-y-1.5 hover:border-violet-500/40 dark:border-white/10"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="truncate font-semibold text-text-primary">{p.title}</h3>
                  <p className="mt-1 font-display text-sm font-bold text-violet-700 dark:text-violet-300">
                    {formatMoney(p.price_cents)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductPage;
