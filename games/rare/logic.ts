import { LIVE_THRESHOLD, type PromptAnswer, type RareTier } from "@/shared/prompts/types";

export const TIER_POINTS: Record<RareTier, number> = { common: 10, known: 30, rare: 60, deep: 85, legend: 100 };
export const MAX_POINTS = 700;

/** Tier from the live share of players who gave this answer. */
export function liveTier(count: number, total: number): RareTier {
  const share = total > 0 ? count / total : 0;
  if (share >= 0.15) return "common";
  if (share >= 0.06) return "known";
  if (share >= 0.02) return "rare";
  if (share >= 0.005) return "deep";
  return "legend";
}

export function tierFor(answer: PromptAnswer, counts: Map<string, number>, total: number): RareTier {
  if (total >= LIVE_THRESHOLD) return liveTier(counts.get(answer.id) ?? 0, total);
  return answer.tier ?? "deep";
}

export function topAnswer(answers: PromptAnswer[], counts: Map<string, number>, total: number): PromptAnswer | undefined {
  if (total >= LIVE_THRESHOLD) {
    let best: PromptAnswer | undefined;
    for (const a of answers) if (!best || (counts.get(a.id) ?? 0) > (counts.get(best.id) ?? 0)) best = a;
    return best;
  }
  return answers.find((a) => a.tier === "common") ?? answers[0];
}
