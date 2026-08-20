import Link from "next/link";
import { Search, X } from "lucide-react";
import { db, initDb, type CategoryRow } from "@/lib/db";
import { ProductCard, type ProductSummary } from "@/components/ProductCard";
import { SortSelect } from "@/components/SortSelect";

initDb();

export const metadata = {
  title: "Browse Products",
  description:
    "Browse the DIGI VIP catalog — premium software, design assets, courses and templates with instant license delivery.",
};

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "name", label: "Name A–Z" },
];

async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const categories = db
    .prepare("SELECT * FROM categories ORDER BY name")
    .all() as CategoryRow[];
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const category = typeof sp.category === "string" ? sp.category : "";
  const sort = typeof sp.sort === "string" ? sp.sort : "newest";
  const minPrice =
    typeof sp.min === "string" && sp.min !== "" ? Number(sp.min) : null;
  const maxPrice =
    typeof sp.max === "string" && sp.max !== "" ? Number(sp.max) : null;

  const params: unknown[] = [];
  const where: string[] = [];

  if (q) {
    where.push("(p.title LIKE ? OR p.description LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }
  if (category) {
    where.push("c.slug = ?");
    params.push(category);
  }
  if (minPrice !== null) {
    where.push("p.price_cents >= ?");
    params.push(Math.round(minPrice * 100));
  }
  if (maxPrice !== null) {
    where.push("p.price_cents <= ?");
    params.push(Math.round(maxPrice * 100));
  }

  const orderBy: Record<string, string> = {
    newest: "p.created_at DESC",
    "price-asc": "p.price_cents ASC",
    "price-desc": "p.price_cents DESC",
    name: "p.title ASC",
  };

  const sql = `SELECT p.*, c.slug AS category_slug, c.name AS category_name
    FROM products p JOIN categories c ON c.id = p.category_id
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY ${orderBy[sort] ?? orderBy.newest}`;

  const rows = db.prepare(sql).all(...params) as Record<string, unknown>[];
  const products = rows.map((row) => ({
    ...row,
    category: { slug: row.category_slug, name: row.category_name },
  })) as ProductSummary[];

  const hasFilters = q !== "" || category !== "" || minPrice !== null || maxPrice !== null || sort !== "newest";

  const buildHref = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams();
    const current: Record<string, string | null> = {
      q: q || null,
      category: category || null,
      sort: sort !== "newest" ? sort : null,
      min: minPrice !== null ? String(minPrice) : null,
      max: maxPrice !== null ? String(maxPrice) : null,
    };
    for (const [k, v] of Object.entries({ ...current, ...patch })) {
      if (v && v !== "") next.set(k, v);
    }
    const str = next.toString();
    return str ? `/products?${str}` : "/products";
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-600 dark:text-violet-400">
            The catalog
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Browse <span className="text-gradient">products</span>
          </h1>
        </div>
        <p className="text-sm text-text-muted">
          {products.length} product{products.length === 1 ? "" : "s"} found
        </p>
      </div>

      {/* Search + sorts */}
      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">
        <form action="/products" method="GET" className="relative flex-1">
          <Search
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search products, tools, courses…"
            className="input-field pl-11"
            aria-label="Search products"
          />
        </form>

        <SortSelect
          value={sort}
          current={{
            q: q || null,
            category: category || null,
            min: minPrice !== null ? String(minPrice) : null,
            max: maxPrice !== null ? String(maxPrice) : null,
          }}
        />
      </div>

      {/* Active filters */}
      {hasFilters && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {q && (
            <span className="chip">
              “{q}”
              <Link href={buildHref({ q: null })} aria-label="Clear search">
                <X size={13} />
              </Link>
            </span>
          )}
          {category && (
            <span className="chip">
              {categories.find((c) => c.slug === category)?.name ?? category}
              <Link href={buildHref({ category: null })} aria-label="Clear category">
                <X size={13} />
              </Link>
            </span>
          )}
          {minPrice !== null && maxPrice !== null && (
            <span className="chip">
              ${minPrice} – ${maxPrice}
              <Link href={buildHref({ min: null, max: null })} aria-label="Clear price range">
                <X size={13} />
              </Link>
            </span>
          )}
          {sort !== "newest" && (
            <span className="chip">
              {SORTS.find((s) => s.value === sort)?.label}
              <Link href={buildHref({ sort: null })} aria-label="Reset sort">
                <X size={13} />
              </Link>
            </span>
          )}
          <Link href="/products" className="btn-ghost px-3 py-1 text-xs">
            Clear all
          </Link>
        </div>
      )}

      {/* Category chips */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={buildHref({ category: null })}
          className={`chip ${!category ? "chip-active" : ""}`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={buildHref({ category: c.slug })}
            className={`chip ${category === c.slug ? "chip-active" : ""}`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {/* Grid */}
      {products.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 py-20 text-center">
          <Search size={36} className="text-text-muted" />
          <h2 className="mt-4 font-display text-xl font-semibold text-text-primary dark:text-white">
            No products found
          </h2>
          <p className="mt-2 max-w-sm text-sm text-text-muted">
            Try clearing your filters or searching for something different.
          </p>
          <Link href="/products" className="btn-secondary mt-6 text-sm">
            Clear all filters
          </Link>
        </div>
      )}
    </div>
  );
}

export default ProductsPage;
