import { NextResponse } from "next/server";
import { initDb, db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

initDb();

export async function GET() {
  try {
    await requireAdmin();
    const users = db
      .prepare(
        `SELECT u.id, u.email, u.name, u.role, u.created_at,
                COUNT(o.id) AS order_count,
                COALESCE(SUM(o.total_cents), 0) AS total_spent_cents
         FROM users u
         LEFT JOIN orders o ON o.user_id = u.id AND o.status != 'cancelled'
         GROUP BY u.id
         ORDER BY u.created_at DESC`
      )
      .all();
    return NextResponse.json({ users });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unauthorized" },
      { status: 401 }
    );
  }
}
