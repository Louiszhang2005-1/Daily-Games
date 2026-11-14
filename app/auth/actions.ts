"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authAvailable, authMode, claimGuestResults, DEV_COOKIE, ensureUser, getSessionUser, supabaseServer } from "@/shared/auth";
import { GUEST_COOKIE } from "@/shared/identity";
import { randomId } from "@/shared/rng";
import { getStore } from "@/shared/store";
import { importStreak } from "@/shared/streaks";

/** Local development only: sign in by display name, no password. */
export async function devSignIn(form: FormData) {
  if (authMode() !== "dev" || !authAvailable()) throw new Error("dev sign-in disabled");
  const name = String(form.get("name") ?? "").trim().slice(0, 32);
  const store = getStore();
  const existing = name ? await store.select<{ id: string }>("users", { display_name: name }) : [];
  const id = existing[0]?.id ?? randomId();
  const lang = (await cookies()).get("lang")?.value === "fr" ? "fr" : "en";
  await ensureUser(id, name || null, lang);
  const jar = await cookies();
  jar.set(DEV_COOKIE, id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 400 });
  await claimGuestResults(jar.get(GUEST_COOKIE)?.value, id);
  redirect(String(form.get("next") ?? "/"));
}

export async function signOut() {
  if (authMode() === "supabase") await (await supabaseServer()).auth.signOut();
  (await cookies()).delete(DEV_COOKIE);
  redirect("/");
}

export async function updateDisplayName(form: FormData) {
  const user = await getSessionUser();
  const name = String(form.get("name") ?? "").trim().slice(0, 32);
  if (!user || name.length < 2) return;
  await getStore().update("users", { id: user.id }, { display_name: name });
  redirect("/account");
}

export async function syncLocalStreak(local: { current: number; best: number; lastDay: string | null }) {
  const user = await getSessionUser();
  if (user) await importStreak(user.id, local);
}

/** After signing in with an emailed code: create the profile and keep today's guest results. */
export async function finishEmailCodeSignIn() {
  if (authMode() !== "supabase") return;
  const { data } = await (await supabaseServer()).auth.getUser();
  if (!data.user) return;
  const lang = (await cookies()).get("lang")?.value === "fr" ? "fr" : "en";
  await ensureUser(data.user.id, null, lang);
  await claimGuestResults((await cookies()).get(GUEST_COOKIE)?.value, data.user.id);
}
