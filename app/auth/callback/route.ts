import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { EmailOtpType, User } from "@supabase/supabase-js";
import { claimGuestResults, ensureUser, supabaseServer } from "@/shared/auth";
import { GUEST_COOKIE } from "@/shared/identity";

// Supabase sends people here after Google / Microsoft / Apple sign-in or an email link.
// Handles both link styles: ?code=... (PKCE) and ?token_hash=...&type=email.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = url.searchParams.get("next") ?? "/";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const back = (error: string) => NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent(error)}&next=${encodeURIComponent(safeNext)}`, url.origin));

  const providerError = url.searchParams.get("error_description") ?? url.searchParams.get("error");
  if (providerError) return back(providerError);

  const sb = await supabaseServer();
  let user: User | null = null;
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  if (code) {
    const { data, error } = await sb.auth.exchangeCodeForSession(code);
    if (error) return back(error.message);
    user = data.user;
  } else if (tokenHash) {
    const type = (url.searchParams.get("type") ?? "email") as EmailOtpType;
    const { data, error } = await sb.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) return back(error.message);
    user = data.user;
  } else return back("missing sign-in code");

  if (user) {
    const meta = user.user_metadata ?? {};
    const full = (meta.full_name ?? meta.name ?? "") as string;
    const first = full.split(" ")[0] || null;
    const jar = await cookies();
    await ensureUser(user.id, first, jar.get("lang")?.value === "fr" ? "fr" : "en");
    await claimGuestResults(jar.get(GUEST_COOKIE)?.value, user.id);
  }
  return NextResponse.redirect(new URL(safeNext, url.origin));
}
