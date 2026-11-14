import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// 1. Gives every browser a stable guest id so its first result per puzzle can count.
// 2. Refreshes the Supabase session cookie when Supabase Auth is configured.
export async function middleware(req: NextRequest) {
  let newGuest: string | null = null;
  if (!req.cookies.get("gid")) {
    newGuest = crypto.randomUUID();
    req.cookies.set("gid", newGuest); // visible to this request's server components
  }
  let res = NextResponse.next({ request: { headers: req.headers } });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anon) {
    const sb = createServerClient(url, anon, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: { headers: req.headers } });
          list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    });
    await sb.auth.getUser();
  }

  if (newGuest) res.cookies.set("gid", newGuest, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 400 });
  return res;
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico|api/card|api/cron).*)"],
};
