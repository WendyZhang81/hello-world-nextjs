import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("OAuth callback error:", error.message);

    return NextResponse.redirect(
      `${origin}/login?error=auth_callback`
    );
  }

  // Vercel may sit behind a proxy, so use the original public host
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";

  if (isLocal) {
    return NextResponse.redirect(`${origin}/profile`);
  }

  if (forwardedHost) {
    return NextResponse.redirect(
      `https://${forwardedHost}/profile`
    );
  }

  return NextResponse.redirect(`${origin}/profile`);
}