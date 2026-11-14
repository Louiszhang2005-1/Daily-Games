import { NextResponse } from "next/server";
import { getPlayer } from "@/shared/identity";
import { submitResult, type SubmitInput } from "@/shared/results";

export async function POST(req: Request) {
  let body: SubmitInput;
  try {
    body = (await req.json()) as SubmitInput;
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const player = await getPlayer();
  const result = await submitResult(body, player);
  return NextResponse.json(result, { status: "error" in result ? 400 : 200 });
}
