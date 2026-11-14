import { LIVE_THRESHOLD, type PromptAnswer } from "@/shared/prompts/types";

export interface BoardRow {
  id: string;
  display: string;
  share: number; // percent, 0-100
}

/** Estimated shares until 30 answers, then live counts. Normalised to 100%. */
export function board(answers: PromptAnswer[], counts: Map<string, number>, total: number): BoardRow[] {
  let rows: BoardRow[];
  if (total >= LIVE_THRESHOLD) {
    rows = answers.map((a) => ({ id: a.id, display: a.aliases[0], share: (100 * (counts.get(a.id) ?? 0)) / total }));
  } else {
    const sum = answers.reduce((s, a) => s + (a.share ?? 0), 0) || 1;
    rows = answers.map((a) => ({ id: a.id, display: a.aliases[0], share: (100 * (a.share ?? 0)) / sum }));
  }
  return rows.sort((a, b) => b.share - a.share);
}

export function pointsFor(rows: BoardRow[], id: string | null): number {
  if (!id) return 0;
  return Math.round(rows.find((r) => r.id === id)?.share ?? 0);
}
