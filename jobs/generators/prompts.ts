import "server-only";
import { dayIndex } from "@/shared/day";
import type { GameId, Lang } from "@/shared/game";
import { normalize } from "@/shared/matcher";
import { PROMPTS_PER_DAY, type Prompt, type PromptAnswer, type PromptPuzzle, type RareTier } from "@/shared/prompts/types";
import { seededShuffle } from "@/shared/rng";
import { getStore } from "@/shared/store";
import { recentAnswerKeys } from "../archive";
import { anyBlocked } from "../blocklist";
import { geminiJSON } from "../gemini";
import { COMMON_THEMES, RARE_THEMES, type Theme } from "../themes";
import type { Generator } from "./types";

// Rare Answers and Common Answers: themes are picked at random; Gemini drafts the
// prompt and the answer list (aliases, tiers or groups and starting shares).

const THEME_REPEAT_DAYS = 90;
const TIERS: RareTier[] = ["common", "known", "rare", "deep"];

const slug = (s: string) => normalize(s).replace(/ /g, "-");

interface Draft {
  prompts: { key: string; text: string; answers: { canonical: string; aliases?: string[]; tier?: string; share?: number }[] }[];
}

/** Answers approved by the nightly review are merged into future lists for that theme. */
async function approvedFor(game: GameId, lang: Lang, key: string): Promise<string[]> {
  const rows = await getStore().select<{ normalized_text: string }>("approved_answers", { game, language: lang, prompt_key: key });
  return rows.map((r) => r.normalized_text);
}

function rarePrompt(themes: Theme[], lang: Lang): string {
  const language = lang === "fr" ? "French (French answers from French culture and usage, not translations)" : "English";
  return `You build a daily game where players name a valid answer few people would think of.
Write ${themes.length} prompts in ${language}, one per theme below, keeping each theme's key.
For each prompt give AT LEAST 45 valid answers, each with a rarity tier:
"common" (most people say it), "known", "rare", "deep" (a real but deep cut).
Give realistic spellings and common variants as aliases (plurals, abbreviations, with/without accents).
Never put the same alias under two answers. Family-friendly only.
Themes (key | what to ask):
${themes.map((t) => `${t.key} | ${t.hint}`).join("\n")}
Reply as JSON: {"prompts": [{"key": "...", "text": "Name ...", "answers": [{"canonical": "...", "aliases": ["..."], "tier": "common|known|rare|deep"}]}]}`;
}

function commonPrompt(themes: Theme[], lang: Lang): string {
  const language = lang === "fr" ? "French (French culture and usage, not translations)" : "English";
  return `You build a survey-style daily game: players try to give the answer most people would give.
Write ${themes.length} prompts in ${language}, one per theme below, keeping each theme's key.
For each prompt list 10-14 grouped answers with an estimated share (percent of people) that adds up to about 100.
Group answers that mean the same thing as aliases of one answer (e.g. "sunscreen", "sunblock", "sun cream").
Include common misspellings and short forms as aliases. Family-friendly only.
Themes (key | what to ask):
${themes.map((t) => `${t.key} | ${t.hint}`).join("\n")}
Reply as JSON: {"prompts": [{"key": "...", "text": "...", "answers": [{"canonical": "...", "aliases": ["..."], "share": 25}]}]}`;
}

function makeGenerator(game: "rare" | "common"): Generator {
  const themesFor = game === "rare" ? RARE_THEMES : COMMON_THEMES;
  return {
    game,
    needsGemini: true,
    variants: (lang) => [{ lang }],

    async generate(day, v, attempt) {
      const used = await recentAnswerKeys(game, v.lang, day, THEME_REPEAT_DAYS);
      const pool = themesFor[v.lang].filter((t) => !used.has(t.key));
      const source = pool.length >= PROMPTS_PER_DAY ? pool : themesFor[v.lang];
      const themes = seededShuffle(source, `${game}:${v.lang}:${dayIndex(day)}:${attempt}`).slice(0, PROMPTS_PER_DAY);
      const draft = await geminiJSON<Draft>(game === "rare" ? rarePrompt(themes, v.lang) : commonPrompt(themes, v.lang));
      const prompts: Prompt[] = [];
      for (const theme of themes) {
        const d = draft.prompts?.find((p) => p.key === theme.key);
        if (!d) throw new Error(`Gemini skipped theme ${theme.key}`);
        const answers: PromptAnswer[] = d.answers.map((a) => {
          const aliases = Array.from(new Set([a.canonical, ...(a.aliases ?? [])].map((x) => String(x).trim()).filter(Boolean)));
          return game === "rare"
            ? { id: slug(a.canonical), aliases, tier: (TIERS.includes(a.tier as RareTier) ? a.tier : "deep") as RareTier }
            : { id: slug(a.canonical), aliases, share: Math.max(0, Number(a.share) || 0) };
        });
        // Merge reviewer-approved answers (future days only).
        for (const extra of await approvedFor(game, v.lang, theme.key)) {
          if (answers.some((a) => a.aliases.some((al) => normalize(al) === extra))) continue;
          answers.push(game === "rare" ? { id: slug(extra), aliases: [extra], tier: "deep" } : { id: slug(extra), aliases: [extra], share: 1 });
        }
        prompts.push({ key: theme.key, text: d.text, answers });
      }
      const content: PromptPuzzle = { prompts };
      return { content, answerKey: themes.map((t) => t.key).join("|") };
    },

    async check(g, day, v) {
      const p = g.content as PromptPuzzle;
      const problems: string[] = [];
      if (p.prompts?.length !== PROMPTS_PER_DAY) return [`need ${PROMPTS_PER_DAY} prompts`];
      for (const pr of p.prompts) {
        const min = game === "rare" ? 40 : 8;
        if (pr.answers.length < min) problems.push(`${pr.key}: only ${pr.answers.length} answers (min ${min})`);
        const seen = new Map<string, string>();
        for (const a of pr.answers)
          for (const al of a.aliases) {
            const n = normalize(al);
            if (seen.has(n) && seen.get(n) !== a.id) problems.push(`${pr.key}: alias "${n}" under two answers`);
            seen.set(n, a.id);
          }
        if (game === "common") {
          const sum = pr.answers.reduce((s, a) => s + (a.share ?? 0), 0);
          if (sum < 85 || sum > 115) problems.push(`${pr.key}: shares add up to ${sum}%`);
        }
        if (anyBlocked([pr.text, ...pr.answers.flatMap((a) => a.aliases)])) problems.push(`${pr.key}: blocked word`);
      }
      const used = await recentAnswerKeys(game, v.lang, day, THEME_REPEAT_DAYS);
      const repeats = p.prompts.filter((pr) => used.has(pr.key)).map((pr) => pr.key);
      if (repeats.length > 2) problems.push(`themes repeat within ${THEME_REPEAT_DAYS} days: ${repeats.join(", ")}`);
      return problems;
    },
  };
}

export const rareGenerator = makeGenerator("rare");
export const commonGenerator = makeGenerator("common");
