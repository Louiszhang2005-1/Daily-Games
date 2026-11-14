"use client";

import { useEffect, useState } from "react";
import { msUntilNextDay } from "../day";

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function Countdown() {
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    setMs(msUntilNextDay());
    const id = setInterval(() => setMs(msUntilNextDay()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="mono">{ms === null ? "--:--:--" : fmt(ms)}</span>;
}
