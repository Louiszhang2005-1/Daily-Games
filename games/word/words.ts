import "server-only";
import type { Lang } from "@/shared/game";
import { ANSWERS_EN } from "./data/answers-en";
import allowedEn from "./data/allowed-en.json";

interface WordList {
  answers: string[];
  allowed: Set<string>;
}

const lists: Partial<Record<Lang, WordList>> = {
  en: { answers: ANSWERS_EN, allowed: new Set([...(allowedEn as string[]), ...ANSWERS_EN]) },
};

export function wordList(lang: Lang): WordList | null {
  return lists[lang] ?? null;
}
