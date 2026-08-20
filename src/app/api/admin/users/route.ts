import { NextResponse } from "next/server";
import { initDb, db, type UserRow } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { firestoreDb, COLLECTIONS } from "@/lib/firebase-admin";

initDb();

export async function GET() {
  try {
    await requireAdmin();

    const usersMap = new Map<string, any>();

    // 1. Fetch from SQLite
    try {
      const sqliteUsers = db
        .prepare(
          `SELECT u.id, u.email, u.name, u.role, u.status, u.created_at,
                  COUNT(o.id) AS order_count,
                  COALESCE(SUM(o.total_cents), 0) AS total_spent_cents
           FROM users u
           LEFT JOIN orders o ON o.user_id = u.id AND o.status != 'cancelled'
           GROUP BY u.id
           ORDER BY u.created_at DESC`
        )
        .all();

      for (const u of sqliteUsers as any[]) {
        usersMap.set(u.id, {
          ...u,
          status: u.status || "active",
        });
      }
    } catch {}

    // 2. Fetch from Cloud Firestore
    try {
      const firestoreSnap = await firestoreDb.collection(COLLECTIONS.USERS).get();
      for (const doc of firestoreSnap.docs) {
        const data = doc.data() as UserRow;
        const existing = usersMap.get(data.id);
        if (existing) {
          usersMap.set(data.id, {
            ...existing,
            name: data.name || existing.name,
            email: data.email || existing.email,
            role: data.role || existing.role,
            status: data.status || existing.status || "active",
          });
        } else {
          usersMap.set(data.id, {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role || "customer",
            status: data.status || "active",
            created_at: data.created_at || new Date().toISOString(),
            order_count: 0,
            total_spent_cents: 0,
          });
        }
      }
    } catch {}

    const users = Array.from(usersMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({ users });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unauthorized" },
      { status: 401 }
    );
  }
}
