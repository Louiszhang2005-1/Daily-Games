import { meta as word } from "./word/meta";
import { meta as country } from "./country/meta";
import { meta as crossword } from "./crossword/meta";
import { meta as rare } from "./rare/meta";
import { meta as common } from "./common/meta";
import type { GameId, GameMeta } from "@/shared/game";

export const METAS: Record<GameId, GameMeta> = { word, country, crossword, rare, common };
export const ORDERED_METAS: GameMeta[] = [word, country, crossword, rare, common];
