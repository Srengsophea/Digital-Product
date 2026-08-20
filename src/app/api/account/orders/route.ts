import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { requireUser } from "@/lib/auth";

initDb();

export const dynamic = "force-dynamic";

export async function GET() {
  let session;
  try {
    session = await requireUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = db
    .prepare(
      `SELECT o.id, o.total_cents, o.status, o.created_at,
              COUNT(oi.id) AS item_count
       FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`
    )
    .all(session.sub) as {
    id: string;
    total_cents: number;
    status: string;
    created_at: string;
    item_count: number;
  }[];

  // Attach items
  const itemsByOrder = new Map<string, unknown[]>();
  for (const order of orders) {
    const items = db
      .prepare(
        `SELECT oi.product_id, oi.title, oi.price_cents
         FROM order_items oi WHERE oi.order_id = ?`
      )
      .all(order.id);
    itemsByOrder.set(order.id, items);
  }

  return NextResponse.json({
    orders: orders.map((o) => ({ ...o, items: itemsByOrder.get(o.id) ?? [] })),
  });
}
