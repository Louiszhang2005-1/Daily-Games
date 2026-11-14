"use server";

import { redirect } from "next/navigation";
import { getSessionUser } from "@/shared/auth";
import { createClan, joinClan, leaveClan } from "@/shared/clans";

export async function createClanAction(form: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/auth?next=/clans");
  const res = await createClan(user.id, String(form.get("name") ?? ""));
  if ("error" in res) redirect(`/clans?error=${res.error}`);
  redirect(`/clans/${res.id}`);
}

export async function joinClanAction(form: FormData) {
  const code = String(form.get("code") ?? "").trim();
  const user = await getSessionUser();
  if (!user) redirect(`/auth?next=${encodeURIComponent(`/clans/join/${code}`)}`);
  const res = await joinClan(user.id, code);
  if ("error" in res) redirect(`/clans?error=${res.error}`);
  redirect(`/clans/${res.id}`);
}

export async function leaveClanAction(form: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/auth");
  await leaveClan(user.id, String(form.get("clanId")));
  redirect("/clans");
}
