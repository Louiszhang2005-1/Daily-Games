export type Category = "history" | "geography" | "climate" | "landmarks";

export const CATEGORIES: Category[] = ["history", "geography", "climate", "landmarks"];
export const SLOTS: Record<Category, number> = { history: 2, geography: 1, climate: 1, landmarks: 1 };
export const TOTAL_CLUES = 5;
export const MAX_WRONG = 6;

export interface CountryPuzzle {
  answer: string; // ISO alpha-3
  free: Category; // the first clue of this category is shown for free
  clues: Record<Category, string[]>; // vague -> specific within each category
}

export type Action = { type: "reveal"; cat: Category } | { type: "guess"; id: string };

export interface Replay {
  revealed: Record<Category, number>;
  extraClues: number;
  wrong: number;
  solved: boolean;
  over: boolean;
  score: number;
  marks: ("clue" | "miss" | "hit")[];
}

export function startState(free: Category): Record<Category, number> {
  return { history: 0, geography: 0, climate: 0, landmarks: 0, [free]: 1 } as Record<Category, number>;
}

export function liveScore(extraClues: number, wrong: number): number {
  return Math.max(0, 100 - 10 * extraClues - 15 * wrong);
}

/**
 * Replays a round. Each turn is a reveal or a guess. The round ends on a correct guess,
 * or as a fail when every clue is out and a guess is wrong (or after MAX_WRONG misses).
 */
export function replay(puzzle: Pick<CountryPuzzle, "answer" | "free">, actions: Action[]): Replay | { error: string } {
  const revealed = startState(puzzle.free);
  let extraClues = 0;
  let wrong = 0;
  let solved = false;
  let over = false;
  const marks: Replay["marks"] = [];
  for (const a of actions) {
    if (over) return { error: "actions after end" };
    if (a.type === "reveal") {
      if (!CATEGORIES.includes(a.cat) || revealed[a.cat] >= SLOTS[a.cat]) return { error: "bad reveal" };
      revealed[a.cat]++;
      extraClues++;
      marks.push("clue");
    } else {
      const allOut = CATEGORIES.every((c) => revealed[c] >= SLOTS[c]);
      if (a.id === puzzle.answer) {
        solved = true;
        over = true;
        marks.push("hit");
      } else {
        wrong++;
        marks.push("miss");
        if (allOut || wrong >= MAX_WRONG) over = true;
      }
    }
  }
  return { revealed, extraClues, wrong, solved, over, score: solved ? liveScore(extraClues, wrong) : 0, marks };
}
