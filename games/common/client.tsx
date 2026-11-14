"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { variantKey, type FinishResult, type GameClientProps, type Lang } from "@/shared/game";
import { sceneStyles as v } from "@/shared/prompts/Expedition";
import { PromptRound, type RoundCopy } from "@/shared/prompts/PromptRound";
import { climbScene } from "@/shared/prompts/scenes";
import { answerCommon, reportCommon, type CommonReveal } from "./actions";
import { RANK_TIERS, type ClimbTier } from "./logic";
import type { CommonPromptResult, CommonPublic } from "./server";
import s from "./common.module.css";

const S = {
  en: {
    tiers: { summit: "Top answer", high: "High altitude", clouds: "Cloud level", rooftops: "Rooftops", lamppost: "Lamppost", ground: "Ground floor" } as Record<ClimbTier, string>,
    ranks: { summit: "#1", high: "#2 to #4", clouds: "#5 to #9", rooftops: "#10 to #12", lamppost: "#13 to #15", ground: "Lower" } as Record<ClimbTier, string>,
    quips: {
      summit: "Exactly what everyone said.",
      high: "Right up there with the crowd.",
      clouds: "A popular pick.",
      rooftops: "Some people agreed.",
      lamppost: "A handful of people agreed.",
      ground: "On the board, just barely.",
    } as Record<ClimbTier, string>,
    nothing: "No lift",
    nothingLine: "No answer counted before the clock ran out.",
    rank: (n: number) => `#${n} on the board`,
    reject: { ok: "", empty: "", nonsense: "That doesn't look like an answer. Try another.", unlisted: "Nobody on the board said that. Try another." },
    report: (a: string) => `Report "${a}": it should count`,
    reported: "Thanks. It goes into tonight's review.",
    pts: "pts",
    you: "You",
    top: "Top answer",
    copy: {
      start: "Start the climb",
      submit: "Climb",
      next: "Keep climbing",
      finish: "Land and see results",
      pass: "Pass",
      placeholder: "What would most people say?",
      hint: "Common answers climb higher",
      meterLabel: "Altitude",
      scoreLabel: "Score",
      promptOf: (i: number, n: number) => `Prompt ${i} of ${n}`,
      clockIn: "The clock starts in",
      timeUp: "Time's up",
      intro: "7 survey prompts, 25 seconds each. Say what most people would say. Only the number one answer on the board earns the full 100. Answers that aren't on the board bounce off, so keep trying until the clock runs out.",
    } satisfies RoundCopy,
  },
  fr: {
    tiers: { summit: "Réponse n° 1", high: "Haute altitude", clouds: "Dans les nuages", rooftops: "Les toits", lamppost: "Le lampadaire", ground: "Rez-de-chaussée" } as Record<ClimbTier, string>,
    ranks: { summit: "n° 1", high: "n° 2 à 4", clouds: "n° 5 à 9", rooftops: "n° 10 à 12", lamppost: "n° 13 à 15", ground: "Plus bas" } as Record<ClimbTier, string>,
    quips: {
      summit: "Exactement ce que tout le monde a dit.",
      high: "Tout en haut avec la foule.",
      clouds: "Un choix populaire.",
      rooftops: "Quelques personnes étaient d'accord.",
      lamppost: "Une poignée de gens étaient d'accord.",
      ground: "Sur le tableau, de justesse.",
    } as Record<ClimbTier, string>,
    nothing: "Pas d'envol",
    nothingLine: "Aucune réponse avant la fin du chrono.",
    rank: (n: number) => `n° ${n} du tableau`,
    reject: { ok: "", empty: "", nonsense: "Ça ne ressemble pas à une réponse. Essaie autre chose.", unlisted: "Personne au tableau n'a dit ça. Essaie autre chose." },
    report: (a: string) => `Signaler « ${a} » : ça devrait compter`,
    reported: "Merci. Ce sera vérifié ce soir.",
    pts: "pts",
    you: "Toi",
    top: "Réponse n° 1",
    copy: {
      start: "Commencer l'ascension",
      submit: "Monter",
      next: "Continuer",
      finish: "Atterrir et voir les résultats",
      pass: "Passer",
      placeholder: "Que dirait la plupart des gens ?",
      hint: "Plus c'est courant, plus tu montes",
      meterLabel: "Altitude",
      scoreLabel: "Score",
      promptOf: (i: number, n: number) => `Question ${i} sur ${n}`,
      clockIn: "Le chrono démarre dans",
      timeUp: "Temps écoulé",
      intro: "7 questions de sondage, 25 secondes chacune. Dis ce que la plupart des gens diraient. Seule la réponse n° 1 du tableau rapporte 100 points. Les réponses absentes du tableau rebondissent : continue jusqu'à la fin du chrono.",
    } satisfies RoundCopy,
  },
};

