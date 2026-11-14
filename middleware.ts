import { NextResponse, type NextRequest } from "next/server";

// Gives every browser a stable guest id so its first result per puzzle can count.
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  if (!req.cookies.get("gid")) {
    const id = crypto.randomUUID();
    // Make the id visible to this same request's server components too.
    req.cookies.set("gid", id);
    const forwarded = NextResponse.next({ request: { headers: req.headers } });
    forwarded.cookies.set("gid", id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 400 });
    return forwarded;
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico|api/card).*)"],
};
