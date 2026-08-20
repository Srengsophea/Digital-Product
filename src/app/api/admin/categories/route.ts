import { NextResponse } from "next/server";
import { initDb, db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { newId, slugify } from "@/lib/utils";

initDb();

export async function GET() {
  try {
    await requireAdmin();
    const categories = db
      .prepare(
        `SELECT c.id, c.slug, c.name, c.icon,
                COUNT(p.id) AS product_count
         FROM categories c
         LEFT JOIN products p ON p.category_id = c.id
         GROUP BY c.id
         ORDER BY c.name ASC`
      )
      .all();
    return NextResponse.json({ categories });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { name, icon } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const slug = slugify(name);
    const existing = db
      .prepare("SELECT id FROM categories WHERE slug = ?")
      .get(slug);
    if (existing) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 400 }
      );
    }

    const id = newId("cat");
    const categoryIcon = icon || "code";

    db.prepare(
      "INSERT INTO categories (id, slug, name, icon) VALUES (?, ?, ?, ?)"
    ).run(id, slug, name.trim(), categoryIcon);

    const created = db
      .prepare("SELECT id, slug, name, icon FROM categories WHERE id = ?")
      .get(id);

    return NextResponse.json({ category: created }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create category" },
      { status: 400 }
    );
  }
}
