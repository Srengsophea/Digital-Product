import { NextResponse } from "next/server";
import { z } from "zod";
import { initDb } from "@/lib/db";
import { createSession, setSessionCookie, saveUser } from "@/lib/auth";
import { getPendingVerification, deletePendingVerification } from "@/lib/verification";
import { newId } from "@/lib/utils";

initDb();

const VerifyCodeSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  code: z.string().min(6, "Enter the 6-digit code").max(6),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = VerifyCodeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { email, code } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  // Retrieve pending verification entry
  const pending = await getPendingVerification(normalizedEmail);
  if (!pending) {
    return NextResponse.json(
      { error: "Verification code expired or not found. Please request a new code." },
      { status: 400 }
    );
  }

  if (pending.code.trim() !== code.trim()) {
    return NextResponse.json(
      { error: "Incorrect verification code. Please check your email." },
      { status: 400 }
    );
  }

  // Create the verified user
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const role = adminEmail && normalizedEmail === adminEmail ? "admin" : "customer";

  const user = {
    id: newId("usr"),
    email: normalizedEmail,
    password_hash: pending.passwordHash,
    name: pending.name,
    role: role as "admin" | "customer",
    created_at: new Date().toISOString(),
  };

  // Persist to Cloud Firestore + SQLite
  await saveUser(user);

  // Clear verification code
  await deletePendingVerification(normalizedEmail);

  // Create session and set cookie
  const token = await createSession(user);
  await setSessionCookie(token);

  return NextResponse.json(
    {
      ok: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      redirect: user.role === "admin" ? "/admin" : "/account",
    },
    { status: 201 }
  );
}
