import "server-only";
import type { ResultRow } from "./results";

// Percentiles arrive in feature/scoring. Until then only raw scores are shown.

export async function percentileFor(_row: ResultRow): Promise<{ percentile: number | null; provisional: boolean }> {
  return { percentile: null, provisional: false };
}

export interface Difficulty {
  label: "easy" | "medium" | "hard";
  detail: string;
}

export async function difficultyFor(_game: string, _day: string, _variant: string): Promise<Difficulty | null> {
  return null;
}
