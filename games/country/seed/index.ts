import type { Lang } from "@/shared/game";
import type { CountryPuzzle } from "../logic";
import { SEED_EN } from "./en";

export const SEEDS: Partial<Record<Lang, CountryPuzzle[]>> = { en: SEED_EN };
