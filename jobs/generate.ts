import "server-only";
import { addDays, todayET, yesterdayET } from "@/shared/day";
import { LANGS, puzzleId, variantKey, type GameId, type Variant } from "@/shared/game";
import { getStore } from "@/shared/store";
import { alertOwner } from "./alert";
import { puzzleExists } from "./archive";
import { takeBackup } from "./backup";
import { geminiConfigured } from "./gemini";
import { countryGenerator } from "./generators/country";
import { crosswordGenerator } from "./generators/crossword";
import { commonGenerator, rareGenerator } from "./generators/prompts";
import type { Generator } from "./generators/types";
import { wordGenerator } from "./generators/word";

// Daily content generation. Puzzles are generated ahead of time, checked automatically,
// and go live with no human approval. A failing puzzle is retried up to 3 times,
// then a backup puzzle goes live and the owner gets an email.

export const GENERATORS: Generator[] = [wordGenerator, countryGenerator, crosswordGenerator, rareGenerator, commonGenerator];
export const MAX_RETRIES = 3;
export const STOCKPILE_DAYS = 30;

export interface GenReport {
  id: string;
  result: "exists" | "generated" | "backup" | "failed";
  problems?: string[];
}

async function store(id: string, game: GameId, day: string, v: Variant, content: unknown, answerKey: string, source: "generated" | "backup") {
  await getStore().insert("daily_puzzles", {
    id,
    game,
    day,
    variant: variantKey(v),
    language: v.lang,
    answer_key: answerKey,
    content,
    source,
    status: "scheduled",
    created_at: new Date().toISOString(),
  });
}

export async function generateOne(gen: Generator, day: string, v: Variant): Promise<GenReport> {
  const id = puzzleId(gen.game, day, v);
  if (await puzzleExists(id)) return { id, result: "exists" };
  const problems: string[] = [];
  if (!gen.needsGemini || geminiConfigured()) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const g = await gen.generate(day, v, attempt);
        const found = await gen.check(g, day, v);
        if (found.length === 0) {
          await store(id, gen.game, day, v, g.content, g.answerKey, "generated");
          return { id, result: "generated" };
        }
        problems.push(`attempt ${attempt + 1}: ${found.join("; ")}`);
      } catch (err) {
        problems.push(`attempt ${attempt + 1}: ${(err as Error).message}`);
      }
    }
  } else problems.push("GEMINI_API_KEY not set");

  const backup = await takeBackup(gen.game, v, day);
  if (backup) {
    await store(id, gen.game, day, v, backup.content, backup.answer_key, "backup");
    return { id, result: "backup", problems };
  }
  return { id, result: "failed", problems };
}

export async function generateDay(day: string): Promise<GenReport[]> {
  const out: GenReport[] = [];
  for (const gen of GENERATORS) for (const lang of LANGS) for (const v of gen.variants(lang)) out.push(await generateOne(gen, day, v));
  return out;
}

/** Keeps at least `days` days generated ahead. `maxDays` caps the work per call. */
export async function ensureStockpile(days = STOCKPILE_DAYS, maxDays = days): Promise<GenReport[]> {
  const today = todayET();
  const reports: GenReport[] = [];
  let worked = 0;
  for (let i = 0; i <= days && worked < maxDays; i++) {
    const day = addDays(today, i);
    const r = await generateDay(day);
    if (r.some((x) => x.result !== "exists")) worked++;
    reports.push(...r);
  }
  const fallbacks = reports.filter((r) => r.result === "backup" || r.result === "failed");
  if (fallbacks.length) {
    await alertOwner(
      `Daily Games: ${fallbacks.length} puzzle(s) used the backup bank`,
      fallbacks.map((f) => `${f.id}: ${f.result}\n  ${(f.problems ?? []).join("\n  ")}`).join("\n\n"),
    );
  }
  await sweepStatuses();
  return reports;
}

/** Marks today's puzzles live and yesterday's as "yesterday" (the lock job archives older days). */
export async function sweepStatuses(): Promise<void> {
  const store = getStore();
  await store.update("daily_puzzles", { day: todayET() }, { status: "live" });
  await store.update("daily_puzzles", { day: yesterdayET() }, { status: "yesterday" });
}
