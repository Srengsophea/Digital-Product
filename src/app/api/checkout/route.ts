import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { db, initDb } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { newId } from "@/lib/utils";

initDb();

const CheckoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        qty: z.number().int().min(1).max(10),
      })
    )
    .min(1)
    .max(25),
});

export async function POST(request: Request) {
  let session;
  try {
    session = await requireUser();
  } catch {
    return NextResponse.json({ error: "Please sign in to checkout" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart contents" }, { status: 400 });
  }

  const ids = parsed.data.items.map((i) => i.productId);
  const placeholders = ids.map(() => "?").join(",");

  const rows = db
    .prepare(
      `SELECT id, title, price_cents, license_payload, in_stock
       FROM products WHERE id IN (${placeholders})`
    )
    .all(...ids) as unknown as {
    id: string;
    title: string;
    price_cents: number;
    license_payload: string;
    in_stock: number;
  }[];

  // Map requested qty to product
  const requested = new Map(
    parsed.data.items.map((i) => [i.productId, i.qty]) as [string, number][]
  );

  let totalCents = 0;
  const orderLines: {
    productId: string;
    title: string;
    price_cents: number;
    license: string;
    qty: number;
  }[] = [];

  for (const row of rows) {
    const qty = requested.get(row.id) ?? 0;
    if (qty <= 0) continue;
    if (row.in_stock !== 1) {
      return NextResponse.json(
        { error: `${row.title} is currently out of stock` },
        { status: 409 }
      );
    }
    totalCents += row.price_cents * qty;
    orderLines.push({
      productId: row.id,
      title: row.title,
      price_cents: row.price_cents,
      license: row.license_payload,
      qty,
    });
  }

  if (orderLines.length === 0) {
    return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
  }

  // Create order + items + licenses in a transaction
  const orderId = newId("ord");
  const createdAt = new Date().toISOString();

  const createOrder = db.transaction(() => {
    db.prepare(
      `INSERT INTO orders (id, user_id, email, name, total_cents, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'paid', ?)`
    ).run(orderId, session.sub, session.email, session.name, totalCents, createdAt);

    const insertItem = db.prepare(
      `INSERT INTO order_items (id, order_id, product_id, title, price_cents)
       VALUES (?, ?, ?, ?, ?)`
    );
    const insertLicense = db.prepare(
      `INSERT INTO licenses (id, order_id, product_id, key, qr_secret, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    );

    for (const line of orderLines) {
      for (let i = 0; i < line.qty; i++) {
        const itemId = newId("item");
        insertItem.run(itemId, orderId, line.productId, line.title, line.price_cents);

        const key = `${line.license}-${randomBytes(4).toString("hex").toUpperCase().slice(0, 8)}`;
        insertLicense.run(
          newId("lic"),
          orderId,
          line.productId,
          key,
          randomBytes(16).toString("hex"),
          createdAt
        );
      }
    }
  });

  createOrder();

  const licenses = db
    .prepare(
      `SELECT l.id, l.key, l.qr_secret, l.product_id, p.title AS product_title, p.image AS product_image
       FROM licenses l JOIN products p ON p.id = l.product_id
       WHERE l.order_id = ?`
    )
    .all(orderId);

  return NextResponse.json(
    {
      order: {
        id: orderId,
        total_cents: totalCents,
        status: "paid",
        created_at: createdAt,
      },
      licenses,
    },
    { status: 201 }
  );
}
