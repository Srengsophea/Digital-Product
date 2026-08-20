import { NextResponse } from "next/server";
import { z } from "zod";
import { initDb } from "@/lib/db";
import {
  getUserByEmail,
  verifyPassword,
  createSession,
  setSessionCookie,
} from "@/lib/auth";

initDb();

const LoginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;
  const user = await getUserByEmail(email);

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const token = await createSession(user);
  await setSessionCookie(token);

  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}
