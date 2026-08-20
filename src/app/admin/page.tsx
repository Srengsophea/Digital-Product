import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  DollarSign,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  FolderPlus,
} from "lucide-react";
import { db, initDb, formatMoney } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ProductManager } from "@/components/admin/ProductManager";
import { OrderManager } from "@/components/admin/OrderManager";
import { CategoryManager, CategoryItem } from "@/components/admin/CategoryManager";
import { UserManager, UserItem } from "@/components/admin/UserManager";
import { SignOutButton } from "@/components/admin/SignOutButton";

initDb();

export const metadata = {
  title: "Admin Dashboard",
  description: "Manage DIGI VIP products, orders, categories, users and store revenue.",
};

export const dynamic = "force-dynamic";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "categories", label: "Categories", icon: FolderPlus },
  { id: "users", label: "Users", icon: Users },
] as const;

type TabId = (typeof TABS)[number]["id"];

async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const session = await requireAdmin();
  const sp = await searchParams;
  const tabParam = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;
  const activeTab: TabId =
    tabParam === "products" ||
    tabParam === "orders" ||
    tabParam === "categories" ||
    tabParam === "users"
      ? tabParam
      : "overview";

  const products = db
    .prepare(
      `SELECT p.*, c.slug AS category_slug, c.name AS category_name
       FROM products p JOIN categories c ON c.id = p.category_id
       ORDER BY p.created_at DESC`
    )
    .all() as {
    id: string;
    slug: string;
    title: string;
    description: string;
    category_id: string;
    category_name: string;
    price_cents: number;
    image: string;
    license_payload: string;
    featured: number;
    in_stock: number;
  }[];

  const categories = db
    .prepare("SELECT id, slug, name, icon FROM categories ORDER BY name")
    .all() as { id: string; slug: string; name: string; icon: string }[];

  const categoriesWithCount = db
    .prepare(
      `SELECT c.id, c.slug, c.name, c.icon,
              COUNT(p.id) AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.id
       ORDER BY c.name ASC`
    )
    .all() as CategoryItem[];

  const orders = db
    .prepare(
      `SELECT o.id, o.email, o.name, o.total_cents, o.status, o.created_at,
              COUNT(oi.id) AS item_count
       FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT 100`
    )
    .all() as {
    id: string;
    email: string;
    name: string;
    total_cents: number;
    status: string;
    created_at: string;
    item_count: number;
  }[];

  const usersList = db
    .prepare(
      `SELECT u.id, u.email, u.name, u.role, u.status, u.created_at,
              COUNT(o.id) AS order_count,
              COALESCE(SUM(o.total_cents), 0) AS total_spent_cents
       FROM users u
       LEFT JOIN orders o ON o.user_id = u.id AND o.status != 'cancelled'
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    )
    .all() as UserItem[];

  const stats = db
    .prepare(
      `SELECT
         (SELECT COUNT(*) FROM orders) AS orders,
         (SELECT COUNT(*) FROM products) AS products,
         (SELECT COUNT(*) FROM users WHERE role = 'customer') AS customers,
         (SELECT COALESCE(SUM(total_cents), 0) FROM orders WHERE status != 'cancelled') AS revenue`
    )
    .get() as { orders: number; products: number; customers: number; revenue: number };

  // Revenue by day (last 7 days)
  const revenueByDay = db
    .prepare(
      `SELECT date(created_at) AS day, COALESCE(SUM(total_cents), 0) AS total
       FROM orders WHERE status != 'cancelled'
       GROUP BY day ORDER BY day DESC LIMIT 7`
    )
    .all() as { day: string; total: number }[];

  const chartData = [...revenueByDay].reverse();
  const maxRevenue = Math.max(...chartData.map((d) => d.total), 1);
  const thisWeekRevenue = chartData.reduce((sum, d) => sum + d.total, 0);

  const prevWeekRevenue = db
    .prepare(
      `SELECT COALESCE(SUM(total_cents), 0) AS total
       FROM orders
       WHERE status != 'cancelled'
         AND date(created_at) >= date('now', '-14 days')
         AND date(created_at) < date('now', '-7 days')`
    )
    .get() as { total: number };
  const growthPct =
    prevWeekRevenue.total > 0
      ? ((thisWeekRevenue - prevWeekRevenue.total) / prevWeekRevenue.total) * 100
      : thisWeekRevenue > 0
        ? 100
        : 0;
  const growing = growthPct >= 0;

  const statusCounts = {
    paid: orders.filter((o) => o.status === "paid").length,
    fulfilled: orders.filter((o) => o.status === "fulfilled").length,
    refunded: orders.filter((o) => o.status === "refunded").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  const statCards = [
    {
      label: "Revenue",
      value: formatMoney(stats.revenue),
      icon: DollarSign,
      accent: "text-violet-700 dark:text-violet-300",
      bg: "bg-violet-500/10",
    },
    {
      label: "Orders",
      value: String(stats.orders),
      icon: ShoppingBag,
      accent: "text-cyan-700 dark:text-cyan-300",
      bg: "bg-cyan-500/10",
    },
    {
      label: "Products",
      value: String(stats.products),
      icon: Package,
      accent: "text-emerald-700 dark:text-emerald-300",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Customers",
      value: String(stats.customers),
      icon: Users,
      accent: "text-amber-700 dark:text-amber-300",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Admin Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25">
            <span className="font-display text-base font-bold">DV</span>
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-text-primary">
              Admin Control Center
            </h1>
            <p className="text-xs text-text-muted">
              Logged in as <span className="font-semibold text-text-primary">{session.name}</span> ({session.email})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/products"
            className="btn-secondary py-1.5 px-3.5 text-xs font-semibold"
          >
            <Store size={14} /> Storefront
          </Link>
          <SignOutButton className="btn-ghost py-1.5 px-3.5 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10" />
        </div>
      </div>

      {/* Top Tab Bar */}
      <div className="mt-6 flex overflow-x-auto gap-2 border-b border-slate-200/80 pb-3 dark:border-white/10">
        {TABS.map((item) => {
          const active = item.id === activeTab;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.id === "overview" ? "/admin" : `/admin?tab=${item.id}`}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-all ${
                active
                  ? "bg-violet-600 text-white font-semibold shadow-sm"
                  : "bg-slate-100/80 text-slate-700 font-medium hover:bg-slate-200/80 hover:text-slate-900 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Main Content */}
      <main className="mt-8 min-w-0">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Page header */}
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h1 className="text-xl font-semibold tracking-tight text-text-primary">Overview</h1>
                  <p className="mt-1 text-sm text-text-muted">
                    Welcome back, {session.name.split(" ")[0]}. Here&apos;s your store at a glance.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  System Operational
                </span>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {statCards.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 transition-colors hover:border-slate-300 dark:border-white/[0.07] dark:bg-white/[0.02]"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-text-muted">{s.label}</p>
                      <span className={`flex h-6 w-6 items-center justify-center rounded-md ${s.bg}`}>
                        <s.icon size={13} className={s.accent} />
                      </span>
                    </div>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">{s.value}</p>
                    {s.label === "Revenue" && (
                      <p
                        className={`mt-1 inline-flex items-center gap-0.5 text-xs font-medium ${
                          growing ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"
                        }`}
                      >
                        {growing ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {Math.abs(growthPct).toFixed(0)}% vs last week
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
                {/* Revenue chart */}
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-5 dark:border-white/[0.07] dark:bg-white/[0.02]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-text-primary">Revenue</h2>
                    <span className="text-xs text-text-muted">Last 7 days</span>
                  </div>

                  {chartData.length > 0 ? (
                    <>
                      <div className="mt-6 flex h-40 items-end gap-2">
                        {chartData.map((d) => (
                          <div
                            key={d.day}
                            className="group flex flex-1 flex-col items-center gap-1.5"
                          >
                            <span className="text-[10px] font-medium text-text-primary opacity-0 transition-opacity group-hover:opacity-100">
                              {formatMoney(d.total)}
                            </span>
                            <div
                              className="w-full rounded-md bg-gradient-to-t from-violet-600 to-indigo-500 transition-opacity group-hover:opacity-80"
                              style={{
                                height: `${Math.max((d.total / maxRevenue) * 100, 4)}%`,
                              }}
                            />
                            <span className="text-[10px] text-text-muted">
                              {new Date(d.day + "T00:00:00").toLocaleDateString("en-US", {
                                weekday: "short",
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-4 border-t border-slate-200/80 pt-3 text-xs text-text-muted dark:border-white/[0.06]">
                        {thisWeekRevenue > 0
                          ? `${formatMoney(thisWeekRevenue)} in the last 7 days`
                          : "Awaiting first sales"}
                      </p>
                    </>
                  ) : (
                    <div className="mt-6 flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200/80 dark:border-white/10">
                      <TrendingUp size={20} className="text-text-muted" />
                      <p className="mt-2 text-xs text-text-muted">No sales data yet</p>
                    </div>
                  )}
                </div>

                {/* Order status */}
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-5 dark:border-white/[0.07] dark:bg-white/[0.02]">
                  <h2 className="text-sm font-semibold text-text-primary">Order status</h2>
                  <div className="mt-5 space-y-3.5">
                    {[
                      { label: "Pending", count: statusCounts.paid, color: "bg-amber-500", text: "text-amber-700 dark:text-amber-300" },
                      { label: "Fulfilled", count: statusCounts.fulfilled, color: "bg-cyan-500", text: "text-cyan-700 dark:text-cyan-300" },
                      { label: "Refunded", count: statusCounts.refunded, color: "bg-violet-500", text: "text-violet-700 dark:text-violet-300" },
                      { label: "Cancelled", count: statusCounts.cancelled, color: "bg-red-500", text: "text-red-700 dark:text-red-300" },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm text-text-muted">
                          <span className={`h-1.5 w-1.5 rounded-full ${row.color}`} />
                          {row.label}
                        </span>
                        <span className={`text-sm font-semibold ${row.text}`}>{row.count}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-200/80 pt-4 dark:border-white/[0.06]">
                    <span className="text-xs text-text-muted">Total orders</span>
                    <span className="text-sm font-semibold text-text-primary">{stats.orders}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <ProductManager initialProducts={products} categories={categories} />
          )}
          {activeTab === "orders" && <OrderManager initialOrders={orders} />}
          {activeTab === "categories" && (
            <CategoryManager initialCategories={categoriesWithCount} />
          )}
          {activeTab === "users" && <UserManager initialUsers={usersList} />}
        </main>
    </div>
  );
}

export default AdminPage;