const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);

function Verdict({ r, lang, rejected, onReport }: { r: CommonReveal; lang: Lang; rejected: string | null; onReport: (text: string) => Promise<void> }) {
  const t = S[lang];
  const [reported, setReported] = useState(false);
  const ok = r.reason === "ok" && r.tier;
  return (
    <div className={v.verdict}>
      <div className={v.verdictTitle}>{ok ? t.tiers[r.tier!] : t.nothing}</div>
      <div className={v.verdictPoints}>
        +{r.points} {t.pts}
      </div>
      <div className={v.verdictLine}>{ok ? `${cap(r.display ?? "")}: ${t.rank(r.rank!)}. ${t.quips[r.tier!]}` : t.nothingLine}</div>
      {r.board.length > 0 && (
        <ol className={s.board}>
          {r.board.map((row, i) => (
            <li key={row.id} className={row.id === r.matched ? s.mine : ""} style={{ animationDelay: `${i * 90}ms` }}>
              <span className={s.rank}>{row.rank}</span>
              <span className={s.name}>{row.display}</span>
              <span className={s.share}>{row.share}%</span>
            </li>
          ))}
        </ol>
      )}
      {!ok && rejected && (
        <div style={{ marginTop: 10 }}>
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

export default function CommonGame({ puzzle, day, variant, lang, puzzleId, onFinish }: GameClientProps<CommonPublic>) {
  const t = S[lang];
  const vk = variantKey(variant);
  const [result, setResult] = useState<FinishResult | null>(null);
  const lastRejected = useRef<Record<number, string>>({});
  const scene = useMemo(() => climbScene(lang), [lang]);

  const onAnswer = useCallback(
    async (i: number, text: string | null) => {
      const r = await answerCommon(day, vk, i, text);
      if (r.reason !== "ok" && text) lastRejected.current[i] = text;
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

  const per = (result?.details.perPrompt as CommonPromptResult[] | undefined) ?? null;

  return (
    <div className="col gap">
      <PromptRound
        prompts={puzzle.prompts}
        storeKey={`dg:common2:${puzzleId}`}
        scene={scene}
        copy={t.copy}
        onAnswer={onAnswer}
        isAccepted={(r: CommonReveal) => r.reason === "ok"}
        pointsOf={(r: CommonReveal) => r.points}
        rejectText={(r: CommonReveal) => t.reject[r.reason]}
        onDone={onDone}
        intro={
          <div className={s.ladder}>
            {RANK_TIERS.map((x) => (
              <span key={x.tier} className={s.rung}>
                <strong>{x.points}</strong> {t.tiers[x.tier]} <em>{t.ranks[x.tier]}</em>
              </span>
            ))}
          </div>
        }
        renderReveal={(r: CommonReveal, i) => (
          <Verdict key={i} r={r} lang={lang} rejected={lastRejected.current[i] ?? null} onReport={(text) => reportCommon(day, vk, i, text)} />
        )}
      />
      {per && (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t.you}</th>
                <th>{t.top}</th>
                <th className="num">{t.pts}</th>
              </tr>
            </thead>
            <tbody>
              {per.map((p, i) => (
                <tr key={i}>
                  <td title={p.text}>{i + 1}</td>
                  <td>{p.display ?? <span className="muted">{p.answer ?? "—"}</span>}</td>
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
