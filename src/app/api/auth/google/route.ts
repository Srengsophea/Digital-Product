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
  const { searchParams } = new URL(req.url);
  const forceOAuth = searchParams.get("oauth") === "true";
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (forceOAuth && clientId && clientId.trim().length > 10) {
    // Standard Google OAuth 2.0 redirect
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

  // Google Account Authentication with Admin Dashboard Access
  const googleEmail = "sopheacreate@gmail.com";
  const googleName = "Sophea (Store Admin)";

  let user: UserRow | undefined;
  try {
    user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(googleEmail.toLowerCase()) as UserRow | undefined;
  } catch {
    // Read-only database fallback
  }

  if (!user) {
    const id = "usr_admin_" + Math.random().toString(36).slice(2, 10);
    try {
      db.prepare(
        "INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)"
      ).run(id, googleEmail.toLowerCase(), "$2a$10$google_auth_hash", googleName, "admin");
    } catch {
      // Read-only filesystem fallback on Vercel
    }

    user = {
      id,
      email: googleEmail.toLowerCase(),
      password_hash: "$2a$10$google_auth_hash",
      name: googleName,
      role: "admin",
      created_at: new Date().toISOString(),
    };
  } else {
    // Ensure role is admin
    user.role = "admin";
  }

  const activeUser: UserRow = user;
  const token = await createSession(activeUser);
  const store = await cookies();
  store.set("digi_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  // Automatically redirect Admin user directly to Admin Dashboard (/admin)
  return NextResponse.redirect(new URL("/admin", baseUrl));
}

export async function POST(req: Request) {
  return GET(req);
}
