import { NextResponse } from "next/server";
import { initDb, db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

initDb();

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { name, icon } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const slug = slugify(name);
    db.prepare(
      "UPDATE categories SET name = ?, slug = ?, icon = ? WHERE id = ?"
    ).run(name.trim(), slug, icon || "code", id);

    const updated = db
      .prepare("SELECT id, slug, name, icon FROM categories WHERE id = ?")
      .get(id);

    return NextResponse.json({ category: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update category" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const prodCount = db
      .prepare("SELECT COUNT(*) AS count FROM products WHERE category_id = ?")
      .get(id) as { count: number };

    if (prodCount && prodCount.count > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category: ${prodCount.count} product(s) are assigned to it. Reassign or delete products first.`,
        },
        { status: 400 }
      );
    }

    db.prepare("DELETE FROM categories WHERE id = ?").run(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete category" },
      { status: 400 }
    );
  }
}
