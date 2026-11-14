import "server-only";
import { dayIndex } from "@/shared/day";
import type { GameServer, Lang } from "@/shared/game";
import { loadStoredPuzzle } from "@/shared/puzzles";
import { rotatingPick } from "@/shared/rng";
import { cleanGuess, markGuess, MAX_GUESSES, rawScore, WORD_LENGTH, type Mark } from "./logic";
import { wordList } from "./words";

export interface WordFull {
  answer: string;
}

export interface WordPublic {
  length: number;
  maxGuesses: number;
}

export interface WordPayload {
  guesses: string[];
}

export function dailyAnswer(day: string, lang: Lang): string | null {
  const list = wordList(lang);
  if (!list) return null;
  return rotatingPick(list.answers, dayIndex(day), `word:${lang}`);
}

export const server: GameServer<WordFull, WordPublic, WordPayload> = {
  async load(day, v) {
    if (!wordList(v.lang)) return null;
    const stored = await loadStoredPuzzle<WordFull>("word", day, v);
    if (stored) return stored;
    const answer = dailyAnswer(day, v.lang);
    return answer ? { full: { answer }, source: "seed" } : null;
  },

  toPublic() {
    return { length: WORD_LENGTH, maxGuesses: MAX_GUESSES };
  },

  score(full, payload) {
    const guesses = Array.isArray(payload?.guesses) ? payload.guesses.map((g) => cleanGuess(String(g))) : [];
    if (guesses.length === 0 || guesses.length > MAX_GUESSES) return { error: "bad guesses" };
    const grid: Mark[][] = [];
    let solved = false;
    for (let i = 0; i < guesses.length; i++) {
      const g = guesses[i];
      if (g.length !== WORD_LENGTH) return { error: "bad guess length" };
      grid.push(markGuess(g, full.answer));
      if (g === full.answer) {
        solved = true;
        if (i !== guesses.length - 1) return { error: "guesses after solve" };
      }
    }
    if (!solved && guesses.length < MAX_GUESSES) return { error: "unfinished" };
    const used = guesses.length;
    const label = solved ? `${used}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
    return {
      raw: rawScore(used, solved),
      details: {
        solved,
        used,
        grid,
        answer: full.answer,
        // A failed round reveals the word on the results screen (never in the share text).
        summary: solved ? { en: label, fr: label } : { en: `${label} · ${full.answer.toUpperCase()}`, fr: `${label} · ${full.answer.toUpperCase()}` },
      },
    };
  },

  difficultyDetail(raws, lang) {
    const solved = raws.filter((r) => r > 0);
    if (solved.length === 0) return lang === "fr" ? "personne ne l'a trouvé" : "nobody solved it";
    const avg = solved.reduce((a, r) => a + (MAX_GUESSES + 1 - r), 0) / solved.length;
    return lang === "fr" ? `moy. ${avg.toFixed(1).replace(".", ",")} essais` : `avg ${avg.toFixed(1)} guesses`;
  },
};
