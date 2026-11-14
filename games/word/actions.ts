"use server";

import { getPlayer } from "@/shared/identity";
import { parseVariant } from "@/shared/game";
import { todayET, yesterdayET } from "@/shared/day";
import { cleanGuess, markGuess, WORD_LENGTH, type Mark } from "./logic";
import { server } from "./server";
import { wordList } from "./words";

// Checks one guess on the server so the answer never ships to the browser.
export async function checkWordGuess(
  day: string,
  variant: string,
  raw: string,
): Promise<{ valid: false } | { valid: true; word: string; marks: Mark[] }> {
  const player = await getPlayer();
  if (day !== todayET() && !(player.userId && day === yesterdayET())) return { valid: false };
  const v = parseVariant(variant);
  const list = wordList(v.lang);
  const loaded = await server.load(day, v);
  if (!list || !loaded) return { valid: false };
  const word = cleanGuess(raw);
  if (word.length !== WORD_LENGTH || !list.allowed.has(word)) return { valid: false };
  return { valid: true, word, marks: markGuess(word, loaded.full.answer) };
}

/** How everyone did today: counts of solves in 1..6 guesses, plus misses (index 0). */
export async function wordDistribution(day: string, variant: string): Promise<number[]> {
  const { getStore } = await import("@/shared/store");
  const { puzzleId } = await import("@/shared/game");
  const rows = await getStore().select<{ raw_score: number }>("results", { puzzle_id: puzzleId("word", day, parseVariant(variant)) });
  const out = [0, 0, 0, 0, 0, 0, 0];
  for (const r of rows) {
    const used = r.raw_score > 0 ? 7 - r.raw_score : 0; // raw = 7 - guesses; 0 = miss
    out[used]++;
  }
  return out;
}
