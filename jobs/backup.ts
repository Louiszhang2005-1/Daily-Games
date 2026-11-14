import "server-only";
import { addDays } from "@/shared/day";
import { variantKey, type GameId, type Lang, type Variant } from "@/shared/game";
import { getStore } from "@/shared/store";
import { SEEDS as COUNTRY_SEEDS } from "@/games/country/seed";
import { SEEDS as CROSSWORD_SEEDS } from "@/games/crossword/seed";
import { answersOf } from "@/games/crossword/logic";
import { SEEDS as RARE_SEEDS } from "@/games/rare/seed";
import { SEEDS as COMMON_SEEDS } from "@/games/common/seed";
import { recentAnswerKeys } from "./archive";

// Backup bank: pre-made, already-checked puzzles that go live when generation fails.
// Seeded from each game's hand-written test puzzles; more can be added at any time.

export interface BackupRow {
  id: string;
  game: GameId;
  language: Lang;
  variant: string;
  answer_key: string;
  content: unknown;
  used_on: string | null;
}

function seedRows(): BackupRow[] {
  const rows: BackupRow[] = [];
  for (const lang of ["en", "fr"] as Lang[]) {
    COUNTRY_SEEDS[lang]?.forEach((p, i) =>
      rows.push({ id: `country:${lang}:${i}`, game: "country", language: lang, variant: lang, answer_key: p.answer, content: p, used_on: null }),
    );
    for (const level of ["easy", "medium"] as const)
      CROSSWORD_SEEDS[lang]?.[level]?.forEach((p, i) =>
        rows.push({
          id: `crossword:${lang}-${level}:${i}`,
          game: "crossword",
          language: lang,
          variant: `${lang}-${level}`,
          answer_key: Object.values(answersOf(p)).join("|"),
          content: p,
          used_on: null,
        }),
      );
    RARE_SEEDS[lang]?.forEach((prompts, i) =>
      rows.push({ id: `rare:${lang}:${i}`, game: "rare", language: lang, variant: lang, answer_key: prompts.map((p) => p.key).join("|"), content: { prompts }, used_on: null }),
    );
    COMMON_SEEDS[lang]?.forEach((prompts, i) =>
      rows.push({ id: `common:${lang}:${i}`, game: "common", language: lang, variant: lang, answer_key: prompts.map((p) => p.key).join("|"), content: { prompts }, used_on: null }),
    );
  }
  return rows;
}

/** Adds any missing seed puzzles to the backup bank. Safe to run repeatedly. */
export async function seedBackupBank(): Promise<number> {
  const store = getStore();
  let added = 0;
  for (const row of seedRows()) if (await store.insert("backup_puzzles", row)) added++;
  return added;
}

/** Takes the best unused backup for a game/variant (least recently used if all were used). */
export async function takeBackup(game: GameId, v: Variant, day: string): Promise<BackupRow | null> {
  await seedBackupBank();
  const store = getStore();
  const rows = await store.select<BackupRow>("backup_puzzles", { game, variant: variantKey(v) });
  if (rows.length === 0) return null;
  const recent = await recentAnswerKeys(game, v.lang, day, 60);
  const fresh = (r: BackupRow) => !r.answer_key.split("|").some((k) => recent.has(k));
  const sorted = rows.slice().sort((a, b) => (a.used_on ?? "0000").localeCompare(b.used_on ?? "0000"));
  const pick = sorted.find((r) => !r.used_on && fresh(r)) ?? sorted.find(fresh) ?? sorted[0];
  await store.update("backup_puzzles", { id: pick.id }, { used_on: day });
  return pick;
}

export function backupWindowStart(day: string): string {
  return addDays(day, -60);
}
