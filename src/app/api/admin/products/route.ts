import { NextResponse } from "next/server";
import { z } from "zod";
import { db, initDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { newId, slugify } from "@/lib/utils";

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

export async function GET() {
  await requireAdmin();
  const products = db
    .prepare(
      `SELECT p.*, c.slug AS category_slug, c.name AS category_name
       FROM products p JOIN categories c ON c.id = p.category_id
       ORDER BY p.created_at DESC`
    )
    .all();
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  await requireAdmin();

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

  const category = db
    .prepare("SELECT id FROM categories WHERE id = ?")
    .get(categoryId);
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 400 });
  }

  const id = newId("prod");
  const slug = slugify(title);
  const existing = db.prepare("SELECT id FROM products WHERE slug = ?").get(slug);
  if (existing) {
    return NextResponse.json(
      { error: "A product with this title already exists" },
      { status: 409 }
    );
  }

  db.prepare(
    `INSERT INTO products
      (id, slug, title, description, category_id, price_cents, image, license_payload, featured, in_stock, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    slug,
    title,
    description,
    categoryId,
    Math.round(price * 100),
    image,
    license,
    featured ? 1 : 0,
    inStock ? 1 : 0,
    new Date().toISOString()
  );

  return NextResponse.json({ product: { id, slug } }, { status: 201 });
}
