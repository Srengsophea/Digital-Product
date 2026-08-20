import { NextResponse } from "next/server";
import { z } from "zod";
import { initDb } from "@/lib/db";
import { getUserByEmail } from "@/lib/auth";
import { savePasswordResetCode } from "@/lib/verification";
import { sendPasswordResetEmail } from "@/lib/mail";

initDb();

const ForgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = ForgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { email } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  // Find user by email
  const user = await getUserByEmail(normalizedEmail);
  if (!user) {
    return NextResponse.json(
      { error: "No account found with this email address." },
      { status: 404 }
    );
  }

  if (user.status === "banned") {
    return NextResponse.json(
      { error: "This account is suspended. Please contact support." },
      { status: 403 }
    );
  }

  // Generate 6-digit OTP code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Save reset code (10 minutes)
  await savePasswordResetCode({
    email: normalizedEmail,
    code,
    ttlMinutes: 10,
  });

  try {
    await sendPasswordResetEmail({
      to: normalizedEmail,
      name: user.name,
      code,
    });

    return NextResponse.json({
      ok: true,
      message: `Password reset code sent to ${normalizedEmail}`,
    });
  } catch (err) {
    console.error("Error sending password reset email:", err);
    return NextResponse.json(
      {
        error:
          "Failed to send email. Please ensure your SMTP_EMAIL and SMTP_APP_PASSWORD are set correctly in .env.local.",
      },
      { status: 500 }
    );
  }
}
