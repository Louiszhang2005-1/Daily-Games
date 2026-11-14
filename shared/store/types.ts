// A tiny table-store interface. Two implementations:
//  - Supabase (production) when NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set
//  - a JSON file in .data/ (local development) otherwise
// Business logic is written once against this interface.

export type FilterValue =
  | string
  | number
  | boolean
  | null
  | { in: (string | number)[] }
  | { gte?: string | number; lte?: string | number }
  | { neq: string | number | boolean | null };

export type Filter = Record<string, FilterValue>;

export interface SelectOptions {
  order?: { col: string; asc?: boolean };
  limit?: number;
}

export interface Store {
  readonly kind: "supabase" | "local";
  select<T = Row>(table: string, filter?: Filter, opts?: SelectOptions): Promise<T[]>;
  /** Inserts a row. Returns false when a unique constraint already holds that row. */
  insert(table: string, row: object): Promise<boolean>;
  upsert(table: string, row: object, onConflict: string[]): Promise<void>;
  update(table: string, filter: Filter, patch: object): Promise<void>;
  remove(table: string, filter: Filter): Promise<void>;
}

export type Row = Record<string, unknown>;

/** Unique keys per table (mirrors supabase/schema.sql). */
export const UNIQUE_KEYS: Record<string, string[][]> = {
  users: [["id"]],
  daily_puzzles: [["id"]],
  results: [["id"], ["puzzle_id", "player_key"]],
  answer_counts: [["puzzle_id", "prompt_index", "canonical_id"]],
  rejected_answers: [["puzzle_id", "prompt_index", "normalized_text"]],
  backup_puzzles: [["id"]],
  clans: [["id"], ["invite_code"]],
  clan_members: [["clan_id", "user_id"]],
  challenges: [["token"]],
  streaks: [["user_id", "game"]],
  approved_answers: [["game", "language", "prompt_key", "normalized_text"]],
};

export function matchesFilter(row: Row, filter: Filter | undefined): boolean {
  if (!filter) return true;
  for (const [col, cond] of Object.entries(filter)) {
    const v = row[col] as string | number | boolean | null | undefined;
    if (cond !== null && typeof cond === "object") {
      if ("in" in cond) {
        if (!cond.in.includes(v as string | number)) return false;
      } else if ("neq" in cond) {
        if (v === cond.neq) return false;
      } else {
        if (cond.gte !== undefined && !(v !== null && v !== undefined && v >= cond.gte)) return false;
        if (cond.lte !== undefined && !(v !== null && v !== undefined && v <= cond.lte)) return false;
      }
    } else if ((v ?? null) !== cond) {
      return false;
    }
  }
  return true;
}
