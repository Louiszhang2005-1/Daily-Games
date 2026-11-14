import "server-only";
import { dayIndex } from "@/shared/day";
import type { GameServer, Lang } from "@/shared/game";
import { loadStoredPuzzle } from "@/shared/puzzles";
import { rotatingPick } from "@/shared/rng";
import { COUNTRIES } from "./countries";
import { replay, SLOTS, type Action, type Category, type CountryPuzzle } from "./logic";
import { SEEDS } from "./seed";
import { countryOutline } from "./shape";

export interface CountryOption {
  id: string;
  name: string;
  aliases: string[];
}

export interface CountryPublic {
  outline: string | null; // SVG path, 300x300
  free: Category;
  clues: Record<Category, string[]>;
  slots: Record<Category, number>;
  countries: CountryOption[];
}

export interface CountryPayload {
  actions: Action[];
}

const optionsCache: Partial<Record<Lang, CountryOption[]>> = {};

export function countryOptions(lang: Lang): CountryOption[] {
  return (optionsCache[lang] ??= COUNTRIES.map((c) => ({ id: c.id, name: c.name[lang], aliases: c.aliases })).sort((a, b) =>
    a.name.localeCompare(b.name, lang),
  ));
}

export const server: GameServer<CountryPuzzle, CountryPublic, CountryPayload> = {
  async load(day, v) {
    const stored = await loadStoredPuzzle<CountryPuzzle>("country", day, v);
    if (stored) return stored;
    const seeds = SEEDS[v.lang];
    if (!seeds?.length) return null;
    return { full: rotatingPick(seeds, dayIndex(day), `country:${v.lang}`), source: "seed" };
  },

  toPublic(full, v) {
    return { outline: countryOutline(full.answer), free: full.free, clues: full.clues, slots: SLOTS, countries: countryOptions(v.lang) };
  },

  score(full, payload) {
    const actions = Array.isArray(payload?.actions) ? payload.actions : [];
    const r = replay(full, actions);
    if ("error" in r) return r;
    if (!r.over) return { error: "unfinished" };
    const answer = COUNTRIES.find((c) => c.id === full.answer);
    const en = r.solved ? `${r.score} pts` : `Missed · ${answer?.name.en ?? full.answer}`;
    const fr = r.solved ? `${r.score} pts` : `Raté · ${answer?.name.fr ?? full.answer}`;
    return {
      raw: r.score,
      details: {
        solved: r.solved,
        extraClues: r.extraClues,
        wrong: r.wrong,
        marks: r.marks,
        answer: answer ? answer.name : full.answer,
        summary: { en, fr },
      },
    };
  },

  difficultyDetail(raws, lang) {
    const avg = raws.reduce((a, b) => a + b, 0) / Math.max(1, raws.length);
    return lang === "fr" ? `score moyen ${Math.round(avg)}` : `avg score ${Math.round(avg)}`;
  },
};
