import type { Lang } from "@/shared/game";

export function shareText(details: Record<string, unknown>, lang: Lang): string {
  const per = (details.perPrompt as { points: number }[] | undefined) ?? [];
  const label = (details.summary as Record<Lang, string> | undefined)?.[lang] ?? "";
  const mark = (p: number) => (p >= 100 ? "🟩" : p >= 64 ? "🟦" : p >= 32 ? "🟨" : p > 0 ? "🟧" : "⬛");
  return [label, per.map((p) => mark(p.points)).join("")].join("\n");
}
