import "server-only";
import { dayIndex } from "@/shared/day";
import type { GameServer } from "@/shared/game";
import { bumpCount, logRejected, matchPrompt, promptCounts } from "@/shared/prompts/server";
import { PROMPT_SECONDS, type PromptPayload, type PromptPuzzle } from "@/shared/prompts/types";
import { loadStoredPuzzle } from "@/shared/puzzles";
import { rotatingPick } from "@/shared/rng";
import { board, pointsFor } from "./logic";
import { SEEDS } from "./seed";

export interface CommonPublic {
  prompts: { text: string }[];
  seconds: number;
}

export interface CommonPromptResult {
  text: string;
  answer: string | null;
  display: string | null;
  points: number;
  top: string | null;
}

export const server: GameServer<PromptPuzzle, CommonPublic, PromptPayload> = {
  async load(day, v) {
    const stored = await loadStoredPuzzle<PromptPuzzle>("common", day, v);
    if (stored) return stored;
    const seeds = SEEDS[v.lang];
    if (!seeds?.length) return null;
    return { full: { prompts: rotatingPick(seeds, dayIndex(day), `common:${v.lang}`) }, source: "seed" };
  },

  toPublic(full) {
    return { prompts: full.prompts.map((p) => ({ text: p.text })), seconds: PROMPT_SECONDS };
  },

  async score(full, payload, ctx) {
    const answers = Array.isArray(payload?.answers) ? payload.answers : [];
    if (answers.length !== full.prompts.length) return { error: "wrong number of answers" };
    const per: CommonPromptResult[] = [];
    for (let i = 0; i < full.prompts.length; i++) {
      const p = full.prompts[i];
      const text = typeof answers[i] === "string" ? (answers[i] as string).slice(0, 80) : null;
      const id = matchPrompt(p, text);
      const { counts, total } = await promptCounts(ctx.puzzleId, i);
      const rows = board(p.answers, counts, total);
      per.push({
        text: p.text,
        answer: text,
        display: id ? (rows.find((r) => r.id === id)?.display ?? null) : null,
        points: pointsFor(rows, id),
        top: rows[0]?.display ?? null,
      });
    }
    const raw = per.reduce((a, r) => a + r.points, 0);
    return { raw, details: { perPrompt: per, summary: { en: `${raw} pts`, fr: `${raw} pts` } } };
  },

  async afterSave(full, payload, ctx) {
    for (let i = 0; i < full.prompts.length; i++) {
      const p = full.prompts[i];
      const text = typeof payload.answers[i] === "string" ? (payload.answers[i] as string).slice(0, 80) : null;
      const id = matchPrompt(p, text);
      if (id) await bumpCount(ctx.puzzleId, i, id);
      else if (text) await logRejected("common", ctx.variant.lang, ctx.puzzleId, i, p, text);
    }
  },

  difficultyDetail(raws, lang) {
    const avg = Math.round(raws.reduce((a, b) => a + b, 0) / Math.max(1, raws.length));
    return lang === "fr" ? `moy. ${avg} pts` : `avg ${avg} pts`;
  },
};
