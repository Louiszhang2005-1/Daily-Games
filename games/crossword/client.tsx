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

type Dir = "across" | "down";
interface Pos {
  r: number;
  c: number;
}

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
  const black = useCallback((r: number, c: number) => puzzle.shape[r]?.[c] !== ".", [puzzle.shape]);

  const firstCell = (): Pos => {
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (puzzle.shape[r][c] === ".") return { r, c };
    return { r: 0, c: 0 };
  };

  // Grid state lives in refs (updated synchronously, so fast typing never loses its place)
  // and a version counter re-renders after each change.
  const filledRef = useRef<string[][]>(empty(""));
  const lockedRef = useRef<boolean[][]>(empty(false));
  const selRef = useRef<Pos>(firstCell());
  const dirRef = useRef<Dir>("across");
  const [, setVersion] = useState(0);
  const rerender = () => setVersion((v) => v + 1);

  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hints, setHints] = useState({ letter: 0, word: 0 });
  const [solved, setSolved] = useState(false);
  const finished = useRef(false);
  const lastTick = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  elapsedRef.current = elapsed;
  const hintsRef = useRef(hints);
  hintsRef.current = hints;

  // Restore after a refresh.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storeKey) ?? "null") as Saved | null;
      if (saved) {
        filledRef.current = saved.filled;
        lockedRef.current = saved.locked;
        setElapsed(saved.elapsed);
        setStarted(saved.started);
        setHints({ letter: saved.letterHints, word: saved.wordHints });
        rerender();
      }
    } catch {
      /* ignore */
    }
  }, [storeKey]);

  const persist = useCallback(() => {
    try {
      const data: Saved = {
        filled: filledRef.current,
        locked: lockedRef.current,
        elapsed: elapsedRef.current,
        started: true,
        letterHints: hintsRef.current.letter,
        wordHints: hintsRef.current.word,
      };
      localStorage.setItem(storeKey, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }, [storeKey]);

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
    const save = setInterval(persist, 2000);
    return () => {
      clearInterval(id);
      clearInterval(save);
    };
  }, [started, solved, hidden, persist]);

  const checkSolved = useCallback(() => {
    const f = filledRef.current;
    const ok = solution.every((row, r) => row.split("").every((ch, c) => ch === "#" || f[r][c] === ch));
    if (ok && !finished.current) {
      finished.current = true;
      setSolved(true);
      persist();
      void onFinish({
        filled: f.map((row, r) => row.map((ch, c) => (black(r, c) ? "#" : ch)).join("")),
        seconds: Math.max(3, elapsedRef.current),
        letterHints: hintsRef.current.letter,
        wordHints: hintsRef.current.word,
      });
    }
  }, [solution, onFinish, black, persist]);

  const entryAt = useCallback(
    (r: number, c: number, d: Dir): Entry | undefined =>
      puzzle.entries.find((e) => e.dir === d && (d === "across" ? e.row === r && c >= e.col && c < e.col + e.len : e.col === c && r >= e.row && r < e.row + e.len)),
    [puzzle.entries],
  );
  const currentEntry = () => {
    const { r, c } = selRef.current;
    return entryAt(r, c, dirRef.current) ?? entryAt(r, c, dirRef.current === "across" ? "down" : "across");
  };
  const cellsOf = (e: Entry): Pos[] => Array.from({ length: e.len }, (_, k) => (e.dir === "across" ? { r: e.row, c: e.col + k } : { r: e.row + k, c: e.col }));

  const numbers = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of puzzle.entries) m.set(`${e.row},${e.col}`, e.num);
    return m;
  }, [puzzle.entries]);

  function select(p: Pos, d?: Dir) {
    selRef.current = p;
    if (d) dirRef.current = d;
    rerender();
  }

  function toggleDir() {
    dirRef.current = dirRef.current === "across" ? "down" : "across";
    rerender();
  }

  function setCell(r: number, c: number, ch: string) {
    filledRef.current = filledRef.current.map((row, i) => (i === r ? row.map((x, j) => (j === c ? ch : x)) : row));
  }

  function nextEntry(delta: 1 | -1) {
    const list = puzzle.entries;
    const cur = currentEntry();
    const i = cur ? list.findIndex((e) => e.key === cur.key) : -1;
    const e = list[(i + delta + list.length) % list.length];
    const f = filledRef.current;
    const firstEmpty = cellsOf(e).find(({ r, c }) => !f[r][c]) ?? { r: e.row, c: e.col };
    select(firstEmpty, e.dir);
  }

  function step(delta: 1 | -1) {
    const cur = currentEntry();
    if (!cur) return;
    dirRef.current = cur.dir;
    const cells = cellsOf(cur);
    const { r, c } = selRef.current;
    const i = cells.findIndex((x) => x.r === r && x.c === c);
    const next = cells[i + delta];
    if (next) select(next);
    else if (delta === 1) nextEntry(1);
    else rerender();
  }

  function type(key: string) {
    if (finished.current) return;
    const { r, c } = selRef.current;
    if (key === "back") {
      if (!lockedRef.current[r][c] && filledRef.current[r][c]) {
        setCell(r, c, "");
        rerender();
      } else step(-1);
      return;
    }
    const ch = key.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    if (!/^[a-z]$/.test(ch)) return;
    if (!started) setStarted(true);
    if (!lockedRef.current[r][c]) setCell(r, c, ch);
    step(1);
    checkSolved();
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const move = (dr: number, dc: number) => {
        e.preventDefault();
        let { r, c } = selRef.current;
        do {
          r += dr;
          c += dc;
        } while (r >= 0 && r < N && c >= 0 && c < N && black(r, c));
        if (r >= 0 && r < N && c >= 0 && c < N) select({ r, c });
      };
      const d = dirRef.current;
      if (e.key === "Backspace") type("back");
      else if (e.key === "ArrowRight") d === "across" ? move(0, 1) : select(selRef.current, "across");
      else if (e.key === "ArrowLeft") d === "across" ? move(0, -1) : select(selRef.current, "across");
      else if (e.key === "ArrowDown") d === "down" ? move(1, 0) : select(selRef.current, "down");
      else if (e.key === "ArrowUp") d === "down" ? move(-1, 0) : select(selRef.current, "down");
      else if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        nextEntry(e.shiftKey ? -1 : 1);
      } else if (e.key === " ") {
        e.preventDefault();
        toggleDir();
      } else if (e.key.length === 1) type(e.key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function lockCells(cells: Pos[]) {
    lockedRef.current = lockedRef.current.map((row, i) => row.map((x, j) => x || cells.some((p) => p.r === i && p.c === j)));
    for (const p of cells) setCell(p.r, p.c, solution[p.r][p.c]);
  }

  function applyHint(kind: "letter" | "word") {
    if (finished.current) return;
    const cells = kind === "letter" ? [selRef.current] : (() => {
      const cur = currentEntry();
      return cur ? cellsOf(cur) : [];
    })();
    if (cells.length === 0 || cells.every((p) => black(p.r, p.c) || lockedRef.current[p.r][p.c])) return;
    if (!started) setStarted(true);
    const h = { ...hintsRef.current, [kind]: hintsRef.current[kind] + 1 };
    hintsRef.current = h;
    setHints(h);
    lockCells(cells);
    rerender();
    checkSolved();
  }

  const sel = selRef.current;
  const filled = filledRef.current;
  const locked = lockedRef.current;
  const current = currentEntry();
  const inCurrent = (r: number, c: number) => current && cellsOf(current).some((p) => p.r === r && p.c === c);
  const total = elapsed + hints.letter * LETTER_HINT_S + hints.word * WORD_HINT_S;

  return (
    <div className={s.wrap}>
      <div className="row spread">
        <span className="muted small">{!started ? t.start : hidden ? t.paused : solved ? t.solved : ""}</span>
        <span className={`mono ${s.timer}`}>{fmtSeconds(total)}</span>
      </div>

      {current && (
        <div className={s.clueBar} onClick={toggleDir}>
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
                  onClick={() => (selected ? toggleDir() : select({ r, c }))}
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
                    <li key={e.key} className={current?.key === e.key ? s.activeClue : ""} onClick={() => select({ r: e.row, c: e.col }, e.dir)}>
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
            <button className="btn ghost small" onClick={() => applyHint("letter")}>
              {t.letter}
            </button>
            <button className="btn ghost small" onClick={() => applyHint("word")}>
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
