import { NextResponse } from "next/server";
import { cronAuthorized } from "@/shared/cron";
import { addDays, todayET } from "@/shared/day";
import { lockDay } from "@/shared/scoring";

// Runs just after midnight ET. The day before yesterday locks for good;
// yesterday stays open for logged-in catch-up play.
export async function GET(req: Request) {
  if (!cronAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const day = new URL(req.url).searchParams.get("day") ?? addDays(todayET(), -2);
  const out = await lockDay(day);
  return NextResponse.json({ day, ...out });
}
