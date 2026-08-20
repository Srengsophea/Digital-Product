import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  KeyRound,
  Package,
  ArrowRight,
  ShoppingBag,
  CreditCard,
} from "lucide-react";
import { db, initDb, formatMoney, type UserRole, type UserRow } from "@/lib/db";
import { getSession, getUserById } from "@/lib/auth";
import { CopyKeyButton } from "@/components/CopyKeyButton";
import { QRCodeSVG } from "@/components/QRCode";

initDb();

export const metadata = {
  title: "My Account",
  description: "Manage your DIGI VIP orders, licenses and profile.",
};

async function AccountPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/account");
  }

  let dbUser: UserRow | undefined;
  try {
    dbUser = await getUserById(session.sub);
  } catch {
    // Database fallback
  }

  const user: UserRow = dbUser || {
    id: session.sub,
    email: session.email,
    name: session.name,
    role: (session.role === "admin" ? "admin" : "customer") as UserRole,
    password_hash: "",
    created_at: new Date().toISOString(),
  };

  let orders: {
    id: string;
    total_cents: number;
    status: string;
    created_at: string;
    item_count: number;
  }[] = [];

  try {
    orders = db
      .prepare(
        `SELECT o.id, o.total_cents, o.status, o.created_at,
                COUNT(oi.id) AS item_count
         FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id
         WHERE o.user_id = ?
         GROUP BY o.id
         ORDER BY o.created_at DESC
         LIMIT 10`
      )
      .all(session.sub) as typeof orders;
  } catch {
    orders = [];
  }

  let licenses: {
    id: string;
    key: string;
    qr_secret: string;
    product_id: string;
    product_title: string;
    product_image: string;
  }[] = [];

  try {
    licenses = db
      .prepare(
        `SELECT l.id, l.key, l.qr_secret, l.product_id, p.title AS product_title, p.image AS product_image
         FROM licenses l JOIN products p ON p.id = l.product_id
         JOIN orders o ON o.id = l.order_id
         WHERE o.user_id = ?
         ORDER BY l.created_at DESC
         LIMIT 8`
      )
      .all(session.sub) as typeof licenses;
  } catch {
    licenses = [];
  }

  const statCards = [
    { label: "Orders", value: String(orders.length), icon: ShoppingBag, color: "text-violet-700 bg-violet-500/10 dark:text-violet-300" },
    { label: "Licenses", value: String(licenses.length), icon: KeyRound, color: "text-cyan-700 bg-cyan-500/10 dark:text-cyan-300" },
    {
      label: "Total spent",
      value: formatMoney(orders.reduce((acc, o) => acc + o.total_cents, 0)),
      icon: CreditCard,
      color: "text-emerald-700 bg-emerald-500/10 dark:text-emerald-300",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-lg font-bold text-white shadow-lg shadow-violet-500/30">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Welcome back, <span className="text-gradient">{user.name.split(" ")[0]}</span>
            </h1>
            <p className="mt-1 text-sm text-text-muted">{user.email}</p>
          </div>
        </div>
        <Link href="/products" className="btn-secondary text-sm">
          Browse products <ArrowRight size={15} />
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 transition-colors hover:border-slate-300 dark:border-white/[0.07] dark:bg-white/[0.02]"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-text-muted">{s.label}</p>
              <span className={`flex h-6 w-6 items-center justify-center rounded-md ${s.color.split(" ")[1]}`}>
                <s.icon size={13} className={s.color.split(" ")[0]} />
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* Recent orders */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-text-primary">Recent orders</h2>
            <Link href="/account/orders" className="text-xs font-semibold text-violet-600 hover:text-cyan-700 dark:text-violet-300 dark:hover:text-cyan-300">
              View all
            </Link>
          </div>

          {orders.length > 0 ? (
            <div className="mt-4 space-y-3">
              {orders.map((o) => (
                <Link
                  key={o.id}
                  href={`/account/orders/${o.id}`}
                  className="glass flex items-center justify-between rounded-2xl p-4 transition-all hover:border-violet-500/40"
                >
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      #{o.id.slice(-10)}
                    </p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {new Date(o.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      · {o.item_count} item{o.item_count === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-text-primary">
                      {formatMoney(o.total_cents)}
                    </span>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {o.status}
                    </span>
                    <ArrowRight size={15} className="text-text-muted" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="glass mt-4 rounded-2xl p-8 text-center">
              <Package size={28} className="mx-auto text-text-muted" />
              <p className="mt-3 text-sm text-text-muted">No orders yet</p>
              <Link href="/products" className="btn-ghost mt-3 text-xs text-violet-600 dark:text-violet-300">
                Start shopping
              </Link>
            </div>
          )}
        </section>

        {/* Licenses */}
        <section>
          <h2 className="font-display text-xl font-bold text-text-primary">My licenses</h2>
          {licenses.length > 0 ? (
            <div className="mt-4 space-y-3">
              {licenses.map((lic) => (
                <div key={lic.id} className="glass rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={lic.product_image}
                        alt={lic.product_title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text-primary">
                        {lic.product_title}
                      </p>
                      <code className="mt-1 block truncate font-mono text-xs text-violet-700 dark:text-violet-300">
                        {lic.key}
                      </code>
                    </div>
                    <CopyKeyButton value={lic.key} />
                    <div className="shrink-0 rounded-lg border border-slate-200/80 bg-white p-1.5 shadow-xs dark:border-white/10">
                      <QRCodeSVG secret={lic.qr_secret} size={40} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass mt-4 rounded-2xl p-8 text-center">
              <KeyRound size={28} className="mx-auto text-text-muted" />
              <p className="mt-3 text-sm text-text-muted">
                Your purchased license keys will appear here
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AccountPage;
