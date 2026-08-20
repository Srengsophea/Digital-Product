import { NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

initDb();

export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdmin();

  const orders = db
    .prepare(
      `SELECT o.id, o.email, o.name, o.total_cents, o.status, o.created_at,
              COUNT(oi.id) AS item_count
       FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT 100`
    )
    .all();

  return NextResponse.json({ orders });
}
