"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "../game";
import { AnswerInput } from "../ui/AnswerInput";
import { PROMPT_SECONDS } from "./types";
import s from "./prompts.module.css";

const S = {
  en: { start: "Start", next: "Next prompt", finish: "See results", answer: "Answer", placeholder: "Your answer…", timeUp: "Time's up!", of: "of", ready: "7 prompts, 25 seconds each. The timer keeps running if you switch tabs." },
  fr: { start: "Commencer", next: "Question suivante", finish: "Voir les résultats", answer: "Valider", placeholder: "Ta réponse…", timeUp: "Temps écoulé !", of: "sur", ready: "7 questions, 25 secondes chacune. Le chrono continue si tu changes d'onglet." },
} satisfies Record<Lang, Record<string, string>>;

interface Saved<R> {
  idx: number;
  deadline: number | null;
  answers: (string | null)[];
  reveals: R[];
  started: boolean;
}

/**
 * Runs a list of timed prompts. The timer is deadline-based, so it keeps running
 * if the player switches tabs or reloads.
 */
export function PromptRound<R>({
  prompts,
  lang,
  storeKey,
  onAnswer,
  renderReveal,
  onDone,
  intro,
}: {
  prompts: { text: string }[];
  lang: Lang;
  storeKey: string;
  onAnswer: (index: number, text: string | null) => Promise<R>;
  renderReveal: (reveal: R, index: number) => React.ReactNode;
  onDone: (answers: (string | null)[]) => void;
  intro?: React.ReactNode;
}) {
  const t = S[lang];
  const [state, setState] = useState<Saved<R>>({ idx: 0, deadline: null, answers: [], reveals: [], started: false });
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const done = useRef(false);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storeKey) ?? "null") as Saved<R> | null;
      if (saved) setState(saved);
    } catch {
      /* ignore */
    }
    loaded.current = true;
  }, [storeKey]);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(storeKey, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, storeKey]);

  const answering = state.started && state.reveals.length === state.idx && state.idx < prompts.length;

  const submit = useCallback(
    async (text: string | null) => {
      if (busy || !answering) return;
      setBusy(true);
      const reveal = await onAnswer(state.idx, text);
      setBusy(false);
      setState((st) => ({ ...st, deadline: null, answers: [...st.answers, text], reveals: [...st.reveals, reveal] }));
    },
    [busy, answering, onAnswer, state.idx],
  );

  // Countdown (deadline based).
  useEffect(() => {
    if (!answering || state.deadline === null) return;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [answering, state.deadline]);

  const left = state.deadline ? Math.max(0, state.deadline - now) : PROMPT_SECONDS * 1000;
  useEffect(() => {
    if (answering && state.deadline !== null && left <= 0) void submit(null);
  }, [answering, left, state.deadline, submit]);

  useEffect(() => {
    if (state.reveals.length === prompts.length && state.idx >= prompts.length && !done.current) {
      done.current = true;
      onDone(state.answers);
    }
  }, [state, prompts.length, onDone]);

  function next() {
    setState((st) => ({ ...st, idx: st.idx + 1, deadline: st.idx + 1 < prompts.length ? Date.now() + PROMPT_SECONDS * 1000 : null }));
  }

  if (!state.started) {
    return (
      <div className={s.ready}>
        <p>{t.ready}</p>
        {intro}
        <button
          className="btn primary"
          onClick={() => setState((st) => ({ ...st, started: true, deadline: Date.now() + PROMPT_SECONDS * 1000 }))}
        >
          {t.start}
        </button>
      </div>
    );
  }

  const idx = Math.min(state.idx, prompts.length - 1);
  const revealed = state.reveals[idx];
  const pct = Math.max(0, Math.min(1, left / (PROMPT_SECONDS * 1000)));

  return (
    <div className={s.wrap}>
      <div className={s.progress}>
        {prompts.map((_, i) => (
          <span key={i} className={i < state.reveals.length ? s.dotDone : i === idx ? s.dotNow : s.dot} />
        ))}
      </div>
      <div className={s.prompt}>
        <div className="label">
          {idx + 1} {t.of} {prompts.length}
        </div>
        <h2 className={s.text}>{prompts[idx].text}</h2>
        {answering && (
          <>
            <div className={s.timerRow}>
              <div className={s.timerBar}>
                <span style={{ transform: `scaleX(${pct})` }} className={left < 6000 ? s.low : ""} />
              </div>
              <span className={s.secs}>{Math.ceil(left / 1000)}s</span>
            </div>
            <div className={s.inputArea}>
              <AnswerInput onSubmit={(v) => void submit(v)} placeholder={t.placeholder} submitLabel={t.answer} disabled={busy} autoFocus showSuggestions={false} />
            </div>
          </>
        )}
        {revealed !== undefined && (
          <div className={s.reveal}>
            {state.answers[idx] === null && <p className={s.timeUp}>{t.timeUp}</p>}
            {renderReveal(revealed, idx)}
            {state.idx === idx && state.idx < prompts.length && (
              <button className="btn" onClick={next}>
                {idx + 1 < prompts.length ? t.next : t.finish}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
