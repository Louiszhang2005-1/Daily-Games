import type { Lang } from "@/shared/game";
import type { CrosswordFull } from "../logic";
import { SEED_EN } from "./en";

export const SEEDS: Partial<Record<Lang, Record<"easy" | "medium", CrosswordFull[]>>> = { en: SEED_EN };
