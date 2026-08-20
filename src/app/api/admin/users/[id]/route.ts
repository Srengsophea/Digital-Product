import { NextResponse } from "next/server";
import { initDb, db, type UserRole, type UserStatus } from "@/lib/db";
import { requireAdmin, getUserById, saveUser, deleteUser } from "@/lib/auth";

initDb();

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { name, email, role, status } = body;

    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (role !== undefined && role !== "admin" && role !== "customer") {
      return NextResponse.json(
        { error: "Invalid role specified" },
        { status: 400 }
      );
    }

    if (status !== undefined && status !== "active" && status !== "banned") {
      return NextResponse.json(
        { error: "Invalid status specified" },
        { status: 400 }
      );
    }

    if (id === session.sub) {
      if (role && role !== "admin") {
        return NextResponse.json(
          { error: "You cannot demote your own admin account" },
          { status: 400 }
        );
      }
      if (status && status === "banned") {
        return NextResponse.json(
          { error: "You cannot ban your own admin account" },
          { status: 400 }
        );
      }
    }

    const updatedUser = {
      ...user,
      name: typeof name === "string" && name.trim().length > 0 ? name.trim() : user.name,
      email: typeof email === "string" && email.trim().length > 0 ? email.toLowerCase().trim() : user.email,
      role: (role ?? user.role) as UserRole,
      status: (status ?? user.status ?? "active") as UserStatus,
    };

    await saveUser(updatedUser);

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update user" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    if (id === session.sub) {
      return NextResponse.json(
        { error: "You cannot delete your own admin account" },
        { status: 400 }
      );
    }

    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await deleteUser(id);

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete user" },
      { status: 400 }
    );
  }
}
