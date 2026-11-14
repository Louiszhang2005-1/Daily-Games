import { redirect } from "next/navigation";
import { getSessionUser } from "@/shared/auth";
import { createChallenge } from "@/shared/challenges";
import { getLang } from "@/shared/lang-server";

export const dynamic = "force-dynamic";

const S = {
  en: { title: "Challenge a friend", body: "Make a link for today's puzzles. Your friend plays the games they haven't done yet, then you both see a head-to-head card.", go: "Make my link" },
  fr: { title: "Défier un ami", body: "Crée un lien pour les jeux du jour. Ton ami joue ceux qu'il n'a pas encore faits, puis vous voyez tous les deux le face-à-face.", go: "Créer mon lien" },
};

async function make() {
  "use server";
  const user = await getSessionUser();
  if (!user) redirect("/auth?next=/challenge");
  const c = await createChallenge(user.id, await getLang());
  redirect(`/c/${c.token}`);
}

export default async function ChallengePage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth?next=/challenge");
  const t = S[await getLang()];
  return (
    <section className="card col gap" style={{ maxWidth: 520, margin: "24px auto" }}>
      <h1>⚔️ {t.title}</h1>
      <p className="muted">{t.body}</p>
      <form action={make}>
        <button className="btn primary" type="submit">
          {t.go}
        </button>
      </form>
    </section>
  );
}
