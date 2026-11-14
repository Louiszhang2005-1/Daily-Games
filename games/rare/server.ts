import "server-only";
import { dayIndex } from "@/shared/day";
import type { GameServer } from "@/shared/game";
import { bumpCount, logRejected, matchPrompt, promptCounts } from "@/shared/prompts/server";
import { PROMPT_SECONDS, type PromptPayload, type PromptPuzzle, type RareTier } from "@/shared/prompts/types";
import { loadStoredPuzzle } from "@/shared/puzzles";
import { rotatingPick } from "@/shared/rng";
import { MAX_POINTS, TIER_POINTS, tierFor, topAnswer } from "./logic";
import { SEEDS } from "./seed";

export interface RarePublic {
  prompts: { text: string }[];
  seconds: number;
}

export interface PromptResult {
  text: string;
  answer: string | null;
  display: string | null;
  tier: RareTier | null;
  points: number;
  top: string | null;
}

export const server: GameServer<PromptPuzzle, RarePublic, PromptPayload> = {
  async load(day, v) {
    const stored = await loadStoredPuzzle<PromptPuzzle>("rare", day, v);
    if (stored) return stored;
    const seeds = SEEDS[v.lang];
    if (!seeds?.length) return null;
    return { full: { prompts: rotatingPick(seeds, dayIndex(day), `rare:${v.lang}`) }, source: "seed" };
  },

  toPublic(full) {
    return { prompts: full.prompts.map((p) => ({ text: p.text })), seconds: PROMPT_SECONDS };
  },

  async score(full, payload, ctx) {
    const answers = Array.isArray(payload?.answers) ? payload.answers : [];
    if (answers.length !== full.prompts.length) return { error: "wrong number of answers" };
    const per: PromptResult[] = [];
    for (let i = 0; i < full.prompts.length; i++) {
      const p = full.prompts[i];
      const text = typeof answers[i] === "string" ? (answers[i] as string).slice(0, 80) : null;
      const id = matchPrompt(p, text);
      const { counts, total } = await promptCounts(ctx.puzzleId, i);
      const top = topAnswer(p.answers, counts, total)?.aliases[0] ?? null;
      const ans = id ? p.answers.find((a) => a.id === id) : undefined;
      const tier = ans ? tierFor(ans, counts, total) : null;
      per.push({ text: p.text, answer: text, display: ans?.aliases[0] ?? null, tier, points: tier ? TIER_POINTS[tier] : 0, top });
    }
    const raw = per.reduce((a, r) => a + r.points, 0);
    return { raw, details: { perPrompt: per, summary: { en: `${raw} / ${MAX_POINTS}`, fr: `${raw} / ${MAX_POINTS}` } } };
  },

  async afterSave(full, payload, ctx) {
    for (let i = 0; i < full.prompts.length; i++) {
      const p = full.prompts[i];
      const text = typeof payload.answers[i] === "string" ? (payload.answers[i] as string).slice(0, 80) : null;
      const id = matchPrompt(p, text);
      if (id) await bumpCount(ctx.puzzleId, i, id);
      else if (text) await logRejected("rare", ctx.variant.lang, ctx.puzzleId, i, p, text);
    }
  },

  difficultyDetail(raws, lang) {
    const avg = Math.round(raws.reduce((a, b) => a + b, 0) / Math.max(1, raws.length));
    return lang === "fr" ? `moy. ${avg} pts` : `avg ${avg} pts`;
  },
};
