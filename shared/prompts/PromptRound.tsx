"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Expedition, sceneStyles as s, TimerRing, type SceneConfig } from "./Expedition";
import { PROMPT_SECONDS } from "./types";

// One round of 7 timed prompts, played inside an Expedition scene.
// Each prompt: a 3-second lead-in, then 25 seconds. A wrong answer is turned away and
// you can keep trying while time remains; Pass or the clock ends the prompt.
// The timer is deadline-based, so it keeps running if the player switches tabs.

const LEAD_MS = 3000;

export interface RoundCopy {
  start: string;
  submit: string;
  next: string;
  finish: string;
  pass: string;
  placeholder: string;
  hint: string; // under the prompt, e.g. "rarer answers sink deeper"
  meterLabel: string; // "Depth" / "Altitude"
  scoreLabel: string;
  promptOf: (i: number, n: number) => string;
  clockIn: string;
  timeUp: string;
  intro: string;
}

interface Saved<R> {
  idx: number;
  phase: "intro" | "lead" | "answering" | "revealed" | "done";
  leadUntil: number | null;
  deadline: number | null;
  answers: (string | null)[];
  reveals: R[];
  points: number[];
}

export function PromptRound<R>({
  prompts,
  storeKey,
  scene,
  copy,
  onAnswer,
  isAccepted,
  pointsOf,
  rejectText,
  renderReveal,
  onDone,
  intro,
}: {
  prompts: { text: string }[];
  storeKey: string;
  scene: SceneConfig;
  copy: RoundCopy;
  /** `final` is true when the prompt ends without an accepted answer (time up or pass). */
  onAnswer: (index: number, text: string | null, final: boolean) => Promise<R>;
  isAccepted: (r: R) => boolean;
  pointsOf: (r: R) => number;
  rejectText: (r: R) => string;
  renderReveal: (r: R, index: number) => React.ReactNode;
  onDone: (answers: (string | null)[]) => void;
  intro?: React.ReactNode;
}) {
  const [st, setSt] = useState<Saved<R>>({ idx: 0, phase: "intro", leadUntil: null, deadline: null, answers: [], reveals: [], points: [] });
  const [now, setNow] = useState(() => Date.now());
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const loaded = useRef(false);
  const done = useRef(false);
  const ending = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storeKey) ?? "null") as Saved<R> | null;
      if (saved?.phase) setSt(saved);
    } catch {
      /* ignore */
    }
    loaded.current = true;
  }, [storeKey]);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(storeKey, JSON.stringify(st));
    } catch {
      /* ignore */
    }
  }, [st, storeKey]);

  // Clock
  useEffect(() => {
    if (st.phase !== "lead" && st.phase !== "answering") return;
    const id = setInterval(() => setNow(Date.now()), 150);
    return () => clearInterval(id);
  }, [st.phase]);

  // Lead-in ends -> answering
  useEffect(() => {
    if (st.phase === "lead" && st.leadUntil !== null && now >= st.leadUntil) {
      setSt((x) => ({ ...x, phase: "answering", deadline: x.leadUntil! + PROMPT_SECONDS * 1000 }));
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [st.phase, st.leadUntil, now]);

  const finishPrompt = useCallback(
    async (accepted: { text: string; reveal: R } | null) => {
      if (ending.current) return;
      ending.current = true;
      const idx = st.idx;
      const reveal = accepted?.reveal ?? (await onAnswer(idx, null, true));
      setSt((x) => {
        const answers = x.answers.slice();
        const reveals = x.reveals.slice();
        const points = x.points.slice();
        answers[idx] = accepted?.text ?? null;
        reveals[idx] = reveal;
        points[idx] = accepted ? pointsOf(reveal) : 0;
        return { ...x, phase: "revealed", deadline: null, answers, reveals, points };
      });
      setText("");
      setNote("");
      ending.current = false;
    },
    [onAnswer, pointsOf, st.idx],
  );

  // Time up
  const left = st.deadline ? Math.max(0, st.deadline - now) : PROMPT_SECONDS * 1000;
  useEffect(() => {
    if (st.phase === "answering" && st.deadline !== null && left <= 0 && !busy) void finishPrompt(null);
  }, [st.phase, st.deadline, left, busy, finishPrompt]);

  async function submit() {
    const value = text.trim();
    if (!value || busy || st.phase !== "answering") return;
    setBusy(true);
    const r = await onAnswer(st.idx, value, false);
    setBusy(false);
    if (isAccepted(r)) await finishPrompt({ text: value, reveal: r });
    else {
      setNote(rejectText(r));
      setText("");
      inputRef.current?.focus();
    }
  }

  function startPrompt(idx: number) {
    setSt((x) => ({ ...x, idx, phase: "lead", leadUntil: Date.now() + LEAD_MS, deadline: null }));
    setNow(Date.now());
  }

  function next() {
    if (st.idx + 1 < prompts.length) startPrompt(st.idx + 1);
    else setSt((x) => ({ ...x, phase: "done" }));
  }

  useEffect(() => {
    if (st.phase === "done" && !done.current) {
      done.current = true;
      onDone(prompts.map((_, i) => st.answers[i] ?? null));
    }
  }, [st.phase, st.answers, prompts, onDone]);

  const score = st.points.reduce((a, b) => a + (b ?? 0), 0);
  const meters = Math.round(score * scene.metersPerPoint);
  const finished = (i: number) => st.reveals[i] !== undefined && st.reveals[i] !== null;

  const hud = (
    <>
      <div className={s.hudBox}>
        <span className={s.hudLabel}>{copy.meterLabel}</span>
        <span className={s.hudValue}>{meters.toLocaleString()} m</span>
      </div>
      <div className={s.pips} aria-label={copy.promptOf(Math.min(st.idx + 1, prompts.length), prompts.length)}>
        {prompts.map((_, i) => (
          <span
            key={i}
            className={`${s.pip} ${finished(i) ? ((st.points[i] ?? 0) > 0 ? s.done : s.miss) : i === st.idx && st.phase !== "intro" ? s.now : ""}`}
          />
        ))}
      </div>
      <div className={`${s.hudBox} ${s.right}`}>
        <span className={s.hudLabel}>{copy.scoreLabel}</span>
        <span className={s.hudValue}>{score}</span>
      </div>
    </>
  );

  let overlay: React.ReactNode = null;
  let dock: React.ReactNode = null;

  if (st.phase === "intro") {
    overlay = (
      <div className={s.card}>
        <p className={s.introText}>{copy.intro}</p>
        {intro}
      </div>
    );
    dock = (
      <div className={s.dockCenter}>
        <button className={s.next} onClick={() => startPrompt(0)}>
          {copy.start}
        </button>
      </div>
    );
  } else if (st.phase === "lead" || st.phase === "answering") {
    overlay = (
      <div className={s.card}>
        <div className={s.cardLabel}>{copy.promptOf(st.idx + 1, prompts.length)}</div>
        <div className={s.promptText}>{prompts[st.idx].text}</div>
        <div className={s.hint}>{copy.hint}</div>
      </div>
    );
    dock =
      st.phase === "lead" ? (
        <div className={s.lead}>
          {copy.clockIn} <strong>{Math.max(1, Math.ceil(((st.leadUntil ?? now) - now) / 1000))}</strong>
        </div>
      ) : (
        <>
          <form
            className={s.dockRow}
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <TimerRing left={left} total={PROMPT_SECONDS * 1000} />
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={copy.placeholder}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="send"
              maxLength={80}
              aria-label={copy.placeholder}
            />
            <button className={s.go} type="submit" disabled={busy || !text.trim()}>
              {copy.submit}
            </button>
            <button className={s.pass} type="button" onClick={() => void finishPrompt(null)} disabled={busy}>
              {copy.pass}
            </button>
          </form>
          <div className={s.dockNote} aria-live="polite">
            {note}
          </div>
        </>
      );
  } else if (st.phase === "revealed" || st.phase === "done") {
    const i = Math.min(st.idx, prompts.length - 1);
    const r = st.reveals[i];
    overlay = r !== undefined ? renderReveal(r, i) : null;
    dock =
      st.phase === "revealed" ? (
        <div className={s.dockCenter}>
          <button className={s.next} onClick={next} autoFocus>
            {st.idx + 1 < prompts.length ? copy.next : copy.finish}
          </button>
        </div>
      ) : null;
  }

  return <Expedition scene={scene} meters={meters} hud={hud} overlay={overlay} dock={dock} />;
}
