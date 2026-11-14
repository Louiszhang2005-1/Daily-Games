"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { variantKey, type GameClientProps, type Lang } from "@/shared/game";
import { buildIndex, isNonsense, matchAnswer } from "@/shared/matcher";
import { AnswerInput } from "@/shared/ui/AnswerInput";
import { checkCountryGuess, type GuessFeedback } from "./actions";
import { CATEGORIES, liveScore, replay, type Action, type Category } from "./logic";
import type { CountryPublic } from "./server";
import s from "./country.module.css";

const S = {
  en: {
    cats: { history: "History", geography: "Geography", climate: "Climate", landmarks: "Landmarks" },
    free: "free",
    reveal: "Reveal",
    cost: "−10",
    left: "left",
    none: "none left",
    guess: "Guess",
    placeholder: "Type a country…",
    unknown: "Not a country we know. That didn't count.",
    repeat: "Already guessed.",
    score: "If you guess now",
    rules: "Each turn: guess, or reveal one more clue (−10). Wrong guess: −15.",
    lastGuess: "All clues are out. One last guess!",
    away: "away",
    solved: "Correct!",
    failed: "Out of turns.",
  },
  fr: {
    cats: { history: "Histoire", geography: "Géographie", climate: "Climat", landmarks: "Sites" },
    free: "gratuit",
    reveal: "Révéler",
    cost: "−10",
    left: "restant",
    none: "épuisé",
    guess: "Deviner",
    placeholder: "Tape un pays…",
    unknown: "Pays inconnu. Ça ne compte pas.",
    repeat: "Déjà proposé.",
    score: "Si tu devines maintenant",
    rules: "À chaque tour : devine, ou révèle un indice de plus (−10). Mauvaise réponse : −15.",
    lastGuess: "Tous les indices sont sortis. Dernière chance !",
    away: "",
    solved: "Bravo !",
    failed: "Plus de tours.",
  },
} satisfies Record<Lang, unknown>;

const ARROWS = ["⬆️", "↗️", "➡️", "↘️", "⬇️", "↙️", "⬅️", "↖️"];
const arrow = (deg: number) => ARROWS[Math.round((deg % 360) / 45) % 8];

interface Revealed {
  cat: Category;
  text: string;
  isNew?: boolean;
}

interface GuessRow {
  id: string;
  name: string;
  fb: GuessFeedback;
}

