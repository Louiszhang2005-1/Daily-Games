import "server-only";
import type { PromptPuzzle } from "@/shared/prompts/types";
import type { PuzzleRow } from "@/shared/puzzles";
import { getStore } from "@/shared/store";
import { geminiConfigured, geminiJSON } from "./gemini";

// Nightly review of rejected answers: remove duplicates, let Gemini sort them
// (real answer / typo / nonsense), and approve real answers for FUTURE days only.
// Today's scores never change.

interface RejectRow {
  puzzle_id: string;
  prompt_index: number;
  normalized_text: string;
  game: string;
  language: string;
  prompt_key: string;
  count: number;
  review_status: string;
}

export const APPROVE_MIN_COUNT = 2; // a "real" answer needs at least this many players

export async function nightlyReview(): Promise<{ reviewed: number; approved: number }> {
  const store = getStore();
  const pending = await store.select<RejectRow>("rejected_answers", { review_status: "pending" });
  if (pending.length === 0) return { reviewed: 0, approved: 0 };

  // Dedupe across days: one entry per game + language + theme + text.
  const groups = new Map<string, { rows: RejectRow[]; total: number }>();
  for (const r of pending) {
    const k = `${r.game}|${r.language}|${r.prompt_key}|${r.normalized_text}`;
    const g = groups.get(k) ?? { rows: [], total: 0 };
    g.rows.push(r);
    g.total += r.count;
    groups.set(k, g);
  }
  if (!geminiConfigured()) return { reviewed: 0, approved: 0 };

  // One Gemini call per theme.
  const byTheme = new Map<string, { key: string; text: string; total: number; rows: RejectRow[] }[]>();
  for (const [k, g] of groups) {
    const [game, lang, theme, text] = k.split("|");
    const tk = `${game}|${lang}|${theme}`;
    byTheme.set(tk, [...(byTheme.get(tk) ?? []), { key: k, text, total: g.total, rows: g.rows }]);
  }

  let approved = 0;
  let reviewed = 0;
  for (const [tk, items] of byTheme) {
    const [game, lang, theme] = tk.split("|");
    const sample = items[0].rows[0];
    const [puzzle] = await store.select<PuzzleRow>("daily_puzzles", { id: sample.puzzle_id });
    const promptText = (puzzle?.content as PromptPuzzle | undefined)?.prompts[sample.prompt_index]?.text ?? theme;
    const verdicts = await geminiJSON<Record<string, "real" | "typo" | "nonsense">>(
      `A word game asked: "${promptText}" (language: ${lang}). Players gave these answers that weren't on our list.
Classify each as "real" (a valid answer to the prompt), "typo" (a misspelling of a valid answer) or "nonsense".
Answers:
${items.map((i) => `- ${i.text}`).join("\n")}
Reply as JSON mapping each answer exactly as written to its class.`,
      { temperature: 0 },
    );
    for (const item of items) {
      const verdict = verdicts[item.text] ?? "nonsense";
      const ok = verdict === "real" && item.total >= APPROVE_MIN_COUNT;
      if (ok) {
        await store.upsert(
          "approved_answers",
          { game, language: lang, prompt_key: theme, normalized_text: item.text, canonical_id: null, approved_at: new Date().toISOString() },
          ["game", "language", "prompt_key", "normalized_text"],
        );
        approved++;
      }
      const status = ok ? "approved" : verdict === "real" ? "real" : verdict;
      for (const r of item.rows)
        await store.update("rejected_answers", { puzzle_id: r.puzzle_id, prompt_index: r.prompt_index, normalized_text: r.normalized_text }, { review_status: status });
      reviewed++;
    }
  }
  return { reviewed, approved };
}
