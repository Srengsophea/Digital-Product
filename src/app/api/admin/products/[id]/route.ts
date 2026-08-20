import { NextResponse } from "next/server";
import { z } from "zod";
import { db, initDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

initDb();

export const dynamic = "force-dynamic";

const ProductSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(3000),
  categoryId: z.string(),
  price: z.number().positive().max(100000),
  image: z.string().min(1),
  license: z.string().min(3).max(60),
  featured: z.boolean().default(false),
  inStock: z.boolean().default(true),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;

  const existing = db.prepare("SELECT id FROM products WHERE id = ?").get(id);
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = ProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { title, description, categoryId, price, image, license, featured, inStock } =
    parsed.data;

  const slugBase = slugify(title);
  const slugConflict = db
    .prepare("SELECT id FROM products WHERE slug = ? AND id != ?")
    .get(slugBase, id);
  if (slugConflict) {
    return NextResponse.json(
      { error: "Another product with this title already exists" },
      { status: 409 }
    );
  }

  db.prepare(
    `UPDATE products
     SET title = ?, slug = ?, description = ?, category_id = ?, price_cents = ?,
         image = ?, license_payload = ?, featured = ?, in_stock = ?
     WHERE id = ?`
  ).run(
    title,
    slugBase,
    description,
    categoryId,
    Math.round(price * 100),
    image,
    license,
    featured ? 1 : 0,
    inStock ? 1 : 0,
    id
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;

  const existing = db.prepare("SELECT id FROM products WHERE id = ?").get(id);
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  db.prepare("DELETE FROM products WHERE id = ?").run(id);

  return NextResponse.json({ ok: true });
}
