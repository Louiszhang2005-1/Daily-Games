"use client";

import { useCallback, useEffect, useState } from "react";
import { variantKey, type FinishResult, type GameClientProps, type Lang } from "@/shared/game";
import { PromptRound } from "@/shared/prompts/PromptRound";
import type { RareTier } from "@/shared/prompts/types";
import { answerRare, reportRare, type RareReveal } from "./actions";
import type { PromptResult, RarePublic } from "./server";
import s from "./rare.module.css";

const S = {
  en: {
    tiers: { common: "Common", known: "Known", rare: "Rare", deep: "Deep cut", legend: "One in a million" },
    reasons: { empty: "No answer", nonsense: "That doesn't look like an answer", unlisted: "Not on our list for this prompt" },
    report: "Report: this should count",
    reported: "Thanks, we'll review it tonight.",
    most: "Most people said",
    you: "You",
    pts: "pts",
  },
  fr: {
    tiers: { common: "Courant", known: "Connu", rare: "Rare", deep: "Pointu", legend: "Une sur un million" },
    reasons: { empty: "Pas de réponse", nonsense: "Ça ne ressemble pas à une réponse", unlisted: "Pas dans notre liste pour cette question" },
    report: "Signaler : ça devrait compter",
    reported: "Merci, on vérifie ce soir.",
    most: "La plupart ont dit",
    you: "Toi",
    pts: "pts",
  },
} satisfies Record<Lang, unknown>;

function beep(points: number) {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const notes = points >= 85 ? [523, 659, 784, 1047] : points >= 60 ? [523, 659, 784] : points > 0 ? [440, 554] : [220];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f;
      o.type = "triangle";
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.09);
      g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + i * 0.09 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.09 + 0.25);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.09);
      o.stop(ctx.currentTime + i * 0.09 + 0.3);
    });
  } catch {
    /* audio blocked */
  }
}

function RollingNumber({ value }: { value: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / 900);
      setShown(Math.round(value * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className="mono">{shown}</span>;
}

function Reveal({ r, lang, onReport }: { r: RareReveal; lang: Lang; onReport: () => Promise<void> }) {
  const t = S[lang];
  const [reported, setReported] = useState(false);
  useEffect(() => beep(r.ok ? r.points : 0), [r]);
  if (r.ok)
    return (
      <div className={`${s.reveal} ${s[r.tier]}`}>
        <div className={s.points}>
          +<RollingNumber value={r.points} />
        </div>
        <div className={s.tier}>{t.tiers[r.tier]}</div>
        <div className={s.answer}>{r.display}</div>
        {r.top && r.top !== r.display && (
          <div className="small muted">
            {t.most}: <strong>{r.top}</strong>
          </div>
        )}
      </div>
    );
  return (
    <div className={`${s.reveal} ${s.miss}`}>
      <div className={s.points}>0</div>
      <div className={s.tier}>{t.reasons[r.reason]}</div>
      {r.top && (
        <div className="small muted">
          {t.most}: <strong>{r.top}</strong>
        </div>
      )}
      {r.reason === "unlisted" &&
        (reported ? (
          <span className="small muted">{t.reported}</span>
        ) : (
          <button
            className="btn ghost small"
            onClick={async () => {
              await onReport();
              setReported(true);
            }}
          >
            {t.report}
          </button>
        ))}
    </div>
  );
}

export default function RareGame({ puzzle, day, variant, lang, puzzleId, onFinish }: GameClientProps<RarePublic>) {
  const t = S[lang];
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [result, setResult] = useState<FinishResult | null>(null);
  const v = variantKey(variant);

  const onAnswer = useCallback(
    async (i: number, text: string | null) => {
      setAnswers((a) => {
        const next = a.slice();
        next[i] = text;
        return next;
      });
      return answerRare(day, v, i, text);
    },
    [day, v],
  );

  const onDone = useCallback(
    async (all: (string | null)[]) => {
      const r = await onFinish({ answers: all });
      if (!("error" in r)) setResult(r);
    },
    [onFinish],
  );

  const per = (result?.details.perPrompt as PromptResult[] | undefined) ?? null;

  return (
    <div className="col gap">
      {!per && (
        <PromptRound
          prompts={puzzle.prompts}
          lang={lang}
          storeKey={`dg:rare:${puzzleId}`}
          onAnswer={onAnswer}
          onDone={onDone}
          renderReveal={(r: RareReveal, i) => (
            <Reveal r={r} lang={lang} onReport={() => reportRare(day, v, i, answers[i] ?? "")} />
          )}
        />
      )}
      {per && (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t.you}</th>
                <th>{t.most}</th>
                <th className="num">{t.pts}</th>
              </tr>
            </thead>
            <tbody>
              {per.map((p, i) => (
                <tr key={i}>
                  <td title={p.text}>{i + 1}</td>
                  <td>
                    {p.display ?? <span className="muted">{p.answer ?? "—"}</span>}
                    {p.tier && <span className={`tag ${s[p.tier]}`}>{t.tiers[p.tier as RareTier]}</span>}
                  </td>
                  <td className="muted">{p.top ?? "—"}</td>
                  <td className="num">{p.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
