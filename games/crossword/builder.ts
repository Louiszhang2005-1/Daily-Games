// Builds a 5x5 crossword grid from a word list (code builds grids; LLMs are bad at it).
// Templates are rotationally symmetric; every white cell is part of an across and a
// down word of length >= 3.

import { mulberry32 } from "@/shared/rng";

export const SIZE = 5;

export const TEMPLATES: Record<"easy" | "medium", string[][]> = {
  easy: [
    ["##...", "#....", ".....", "....#", "...##"],
    ["...##", "....#", ".....", "#....", "##..."],
  ],
  medium: [
    ["#....", "#....", ".....", "....#", "....#"],
    ["....#", "....#", ".....", "#....", "#...."],
  ],
};

export interface Slot {
  dir: "across" | "down";
  row: number;
  col: number;
  len: number;
  cells: [number, number][];
  num: number;
}

export function slotsOf(template: string[]): Slot[] {
  const black = (r: number, c: number) => r < 0 || c < 0 || r >= SIZE || c >= SIZE || template[r][c] === "#";
  const slots: Slot[] = [];
  let num = 0;
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (black(r, c)) continue;
      const startsAcross = black(r, c - 1) && !black(r, c + 1);
      const startsDown = black(r - 1, c) && !black(r + 1, c);
      if (!startsAcross && !startsDown) continue;
      num++;
      if (startsAcross) {
        const cells: [number, number][] = [];
        for (let k = c; !black(r, k); k++) cells.push([r, k]);
        slots.push({ dir: "across", row: r, col: c, len: cells.length, cells, num });
      }
      if (startsDown) {
        const cells: [number, number][] = [];
        for (let k = r; !black(k, c); k++) cells.push([k, c]);
        slots.push({ dir: "down", row: r, col: c, len: cells.length, cells, num });
      }
    }
  return slots;
}

export function isSymmetric(template: string[]): boolean {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) if ((template[r][c] === "#") !== (template[SIZE - 1 - r][SIZE - 1 - c] === "#")) return false;
  return true;
}

export interface Fill {
  template: string[];
  grid: string[]; // letters, '#' for black
  slots: (Slot & { answer: string })[];
}

/**
 * Backtracking fill. `words` should be lowercase a-z. `avoid` holds answers that must
 * not appear (e.g. used recently). Returns null if no fill is found within the budget.
 */
export function buildGrid(template: string[], words: string[], seed: number, avoid = new Set<string>(), budget = 20_000): Fill | null {
  const rand = mulberry32(seed);
  const slots = slotsOf(template);
  const byLen = new Map<number, string[]>();
  for (const w of new Set(words)) {
    if (avoid.has(w) || !/^[a-z]+$/.test(w)) continue;
    const list = byLen.get(w.length) ?? [];
    list.push(w);
    byLen.set(w.length, list);
  }
  // Shuffle each length bucket once per seed.
  for (const [k, list] of byLen) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    byLen.set(k, list);
  }

  const grid: string[][] = template.map((row) => row.split("").map((ch) => (ch === "#" ? "#" : "")));
  const assigned: (string | null)[] = slots.map(() => null);
  const used = new Set<string>();
  let nodes = 0;

  const pattern = (s: Slot) => s.cells.map(([r, c]) => grid[r][c] || ".").join("");
  const fits = (w: string, p: string) => {
    for (let i = 0; i < p.length; i++) if (p[i] !== "." && p[i] !== w[i]) return false;
    return true;
  };
  const candidates = (s: Slot) => {
    const p = pattern(s);
    return (byLen.get(s.len) ?? []).filter((w) => !used.has(w) && fits(w, p));
  };

  function solve(): boolean {
    if (++nodes > budget) return false;
    // Most constrained open slot first.
    let best = -1;
    let bestCands: string[] = [];
    for (let i = 0; i < slots.length; i++) {
      if (assigned[i]) continue;
      const c = candidates(slots[i]);
      if (c.length === 0) return false;
      if (best === -1 || c.length < bestCands.length) {
        best = i;
        bestCands = c;
      }
    }
    if (best === -1) return true;
    const s = slots[best];
    for (const w of bestCands.slice(0, 60)) {
      const prev = s.cells.map(([r, c]) => grid[r][c]);
      s.cells.forEach(([r, c], k) => (grid[r][c] = w[k]));
      assigned[best] = w;
      used.add(w);
      // Every crossing slot that becomes complete must itself be a word in the list.
      const ok = slots.every((o, i) => {
        if (assigned[i] || i === best) return true;
        const p = pattern(o);
        return p.includes(".") || (byLen.get(o.len) ?? []).includes(p);
      });
      if (ok && solve()) return true;
      used.delete(w);
      assigned[best] = null;
      s.cells.forEach(([r, c], k) => (grid[r][c] = prev[k]));
    }
    return false;
  }

  if (!solve()) return null;
  // Mark auto-completed crossings as assigned too.
  const filled = slots.map((s) => ({ ...s, answer: s.cells.map(([r, c]) => grid[r][c]).join("") }));
  const answers = filled.map((s) => s.answer);
  if (new Set(answers).size !== answers.length) return null; // no duplicate words
  return { template, grid: grid.map((r) => r.join("")), slots: filled };
}
