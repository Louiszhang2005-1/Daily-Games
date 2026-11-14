import "server-only";
import type { Lang } from "@/shared/game";
import { ANSWERS_EN } from "./data/answers-en";
import { ANSWERS_FR } from "./data/answers-fr";
import allowedEn from "./data/allowed-en.json";
import allowedFr from "./data/allowed-fr.json";

interface WordList {
  answers: string[];
  allowed: Set<string>;
}

// French uses its own dictionary and answer list (not translations).
const lists: Partial<Record<Lang, WordList>> = {
  en: { answers: ANSWERS_EN, allowed: new Set([...(allowedEn as string[]), ...ANSWERS_EN]) },
  fr: { answers: ANSWERS_FR, allowed: new Set([...(allowedFr as string[]), ...ANSWERS_FR]) },
};

export function wordList(lang: Lang): WordList | null {
  return lists[lang] ?? null;
}
