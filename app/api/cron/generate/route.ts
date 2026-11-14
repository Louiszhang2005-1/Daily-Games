import { NextResponse } from "next/server";
import { cronAuthorized } from "@/shared/cron";
import { ensureStockpile, STOCKPILE_DAYS } from "@/jobs/generate";

export const maxDuration = 300;

// Daily: keeps 30 days of puzzles generated ahead. `max` caps how many new days one call fills.
export async function GET(req: Request) {
  if (!cronAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const q = new URL(req.url).searchParams;
  const max = Math.max(1, Math.min(STOCKPILE_DAYS, Number(q.get("max") ?? 2)));
  const reports = await ensureStockpile(STOCKPILE_DAYS, max);
  const summary = reports.reduce<Record<string, number>>((acc, r) => ((acc[r.result] = (acc[r.result] ?? 0) + 1), acc), {});
  return NextResponse.json({ summary, changed: reports.filter((r) => r.result !== "exists") });
}
