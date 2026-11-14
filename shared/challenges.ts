import "server-only";
import { todayET } from "./day";
import type { GameId, Lang } from "./game";
import type { ResultRow } from "./results";
import { percentileMap, userNames } from "./boards";
import { dailyTotal } from "./scoring";
import { getStore } from "./store";

// 1v1: "Challenge a friend" makes a link for today's puzzles. A friend's existing
// results today are used; they only play the games they haven't done.

export interface Challenge {
  token: string;
  creator_id: string;
  day: string;
  language: Lang;
  opponent_id: string | null;
  created_at: string;
}

function token(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  return Buffer.from(bytes).toString("base64url");
}

export async function createChallenge(creatorId: string, lang: Lang): Promise<Challenge> {
  const c: Challenge = { token: token(), creator_id: creatorId, day: todayET(), language: lang, opponent_id: null, created_at: new Date().toISOString() };
  await getStore().insert("challenges", c);
  return c;
}

export async function getChallenge(t: string): Promise<Challenge | null> {
  return (await getStore().select<Challenge>("challenges", { token: t }))[0] ?? null;
}

export async function acceptChallenge(c: Challenge, userId: string): Promise<Challenge> {
  if (c.opponent_id || c.creator_id === userId) return c;
  await getStore().update("challenges", { token: c.token }, { opponent_id: userId });
  return { ...c, opponent_id: userId };
}

export interface HeadToHead {
  names: Record<string, string>;
  games: { game: GameId; a: number | null; b: number | null }[];
  totals: { a: number | null; b: number | null };
  done: boolean; // both finished every game the other played
}

export async function headToHead(c: Challenge): Promise<HeadToHead> {
  const ids = [c.creator_id, c.opponent_id].filter((x): x is string => Boolean(x));
  const store = getStore();
  const all = await store.select<ResultRow>("results", { day: c.day, language: c.language });
  const pct = await percentileMap(all);
  const mine = (uid: string | null) => (uid ? all.filter((r) => r.user_id === uid && !r.is_catch_up) : []);
  const a = mine(c.creator_id);
  const b = mine(c.opponent_id);
  const games: GameId[] = ["word", "country", "crossword", "rare", "common"];
  const val = (rows: ResultRow[], g: GameId) => {
    const r = rows.find((x) => x.game === g);
    return r ? (pct.get(r.id) ?? null) : null;
  };
  const rows = games.map((g) => ({ game: g, a: val(a, g), b: val(b, g) }));
  const names = Object.fromEntries(await userNames(ids));
  const done = Boolean(c.opponent_id) && rows.every((r) => (r.a === null) === (r.b === null)) && rows.some((r) => r.a !== null);
  return {
    names,
    games: rows,
    totals: {
      a: dailyTotal(rows.flatMap((r) => (r.a !== null ? [r.a] : []))),
      b: dailyTotal(rows.flatMap((r) => (r.b !== null ? [r.b] : []))),
    },
    done,
  };
}
