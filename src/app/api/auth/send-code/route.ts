import { NextResponse } from "next/server";
import { z } from "zod";
import { db, initDb } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { savePendingVerification } from "@/lib/verification";
import { sendVerificationEmail } from "@/lib/mail";

initDb();

const SendCodeSchema = z.object({
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

  const parsed = SendCodeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  // Check if account already exists
  try {
    const existing = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(normalizedEmail);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 409 }
      );
    }
  } catch {
    // Database fallback
  }

  // Generate 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const passwordHash = await hashPassword(password);

  // Save pending verification (valid for 10 minutes)
  savePendingVerification({
    email: normalizedEmail,
    code,
    name,
    passwordHash,
    ttlMinutes: 10,
  });

  try {
    // Send email via SMTP
    await sendVerificationEmail({
      to: normalizedEmail,
      name,
      code,
    });

    return NextResponse.json({
      ok: true,
      message: `Verification code sent to ${normalizedEmail}`,
    });
  } catch (err) {
    console.error("Error sending verification email:", err);
    return NextResponse.json(
      {
        error:
          "Failed to send email. Please ensure your SMTP_EMAIL and SMTP_APP_PASSWORD are set correctly in .env.local.",
      },
      { status: 500 }
    );
  }
}
