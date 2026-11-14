import { SIZE, slotsOf } from "./builder";

export interface CrosswordFull {
  grid: string[]; // letters, '#' for black
  clues: Record<string, string>; // "1a" / "3d" -> clue
}

export interface Entry {
  key: string; // "1a"
  num: number;
  dir: "across" | "down";
  row: number;
  col: number;
  len: number;
  clue: string;
}

export const LETTER_HINT_S = 30;
export const WORD_HINT_S = 60;

export function templateOf(grid: string[]): string[] {
  return grid.map((r) => r.replace(/[^#]/g, "."));
}

export function entriesOf(full: CrosswordFull): Entry[] {
  return slotsOf(templateOf(full.grid)).map((s) => {
    const key = `${s.num}${s.dir[0]}`;
    return { key, num: s.num, dir: s.dir, row: s.row, col: s.col, len: s.len, clue: full.clues[key] ?? "" };
  });
}

export function answersOf(full: CrosswordFull): Record<string, string> {
  const out: Record<string, string> = {};
  for (const s of slotsOf(templateOf(full.grid))) out[`${s.num}${s.dir[0]}`] = s.cells.map(([r, c]) => full.grid[r][c]).join("");
  return out;
}

// Light obfuscation so the solution isn't readable in the page source.
// (Timing is client-reported anyway; the server re-checks the final grid.)
export function encodeSolution(grid: string[]): string {
  const s = grid.join("");
  let out = "";
  for (let i = 0; i < s.length; i++) out += String.fromCharCode(s.charCodeAt(i) ^ ((i * 7 + 13) & 31));
  return typeof btoa === "function" ? btoa(out) : Buffer.from(out, "binary").toString("base64");
}

export function decodeSolution(code: string): string[] {
  const s = typeof atob === "function" ? atob(code) : Buffer.from(code, "base64").toString("binary");
  let out = "";
  for (let i = 0; i < s.length; i++) out += String.fromCharCode(s.charCodeAt(i) ^ ((i * 7 + 13) & 31));
  return Array.from({ length: SIZE }, (_, r) => out.slice(r * SIZE, r * SIZE + SIZE));
}

export function rawScore(seconds: number, letterHints: number, wordHints: number): number {
  return Math.round(seconds) + LETTER_HINT_S * letterHints + WORD_HINT_S * wordHints;
}
