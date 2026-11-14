import { ORDERED_METAS } from "@/games/metas";
import { getPlayer } from "../identity";
import { getLang } from "../lang-server";
import { resultsForPlayer, toFinishResult } from "../results";
import { dailyTotal } from "../scoring";
import { getStreak } from "../streaks";
import { StreakBadge } from "./StreakBadge";
import { SummaryClanExtra } from "./SummaryClanExtra";

const S = { en: "Daily summary card", fr: "Carte du résumé" };

// Streak, clan rank and the daily summary card.
export async function SummaryExtras({ day }: { day: string }) {
  const lang = await getLang();
  const player = await getPlayer();
  const streak = player.userId ? await getStreak(player.userId) : null;
  const rows = (await resultsForPlayer(player, day)).filter((r) => r.language === lang);
  const parts: string[] = [];
  const pcts: number[] = [];
  for (const m of ORDERED_METAS) {
    const r = rows.find((x) => x.game === m.id);
    if (!r) continue;
    const res = await toFinishResult(r, true);
    if (res.percentile !== null) {
      parts.push(`${m.id}:${Math.round(res.percentile)}`);
      pcts.push(res.percentile);
    }
  }
  const total = dailyTotal(pcts);
  const q = new URLSearchParams({ summary: parts.join(","), total: total !== null ? String(Math.round(total)) : "—", day, lang, streak: String(streak?.current ?? 0) });
  return (
    <>
      <StreakBadge server={streak} />
      {player.userId && <SummaryClanExtra day={day} userId={player.userId} />}
      {parts.length > 0 && (
        <a className="btn ghost small" href={`/api/card?${q.toString()}`} target="_blank" rel="noopener" style={{ alignSelf: "flex-start" }}>
          🖼️ {S[lang]}
        </a>
      )}
    </>
  );
}
