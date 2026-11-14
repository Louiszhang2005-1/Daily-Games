"use client";

import { useEffect, useState } from "react";
import type { FinishResult, Lang } from "@/shared/game";
import { wordDistribution } from "./actions";
import s from "./word.module.css";

const S = {
  en: { title: "How everyone did today", miss: "X" },
  fr: { title: "Les résultats de tous aujourd'hui", miss: "X" },
};

/** Today's guess distribution, with your row highlighted (like the original's stats screen). */
export function WordResultBody({ day, variant, result, lang }: { day: string; variant: string; result: FinishResult; lang: Lang }) {
  const [dist, setDist] = useState<number[] | null>(null);
  useEffect(() => {
    void wordDistribution(day, variant).then(setDist);
  }, [day, variant, result.raw]);
  if (!dist) return null;
  const mine = result.raw > 0 ? 7 - result.raw : 0;
  const max = Math.max(1, ...dist);
  const rows = [1, 2, 3, 4, 5, 6, 0];
  return (
    <div className={s.dist}>
      <div className="label">{S[lang].title}</div>
      {rows.map((k) => (
        <div key={k} className={s.distRow}>
          <span className={s.distKey}>{k === 0 ? S[lang].miss : k}</span>
          <span className={`${s.distBar} ${k === mine ? s.distMine : ""}`} style={{ width: `${Math.max(7, (100 * dist[k]) / max)}%` }}>
            {dist[k]}
          </span>
        </div>
      ))}
    </div>
  );
}
