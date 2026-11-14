import type { Lang } from "@/shared/game";

export function shareText(details: Record<string, unknown>, lang: Lang): string {
  const label = (details.summary as Record<Lang, string> | undefined)?.[lang] ?? "";
  const hints = Number(details.letterHints ?? 0) + Number(details.wordHints ?? 0);
  const hintLine = hints ? (lang === "fr" ? `💡 ${hints} indice${hints > 1 ? "s" : ""}` : `💡 ${hints} hint${hints > 1 ? "s" : ""}`) : "";
  return [`⏱️ ${label}`, hintLine].filter(Boolean).join("\n");
}
