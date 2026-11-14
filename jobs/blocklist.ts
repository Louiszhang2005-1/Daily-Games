import { normalize } from "@/shared/matcher";

// Offensive-word blocklist for generated content (English and French).
// Extend with BLOCKLIST_EXTRA="word1,word2" without a code change.
const BASE = [
  "fuck", "shit", "cunt", "bitch", "whore", "slut", "nazi", "hitler", "rape", "porn", "nigger", "nigga", "faggot", "retard",
  "merde", "putain", "salope", "connard", "connasse", "encule", "pute", "batard", "nique", "pd", "negre",
];

let cache: Set<string> | null = null;

function words(): Set<string> {
  if (cache) return cache;
  const extra = (process.env.BLOCKLIST_EXTRA ?? "").split(",").map((w) => w.trim()).filter(Boolean);
  cache = new Set([...BASE, ...extra].map(normalize));
  return cache;
}

/** True when any word of the text is on the blocklist. */
export function hasBlockedWord(text: string): boolean {
  const list = words();
  return normalize(text)
    .split(" ")
    .some((w) => list.has(w));
}

export function anyBlocked(texts: string[]): string | null {
  return texts.find(hasBlockedWord) ?? null;
}
