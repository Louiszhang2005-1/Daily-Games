import type { Lang } from "@/shared/game";
import type { RareTier } from "@/shared/prompts/types";

const EMOJI: Record<RareTier, string> = { common: "⚪", known: "🟢", rare: "🔵", deep: "🟣", legend: "🌟" };

export function shareText(details: Record<string, unknown>, lang: Lang): string {
  const per = (details.perPrompt as { tier: RareTier | null }[] | undefined) ?? [];
  const label = (details.summary as Record<Lang, string> | undefined)?.[lang] ?? "";
  return [label, per.map((p) => (p.tier ? EMOJI[p.tier] : "✖️")).join("")].join("\n");
}
