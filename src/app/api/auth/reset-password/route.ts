import { NextResponse } from "next/server";
import { z } from "zod";
import { initDb } from "@/lib/db";
import {
  getUserByEmail,
  hashPassword,
  saveUser,
  createSession,
  setSessionCookie,
} from "@/lib/auth";
import {
  getPasswordResetCode,
  deletePasswordResetCode,
} from "@/lib/verification";

initDb();

const ResetPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  code: z.string().min(6, "Enter the 6-digit code").max(6),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = ResetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { email, code, newPassword } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  // Verify reset code
  const resetEntry = await getPasswordResetCode(normalizedEmail);
  if (!resetEntry) {
    return NextResponse.json(
      { error: "Password reset code has expired or was not requested. Please request a new code." },
      { status: 400 }
    );
  }

  if (resetEntry.code.trim() !== code.trim()) {
    return NextResponse.json(
      { error: "Incorrect verification code. Please check your email." },
      { status: 400 }
    );
  }

  // Get existing user
  const user = await getUserByEmail(normalizedEmail);
  if (!user) {
    return NextResponse.json(
      { error: "User account not found." },
      { status: 404 }
    );
  }

  if (user.status === "banned") {
    return NextResponse.json(
      { error: "This account is suspended. Please contact support." },
      { status: 403 }
    );
  }

  // Hash new password and save to Cloud Firestore + SQLite
  const newHash = await hashPassword(newPassword);
  const updatedUser = {
    ...user,
    password_hash: newHash,
  };

  await saveUser(updatedUser);

  // Remove used reset code
  await deletePasswordResetCode(normalizedEmail);

  // Automatically authenticate user
  const token = await createSession(updatedUser);
  await setSessionCookie(token);

  return NextResponse.json({
    ok: true,
    message: "Password reset successfully! You are now signed in.",
    redirect: updatedUser.role === "admin" ? "/admin" : "/account",
  });
}
