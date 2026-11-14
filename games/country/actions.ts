"use server";

import { todayET, yesterdayET } from "@/shared/day";
import { parseVariant } from "@/shared/game";
import { getPlayer } from "@/shared/identity";
import { bearing, COUNTRY_BY_ID, distanceKm } from "./countries";
import { server } from "./server";

export interface GuessFeedback {
  correct: boolean;
  distanceKm: number;
  bearing: number;
  proximity: number; // 0-100, Worldle-style closeness
}

export async function checkCountryGuess(day: string, variant: string, id: string): Promise<GuessFeedback | { error: string }> {
  const player = await getPlayer();
  if (day !== todayET() && !(player.userId && day === yesterdayET())) return { error: "day" };
  const loaded = await server.load(day, parseVariant(variant));
  const guess = COUNTRY_BY_ID.get(id);
  const answer = loaded ? COUNTRY_BY_ID.get(loaded.full.answer) : undefined;
  if (!guess || !answer) return { error: "unknown" };
  if (guess.id === answer.id) return { correct: true, distanceKm: 0, bearing: 0, proximity: 100 };
  const d = distanceKm(guess.latlng, answer.latlng);
  return {
    correct: false,
    distanceKm: d,
    bearing: bearing(guess.latlng, answer.latlng),
    proximity: Math.max(0, Math.round(100 * (1 - d / 20_000))),
  };
}
