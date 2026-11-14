// Shared by Rare Answers and Common Answers: 7 prompts a day, 25 seconds each.

export const PROMPT_SECONDS = 25;
export const PROMPTS_PER_DAY = 7;
/** Below this many answers a prompt uses its list tiers/shares; above, live counts. */
export const LIVE_THRESHOLD = 30;

export type RareTier = "common" | "known" | "rare" | "deep" | "legend";

export interface PromptAnswer {
  id: string;
  aliases: string[];
  tier?: RareTier; // Rare Answers starting tier
  share?: number; // Common Answers starting share (percent)
}

export interface Prompt {
  key: string; // stable theme key (for rejection review and approvals)
  text: string;
  answers: PromptAnswer[];
}

export interface PromptPuzzle {
  prompts: Prompt[];
}

export interface PromptPayload {
  answers: (string | null)[];
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const TIER_CODES: Record<string, RareTier> = { c: "common", k: "known", r: "rare", d: "deep" };

/**
 * Seed authoring helper for Rare Answers. One line per tier:
 *   c: spaghetti, penne, lasagna/lasagne
 *   k: ...   r: ...   d: ...
 * "/" separates aliases of one answer.
 */
export function rareAnswers(block: string): PromptAnswer[] {
  const out: PromptAnswer[] = [];
  for (const line of block.trim().split("\n")) {
    const m = line.trim().match(/^([ckrd]):\s*(.*)$/);
    if (!m) continue;
    for (const item of m[2].split(",")) {
      const aliases = item.split("/").map((a) => a.trim()).filter(Boolean);
      if (aliases.length) out.push({ id: slug(aliases[0]), aliases, tier: TIER_CODES[m[1]] });
    }
  }
  return out;
}

/**
 * Seed authoring helper for Common Answers: "sunscreen/sunblock = 34, towel = 22, ..."
 * Shares are rough starting percentages; they need not add to 100 exactly.
 */
export function commonAnswers(block: string): PromptAnswer[] {
  return block
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((item) => {
      const [names, share] = item.split("=").map((x) => x.trim());
      const aliases = names.split("/").map((a) => a.trim()).filter(Boolean);
      return { id: slug(aliases[0]), aliases, share: Number(share) || 0 };
    });
}
