import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  await clearSessionCookie();

  // Support both query string (?next=) and form-encoded (input name="next")
  let next = req.nextUrl.searchParams.get("next");
  if (!next) {
    try {
      const form = await req.formData();
      const n = form.get("next");
      if (typeof n === "string") next = n;
    } catch {
      // Not a form submission — fine, JSON response below
    }
  }

  if (next && next.startsWith("/")) {
    return NextResponse.redirect(new URL(next, req.url));
  }
  return NextResponse.json({ ok: true });
}
