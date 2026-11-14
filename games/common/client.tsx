"use client";

import { useCallback, useState } from "react";
import { variantKey, type FinishResult, type GameClientProps, type Lang } from "@/shared/game";
import { PromptRound } from "@/shared/prompts/PromptRound";
import { answerCommon, reportCommon, type CommonReveal } from "./actions";
import type { CommonPromptResult, CommonPublic } from "./server";
import s from "./common.module.css";

const S = {
  en: {
    reasons: { ok: "", empty: "No answer", nonsense: "That doesn't look like an answer", unlisted: "Nobody on the board said that" },
    report: "Report: this should count",
    reported: "Thanks, we'll review it tonight.",
    pts: "pts",
    you: "You",
    top: "Top answer",
    how: "You score the share of players who gave the same answer. Think like everyone else.",
  },
  fr: {
    reasons: { ok: "", empty: "Pas de réponse", nonsense: "Ça ne ressemble pas à une réponse", unlisted: "Personne au tableau n'a dit ça" },
    report: "Signaler : ça devrait compter",
    reported: "Merci, on vérifie ce soir.",
    pts: "pts",
    you: "Toi",
    top: "Réponse n° 1",
    how: "Tu marques le pourcentage de joueurs qui ont donné la même réponse. Pense comme tout le monde.",
  },
} satisfies Record<Lang, unknown>;

function Board({ r, lang, onReport }: { r: CommonReveal; lang: Lang; onReport: () => Promise<void> }) {
  const t = S[lang];
  const [reported, setReported] = useState(false);
  return (
    <div className={s.boardWrap}>
      <div className={s.score}>
        {r.points > 0 ? `+${r.points}` : "0"} <span>{t.pts}</span>
      </div>
      {r.reason !== "ok" && <p style={{ margin: 0, fontWeight: 700 }}>{t.reasons[r.reason]}</p>}
      <ol className={s.board}>
        {r.board.map((row, i) => (
          <li key={row.id} className={row.id === r.matched ? s.mine : ""} style={{ animationDelay: `${i * 120}ms` }}>
            <span className={s.rank}>{i + 1}</span>
            <span className={s.name}>{row.display}</span>
            <span className={s.bar} style={{ ["--w" as string]: `${Math.max(4, row.share)}%` }} />
            <span className={`mono ${s.share}`}>{row.share}%</span>
          </li>
        ))}
      </ol>
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

export default function CommonGame({ puzzle, day, variant, lang, puzzleId, onFinish }: GameClientProps<CommonPublic>) {
  const t = S[lang];
  const v = variantKey(variant);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [result, setResult] = useState<FinishResult | null>(null);

  const onAnswer = useCallback(
    async (i: number, text: string | null) => {
      setAnswers((a) => {
        const next = a.slice();
        next[i] = text;
        return next;
      });
      return answerCommon(day, v, i, text);
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

  const per = (result?.details.perPrompt as CommonPromptResult[] | undefined) ?? null;

  return (
    <div className="col gap">
      {!per && (
        <PromptRound
          prompts={puzzle.prompts}
          lang={lang}
          storeKey={`dg:common:${puzzleId}`}
          onAnswer={onAnswer}
          onDone={onDone}
          intro={<p style={{ margin: 0, opacity: 0.9 }}>{t.how}</p>}
          renderReveal={(r: CommonReveal, i) => <Board r={r} lang={lang} onReport={() => reportCommon(day, v, i, answers[i] ?? "")} />}
        />
      )}
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
