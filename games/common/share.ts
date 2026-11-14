import type { Lang } from "@/shared/game";

export function shareText(details: Record<string, unknown>, lang: Lang): string {
  const per = (details.perPrompt as { points: number }[] | undefined) ?? [];
  const label = (details.summary as Record<Lang, string> | undefined)?.[lang] ?? "";
  const bar = (p: number) => (p >= 30 ? "🟩" : p >= 10 ? "🟨" : p > 0 ? "🟧" : "⬛");
  return [label, per.map((p) => bar(p.points)).join("")].join("\n");
}
