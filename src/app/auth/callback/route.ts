import { NextResponse, type NextRequest } from "next/server";
import { safeRedirectPath } from "@/features/auth/schemas/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const next = safeRedirectPath(searchParams.get("next"), "/dashboard");
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(new URL("/login?error=auth", request.url));
    }
  }

  if (tokenHash && type) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.verifyOtp({
      type: type as Parameters<typeof supabase.auth.verifyOtp>[0]["type"],
      token_hash: tokenHash,
    });

    if (error) {
      return NextResponse.redirect(new URL("/login?error=auth", request.url));
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}
