import { NextResponse } from "next/server";
import { z } from "zod";
import { initDb } from "@/lib/db";
import { hashPassword, createSession, setSessionCookie, saveUser, getUserByEmail } from "@/lib/auth";
import { newId } from "@/lib/utils";

initDb();

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await getUserByEmail(normalizedEmail);
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const user = {
    id: newId("usr"),
    email: normalizedEmail,
    password_hash: await hashPassword(password),
    name: name.trim(),
    role: "customer" as const,
    created_at: new Date().toISOString(),
  };

  // Persist to Cloud Firestore + SQLite
  await saveUser(user);

  const token = await createSession(user);
  await setSessionCookie(token);

  return NextResponse.json(
    { user: { id: user.id, email: user.email, name: user.name, role: user.role } },
    { status: 201 }
  );
}
