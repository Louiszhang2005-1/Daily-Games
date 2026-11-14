import "server-only";
import { dayIndex } from "@/shared/day";
import { mulberry32, rotatingPick } from "@/shared/rng";
import { wordList } from "@/games/word/words";
import type { WordFull } from "@/games/word/server";
import { recentAnswerKeys } from "../archive";
import { hasBlockedWord } from "../blocklist";
import type { Generator } from "./types";

// Word game: the answer is picked at random from the hand-made list. No Gemini.
const REPEAT_DAYS = 365;

export const wordGenerator: Generator = {
  game: "word",
  needsGemini: false,
  variants: (lang) => [{ lang }],

  async generate(day, v, attempt) {
    const list = wordList(v.lang);
    if (!list) throw new Error(`no word list for ${v.lang}`);
    const used = await recentAnswerKeys("word", v.lang, day, REPEAT_DAYS);
    let answer = rotatingPick(list.answers, dayIndex(day) + attempt * 7919, `word:${v.lang}`);
    if (used.has(answer)) {
      const fresh = list.answers.filter((w) => !used.has(w));
      if (fresh.length === 0) throw new Error("every answer was used in the last year");
      answer = fresh[Math.floor(mulberry32(dayIndex(day) * 31 + attempt)() * fresh.length)];
    }
    const content: WordFull = { answer };
    return { content, answerKey: answer };
  },

  async check(g, day, v) {
    const problems: string[] = [];
    const { answer } = g.content as WordFull;
    const list = wordList(v.lang);
    if (!/^[a-z]{5}$/.test(answer ?? "")) problems.push("answer is not 5 letters a-z");
    if (list && !list.allowed.has(answer)) problems.push("answer not in dictionary");
    if (hasBlockedWord(answer)) problems.push("blocked word");
    if ((await recentAnswerKeys("word", v.lang, day, REPEAT_DAYS)).has(answer)) problems.push("answer repeats within a year");
    return problems;
  },
};
