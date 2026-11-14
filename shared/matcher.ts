// Shared answer matcher (no LLM at play time).
// Used by Country Guess, Rare Answers and Common Answers.
//  1. normalize  2. alias lookup  3. typo tolerance  4. short answers exact only

const LEADING_ARTICLES = ["the ", "a ", "an ", "le ", "la ", "les ", "l ", "un ", "une ", "des "];

export function normalize(input: string): string {
  let s = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/[’'`]/g, " ") // l'Italie -> l italie
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  for (const art of LEADING_ARTICLES) {
    if (s.startsWith(art) && s.length > art.length + 1) {
      s = s.slice(art.length);
      break;
    }
  }
  return s;
}

/** Nonsense input (empty, no letters) never counts as a guess. */
export function isNonsense(input: string): boolean {
  const n = normalize(input);
  return n.length === 0 || !/[a-z]/.test(n);
}

export function levenshtein(a: string, b: string, max = Infinity): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

export function typoAllowance(len: number): number {
  if (len <= 3) return 0;
  if (len <= 7) return 1;
  return 2;
}

export interface MatchEntry {
  id: string;
  aliases: string[]; // include the canonical spelling
}

export interface MatchIndex {
  exact: Map<string, string>;
  all: { norm: string; id: string; display: string }[];
}

export function buildIndex(entries: MatchEntry[]): MatchIndex {
  const exact = new Map<string, string>();
  const all: MatchIndex["all"] = [];
  for (const e of entries) {
    for (const alias of e.aliases) {
      const norm = normalize(alias);
      if (!norm) continue;
      if (!exact.has(norm)) exact.set(norm, e.id);
      all.push({ norm, id: e.id, display: alias });
    }
  }
  return { exact, all };
}

export interface MatchResult {
  id: string;
  via: "exact" | "typo";
  distance: number;
}

export function matchAnswer(index: MatchIndex, input: string): MatchResult | null {
  const norm = normalize(input);
  if (!norm) return null;
  const hit = index.exact.get(norm);
  if (hit) return { id: hit, via: "exact", distance: 0 };

  const allow = typoAllowance(norm.length);
  if (allow === 0) return null;

  let best: MatchResult | null = null;
  let ambiguous = false;
  for (const { norm: cand, id } of index.all) {
    if (cand.length <= 3) continue; // short aliases match exactly only
    const d = levenshtein(norm, cand, allow);
    if (d > allow) continue;
    if (!best || d < best.distance) {
      best = { id, via: "typo", distance: d };
      ambiguous = false;
    } else if (d === best.distance && id !== best.id) {
      ambiguous = true;
    }
  }
  return ambiguous ? null : best;
}

/** Suggestions while typing: prefix matches first, then word-start matches. */
export function suggest(index: MatchIndex, input: string, limit = 6): { id: string; display: string }[] {
  const norm = normalize(input);
  if (norm.length < 2) return [];
  const seen = new Set<string>();
  const out: { id: string; display: string }[] = [];
  const push = (id: string, display: string) => {
    if (seen.has(id) || out.length >= limit) return;
    seen.add(id);
    out.push({ id, display });
  };
  for (const e of index.all) if (e.norm.startsWith(norm)) push(e.id, e.display);
  for (const e of index.all) if (e.norm.includes(` ${norm}`)) push(e.id, e.display);
  return out;
}
