import { StreakBadge } from "./StreakBadge";

// Streak (and later clan rank) on the daily summary.
export async function SummaryExtras(_props: { day: string }) {
  return <StreakBadge />;
}
