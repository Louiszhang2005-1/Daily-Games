import Link from "next/link";
import { ORDERED_METAS } from "@/games/metas";
import { getSessionUser } from "@/shared/auth";
import { clanTable, clanVsClan, getClan, memberIds, myClans } from "@/shared/clans";
import { todayET } from "@/shared/day";
import { getLang } from "@/shared/lang-server";

const S = {
  en: { vs: "Clan vs clan", clan: "Clan", avg: "Clan average", members: "Played", none: "No clan has 3 members who played today yet.", player: "Player", total: "Daily total" },
  fr: { vs: "Clan contre clan", clan: "Clan", avg: "Moyenne du clan", members: "Ont joué", none: "Aucun clan n'a encore 3 membres qui ont joué aujourd'hui.", player: "Joueur", total: "Total du jour" },
};

export async function BoardTabsExtra({ board }: { board: string }) {
  const lang = await getLang();
  const user = await getSessionUser();
  const clans = user ? await myClans(user.id) : [];
  return (
    <>
      <Link href="/leaderboards?board=clans" className={`btn small ${board === "clans" ? "active" : "ghost"}`}>
        {S[lang].vs}
      </Link>
      {clans.map((c) => (
        <Link key={c.id} href={`/leaderboards?board=clan&clan=${c.id}`} className="btn small ghost">
          {c.name}
        </Link>
      ))}
    </>
  );
}

export async function ExtraBoard({ board, search }: { board: string; search: Record<string, string | undefined> }) {
  const lang = await getLang();
  const t = S[lang];
  const day = todayET();
  if (board === "clans") {
    const rows = await clanVsClan(day, lang);
    if (rows.length === 0) return <p className="muted">{t.none}</p>;
    return (
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>{t.clan}</th>
            <th className="num">{t.members}</th>
            <th className="num">{t.avg}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.clan.id}>
              <td>{i + 1}</td>
              <td>{r.clan.name}</td>
              <td className="num">{r.members}</td>
              <td className="num">{Math.round(r.average)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  if (board === "clan" && search.clan) {
    const user = await getSessionUser();
    const clan = await getClan(search.clan);
    if (!clan || !user || !(await memberIds(clan.id)).includes(user.id)) return null;
    const table = await clanTable(clan, day, lang);
    return (
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>{t.player}</th>
            {ORDERED_METAS.map((m) => (
              <th key={m.id} className="num">
                <span className="gdot" data-game={m.id}>{m.name.en[0]}</span>
              </th>
            ))}
            <th className="num">{t.total}</th>
          </tr>
        </thead>
        <tbody>
          {table.rows
            .filter((r) => r.playedToday)
            .map((r, i) => (
              <tr key={r.userId} className={r.userId === user.id ? "me" : ""}>
                <td>{i + 1}</td>
                <td>{r.name}</td>
                {ORDERED_METAS.map((m) => (
                  <td key={m.id} className="num">
                    {r.games[m.id] !== undefined ? Math.round(r.games[m.id]!) : "·"}
                  </td>
                ))}
                <td className="num">{r.total !== null ? Math.round(r.total) : "—"}</td>
              </tr>
            ))}
        </tbody>
      </table>
    );
  }
  return null;
}
