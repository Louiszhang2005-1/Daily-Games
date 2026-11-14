import "server-only";
import type { GameServer } from "@/shared/game";

// Placeholder until this game's branch lands.
export const server: GameServer = {
  async load() {
    return null;
  },
  toPublic() {
    return null;
  },
  score() {
    return { error: "not built yet" };
  },
};
