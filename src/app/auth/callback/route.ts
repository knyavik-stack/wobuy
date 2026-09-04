import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getSafeNextPath(value: string | null) {
  return value === "/reset-password" ? value : "/dashboard";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const nextPath = getSafeNextPath(url.searchParams.get("next"));
  const origin = url.origin;

  const supabase = await createClient();

  if (code) {
    const flowId = url.searchParams.get("sb_flow_id");
    const { error } = await supabase.auth.exchangeCodeForSession(
      code,
      flowId ? { flowId } : undefined,
    );
    if (!error) return NextResponse.redirect(`${origin}${nextPath}`);
  }

  if (tokenHash && type === "email") {
    const { error } = await supabase.auth.verifyOtp({ type: "email", token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${nextPath}`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback`);
}
