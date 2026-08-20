import { NextResponse } from "next/server";
import { db, initDb, formatMoney } from "@/lib/db";
import { requireUser } from "@/lib/auth";

initDb();

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let session;
  try {
    session = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const items = db
    .prepare("SELECT title, price_cents FROM order_items WHERE order_id = ?")
    .all(order.id) as { title: string; price_cents: number }[];

  const lines = items
    .map((i) => `${i.title} — ${formatMoney(i.price_cents)}`)
    .join("\n");

  const text = [
    "=============================================",
    "           DIGI VIP — OFFICIAL RECEIPT",
    "=============================================",
    "",
    `Order:      #${order.id.slice(-10)}`,
    `Date:       ${new Date(order.created_at).toLocaleString("en-US")}`,
    `Customer:   ${order.name} <${order.email}>`,
    `Status:     ${order.status.toUpperCase()}`,
    "",
    "---------------------------------------------",
    "ITEMS",
    "---------------------------------------------",
    lines,
    "",
    "---------------------------------------------",
    `TOTAL PAID:   ${formatMoney(order.total_cents)}`,
    "---------------------------------------------",
    "",
    "Thank you for shopping with DIGI VIP!",
    "Your license keys are available in your",
    "account dashboard at any time.",
    "",
    "=============================================",
  ].join("\n");

  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="digi-vip-receipt-${order.id.slice(-8)}.txt"`,
    },
  });
}
