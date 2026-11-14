"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { FinishResult, GameId, Lang } from "../game";
import type { RareTier } from "../prompts/types";
import { todayET } from "../day";
import { useLang } from "./lang";
import { localStreak } from "./local-streak";

const S = {
  en: { card: "Story image", rareCard: "Rare find image", challenge: "Challenge a friend" },
  fr: { card: "Image story", rareCard: "Image de la trouvaille", challenge: "Défier un ami" },
} satisfies Record<Lang, Record<string, string>>;

export function cardUrl(params: Record<string, string | number | null | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== null && v !== undefined && v !== "") q.set(k, String(v));
  return `/api/card?${q.toString()}`;
}

/** Shares the story image to the phone's share sheet (Instagram, Messages...), or downloads it. */
async function shareImage(url: string, filename: string) {
  try {
    const blob = await (await fetch(url)).blob();
    const file = new File([blob], filename, { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file] });
      return;
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  } catch {
    window.open(url, "_blank", "noopener");
  }
}

// Extra buttons on the results screen: 1080x1920 image card, a top Rare Answers card, a 1v1 link.
export function ResultExtras({ game, day, result }: { game: GameId; day: string; result: FinishResult }) {
  const { lang } = useLang();
  const t = S[lang];
  const summary = (result.details.summary as Record<Lang, string> | undefined)?.[lang] ?? String(result.raw);
  // Read after mount so server and client render the same link first.
  const [streak, setStreak] = useState(0);
  useEffect(() => setStreak(localStreak(todayET()).current), []);
  const base = { game, score: summary, pct: result.percentile !== null ? Math.round(result.percentile) : null, streak, day, lang };

  // A top Rare Answers result gets its own card.
  const per = (result.details.perPrompt as { display: string | null; tier: RareTier | null }[] | undefined) ?? [];
  const best = game === "rare" ? (per.find((p) => p.tier === "legend") ?? per.find((p) => p.tier === "deep")) : undefined;

  return (
    <>
      <button className="btn ghost" type="button" onClick={() => void shareImage(cardUrl(base), `daily-games-${game}-${day}.png`)}>
        🖼️ {t.card}
      </button>
      {best?.display && (
        <button
          className="btn ghost"
          type="button"
          onClick={() => void shareImage(cardUrl({ ...base, rare: best.display, tier: best.tier }), `daily-games-rare-find-${day}.png`)}
        >
          ✦ {t.rareCard}
        </button>
      )}
      {!result.isCatchUp && (
        <Link className="btn ghost" href="/challenge">
          ⚔️ {t.challenge}
        </Link>
      )}
    </>
  );
}
