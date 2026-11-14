"use client";

import { useState } from "react";
import Link from "next/link";
import type { FinishResult, GameMeta, Lang } from "../game";
import { useLang } from "./lang";

export function ordinal(n: number, lang: Lang): string {
  if (lang === "fr") return n === 1 ? "1er" : `${n}e`;
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  const s = ["th", "st", "nd", "rd"][n % 10] ?? "th";
  return `${n}${s}`;
}

export function summaryOf(result: { raw: number; details: Record<string, unknown> }, lang: Lang): string {
  const s = result.details.summary as Record<Lang, string> | undefined;
  return s?.[lang] ?? String(result.raw);
}

export function ResultPanel({
  meta,
  result,
  day,
  shareBody,
  extra,
}: {
  meta: GameMeta;
  result: FinishResult;
  day: string;
  shareBody: string;
  extra?: React.ReactNode;
}) {
  const { lang, t } = useLang();
  const [copied, setCopied] = useState(false);

  const pctLine =
    result.percentile !== null
      ? `${t.percentile}: ${ordinal(Math.round(result.percentile), lang)}${result.provisional ? ` (${t.provisional})` : ""}`
      : "";

  async function share() {
    const site = window.location.origin;
    const text = [`${t.siteName} · ${meta.name[lang]} · ${day}`, shareBody, pctLine, site].filter(Boolean).join("\n");
    try {
      if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* user cancelled */
    }
  }

  return (
    <section className="result card" style={{ ["--accent" as string]: meta.color }}>
      {result.alreadyPlayed && <p className="muted small">{t.alreadyPlayed}</p>}
      {result.isCatchUp && <p className="muted small">{t.catchUpNote}</p>}
      <div className="result-row">
        <div>
          <div className="label">{t.score}</div>
          <div className="big">{summaryOf(result, lang)}</div>
        </div>
        {result.percentile !== null && (
          <div>
            <div className="label">
              {t.percentile}
              {result.provisional && <span className="tag">{t.provisional}</span>}
            </div>
            <div className="big">{ordinal(Math.round(result.percentile), lang)}</div>
          </div>
        )}
      </div>
      {shareBody && <pre className="share-preview">{shareBody}</pre>}
      <div className="row gap wrap">
        <button className="btn primary" onClick={share}>
          {copied ? t.copied : t.share}
        </button>
        {extra}
        <Link className="btn ghost" href="/">
          {t.backToHub}
        </Link>
      </div>
    </section>
  );
}
