"use client";

// Guest streaks live in the browser (logged-in streaks are stored server-side).
import { addDays } from "../day";

const KEY = "dg:plays";

type Plays = Record<string, string[]>; // day -> game ids

function read(): Plays {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Plays;
  } catch {
    return {};
  }
}

export function localPlays(): Plays {
  return read();
}

export function recordLocalPlay(game: string, day: string) {
  try {
    const plays = read();
    plays[day] = Array.from(new Set([...(plays[day] ?? []), game]));
    localStorage.setItem(KEY, JSON.stringify(plays));
  } catch {
    /* storage blocked */
  }
}

export function localStreak(today: string, game?: string): { current: number; best: number } {
  const plays = read();
  const has = (d: string) => (game ? (plays[d] ?? []).includes(game) : (plays[d] ?? []).length > 0);
  let current = 0;
  let d = has(today) ? today : addDays(today, -1);
  while (has(d)) {
    current++;
    d = addDays(d, -1);
  }
  const days = Object.keys(plays).filter(has).sort();
  let best = 0;
  let run = 0;
  let prev = "";
  for (const day of days) {
    run = prev && addDays(prev, 1) === day ? run + 1 : 1;
    best = Math.max(best, run);
    prev = day;
  }
  return { current, best: Math.max(best, current) };
}
