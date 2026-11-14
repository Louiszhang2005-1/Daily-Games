import { redirect } from "next/navigation";
import { getSessionUser } from "@/shared/auth";
import { getLang } from "@/shared/lang-server";
import { getStreak } from "@/shared/streaks";
import { ORDERED_METAS } from "@/games/metas";
import { signOut, updateDisplayName } from "../auth/actions";

export const dynamic = "force-dynamic";

const S = {
  en: { title: "Your account", name: "Display name", save: "Save", out: "Sign out", streaks: "Streaks", hub: "Any game", cur: "Current", best: "Best" },
  fr: { title: "Ton compte", name: "Pseudo", save: "Enregistrer", out: "Déconnexion", streaks: "Séries", hub: "N'importe quel jeu", cur: "En cours", best: "Record" },
};

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth?next=/account");
  const lang = await getLang();
  const t = S[lang];
  const streaks = await Promise.all([
    { id: "hub", label: t.hub },
    ...ORDERED_METAS.map((m) => ({ id: m.id, label: m.name[lang] })),
  ].map(async (g) => ({ ...g, s: await getStreak(user.id, g.id) })));

  return (
    <>
      <h1>{t.title}</h1>
      <section className="card col gap" style={{ marginBottom: 16 }}>
        <form action={updateDisplayName} className="row gap wrap">
          <label className="col gap small" style={{ flex: 1, minWidth: 200 }}>
            {t.name}
            <input className="input" name="name" defaultValue={user.displayName} minLength={2} maxLength={32} />
          </label>
          <button className="btn primary" type="submit" style={{ alignSelf: "flex-end" }}>
            {t.save}
          </button>
        </form>
      </section>
      <section className="card table-wrap" style={{ marginBottom: 16 }}>
        <h3>{t.streaks}</h3>
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th className="num">{t.cur}</th>
              <th className="num">{t.best}</th>
            </tr>
          </thead>
          <tbody>
            {streaks.map((g) => (
              <tr key={g.id}>
                <td>{g.label}</td>
                <td className="num">{g.s.current}</td>
                <td className="num">{g.s.best}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <form action={signOut}>
        <button className="btn ghost" type="submit">
          {t.out}
        </button>
      </form>
    </>
  );
}
