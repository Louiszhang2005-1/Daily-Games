import "server-only";
import { dayIndex } from "@/shared/day";
import { fmtSeconds } from "@/shared/format";
import type { GameServer } from "@/shared/game";
import { loadStoredPuzzle } from "@/shared/puzzles";
import { rotatingPick } from "@/shared/rng";
import { SIZE } from "./builder";
import { encodeSolution, entriesOf, rawScore, templateOf, type CrosswordFull, type Entry } from "./logic";
import { SEEDS } from "./seed";

export interface CrosswordPublic {
  level: "easy" | "medium";
  shape: string[];
  entries: Entry[];
  solution: string; // obfuscated
}

export interface CrosswordPayload {
  filled: string[];
  seconds: number;
  letterHints: number;
  wordHints: number;
}

export const server: GameServer<CrosswordFull, CrosswordPublic, CrosswordPayload> = {
  async load(day, v) {
    const level = v.level === "medium" ? "medium" : "easy";
    const stored = await loadStoredPuzzle<CrosswordFull>("crossword", day, { lang: v.lang, level });
    if (stored) return stored;
    const seeds = SEEDS[v.lang]?.[level];
    if (!seeds?.length) return null;
    return { full: rotatingPick(seeds, dayIndex(day), `crossword:${v.lang}:${level}`), source: "seed" };
  },

  toPublic(full, v) {
    return {
      level: v.level === "medium" ? "medium" : "easy",
      shape: templateOf(full.grid),
      entries: entriesOf(full),
      solution: encodeSolution(full.grid),
    };
  },

  score(full, p) {
    const filled = Array.isArray(p?.filled) ? p.filled.map((r) => String(r).toLowerCase()) : [];
    if (filled.length !== SIZE || filled.some((r, i) => r !== full.grid[i])) return { error: "grid not solved" };
    const seconds = Number(p.seconds);
    const lh = Math.max(0, Math.floor(Number(p.letterHints) || 0));
    const wh = Math.max(0, Math.floor(Number(p.wordHints) || 0));
    if (!Number.isFinite(seconds) || seconds < 3 || seconds > 86_400) return { error: "bad time" };
    const raw = rawScore(seconds, lh, wh);
    const label = fmtSeconds(raw);
    const hints = lh + wh;
    return {
      raw,
      details: {
        seconds: Math.round(seconds),
        letterHints: lh,
        wordHints: wh,
        summary: { en: hints ? `${label} (incl. hints)` : label, fr: hints ? `${label} (avec indices)` : label },
      },
    };
  },

  difficultyDetail(raws, lang) {
    const sorted = raws.slice().sort((a, b) => a - b);
    const med = sorted[Math.floor(sorted.length / 2)] ?? 0;
    return lang === "fr" ? `médiane ${fmtSeconds(med)}` : `median ${fmtSeconds(med)}`;
  },
};
