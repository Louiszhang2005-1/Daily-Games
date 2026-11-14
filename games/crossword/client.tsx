"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GameClientProps, Lang } from "@/shared/game";
import { fmtSeconds } from "@/shared/format";
import { decodeSolution, LETTER_HINT_S, WORD_HINT_S, type Entry } from "./logic";
import type { CrosswordPublic } from "./server";
import s from "./crossword.module.css";

const S = {
  en: { across: "Across", down: "Down", letter: `Reveal letter (+${LETTER_HINT_S}s)`, word: `Reveal word (+${WORD_HINT_S}s)`, start: "Timer starts on your first letter.", paused: "Paused", solved: "Solved!" },
  fr: { across: "Horizontal", down: "Vertical", letter: `Révéler une lettre (+${LETTER_HINT_S} s)`, word: `Révéler le mot (+${WORD_HINT_S} s)`, start: "Le chrono démarre à ta première lettre.", paused: "En pause", solved: "Résolu !" },
} satisfies Record<Lang, Record<string, string>>;

const LAYOUTS: Record<Lang, string[]> = {
  en: ["qwertyuiop", "asdfghjkl", "zxcvbnm"],
  fr: ["azertyuiop", "qsdfghjklm", "wxcvbn"],
};

const N = 5;

interface Saved {
  filled: string[][];
  locked: boolean[][];
  elapsed: number;
  started: boolean;
  letterHints: number;
  wordHints: number;
}

const empty = <T,>(v: T) => Array.from({ length: N }, () => Array.from({ length: N }, () => v));

