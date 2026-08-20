import { NextResponse } from "next/server";

function getBaseUrl(req: Request): string {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_APP_URL || "https://www.digital-product.site";
}

export async function GET(req: Request) {
  const baseUrl = getBaseUrl(req);
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId || clientId.trim().length === 0) {
    const errorUrl = new URL("/login", baseUrl);
    errorUrl.searchParams.set("error", "missing_google_credentials");
    return NextResponse.redirect(errorUrl);
  }

  // Real Google OAuth 2.0 authorization redirect
  const redirectUri = `${baseUrl}/api/auth/google/callback`;
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId.trim());
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("prompt", "select_account");

  return NextResponse.redirect(googleAuthUrl.toString());
}

export async function POST(req: Request) {
  return GET(req);
}

