import type { Lang } from "@/shared/game";

const EMOJI = { clue: "🟦", miss: "🟥", hit: "🟩" } as const;

export function shareText(details: Record<string, unknown>, lang: Lang): string {
  const marks = (details.marks as (keyof typeof EMOJI)[] | undefined) ?? [];
  const label = (details.summary as Record<Lang, string> | undefined)?.[lang] ?? "";
  const clues = Number(details.extraClues ?? 0);
  const wrong = Number(details.wrong ?? 0);
  const line =
    lang === "fr"
      ? `${label} · ${clues} indice${clues > 1 ? "s" : ""} en plus · ${wrong} erreur${wrong > 1 ? "s" : ""}`
      : `${label} · ${clues} extra clue${clues === 1 ? "" : "s"} · ${wrong} miss${wrong === 1 ? "" : "es"}`;
  return [line, `🟨${marks.map((m) => EMOJI[m]).join("")}`].join("\n");
}