export default function Crossword({ puzzle, lang, puzzleId, onFinish }: GameClientProps<CrosswordPublic>) {
  const t = S[lang];
  const storeKey = `dg:crossword:${puzzleId}`;
  const solution = useMemo(() => decodeSolution(puzzle.solution), [puzzle.solution]);
  const black = (r: number, c: number) => puzzle.shape[r]?.[c] !== ".";

  const [filled, setFilled] = useState<string[][]>(() => empty(""));
  const [locked, setLocked] = useState<boolean[][]>(() => empty(false));
  const [sel, setSel] = useState<{ r: number; c: number }>(() => {
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (puzzle.shape[r][c] === ".") return { r, c };
    return { r: 0, c: 0 };
  });
  const [dir, setDir] = useState<"across" | "down">("across");
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hints, setHints] = useState({ letter: 0, word: 0 });
  const [solved, setSolved] = useState(false);
  const finished = useRef(false);
  const lastTick = useRef<number | null>(null);

  // Restore
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storeKey) ?? "null") as Saved | null;
      if (saved) {
        setFilled(saved.filled);
        setLocked(saved.locked);
        setElapsed(saved.elapsed);
        setStarted(saved.started);
        setHints({ letter: saved.letterHints, word: saved.wordHints });
      }
    } catch {
      /* ignore */
    }
  }, [storeKey]);

  // Persist
  useEffect(() => {
    try {
      const data: Saved = { filled, locked, elapsed, started, letterHints: hints.letter, wordHints: hints.word };
      localStorage.setItem(storeKey, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }, [filled, locked, elapsed, started, hints, storeKey]);

  // Timer: runs after the first keystroke, pauses while the tab is hidden, stops when solved.
  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);
  useEffect(() => {
    if (!started || solved || hidden) {
      lastTick.current = null;
      return;
    }
    lastTick.current = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      if (lastTick.current !== null) setElapsed((e) => e + (now - lastTick.current!) / 1000);
      lastTick.current = now;
    }, 250);
    return () => clearInterval(id);
  }, [started, solved, hidden]);

  // Solved?
  useEffect(() => {
    const ok = solution.every((row, r) => row.split("").every((ch, c) => ch === "#" || filled[r][c] === ch));
    if (ok && !finished.current && started) {
      finished.current = true;
      setSolved(true);
      void onFinish({ filled: filled.map((row, r) => row.map((ch, c) => (black(r, c) ? "#" : ch)).join("")), seconds: Math.max(3, elapsed), letterHints: hints.letter, wordHints: hints.word });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filled]);

  const entryAt = useCallback(
    (r: number, c: number, d: "across" | "down"): Entry | undefined =>
      puzzle.entries.find((e) => e.dir === d && (d === "across" ? e.row === r && c >= e.col && c < e.col + e.len : e.col === c && r >= e.row && r < e.row + e.len)),
    [puzzle.entries],
  );
  const current = entryAt(sel.r, sel.c, dir) ?? entryAt(sel.r, sel.c, dir === "across" ? "down" : "across");
  const cellsOf = (e: Entry) => Array.from({ length: e.len }, (_, k) => (e.dir === "across" ? { r: e.row, c: e.col + k } : { r: e.row + k, c: e.col }));
  const numbers = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of puzzle.entries) m.set(`${e.row},${e.col}`, e.num);
    return m;
  }, [puzzle.entries]);

  function setCell(r: number, c: number, ch: string) {
    setFilled((f) => f.map((row, i) => (i === r ? row.map((x, j) => (j === c ? ch : x)) : row)));
  }

  function step(delta: 1 | -1) {
    if (!current) return;
    const cells = cellsOf(current);
    const i = cells.findIndex((x) => x.r === sel.r && x.c === sel.c);
    const next = cells[i + delta];
    if (next) setSel(next);
    else if (delta === 1) nextEntry(1);
  }

  function nextEntry(delta: 1 | -1) {
    const list = puzzle.entries;
    const i = current ? list.findIndex((e) => e.key === current.key) : -1;
    const e = list[(i + delta + list.length) % list.length];
    setDir(e.dir);
    const firstEmpty = cellsOf(e).find(({ r, c }) => !filled[r][c]) ?? { r: e.row, c: e.col };
    setSel(firstEmpty);
  }

  const type = useCallback(
    (key: string) => {
      if (solved) return;
      if (key === "back") {
        if (!locked[sel.r][sel.c] && filled[sel.r][sel.c]) setCell(sel.r, sel.c, "");
        else {
          step(-1);
        }
        return;
      }
      const ch = key.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      if (!/^[a-z]$/.test(ch)) return;
      if (!started) setStarted(true);
      if (!locked[sel.r][sel.c]) setCell(sel.r, sel.c, ch);
      step(1);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [solved, sel, locked, filled, started, current],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const move = (dr: number, dc: number) => {
        e.preventDefault();
        let { r, c } = sel;
        do {
          r += dr;
          c += dc;
        } while (r >= 0 && r < N && c >= 0 && c < N && black(r, c));
        if (r >= 0 && r < N && c >= 0 && c < N) setSel({ r, c });
      };
      if (e.key === "Backspace") type("back");
      else if (e.key === "ArrowRight") (dir === "across" ? move(0, 1) : setDir("across"));
      else if (e.key === "ArrowLeft") (dir === "across" ? move(0, -1) : setDir("across"));
      else if (e.key === "ArrowDown") (dir === "down" ? move(1, 0) : setDir("down"));
      else if (e.key === "ArrowUp") (dir === "down" ? move(-1, 0) : setDir("down"));
      else if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        nextEntry(e.shiftKey ? -1 : 1);
      } else if (e.key === " ") {
        e.preventDefault();
        setDir((d) => (d === "across" ? "down" : "across"));
      } else if (e.key.length === 1) type(e.key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function revealLetter() {
    if (solved || black(sel.r, sel.c) || locked[sel.r][sel.c]) return;
    if (!started) setStarted(true);
    setHints((h) => ({ ...h, letter: h.letter + 1 }));
    setLocked((l) => l.map((row, i) => row.map((x, j) => (i === sel.r && j === sel.c ? true : x))));
    setCell(sel.r, sel.c, solution[sel.r][sel.c]);
  }

  function revealWord() {
    if (solved || !current) return;
    if (!started) setStarted(true);
    const cells = cellsOf(current);
    setHints((h) => ({ ...h, word: h.word + 1 }));
    setLocked((l) => l.map((row, i) => row.map((x, j) => x || cells.some((p) => p.r === i && p.c === j))));
    setFilled((f) => f.map((row, i) => row.map((x, j) => (cells.some((p) => p.r === i && p.c === j) ? solution[i][j] : x))));
  }

  const inCurrent = (r: number, c: number) => current && cellsOf(current).some((p) => p.r === r && p.c === c);
  const total = elapsed + hints.letter * LETTER_HINT_S + hints.word * WORD_HINT_S;

  return (
    <div className={s.wrap}>
      <div className="row spread">
        <span className="muted small">{!started ? t.start : hidden ? t.paused : solved ? t.solved : ""}</span>
        <span className={`mono ${s.timer}`}>{fmtSeconds(total)}</span>
      </div>

      {current && (
        <div className={s.clueBar} onClick={() => setDir((d) => (d === "across" ? "down" : "across"))}>
          <strong>
            {current.num}
            {current.dir === "across" ? "A" : "D"}
          </strong>{" "}
          {current.clue}
        </div>
      )}

      <div className={s.board}>
        <div className={s.grid}>
          {puzzle.shape.map((row, r) =>
            row.split("").map((ch, c) => {
              if (ch === "#") return <div key={`${r}${c}`} className={s.black} />;
              const selected = sel.r === r && sel.c === c;
              return (
                <button
                  key={`${r}${c}`}
                  className={`${s.cell} ${inCurrent(r, c) ? s.inWord : ""} ${selected ? s.selected : ""} ${locked[r][c] ? s.locked : ""} ${solved ? s.done : ""}`}
                  onClick={() => (selected ? setDir((d) => (d === "across" ? "down" : "across")) : setSel({ r, c }))}
                  aria-label={`row ${r + 1} column ${c + 1}`}
                >
                  {numbers.has(`${r},${c}`) && <span className={s.num}>{numbers.get(`${r},${c}`)}</span>}
                  {filled[r][c].toUpperCase()}
                </button>
              );
            }),
          )}
        </div>

        <div className={s.lists}>
          {(["across", "down"] as const).map((d) => (
            <div key={d}>
              <h3 className={s.listTitle}>{d === "across" ? t.across : t.down}</h3>
              <ol className={s.list}>
                {puzzle.entries
                  .filter((e) => e.dir === d)
                  .map((e) => (
                    <li
                      key={e.key}
                      className={current?.key === e.key ? s.activeClue : ""}
                      onClick={() => {
                        setDir(e.dir);
                        setSel({ r: e.row, c: e.col });
                      }}
                    >
                      <strong>{e.num}</strong> {e.clue}
                    </li>
                  ))}
              </ol>
            </div>
          ))}
        </div>
      </div>

      {!solved && (
        <>
          <div className="row gap wrap">
            <button className="btn ghost small" onClick={revealLetter}>
              {t.letter}
            </button>
            <button className="btn ghost small" onClick={revealWord}>
              {t.word}
            </button>
          </div>
          <div className={s.keyboard}>
            {LAYOUTS[lang].map((line, i) => (
              <div key={line} className={s.keyRow}>
                {line.split("").map((ch) => (
                  <button key={ch} className={s.key} onClick={() => type(ch)}>
                    {ch.toUpperCase()}
                  </button>
                ))}
                {i === LAYOUTS[lang].length - 1 && (
                  <button className={`${s.key} ${s.wide}`} onClick={() => type("back")} aria-label="Backspace">
                    ⌫
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
