import type { GameId, Lang, Variant } from "@/shared/game";

export interface Generated {
  content: unknown;
  answerKey: string; // "|"-separated keys used to stop repeats
}

export interface Generator {
  game: GameId;
  needsGemini: boolean;
  variants(lang: Lang): Variant[];
  /** Throws when generation fails. `attempt` varies the random picks between retries. */
  generate(day: string, v: Variant, attempt: number): Promise<Generated>;
  /** Automatic checks. Returns the problems found; an empty list means it can go live. */
  check(g: Generated, day: string, v: Variant): Promise<string[]>;
}
