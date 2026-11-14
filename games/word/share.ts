import type { Lang } from "@/shared/game";
import type { Mark } from "./logic";

const EMOJI: Record<Mark, string> = { correct: "🟩", present: "🟨", absent: "⬛" };

export function shareText(details: Record<string, unknown>, _lang: Lang): string {
  const grid = (details.grid as Mark[][] | undefined) ?? [];
  const label = (details.summary as { en: string } | undefined)?.en ?? "";
  return [label, ...grid.map((row) => row.map((m) => EMOJI[m]).join(""))].join("\n");
}
