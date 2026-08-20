import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { QRCodeSVG } from "@/components/QRCode";
import {
  CheckCircle2,
  Download,
  ArrowRight,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import { db, initDb, formatMoney } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { CopyKeyButton } from "@/components/CopyKeyButton";

initDb();

export const metadata = {
  title: "Order Confirmed",
  description: "Your digital products are ready — grab your license keys.",
};

async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  let session;
  try {
    session = await requireUser();
  } catch {
    redirect("/login?next=/account");
  }

  const { id } = await params;

  const order = db
    .prepare("SELECT * FROM orders WHERE id = ? AND user_id = ?")
    .get(id, session.sub) as
    | {
        id: string;
        email: string;
        name: string;
        total_cents: number;
        status: string;
        created_at: string;
      }
    | undefined;

  if (!order) notFound();

  const items = db
    .prepare(
      `SELECT oi.*, p.image AS product_image, p.slug AS product_slug
       FROM order_items oi JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`
    )
    .all(order.id) as unknown[];
  void items; // items rendered via licenses below

  const licenses = db
    .prepare(
      `SELECT l.id, l.key, l.qr_secret, l.product_id, p.title AS product_title, p.image AS product_image
       FROM licenses l JOIN products p ON p.id = l.product_id
       WHERE l.order_id = ?`
    )
    .all(order.id) as {
    id: string;
    key: string;
    qr_secret: string;
    product_id: string;
    product_title: string;
    product_image: string;
  }[];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      {/* Success header */}
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-2xl shadow-emerald-500/30 animate-fade-up">
          <CheckCircle2 size={40} className="text-white" />
        </div>
        <h1 className="animate-fade-up-delay-1 mt-6 font-display text-4xl font-bold tracking-tight">
          Order <span className="text-gradient">confirmed!</span>
        </h1>
        <p className="animate-fade-up-delay-2 mx-auto mt-3 max-w-md text-text-muted">
          Your license keys are ready below. A copy has also been saved to your
          account dashboard.
        </p>
      </div>

      {/* Order meta */}
      <div className="animate-fade-up-delay-2 glass mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl px-6 py-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
            Order reference
          </p>
          <p className="mt-0.5 font-mono text-sm text-text-primary dark:text-white">#{order.id.slice(-10)}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
            Date
          </p>
          <p className="mt-0.5 text-sm font-medium text-text-primary dark:text-white">
            {new Date(order.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
            Total paid
          </p>
          <p className="mt-0.5 font-display text-lg font-bold text-text-primary dark:text-white">
            {formatMoney(order.total_cents)}
          </p>
        </div>
        <span className="rounded-full bg-emerald-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
          {order.status}
        </span>
      </div>

      {/* Licenses */}
      <div className="mt-8 space-y-5">
        <h2 className="font-display text-xl font-bold text-text-primary dark:text-white">
          Your license keys
        </h2>
        {licenses.map((lic, i) => (
          <div
            key={lic.id}
            className="glass rounded-2xl p-5 sm:p-6"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={lic.product_image}
                  alt={lic.product_title}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-text-primary">{lic.product_title}</p>
                <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3.5 py-2">
                  <KeyRound size={14} className="shrink-0 text-violet-600 dark:text-violet-300" />
                  <code className="font-mono text-sm tracking-wider text-violet-800 dark:text-violet-200">
                    {lic.key}
                  </code>
                  <CopyKeyButton value={lic.key} />
                </div>
                <p className="mt-2.5 text-xs text-text-muted">
                  QR code acts as a signed proof of purchase — redeem it anytime
                  in your dashboard.
                </p>
              </div>

              <div className="flex shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs dark:border-white/10">
                <QRCodeSVG secret={lic.qr_secret} size={96} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Download receipt */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/account/orders" className="btn-secondary flex-1 text-sm">
          View my orders <ArrowRight size={16} />
        </Link>
        <a href={`/api/orders/${order.id}/receipt`} className="btn-ghost flex-1 text-sm">
          <Download size={16} /> Download receipt
        </a>
        <Link href="/products" className="btn-ghost flex-1 text-sm">
          Continue shopping
        </Link>
      </div>

      <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-text-muted">
        <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
        Protected by our 30-day happiness guarantee. Questions? Contact support
        anytime.
      </p>
    </div>
  );
}

export default OrderPage;
