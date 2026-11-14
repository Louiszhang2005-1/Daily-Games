import { getPlayer } from "../identity";
import { getStreak } from "../streaks";
import { StreakBadge } from "./StreakBadge";
import { SummaryClanExtra } from "./SummaryClanExtra";

// Streak and clan rank on the daily summary.
export async function SummaryExtras({ day }: { day: string }) {
  const player = await getPlayer();
  const streak = player.userId ? await getStreak(player.userId) : null;
  return (
    <>
      <StreakBadge server={streak} />
      {player.userId && <SummaryClanExtra day={day} userId={player.userId} />}
    </>
  );
}
