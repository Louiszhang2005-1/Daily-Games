// The game contract. Every game lives in games/<id>/ with:
//   meta.ts    – name, colors, levels (pure, importable anywhere)
//   server.ts  – load(day, variant), toPublic(full), score(full, payload)
//   client.tsx – the playable component (default export)
//   share.ts   – shareText(details, lang) for the spoiler-free text share

export type Lang = "en" | "fr";
export const LANGS: Lang[] = ["en", "fr"];

export type GameId = "word" | "country" | "crossword" | "rare" | "common";
export const GAME_IDS: GameId[] = ["word", "country", "crossword", "rare", "common"];

export function isGameId(s: string): s is GameId {
  return (GAME_IDS as string[]).includes(s);
}

export interface GameMeta {
  id: GameId;
  name: Record<Lang, string>;
  tagline: Record<Lang, string>;
  icon: string; // a short glyph shown on the card
  color: string; // card accent
  levels?: string[]; // e.g. crossword: easy / medium
  lowerIsBetter?: boolean; // crossword time
  maxPercentile?: Record<string, number>; // per level cap, e.g. { easy: 80 }
  minutes: number; // typical play time
}

export interface Variant {
  lang: Lang;
  level?: string;
}

export function variantKey(v: Variant): string {
  return v.level ? `${v.lang}-${v.level}` : v.lang;
}

export function parseVariant(key: string): Variant {
  const [lang, level] = key.split("-");
  return { lang: lang === "fr" ? "fr" : "en", ...(level ? { level } : {}) };
}

export function puzzleId(game: GameId, day: string, v: Variant): string {
  return `${game}:${day}:${variantKey(v)}`;
}

export type PuzzleSource = "generated" | "backup" | "seed";

export interface ScoreOk {
  raw: number;
  details: Record<string, unknown>;
}

export interface GameServer<Full = unknown, Pub = unknown, Payload = unknown> {
  /** Returns null when no puzzle exists for that day/variant (e.g. language not built yet). */
  load(day: string, v: Variant): Promise<{ full: Full; source: PuzzleSource } | null>;
  /** Strips answers before the puzzle is sent to the browser. */
  toPublic(full: Full, v: Variant): Pub;
  /** Recomputes the raw score from what the player did. Never trusts a client score. */
  score(full: Full, payload: Payload): ScoreOk | { error: string };
  /** Short difficulty detail for the hub card, e.g. "avg 4.4 guesses". */
  difficultyDetail?(raws: number[], lang: Lang): string;
}

export interface FinishResult {
  raw: number;
  percentile: number | null;
  provisional: boolean;
  details: Record<string, unknown>;
  alreadyPlayed: boolean;
  isCatchUp: boolean;
}

export interface GameClientProps<Pub = unknown> {
  puzzle: Pub;
  puzzleId: string;
  day: string;
  variant: Variant;
  lang: Lang;
  onFinish: (payload: unknown) => Promise<FinishResult | { error: string }>;
}
