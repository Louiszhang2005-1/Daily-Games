// Puzzle days run on Eastern Time (America/New_York) for everyone.
// A "day" is always a YYYY-MM-DD string.

export const TZ = "America/New_York";

const fmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function dayET(date: Date = new Date()): string {
  return fmt.format(date); // en-CA formats as YYYY-MM-DD
}

export function todayET(): string {
  return dayET();
}

export function addDays(day: string, n: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function yesterdayET(): string {
  return addDays(todayET(), -1);
}

/** Whole days since 1970-01-01. Stable index for deterministic rotations. */
export function dayIndex(day: string): number {
  return Math.round(Date.parse(`${day}T00:00:00Z`) / 86_400_000);
}

export function isValidDay(day: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(day) && !Number.isNaN(Date.parse(`${day}T00:00:00Z`));
}

/** Milliseconds until the next midnight in Eastern Time. */
export function msUntilNextDay(now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  const elapsed = (get("hour") * 3600 + get("minute") * 60 + get("second")) * 1000 + now.getMilliseconds();
  return 86_400_000 - elapsed;
}

/** Which days a player may play: today always; yesterday only when logged in. */
export function playableDays(loggedIn: boolean): string[] {
  return loggedIn ? [todayET(), yesterdayET()] : [todayET()];
}