export default function CountryGame({ puzzle, day, variant, lang, puzzleId, onFinish }: GameClientProps<CountryPublic>) {
  const t = S[lang];
  const storeKey = `dg:country:${puzzleId}`;
  const [actions, setActions] = useState<Action[]>([]);
  const [guesses, setGuesses] = useState<GuessRow[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const finished = useRef(false);

  const index = useMemo(
    () => buildIndex(puzzle.countries.map((c) => ({ id: c.id, aliases: [c.name, ...c.aliases] }))),
    [puzzle.countries],
  );
  const nameOf = useMemo(() => new Map(puzzle.countries.map((c) => [c.id, c.name])), [puzzle.countries]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storeKey) ?? "null") as { actions: Action[]; guesses: GuessRow[] } | null;
      if (saved) {
        setActions(saved.actions);
        setGuesses(saved.guesses);
      }
    } catch {
      /* ignore */
    }
  }, [storeKey]);

  const state = replay({ answer: "__hidden__", free: puzzle.free }, actions.map((a) => (a.type === "guess" && guesses.find((g) => g.id === a.id)?.fb.correct ? { type: "guess", id: "__hidden__" } : a)));
  const st = "error" in state ? null : state;
  const solved = guesses.some((g) => g.fb.correct);
  const over = solved || Boolean(st?.over);
  const allOut = st ? CATEGORIES.every((c) => st.revealed[c] >= puzzle.slots[c]) : false;

  const revealedClues: Revealed[] = useMemo(() => {
    const out: Revealed[] = [{ cat: puzzle.free, text: puzzle.clues[puzzle.free][0] }];
    const count: Record<Category, number> = { history: 0, geography: 0, climate: 0, landmarks: 0, [puzzle.free]: 1 } as Record<Category, number>;
    actions.forEach((a, i) => {
      if (a.type !== "reveal") return;
      const text = puzzle.clues[a.cat][count[a.cat]];
      count[a.cat]++;
      if (text) out.push({ cat: a.cat, text, isNew: i === actions.length - 1 });
    });
    return out;
  }, [actions, puzzle]);

  useEffect(() => {
    if (over && !finished.current && actions.length > 0) {
      finished.current = true;
      void onFinish({ actions });
    }
  }, [over, actions, onFinish]);

  function persist(a: Action[], g: GuessRow[]) {
    try {
      localStorage.setItem(storeKey, JSON.stringify({ actions: a, guesses: g }));
    } catch {
      /* ignore */
    }
  }

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  function reveal(cat: Category) {
    if (over || !st || st.revealed[cat] >= puzzle.slots[cat]) return;
    const next: Action[] = [...actions, { type: "reveal", cat }];
    setActions(next);
    persist(next, guesses);
  }

  async function guess(text: string) {
    if (over || busy) return;
    if (isNonsense(text)) return flash(t.unknown);
    const m = matchAnswer(index, text);
    if (!m) return flash(t.unknown);
    if (guesses.some((g) => g.id === m.id)) return flash(t.repeat);
    setBusy(true);
    const fb = await checkCountryGuess(day, variantKey(variant), m.id);
    setBusy(false);
    if ("error" in fb) return flash(t.unknown);
    const g = [...guesses, { id: m.id, name: nameOf.get(m.id) ?? m.id, fb }];
    const a: Action[] = [...actions, { type: "guess", id: m.id }];
    setGuesses(g);
    setActions(a);
    persist(a, g);
  }

  const potential = st ? liveScore(st.extraClues, st.wrong) : 0;

  return (
    <div className={s.wrap}>
      <p className="muted small" style={{ margin: 0 }}>
        {t.rules}
      </p>

      <ol className={s.clues}>
        {revealedClues.map((c, i) => (
          <li key={i} className={`${s.clue} ${c.isNew ? s.new : ""}`} data-cat={c.cat}>
            <span className={s.cat}>
              {t.cats[c.cat]}
              {i === 0 && <span className="tag">{t.free}</span>}
            </span>
            {c.text}
          </li>
        ))}
      </ol>

      {!over && (
        <>
          <div className={s.revealRow}>
            {CATEGORIES.map((cat) => {
              const left = puzzle.slots[cat] - (st?.revealed[cat] ?? 0);
              return (
                <button key={cat} className={`btn ghost ${s.revealBtn}`} disabled={left <= 0} onClick={() => reveal(cat)} data-cat={cat}>
                  <strong>{t.cats[cat]}</strong>
                  <span className="small muted">{left > 0 ? `${t.cost} · ${left} ${t.left}` : t.none}</span>
                </button>
              );
            })}
          </div>
          {allOut && <p className={s.warn}>{t.lastGuess}</p>}
          <div className="row spread small">
            <span className="muted">{t.score}</span>
            <strong className="mono">{potential}</strong>
          </div>
          <AnswerInput index={index} onSubmit={guess} placeholder={t.placeholder} submitLabel={t.guess} disabled={busy} />
        </>
      )}

      {toast && <p className="error small">{toast}</p>}

      {guesses.length > 0 && (
        <ul className={s.guesses}>
          {guesses.map((g) => (
            <li key={g.id} className={g.fb.correct ? s.hit : ""}>
              <span>{g.name}</span>
              {g.fb.correct ? (
                <span>✓</span>
              ) : (
                <span className="mono">
                  {g.fb.distanceKm.toLocaleString(lang)} km {t.away} {arrow(g.fb.bearing)} {g.fb.proximity}%
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {over && <p className={s.end}>{solved ? t.solved : t.failed}</p>}
    </div>
  );
}
