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
  children,
}: {
  meta: GameMeta;
  result: FinishResult;
  day: string;
  shareBody: string;
  extra?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const { lang, t } = useLang();
  const [copied, setCopied] = useState(false);

  const pctLine =
    result.percentile !== null
      ? `${t.percentile}: ${ordinal(Math.round(result.percentile), lang)}${result.provisional ? ` (${t.provisional})` : ""}`
      : "";

  async function share() {
    const site = window.location.origin;
    const text = [`${t.siteName}: ${meta.name[lang]}, ${day}`, shareBody, pctLine, site].filter(Boolean).join("\n");
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

  const pct = result.percentile !== null ? Math.round(result.percentile) : null;
  const R = RS[lang];

  return (
    <section className="result" aria-live="polite">
      {(result.alreadyPlayed || result.isCatchUp) && (
        <p className="muted small" style={{ margin: 0 }}>
          {result.isCatchUp ? t.catchUpNote : t.alreadyPlayed}
        </p>
      )}
      <div className="result-top">
        {pct !== null ? (
          <div>
            <div className="pct">
              {ordinal(pct, lang)}
              <small>{t.percentile.toLowerCase()}</small>
            </div>
            <div className="muted small">{R.ahead(pct)}</div>
          </div>
        ) : (
          <div className="pct">{summaryOf(result, lang)}</div>
        )}
        <div className="score">
          <span className="label">{t.score}</span>
          <strong>{summaryOf(result, lang)}</strong>
        </div>
      </div>
      {pct !== null && (
        <>
          <div className="pct-bar" role="img" aria-label={R.ahead(pct)}>
            <span className="fill" style={{ width: `${Math.max(3, pct)}%` }} />
          </div>
          <div className="pct-ends">
            <span>0</span>
            <span>100</span>
          </div>
          {result.provisional && (
            <p className="muted small" style={{ margin: "-8px 0 0" }}>
              {R.provisional}.
            </p>
          )}
        </>
      )}
      {children}
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

const RS = {
  en: {
    ahead: (p: number) => `You did better than ${p}% of today's players.`,
    provisional: "Early ranking, based on recent days until 30 people play",
  },
  fr: {
    ahead: (p: number) => `Tu as fait mieux que ${p} % des joueurs du jour.`,
    provisional: "Classement provisoire, basé sur les derniers jours jusqu'à 30 joueurs",
  },
};
