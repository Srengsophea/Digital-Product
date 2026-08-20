import { NextResponse } from "next/server";
import { z } from "zod";
import { db, initDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

initDb();

export const dynamic = "force-dynamic";

const StatusSchema = z.object({
  status: z.enum(["paid", "refunded", "fulfilled", "cancelled"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;

  const existing = db.prepare("SELECT id FROM orders WHERE id = ?").get(id);
  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = StatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(parsed.data.status, id);

  return NextResponse.json({ ok: true });
}
