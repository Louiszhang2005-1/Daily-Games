"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { variantKey, type FinishResult, type GameClientProps, type Lang } from "@/shared/game";
import { PromptRound, type RoundCopy } from "@/shared/prompts/PromptRound";
import { diveScene } from "@/shared/prompts/scenes";
import type { RareTier } from "@/shared/prompts/types";
import { sceneStyles as v } from "@/shared/prompts/Expedition";
import { answerRare, reportRare, type RareReveal } from "./actions";
import type { PromptResult, RarePublic } from "./server";
import s from "./rare.module.css";

const TIERS: RareTier[] = ["common", "known", "rare", "deep", "legend"];
const POINTS = [10, 30, 60, 85, 100];

const S = {
  en: {
    tiers: { common: "Common", known: "Known", rare: "Rare", deep: "Deep cut", legend: "One in a million" },
    quips: {
      common: "Plenty of people were already down here.",
      known: "A few others thought of that one.",
      rare: "Now you're getting somewhere.",
      deep: "Hardly anyone makes it this far down.",
      legend: "Nobody else is down here with you.",
    },
    nothing: "Nothing counted",
    nothingLine: "No answer landed before the clock ran out.",
    reject: { empty: "", nonsense: "That doesn't look like an answer. Try another.", unlisted: "Not a valid answer for this one. Try another." },
    report: (a: string) => `Report "${a}": it should count`,
    reported: "Thanks. It goes into tonight's review.",
    most: "Most people said",
    you: "You",
    pts: "pts",
    copy: {
      start: "Start the dive",
      submit: "Dive",
      next: "Keep diving",
      finish: "Surface and see results",
      pass: "Pass",
      placeholder: "Type one answer…",
      hint: "Rarer answers sink deeper",
      meterLabel: "Depth",
      scoreLabel: "Score",
      promptOf: (i: number, n: number) => `Prompt ${i} of ${n}`,
      clockIn: "The clock starts in",
      timeUp: "Time's up",
      intro: "7 prompts, 25 seconds each. Give a real answer that few people would think of. The rarer it is, the deeper you sink. Wrong answers bounce off, so keep trying until the clock runs out.",
    } satisfies RoundCopy,
  },
  fr: {
    tiers: { common: "Courant", known: "Connu", rare: "Rare", deep: "Pointu", legend: "Une sur un million" },
    quips: {
      common: "Beaucoup de monde était déjà là.",
      known: "Quelques autres y ont pensé aussi.",
      rare: "Là, ça devient intéressant.",
      deep: "Presque personne ne descend aussi bas.",
      legend: "Personne d'autre n'est ici avec toi.",
    },
    nothing: "Rien n'a compté",
    nothingLine: "Aucune réponse avant la fin du chrono.",
    reject: { empty: "", nonsense: "Ça ne ressemble pas à une réponse. Essaie autre chose.", unlisted: "Réponse non valide pour celle-ci. Essaie autre chose." },
    report: (a: string) => `Signaler « ${a} » : ça devrait compter`,
    reported: "Merci. Ce sera vérifié ce soir.",
    most: "La plupart ont dit",
    you: "Toi",
    pts: "pts",
    copy: {
      start: "Commencer la plongée",
      submit: "Plonger",
      next: "Continuer",
      finish: "Remonter et voir les résultats",
      pass: "Passer",
      placeholder: "Une seule réponse…",
      hint: "Plus c'est rare, plus tu descends",
      meterLabel: "Profondeur",
      scoreLabel: "Score",
      promptOf: (i: number, n: number) => `Question ${i} sur ${n}`,
      clockIn: "Le chrono démarre dans",
      timeUp: "Temps écoulé",
      intro: "7 questions, 25 secondes chacune. Donne une vraie réponse à laquelle peu de gens penseraient. Plus elle est rare, plus tu descends. Les mauvaises réponses rebondissent : continue jusqu'à la fin du chrono.",
    } satisfies RoundCopy,
  },
} satisfies Record<Lang, unknown>;

function beep(points: number) {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const notes = points >= 85 ? [784, 659, 523, 392] : points >= 60 ? [659, 523, 392] : points > 0 ? [523, 440] : [196];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f;
      o.type = "sine";
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + i * 0.1 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.1 + 0.3);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.1);
      o.stop(ctx.currentTime + i * 0.1 + 0.35);
    });
  } catch {
    /* audio blocked */
  }
}

function Verdict({ r, lang, rejected, onReport }: { r: RareReveal; lang: Lang; rejected: string | null; onReport: (text: string) => Promise<void> }) {
  const t = S[lang];
  const [reported, setReported] = useState(false);
  const played = useRef(false);
  if (!played.current) {
    played.current = true;
    if (typeof window !== "undefined") setTimeout(() => beep(r.ok ? r.points : 0), 0);
  }
  return (
    <div className={v.verdict}>
      <div className={v.verdictTitle}>{r.ok ? t.tiers[r.tier] : t.nothing}</div>
      <div className={v.verdictPoints}>+{r.ok ? r.points : 0} {t.pts}</div>
      {r.ok && <div className={s.answer}>{r.display}</div>}
      <div className={v.verdictLine}>{r.ok ? t.quips[r.tier] : t.nothingLine}</div>
      {r.top && (!r.ok || r.top !== r.display) && (
        <div className={v.verdictLine}>
          {t.most}: <strong>{r.top}</strong>
        </div>
      )}
      {!r.ok && rejected && (
        <div style={{ marginTop: 12 }}>
          {reported ? (
            <span className={v.hint}>{t.reported}</span>
          ) : (
            <button
              className={s.report}
              onClick={async () => {
                await onReport(rejected);
                setReported(true);
              }}
            >
              {t.report(rejected)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function RareGame({ puzzle, day, variant, lang, puzzleId, onFinish }: GameClientProps<RarePublic>) {
  const t = S[lang];
  const [result, setResult] = useState<FinishResult | null>(null);
  const lastRejected = useRef<Record<number, string>>({});
  const vk = variantKey(variant);
  const scene = useMemo(() => diveScene(lang), [lang]);

  const onAnswer = useCallback(
    async (i: number, text: string | null) => {
      const r = await answerRare(day, vk, i, text);
      if (!r.ok && text) lastRejected.current[i] = text;
      return r;
    },
    [day, vk],
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
      <PromptRound
        prompts={puzzle.prompts}
        storeKey={`dg:rare2:${puzzleId}`}
        scene={scene}
        copy={t.copy}
        onAnswer={onAnswer}
        isAccepted={(r: RareReveal) => r.ok}
        pointsOf={(r: RareReveal) => (r.ok ? r.points : 0)}
        rejectText={(r: RareReveal) => (r.ok ? "" : t.reject[r.reason])}
        onDone={onDone}
        intro={
          <div className={s.ladder}>
            {TIERS.map((d, k) => (
              <span key={d} className={`${s.rung} ${s["b" + k]}`}>
                <strong>{POINTS[k]}</strong> {t.tiers[d]}
              </span>
            ))}
          </div>
        }
        renderReveal={(r: RareReveal, i) => (
          <Verdict key={i} r={r} lang={lang} rejected={lastRejected.current[i] ?? null} onReport={(text) => reportRare(day, vk, i, text)} />
        )}
      />
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
                    {p.tier && <span className={`tag ${s[p.tier]}`}>{t.tiers[p.tier]}</span>}
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
