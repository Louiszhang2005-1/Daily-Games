import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { claimGuestResults, ensureUser, supabaseServer } from "@/shared/auth";
import { GUEST_COOKIE } from "@/shared/identity";

// Supabase redirects here after Google sign-in or a magic link.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  if (code) {
    const sb = await supabaseServer();
    const { data, error } = await sb.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const name = (data.user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ?? null;
      const lang = (await cookies()).get("lang")?.value === "fr" ? "fr" : "en";
      await ensureUser(data.user.id, name, lang);
      await claimGuestResults((await cookies()).get(GUEST_COOKIE)?.value, data.user.id);
    }
  }
  return NextResponse.redirect(new URL(next.startsWith("/") ? next : "/", url.origin));
}
