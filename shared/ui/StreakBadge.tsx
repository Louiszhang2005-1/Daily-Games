"use client";

import { useEffect, useState } from "react";
import { todayET } from "../day";
import { useLang } from "./lang";
import { localStreak } from "./local-streak";

/** Hub streak (at least one game a day, ET). Server value when logged in, browser otherwise. */
export function StreakBadge({ server }: { server?: { current: number; best: number } | null }) {
  const { t } = useLang();
  const [s, setS] = useState(server ?? null);
  useEffect(() => {
    if (!server) setS(localStreak(todayET()));
  }, [server]);
  if (!s) return null;
  return (
    <div className="row gap small">
      <span>
        🔥 {t.streak}: <strong>{s.current}</strong> {t.days}
      </span>
      <span className="muted">
        {t.best}: {s.best}
      </span>
    </div>
  );
}
