import "server-only";
import { dayIndex } from "@/shared/day";
import type { Lang } from "@/shared/game";
import { buildGrid, isSymmetric, SIZE, TEMPLATES } from "@/games/crossword/builder";
import { WORDS_EN_3, WORDS_EN_4, WORDS_EN_5 } from "@/games/crossword/data/words-en";
import { WORDS_FR_3, WORDS_FR_4, WORDS_FR_5 } from "@/games/crossword/data/words-fr";
import { answersOf, templateOf, type CrosswordFull } from "@/games/crossword/logic";
import { recentAnswerKeys } from "../archive";
import { anyBlocked } from "../blocklist";
import { geminiJSON } from "../gemini";
import type { Generator } from "./types";

// Mini Crossword: code builds the grid from the word list; Gemini writes the clues.
const REPEAT_DAYS = 60;

const WORDS: Record<Lang, string[]> = {
  en: [...WORDS_EN_3, ...WORDS_EN_4, ...WORDS_EN_5],
  fr: [...WORDS_FR_3, ...WORDS_FR_4, ...WORDS_FR_5.filter((w) => w.length === 5)],
};

function cluePrompt(answers: Record<string, string>, level: string, lang: Lang): string {
  const language = lang === "fr" ? "French (answers have accents removed; clue the real French word)" : "English";
  const tone =
    level === "medium"
      ? "Medium difficulty: a little playful or indirect, still fair and everyday."
      : "Easy: plain, direct, everyday wording anyone gets.";
  const list = Object.entries(answers)
    .map(([k, w]) => `${k}: ${w.toUpperCase()}`)
    .join("\n");
  return `Write crossword clues in ${language}. ${tone}
Never use the answer word (or a form of it) inside its clue. Max 8 words per clue. No obscure trivia.
Answers (key: ANSWER):
${list}
Reply as JSON mapping each key to its clue, e.g. {"1a": "...", "1d": "..."}.`;
}

export const crosswordGenerator: Generator = {
  game: "crossword",
  needsGemini: true,
  variants: (lang) => [
    { lang, level: "easy" },
    { lang, level: "medium" },
  ],

  async generate(day, v, attempt) {
    const level = v.level === "medium" ? "medium" : "easy";
    const avoid = await recentAnswerKeys("crossword", v.lang, day, REPEAT_DAYS);
    const templates = TEMPLATES[level];
    let fill = null;
    for (let k = 0; k < 120 && !fill; k++) {
      const seed = dayIndex(day) * 1000 + attempt * 200 + k + (level === "medium" ? 500_000 : 0) + (v.lang === "fr" ? 7 : 0);
      fill = buildGrid(templates[seed % templates.length], WORDS[v.lang], seed, avoid);
    }
    if (!fill) throw new Error("grid builder found no fill");
    const grid = fill.grid;
    const answers = answersOf({ grid, clues: {} });
    const clues = await geminiJSON<Record<string, string>>(cluePrompt(answers, level, v.lang));
    const content: CrosswordFull = { grid, clues };
    return { content, answerKey: Object.values(answers).join("|") };
  },

  async check(g, day, v) {
    const p = g.content as CrosswordFull;
    const problems: string[] = [];
    if (p.grid.length !== SIZE || p.grid.some((r) => r.length !== SIZE)) return ["grid is not 5x5"];
    if (p.grid.some((r) => /[^a-z#]/.test(r))) problems.push("grid not fully filled");
    if (!isSymmetric(templateOf(p.grid))) problems.push("grid not symmetric");
    const answers = answersOf(p);
    const vocab = new Set(WORDS[v.lang]);
    for (const [key, word] of Object.entries(answers)) {
      if (!vocab.has(word)) problems.push(`${word} not in word list`);
      const clue = p.clues[key];
      if (!clue?.trim()) problems.push(`missing clue ${key}`);
      else if (clue.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(word)) problems.push(`clue ${key} contains its answer`);
    }
    if (new Set(Object.values(answers)).size !== Object.values(answers).length) problems.push("duplicate answer");
    if (anyBlocked([...Object.values(answers), ...Object.values(p.clues)])) problems.push("blocked word");
    const recent = await recentAnswerKeys("crossword", v.lang, day, REPEAT_DAYS);
    const repeats = Object.values(answers).filter((w) => w.length === 5 && recent.has(w));
    if (repeats.length) problems.push(`5-letter answers repeat: ${repeats.join(", ")}`);
    return problems;
  },
};
