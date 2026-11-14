import type { Lang } from "@/shared/game";
import type { CrosswordFull } from "../logic";
import { SEED_EN } from "./en";
import { SEED_FR } from "./fr";

export const SEEDS: Partial<Record<Lang, Record<"easy" | "medium", CrosswordFull[]>>> = { en: SEED_EN, fr: SEED_FR };
