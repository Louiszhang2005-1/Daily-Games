import "server-only";
import { dailyBoard, type BoardEntry } from "./boards";
import type { Lang } from "./game";
import { randomId } from "./rng";
import { getStore } from "./store";

export const MAX_CLANS_PER_PLAYER = 5;
export const MAX_MEMBERS = 50;
export const CLAN_VS_CLAN_MIN = 3;

export interface Clan {
  id: string;
  name: string;
  invite_code: string;
  owner_id: string;
  created_at: string;
}

interface Member {
  clan_id: string;
  user_id: string;
  joined_at: string;
}

function inviteCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export async function myClans(userId: string): Promise<Clan[]> {
  const store = getStore();
  const ms = await store.select<Member>("clan_members", { user_id: userId });
  if (ms.length === 0) return [];
  return store.select<Clan>("clans", { id: { in: ms.map((m) => m.clan_id) } });
}

export async function getClan(id: string): Promise<Clan | null> {
  return (await getStore().select<Clan>("clans", { id }))[0] ?? null;
}

export async function clanByCode(code: string): Promise<Clan | null> {
  return (await getStore().select<Clan>("clans", { invite_code: code.toUpperCase() }))[0] ?? null;
}

export async function memberIds(clanId: string): Promise<string[]> {
  return (await getStore().select<Member>("clan_members", { clan_id: clanId })).map((m) => m.user_id);
}

export type ClanError = "too_many_clans" | "clan_full" | "not_found" | "bad_name";

export async function createClan(userId: string, name: string): Promise<Clan | { error: ClanError }> {
  const clean = name.trim().slice(0, 40);
  if (clean.length < 2) return { error: "bad_name" };
  if ((await myClans(userId)).length >= MAX_CLANS_PER_PLAYER) return { error: "too_many_clans" };
  const clan: Clan = { id: randomId(), name: clean, invite_code: inviteCode(), owner_id: userId, created_at: new Date().toISOString() };
  const store = getStore();
  await store.insert("clans", clan);
  await store.insert("clan_members", { clan_id: clan.id, user_id: userId, joined_at: new Date().toISOString() });
  return clan;
}

export async function joinClan(userId: string, code: string): Promise<Clan | { error: ClanError }> {
  const clan = await clanByCode(code);
  if (!clan) return { error: "not_found" };
  const members = await memberIds(clan.id);
  if (members.includes(userId)) return clan;
  if (members.length >= MAX_MEMBERS) return { error: "clan_full" };
  if ((await myClans(userId)).length >= MAX_CLANS_PER_PLAYER) return { error: "too_many_clans" };
  await getStore().insert("clan_members", { clan_id: clan.id, user_id: userId, joined_at: new Date().toISOString() });
  return clan;
}

export async function leaveClan(userId: string, clanId: string): Promise<void> {
  const store = getStore();
  await store.remove("clan_members", { clan_id: clanId, user_id: userId });
  const left = await memberIds(clanId);
  if (left.length === 0) await store.remove("clans", { id: clanId });
  else {
    const clan = await getClan(clanId);
    if (clan?.owner_id === userId) await store.update("clans", { id: clanId }, { owner_id: left[0] });
  }
}

export interface ClanTable {
  clan: Clan;
  rows: (BoardEntry & { playedToday: boolean })[];
  average: number | null;
}

/** Clan page: one row per member, one column per game. Catch-up games don't count. */
export async function clanTable(clan: Clan, day: string, lang: Lang): Promise<ClanTable> {
  const ids = await memberIds(clan.id);
  const board = await dailyBoard(day, lang, { userIds: new Set(ids), excludeCatchUp: true });
  const playedIds = new Set(board.map((b) => b.userId));
  const store = getStore();
  const idle = ids.filter((id) => !playedIds.has(id));
  const idleUsers = idle.length ? await store.select<{ id: string; display_name: string }>("users", { id: { in: idle } }) : [];
  const rows = [
    ...board.map((b) => ({ ...b, playedToday: true })),
    ...idleUsers.map((u) => ({ userId: u.id, name: u.display_name, total: null, games: {}, played: 0, playedToday: false })),
  ];
  const totals = board.map((b) => b.total).filter((x): x is number => x !== null);
  const average = totals.length ? Math.round((totals.reduce((a, b) => a + b, 0) / totals.length) * 10) / 10 : null;
  return { clan, rows, average };
}

/** Clan vs clan: clan average, only clans with at least 3 members who played. */
export async function clanVsClan(day: string, lang: Lang): Promise<{ clan: Clan; average: number; members: number }[]> {
  const store = getStore();
  const clans = await store.select<Clan>("clans");
  const all = await store.select<Member>("clan_members");
  const board = await dailyBoard(day, lang, { excludeCatchUp: true });
  const totalBy = new Map(board.map((b) => [b.userId, b.total]));
  const out: { clan: Clan; average: number; members: number }[] = [];
  for (const clan of clans) {
    const totals = all
      .filter((m) => m.clan_id === clan.id)
      .map((m) => totalBy.get(m.user_id))
      .filter((x): x is number => typeof x === "number");
    if (totals.length < CLAN_VS_CLAN_MIN) continue;
    out.push({ clan, average: Math.round((totals.reduce((a, b) => a + b, 0) / totals.length) * 10) / 10, members: totals.length });
  }
  return out.sort((a, b) => b.average - a.average);
}

/** A player's rank inside each of their clans today. */
export async function myClanRanks(userId: string, day: string, lang: Lang): Promise<{ clan: Clan; rank: number; of: number }[]> {
  const clans = await myClans(userId);
  const out = [];
  for (const clan of clans) {
    const t = await clanTable(clan, day, lang);
    const played = t.rows.filter((r) => r.playedToday);
    const i = played.findIndex((r) => r.userId === userId);
    if (i >= 0) out.push({ clan, rank: i + 1, of: played.length });
  }
  return out;
}
