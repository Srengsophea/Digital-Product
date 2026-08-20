import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, type UserRow } from "@/lib/db";
import { createSession } from "@/lib/auth";

function getBaseUrl(req: Request): string {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_APP_URL || "https://www.digital-product.site";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const baseUrl = getBaseUrl(req);

  if (error || !code) {
    const errorUrl = new URL("/login", baseUrl);
    errorUrl.searchParams.set("error", error ?? "google_auth_cancelled");
    return NextResponse.redirect(errorUrl);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    const errorUrl = new URL("/login", baseUrl);
    errorUrl.searchParams.set("error", "missing_google_credentials");
    return NextResponse.redirect(errorUrl);
  }

  try {
    // 1. Exchange authorization code for Google access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      const errorUrl = new URL("/login", baseUrl);
      errorUrl.searchParams.set("error", tokenData.error_description ?? "google_token_failed");
      return NextResponse.redirect(errorUrl);
    }

    // 2. Fetch real Google User Profile info
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userRes.json();

    if (!userRes.ok || !googleUser.email) {
      const errorUrl = new URL("/login", baseUrl);
      errorUrl.searchParams.set("error", "google_profile_failed");
      return NextResponse.redirect(errorUrl);
    }

    const email = googleUser.email.toLowerCase().trim();
    const name = googleUser.name || googleUser.email.split("@")[0];
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const isUserAdmin = adminEmail ? email === adminEmail : false;
    const initialRole = isUserAdmin ? "admin" : "user";

    // 3. Find or register user in database
    let user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email) as UserRow | undefined;

    if (!user) {
      const id = "usr_g_" + Math.random().toString(36).slice(2, 10);
      try {
        db.prepare(
          "INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)"
        ).run(id, email, "$2a$10$google_oauth_hash", name, initialRole);
      } catch {
        // Read-only filesystem fallback (e.g. Vercel serverless environment)
      }

      user = (db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow) || {
        id,
        email,
        password_hash: "$2a$10$google_oauth_hash",
        name,
        role: initialRole,
        created_at: new Date().toISOString(),
      };
    }

    // 4. Create JWT session token & set cookie
    const token = await createSession(user);
    const store = await cookies();
    store.set("digi_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    const destination = (user.role === "admin" || isUserAdmin) ? "/admin" : "/account";
    return NextResponse.redirect(new URL(destination, baseUrl));
  } catch (err) {
    const errorUrl = new URL("/login", baseUrl);
    errorUrl.searchParams.set(
      "error",
      err instanceof Error ? err.message : "google_auth_error"
    );
    return NextResponse.redirect(errorUrl);
  }
}
