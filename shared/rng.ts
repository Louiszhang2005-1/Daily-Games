// Small deterministic helpers so every player sees the same puzzle for a day.

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: readonly T[], seed: string | number): T[] {
  const rand = mulberry32(typeof seed === "number" ? seed : hashString(seed));
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Pick the item for a given day index from a list so that nothing repeats
 * until the whole list has been used (a fresh shuffle per cycle).
 */
export function rotatingPick<T>(items: readonly T[], index: number, salt: string): T {
  const n = items.length;
  const cycle = Math.floor(index / n);
  const order = seededShuffle(items, `${salt}:${cycle}`);
  return order[((index % n) + n) % n];
}

export function randomId(): string {
  return globalThis.crypto.randomUUID();
}
