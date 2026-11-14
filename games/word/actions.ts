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
