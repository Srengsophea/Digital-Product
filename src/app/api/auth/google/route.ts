import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode"); // optional query mode

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  if (!clientId || clientId === "your-google-client-id.apps.googleusercontent.com") {
    // If GOOGLE_CLIENT_ID is not configured in .env.local yet
    const errorUrl = new URL("/login", baseUrl);
    errorUrl.searchParams.set("error", "missing_google_credentials");
    return NextResponse.redirect(errorUrl);
  }

  // Construct official Google OAuth 2.0 Authorization URL
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
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
