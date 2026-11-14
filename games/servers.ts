import "server-only";
import { server as word } from "./word/server";
import { server as country } from "./country/server";
import { server as crossword } from "./crossword/server";
import { server as rare } from "./rare/server";
import { server as common } from "./common/server";
import type { GameId, GameServer } from "@/shared/game";

export const SERVERS: Record<GameId, GameServer> = {
  word: word as GameServer,
  country: country as GameServer,
  crossword: crossword as GameServer,
  rare: rare as GameServer,
  common: common as GameServer,
};
