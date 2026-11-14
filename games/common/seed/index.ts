import type { Lang } from "@/shared/game";
import type { Prompt } from "@/shared/prompts/types";
import { SEED_EN } from "./en";

export const SEEDS: Partial<Record<Lang, Prompt[][]>> = { en: SEED_EN };
