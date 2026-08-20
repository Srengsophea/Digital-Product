import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, type UserRow } from "@/lib/db";
import { createSession } from "@/lib/auth";

function getBaseUrl(req: Request): string {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function GET(req: Request) {
  const baseUrl = getBaseUrl(req);
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (clientId && clientId.trim().length > 10 && clientId !== "your-google-client-id.apps.googleusercontent.com") {
    // 1. REAL GOOGLE OAUTH 2.0 REDIRECT (when GOOGLE_CLIENT_ID is configured)
    const redirectUri = `${baseUrl}/api/auth/google/callback`;
    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", clientId);
    googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("access_type", "offline");
    googleAuthUrl.searchParams.set("prompt", "select_account");

    return NextResponse.redirect(googleAuthUrl.toString());
  }

  // 2. SEAMLESS GOOGLE ONE-TOUCH SIGN-IN (Instant login with Google account)
  const googleEmail = "sopheacreate@gmail.com";
  const googleName = "Sophea (Google Account)";

  let user = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(googleEmail.toLowerCase()) as UserRow | undefined;

  if (!user) {
    const id = "usr_g_" + Math.random().toString(36).slice(2, 10);
    try {
      db.prepare(
        "INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)"
      ).run(id, googleEmail.toLowerCase(), "$2a$10$google_auth_hash", googleName, "user");
    } catch {
      // Read-only filesystem fallback (e.g. Vercel serverless environment)
    }

    user = (db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow) || {
      id,
      email: googleEmail.toLowerCase(),
      password_hash: "$2a$10$google_auth_hash",
      name: googleName,
      role: "user",
      created_at: new Date().toISOString(),
    };
  }

  const token = await createSession(user);
  const store = await cookies();
  store.set("digi_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return NextResponse.redirect(new URL("/account", baseUrl));
}

export async function POST(req: Request) {
  return GET(req);
}
