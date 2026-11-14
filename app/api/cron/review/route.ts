import { NextResponse } from "next/server";
import { cronAuthorized } from "@/shared/cron";
import { nightlyReview } from "@/jobs/review";

export const maxDuration = 300;

// Nightly: sorts rejected answers and approves real ones for future days.
export async function GET(req: Request) {
  if (!cronAuthorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(await nightlyReview());
}
