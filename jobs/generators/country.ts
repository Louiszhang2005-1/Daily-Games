import "server-only";
import { dayIndex } from "@/shared/day";
import { buildIndex, matchAnswer, normalize } from "@/shared/matcher";
import { mulberry32 } from "@/shared/rng";
import { COUNTRIES, COUNTRY_BY_ID, REPEAT_DAYS, TIER_WEIGHTS, type Country, type Tier } from "@/games/country/countries";
import { CATEGORIES, SLOTS, type Category, type CountryPuzzle } from "@/games/country/logic";
import { recentPuzzles } from "../archive";
import { anyBlocked } from "../blocklist";
import { geminiJSON } from "../gemini";
import type { Generator } from "./types";

// Country Guess: the country is picked at random by tier and repeat window;
// Gemini writes the clues (in French for the French version).

type Pickable = Exclude<Tier, "excluded">;

async function pickCountry(day: string, lang: "en" | "fr", attempt: number): Promise<Country> {
  const rand = mulberry32(dayIndex(day) * 97 + attempt * 13 + (lang === "fr" ? 5 : 0));
  const recent = await recentPuzzles("country", lang, day, 365);
  const blocked = (c: Country) => {
    const window = REPEAT_DAYS[c.tier as Pickable];
    return recent.some((p) => p.answer_key === c.id && Math.abs(dayIndex(p.day) - dayIndex(day)) < window);
  };
  const roll = rand();
  const order: Pickable[] = roll < TIER_WEIGHTS.common ? ["common", "medium", "rare"] : roll < TIER_WEIGHTS.common + TIER_WEIGHTS.medium ? ["medium", "common", "rare"] : ["rare", "medium", "common"];
  for (const tier of order) {
    const pool = COUNTRIES.filter((c) => c.tier === tier && !blocked(c));
    if (pool.length) return pool[Math.floor(rand() * pool.length)];
  }
  throw new Error("no country available");
}

function facts(c: Country): string {
  return [
    `Region: ${c.region}${c.subregion ? ` (${c.subregion})` : ""}`,
    `Number of land borders: ${c.borders.length}`,
    `Landlocked: ${c.landlocked ? "yes" : "no"}`,
    `Area rank among countries: ${c.areaRank}`,
  ].join("\n");
}

function prompt(c: Country, lang: "en" | "fr"): string {
  const language = lang === "fr" ? "French (write natural French, not a translation)" : "English";
  return `You write clues for a daily geography guessing game. The secret country is ${c.name.en}.
Known facts you may rely on:
${facts(c)}

Write exactly 5 clues in ${language}, as JSON:
{"free": "<one of history|geography|climate|landmarks: the vaguest single clue, shown for free>",
 "clues": {"history": ["<vaguer>", "<more specific>"], "geography": ["..."], "climate": ["..."], "landmarks": ["..."]}}

Rules:
- Each clue narrows the answer to a handful of countries, never exactly one.
- Never write the country's name, its capital, its demonym, its flag, or an obvious nickname.
- No "most famous" facts (not the best-known monument, not "largest country in X").
- Landmarks: a lesser-known landmark or natural site, described without its proper name if the name gives the country away.
- Any number you state about borders must match the facts above.
- Plain, friendly wording, at most 20 words per clue.`;
}

export const countryGenerator: Generator = {
  game: "country",
  needsGemini: true,
  variants: (lang) => [{ lang }],

  async generate(day, v, attempt) {
    const c = await pickCountry(day, v.lang, attempt);
    const out = await geminiJSON<{ free: Category; clues: Record<Category, string[]> }>(prompt(c, v.lang));
    const content: CountryPuzzle = { answer: c.id, free: out.free, clues: out.clues };
    return { content, answerKey: c.id };
  },

  async check(g, day, v) {
    const p = g.content as CountryPuzzle;
    const problems: string[] = [];
    const c = COUNTRY_BY_ID.get(p.answer);
    if (!c) return ["unknown country"];
    if (!CATEGORIES.includes(p.free)) problems.push("bad free category");
    for (const cat of CATEGORIES) {
      if (!Array.isArray(p.clues?.[cat]) || p.clues[cat].length !== SLOTS[cat] || p.clues[cat].some((x) => typeof x !== "string" || !x.trim()))
        problems.push(`category ${cat} needs ${SLOTS[cat]} clue(s)`);
    }
    if (problems.length) return problems;
    const all = CATEGORIES.flatMap((cat) => p.clues[cat]);

    // No clue may contain the name, capital, demonym or a known alias.
    const banned = [c.name.en, c.name.fr, ...c.capital, ...c.demonyms, ...c.aliases.filter((a) => a.length > 3)].map(normalize).filter((x) => x.length > 2);
    for (const clue of all) {
      const n = ` ${normalize(clue)} `;
      const hit = banned.find((b) => n.includes(` ${b} `));
      if (hit) problems.push(`clue gives it away ("${hit}")`);
    }

    // Numbers about borders must match the dataset.
    for (const clue of all) {
      const m = normalize(clue).match(/borders? (\d+)|(\d+) (?:neighbou?rs|countries|pays|voisins)/);
      if (m) {
        const n = Number(m[1] ?? m[2]);
        if (n !== c.borders.length) problems.push(`border count ${n} != ${c.borders.length}`);
      }
    }

    const blocked = anyBlocked(all);
    if (blocked) problems.push("blocked word");

    const recent = await recentPuzzles("country", v.lang, day, REPEAT_DAYS[c.tier as Pickable] ?? 365);
    if (recent.some((r) => r.day !== day && r.answer_key === c.id)) problems.push("country repeats within its window");

    // A second Gemini call, given only the free clue, must not name the country.
    if (!problems.length) {
      const guess = await geminiJSON<{ country: string }>(
        `A guessing game shows one clue about a secret country. Clue: "${p.clues[p.free][0]}". Reply with your single best guess as JSON: {"country": "<name in English>"}`,
        { temperature: 0 },
      );
      const idx = buildIndex(COUNTRIES.map((x) => ({ id: x.id, aliases: [x.name.en, ...x.aliases] })));
      if (matchAnswer(idx, guess.country ?? "")?.id === c.id) problems.push("free clue alone gives the answer");
    }
    return problems;
  },
};
