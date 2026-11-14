"use client";

import { useEffect, useState } from "react";
import { syncLocalStreak } from "@/app/auth/actions";
import { addDays, todayET } from "../day";
import { useLang } from "./lang";
import { localPlays, localStreak } from "./local-streak";

/**
 * Hub streak (at least one game a day, ET). Server value when logged in, browser otherwise.
 * On the first logged-in visit, the browser's guest streak is moved to the account.
 */
export function StreakBadge({ server }: { server?: { current: number; best: number } | null }) {
  const { t } = useLang();
  const [s, setS] = useState(server ?? null);
  useEffect(() => {
    const today = todayET();
    if (!server) {
      setS(localStreak(today));
      return;
    }
    try {
      if (localStorage.getItem("dg:streak-synced")) return;
      const local = localStreak(today);
      const plays = localPlays();
      const lastDay = plays[today]?.length ? today : plays[addDays(today, -1)]?.length ? addDays(today, -1) : null;
      if (local.best > 0) void syncLocalStreak({ ...local, lastDay });
      localStorage.setItem("dg:streak-synced", "1");
    } catch {
      /* storage blocked */
    }
  }, [server]);
  if (!s) return null;
  return (
    <div className="streak">
      <span className="flame" aria-hidden>
        🔥
      </span>
      <span>
        {s.current} {s.current === 1 ? t.day : t.days} {t.streak.toLowerCase()}
        <span className="muted small">
          {" "}
          ({t.best.toLowerCase()} {s.best})
        </span>
      </span>
    </div>
  );
}
