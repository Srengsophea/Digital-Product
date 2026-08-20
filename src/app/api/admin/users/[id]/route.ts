import { NextResponse } from "next/server";
import { initDb, db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

initDb();

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { role } = body;

    if (role !== "admin" && role !== "customer") {
      return NextResponse.json(
        { error: "Invalid role specified" },
        { status: 400 }
      );
    }

    if (id === session.sub) {
      return NextResponse.json(
        { error: "You cannot demote your own admin account" },
        { status: 400 }
      );
    }

    db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, id);

    return NextResponse.json({ success: true, role });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update user role" },
      { status: 400 }
    );
  }
}
