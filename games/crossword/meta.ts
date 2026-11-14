import type { GameMeta } from "@/shared/game";

export const meta: GameMeta = {
  id: "crossword",
  name: { en: "Mini Crossword", fr: "Mini mots croisés" },
  tagline: { en: "A 5×5 grid against the clock.", fr: "Une grille 5×5 contre la montre." },
  icon: "▦",
  color: "#f2b33d",
  levels: ["easy", "medium"],
  lowerIsBetter: true,
  maxPercentile: { easy: 80, medium: 100 },
  minutes: 3,
};
