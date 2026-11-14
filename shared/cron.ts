import "server-only";

/** Cron routes accept `Authorization: Bearer $CRON_SECRET` (Vercel Cron sends this). */
export function cronAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return req.headers.get("authorization") === `Bearer ${secret}`;
}
