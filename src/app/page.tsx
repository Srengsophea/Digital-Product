import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  KeyRound,
  CreditCard,
  Sparkles,
  Star,
  Palette,
  Code2,
  GraduationCap,
  LayoutTemplate,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { db, initDb, type CategoryRow } from "@/lib/db";
import { ProductCard, type ProductSummary } from "@/components/ProductCard";

initDb();

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  software: Code2,
  design: Palette,
  courses: GraduationCap,
  templates: LayoutTemplate,
};

const CATEGORY_COLORS: Record<string, string> = {
  software: "from-violet-500 to-indigo-500",
  design: "from-pink-500 to-rose-500",
  courses: "from-cyan-400 to-sky-500",
  templates: "from-amber-400 to-orange-500",
};

function HomePage() {
  const categories = db
    .prepare("SELECT * FROM categories ORDER BY name")
    .all() as CategoryRow[];

  const featured = db
    .prepare(
      `SELECT p.*, c.slug AS category_slug, c.name AS category_name
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.featured = 1
       ORDER BY p.created_at DESC
       LIMIT 4`
    )
    .all()
    .map((row) => {
      const r = row as ProductSummary & { category_slug: string; category_name: string };
      return {
        ...r,
        category: { slug: r.category_slug, name: r.category_name },
      } as ProductSummary;
    });

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <div className="aurora-blob left-[8%] top-[10%] h-80 w-80 bg-violet-600/15 animate-glow-pulse" />
        <div className="aurora-blob right-[5%] top-[25%] h-96 w-96 bg-cyan-500/10 animate-glow-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="aurora-blob bottom-[5%] left-[35%] h-72 w-72 bg-pink-600/10 animate-glow-pulse" style={{ animationDelay: "3s" }} />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-violet-700 dark:text-violet-300">
              <Sparkles size={13} className="text-cyan-600 dark:text-cyan-300" />
              Premium digital marketplace
            </span>

            <h1 className="animate-fade-up-delay-1 mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              The <span className="text-gradient">VIP lounge</span> for
              <br className="hidden sm:block" /> digital products
            </h1>

            <p className="animate-fade-up-delay-2 mx-auto mt-6 max-w-2xl text-lg leading-8 text-text-muted">
              Hand-picked software, design assets, courses and templates from
              the world&apos;s best independent creators — delivered instantly
              with secure license keys.
            </p>

            <div className="animate-fade-up-delay-3 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/products" className="btn-primary text-base">
                Explore the catalog <ArrowRight size={18} />
              </Link>
              <Link href="/register" className="btn-secondary text-base !text-slate-900 font-bold hover:!text-violet-700 dark:!text-white">
                Create free account
              </Link>
            </div>

            {/* Trust strip */}
            <div className="animate-fade-up-delay-4 mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-text-muted">
              <span className="flex items-center gap-2">
                <Zap size={15} className="text-amber-500" /> Instant delivery
              </span>
              <span className="flex items-center gap-2">
                <KeyRound size={15} className="text-cyan-600 dark:text-cyan-400" /> Secure license keys
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-emerald-600 dark:text-emerald-400" /> Buyer protected
              </span>
              <span className="flex items-center gap-2">
                <CreditCard size={15} className="text-violet-600 dark:text-violet-400" /> 30-day refunds
              </span>
            </div>
          </div>
        </div>

        {/* Marquee strip */}
        <div className="relative border-y border-slate-200/80 bg-slate-100/50 py-4 dark:border-white/5 dark:bg-white/[0.02]">
          <div className="flex overflow-hidden">
            <div className="animate-marquee flex shrink-0 items-center gap-12 pr-12">
              {[...Array(2)].map((_, dup) => (
                <div key={dup} className="flex items-center gap-12">
                  {["SOFTWARE", "DESIGN ASSETS", "COURSES", "TEMPLATES", "INSTANT KEYS", "VIP ONLY"].map((t) => (
                    <span key={`${dup}-${t}`} className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.25em] text-text-muted">
                      <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
                      {t}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURED ============ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-600 dark:text-violet-400">
              Curated this month
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Featured <span className="text-gradient"> picks</span>
            </h2>
          </div>
          <Link
            href="/products"
            className="btn-ghost text-sm"
          >
            View all products <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section className="border-y border-slate-200/80 bg-slate-100/50 py-20 dark:border-white/5 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-400">
              Four worlds, one pass
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Shop by <span className="text-gradient-pink">category</span>
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat, i) => {
              const Icon = CATEGORY_ICONS[cat.slug] ?? Layers;
              const color = CATEGORY_COLORS[cat.slug] ?? "from-violet-500 to-cyan-400";
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className={`glass group relative overflow-hidden rounded-2xl p-6 card-hover ${
                    i % 2 === 0 ? "animate-fade-up" : "animate-fade-up-delay-1"
                  }`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${color} opacity-15 blur-2xl transition-all group-hover:opacity-30 group-hover:scale-125`} />
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-text-primary">
                    {cat.name}
                  </h3>
                  <p className="mt-1.5 text-sm text-text-muted">
                    Premium picks, instant delivery
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 transition-all group-hover:gap-3 dark:text-violet-300">
                    Browse <ArrowRight size={14} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ WHY DIGI VIP ============ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">
              Why DIGI VIP
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              The premium way to <span className="text-gradient">buy digital</span>
            </h2>
            <p className="mt-4 max-w-lg leading-8 text-text-muted">
              We curate only the top 1% of digital products and handle every
              detail — from secure payments to license delivery — so you can
              focus on what matters: owning great tools.
            </p>

            <div className="mt-8 space-y-5">
              {[
                {
                  icon: Zap,
                  color: "text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400",
                  title: "Instant delivery",
                  desc: "License keys and QR codes arrive the second your payment is confirmed.",
                },
                {
                  icon: KeyRound,
                  color: "text-cyan-600 bg-cyan-500/10 border-cyan-500/20 dark:text-cyan-400",
                  title: "One-tap license management",
                  desc: "Every purchase appears in your dashboard with copy-ready keys and QR verification.",
                },
                {
                  icon: ShieldCheck,
                  color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400",
                  title: "Verified creators only",
                  desc: "Every product passes a 12-point quality and security review before listing.",
                },
                {
                  icon: CreditCard,
                  color: "text-violet-600 bg-violet-500/10 border-violet-500/20 dark:text-violet-400",
                  title: "30-day happiness guarantee",
                  desc: "Not what you expected? Full refund, no questions asked.",
                },
              ].map((f, i) => (
                <div
                  key={f.title}
                  className={`flex gap-4 ${i % 2 === 0 ? "animate-fade-up" : "animate-fade-up-delay-1"}`}
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${f.color}`}>
                    <f.icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-text-primary">{f.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-text-muted">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual panel */}
          <div className="relative">
            <div className="aurora-blob right-10 top-10 h-64 w-64 bg-cyan-500/15 animate-float-slow" />
            <div className="glass-strong relative rounded-3xl p-8 animate-fade-up">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-5 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-bold text-white">
                    DV
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Order confirmed</p>
                    <p className="text-xs text-text-muted">#DIGI-2026-0815</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  ✓ PAID
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  { name: "Nebula UI Kit Pro", price: "$89.00", icon: Palette },
                  { name: "Swift Commerce Engine", price: "$149.00", icon: Code2 },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/80 p-3.5 dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <item.icon size={16} className="text-violet-600 dark:text-violet-300" />
                      <span className="text-sm text-text-primary">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-text-primary">{item.price}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-violet-500/30 bg-violet-500/10 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-300">
                    License key
                  </span>
                  <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="mt-1.5 font-mono text-sm tracking-wider text-violet-800 dark:text-violet-200">
                  NEBULA-UI-PRO-0001
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="border-y border-slate-200/80 bg-slate-100/50 py-14 dark:border-white/5 dark:bg-white/[0.02]">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 text-center sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { value: "4.9/5", label: "Average rating" },
            { value: "12k+", label: "Happy customers" },
            { value: "1s", label: "Avg. delivery time" },
            { value: "98%", label: "Would buy again" },
          ].map((s, i) => (
            <div key={s.label} className={i % 2 === 0 ? "animate-fade-up" : "animate-fade-up-delay-1"}>
              <p className="flex items-center justify-center gap-2 font-display text-3xl font-bold text-gradient sm:text-4xl">
                {s.value === "4.9/5" && <Star size={24} className="text-amber-500" />}
                {s.value}
              </p>
              <p className="mt-2 text-sm text-text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-600/10 via-violet-50/50 to-cyan-500/10 px-6 py-16 text-center sm:px-16 dark:from-violet-600/20 dark:via-[#0b0719] dark:to-cyan-500/10">
          <div className="aurora-blob left-1/2 top-0 h-56 w-[32rem] -translate-x-1/2 bg-violet-600/15" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
              Ready to level up your <span className="text-gradient">digital arsenal?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-8 text-text-muted">
              Join thousands of creators and builders who get premium digital
              products delivered the instant they pay.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/products" className="btn-primary text-base">
                Start browsing <ArrowRight size={18} />
              </Link>
              <Link href="/register" className="btn-secondary text-base !text-slate-900 font-bold hover:!text-violet-700 dark:!text-white">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;

// Helper re-export for type reuse
export type { CategoryRow };
