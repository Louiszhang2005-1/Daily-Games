"use server";

import { parseVariant, puzzleId as makeId } from "@/shared/game";
import { isNonsense } from "@/shared/matcher";
import { dayAllowed, logRejected, matchPrompt, promptCounts } from "@/shared/prompts/server";
import type { RareTier } from "@/shared/prompts/types";
import { TIER_POINTS, tierFor, topAnswer } from "./logic";
import { server } from "./server";

export type RareReveal =
  | { ok: true; display: string; tier: RareTier; points: number; top: string | null }
  | { ok: false; reason: "empty" | "nonsense" | "unlisted"; top: string | null };

// Instant feedback after each prompt. The final score is recomputed on submit.
export async function answerRare(day: string, variant: string, index: number, text: string | null): Promise<RareReveal> {
  const v = parseVariant(variant);
  if (!(await dayAllowed(day))) return { ok: false, reason: "empty", top: null };
  const loaded = await server.load(day, v);
  const p = loaded?.full.prompts[index];
  if (!p) return { ok: false, reason: "empty", top: null };
  const { counts, total } = await promptCounts(makeId("rare", day, v), index);
  const top = topAnswer(p.answers, counts, total)?.aliases[0] ?? null;
  if (!text) return { ok: false, reason: "empty", top };
  if (isNonsense(text)) return { ok: false, reason: "nonsense", top };
  const id = matchPrompt(p, text);
  const ans = id ? p.answers.find((a) => a.id === id) : undefined;
  if (!ans) {
    // Every turned-away answer is logged for the nightly review.
    await logRejected("rare", v.lang, makeId("rare", day, v), index, p, text.slice(0, 80));
    return { ok: false, reason: "unlisted", top };
  }
  const tier = tierFor(ans, counts, total);
  return { ok: true, display: ans.aliases[0], tier, points: TIER_POINTS[tier], top };
}

/** "Report: this should count" logs the answer for tonight's review. */
export async function reportRare(day: string, variant: string, index: number, text: string): Promise<void> {
  const v = parseVariant(variant);
  if (!text || !(await dayAllowed(day))) return;
  const loaded = await server.load(day, v);
  const p = loaded?.full.prompts[index];
  if (p) await logRejected("rare", v.lang, makeId("rare", day, v), index, p, text.slice(0, 80));
}
