import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { METAS, ORDERED_METAS } from "@/games/metas";
import { getSessionUser } from "@/shared/auth";
import { acceptChallenge, getChallenge, headToHead } from "@/shared/challenges";
import { todayET } from "@/shared/day";
import { getLang } from "@/shared/lang-server";
import { CopyButton } from "@/shared/ui/CopyButton";

export const dynamic = "force-dynamic";

const S = {
  en: { title: "1v1", waiting: "Send this link to a friend:", copy: "Copy link", copied: "Copied!", play: "Play", vs: "vs", expired: "This challenge was for an earlier day.", done: "Head to head", inProgress: "Still playing…", total: "Daily total", wins: "wins!", tie: "It's a tie!", them: "Waiting for your friend" },
  fr: { title: "1 contre 1", waiting: "Envoie ce lien à un ami :", copy: "Copier le lien", copied: "Copié !", play: "Jouer", vs: "contre", expired: "Ce défi était pour un jour précédent.", done: "Face-à-face", inProgress: "Partie en cours…", total: "Total du jour", wins: "gagne !", tie: "Égalité !", them: "En attente de ton ami" },
};

export default async function ChallengeView({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let c = await getChallenge(token);
  if (!c) notFound();
  const user = await getSessionUser();
  if (!user) redirect(`/auth?next=/c/${token}`);
  const lang = c.language;
  const t = S[await getLang()];
  if (c.day !== todayET()) return <p className="card">{t.expired}</p>;
  if (user.id !== c.creator_id) c = await acceptChallenge(c, user.id);

  const h = await headToHead(c);
  const meIsA = user.id === c.creator_id;
  const nameA = h.names[c.creator_id] ?? "?";
  const nameB = c.opponent_id ? (h.names[c.opponent_id] ?? "?") : "…";
  const myCol = (g: (typeof h.games)[number]) => (meIsA ? g.a : g.b);

  return (
    <>
      <h1>
        ⚔️ {nameA} {t.vs} {nameB}
      </h1>
      {!c.opponent_id && (
        <section className="card col gap" style={{ marginBottom: 16 }}>
          <p>{t.waiting}</p>
          <CopyButton text="" relative={`/c/${c.token}`} label={t.copy} done={t.copied} />
        </section>
      )}
      <section className="card table-wrap" style={{ marginBottom: 16 }}>
        <h3>{h.done ? t.done : t.inProgress}</h3>
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th className="num">{nameA}</th>
              <th className="num">{nameB}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {h.games.map((g) => (
              <tr key={g.game}>
                <td>
                  <span className="gdot" data-game={g.game} /> {METAS[g.game].name[lang]}
                </td>
                <td className="num">{g.a !== null ? Math.round(g.a) : "·"}</td>
                <td className="num">{g.b !== null ? Math.round(g.b) : "·"}</td>
                <td className="num">
                  {myCol(g) === null && (
                    <Link className="btn primary small" href={`/play/${g.game}`}>
                      {t.play}
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>
                <strong>{t.total}</strong>
              </td>
              <td className="num">
                <strong>{h.totals.a !== null ? Math.round(h.totals.a) : "—"}</strong>
              </td>
              <td className="num">
                <strong>{h.totals.b !== null ? Math.round(h.totals.b) : "—"}</strong>
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
        {h.done && h.totals.a !== null && h.totals.b !== null && (
          <p className="big" style={{ fontSize: "1.4rem" }}>
            {h.totals.a === h.totals.b ? t.tie : `${h.totals.a > h.totals.b ? nameA : nameB} ${t.wins}`}
          </p>
        )}
        {!h.done && c.opponent_id && <p className="muted small">{t.them}</p>}
      </section>
      <p className="muted small">{ORDERED_METAS.length} games · {c.day}</p>
    </>
  );
}
