"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GameClientProps, Lang } from "@/shared/game";
import { variantKey } from "@/shared/game";
import { checkWordGuess } from "./actions";
import { cleanGuess, MAX_GUESSES, WORD_LENGTH, type Mark } from "./logic";
import type { WordPublic } from "./server";
import s from "./word.module.css";

const S = {
  en: { notWord: "Not in the word list", tooShort: "Not enough letters", enter: "Enter", del: "⌫", solved: "Got it!", failed: "Out of tries", hint: "Type or tap letters, then Enter." },
  fr: { notWord: "Mot inconnu", tooShort: "Pas assez de lettres", enter: "Entrée", del: "⌫", solved: "Trouvé !", failed: "Plus d'essais", hint: "Tape ou touche les lettres, puis Entrée." },
} satisfies Record<Lang, Record<string, string>>;

const LAYOUTS: Record<Lang, string[]> = {
  en: ["qwertyuiop", "asdfghjkl", "zxcvbnm"],
  fr: ["azertyuiop", "qsdfghjklm", "wxcvbn"],
};

interface Row {
  word: string;
  marks: Mark[];
}

const RANK: Record<Mark, number> = { absent: 0, present: 1, correct: 2 };

export default function WordGame({ day, variant, lang, puzzleId, onFinish }: GameClientProps<WordPublic>) {
  const t = S[lang];
  const storeKey = `dg:word:${puzzleId}`;
  const [rows, setRows] = useState<Row[]>([]);
  const [current, setCurrent] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [done, setDone] = useState(false);
  const finished = useRef(false);

  // Restore progress after a refresh.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storeKey) ?? "null") as Row[] | null;
      if (saved?.length) setRows(saved);
    } catch {
      /* ignore */
    }
  }, [storeKey]);

  const finish = useCallback(
    async (all: Row[]) => {
      if (finished.current) return;
      finished.current = true;
      setDone(true);
      await onFinish({ guesses: all.map((r) => r.word) });
    },
    [onFinish],
  );

  useEffect(() => {
    const solved = rows.some((r) => r.marks.every((m) => m === "correct"));
    if (solved || rows.length >= MAX_GUESSES) void finish(rows);
  }, [rows, finish]);

  const flash = (msg: string) => {
    setToast(msg);
    setShake(true);
    setTimeout(() => setShake(false), 400);
    setTimeout(() => setToast(null), 1400);
  };

  const submit = useCallback(async () => {
    if (busy || done) return;
    if (current.length < WORD_LENGTH) return flash(t.tooShort);
    setBusy(true);
    const res = await checkWordGuess(day, variantKey(variant), current);
    setBusy(false);
    if (!res.valid) return flash(t.notWord);
    const next = [...rows, { word: res.word, marks: res.marks }];
    setRows(next);
    setCurrent("");
    try {
      localStorage.setItem(storeKey, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, [busy, done, current, day, variant, rows, storeKey, t]);

  const press = useCallback(
    (key: string) => {
      if (done) return;
      if (key === "enter") return void submit();
      if (key === "back") return setCurrent((c) => c.slice(0, -1));
      const letter = cleanGuess(key);
      if (letter.length === 1) setCurrent((c) => (c.length < WORD_LENGTH ? c + letter : c));
    },
    [done, submit],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Enter") press("enter");
      else if (e.key === "Backspace") press("back");
      else if (e.key.length === 1) press(e.key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  const keyMarks = useMemo(() => {
    const out: Record<string, Mark> = {};
    for (const r of rows)
      r.word.split("").forEach((c, i) => {
        const m = r.marks[i];
        if (!out[c] || RANK[m] > RANK[out[c]]) out[c] = m;
      });
    return out;
  }, [rows]);

  const solved = rows.some((r) => r.marks.every((m) => m === "correct"));

  return (
    <div className={s.wrap}>
      <div className={s.toastSlot} aria-live="polite">
        {toast && <div className={s.toast}>{toast}</div>}
        {done && !toast && <div className={s.toast}>{solved ? t.solved : t.failed}</div>}
      </div>
      <div className={s.grid}>
        {Array.from({ length: MAX_GUESSES }, (_, r) => {
          const row = rows[r];
          const isCurrent = r === rows.length && !done;
          const letters = row ? row.word : isCurrent ? current : "";
          return (
            <div key={r} className={`${s.row} ${isCurrent && shake ? "shake" : ""}`}>
              {Array.from({ length: WORD_LENGTH }, (_, i) => {
                const mark = row?.marks[i];
                return (
                  <div
                    key={i}
                    className={`${s.tile} ${mark ? s[mark] : ""} ${letters[i] && !mark ? s.filled : ""}`}
                    style={mark ? { animationDelay: `${i * 90}ms` } : undefined}
                  >
                    {letters[i]?.toUpperCase() ?? ""}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <p className="muted small" style={{ textAlign: "center", margin: 0 }}>
        {t.hint}
      </p>
      <div className={s.keyboard}>
        {LAYOUTS[lang].map((line, i) => (
          <div key={line} className={s.keyRow}>
            {i === LAYOUTS[lang].length - 1 && (
              <button className={`${s.key} ${s.wide}`} onClick={() => press("enter")} disabled={busy}>
                {t.enter}
              </button>
            )}
            {line.split("").map((c) => (
              <button key={c} className={`${s.key} ${keyMarks[c] ? s[keyMarks[c]] : ""}`} onClick={() => press(c)}>
                {c.toUpperCase()}
              </button>
            ))}
            {i === LAYOUTS[lang].length - 1 && (
              <button className={`${s.key} ${s.wide}`} onClick={() => press("back")} aria-label="Backspace">
                {t.del}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
