import Link from "next/link";
import { ORDERED_METAS } from "@/games/metas";
import { dailyBoard, gameBoard, rangeBoard } from "@/shared/boards";
import { addDays, todayET, yesterdayET } from "@/shared/day";
import { isGameId } from "@/shared/game";
import { ordinalServer } from "@/shared/format";
import { getPlayer } from "@/shared/identity";
import { getLang } from "@/shared/lang-server";
import { BoardTabsExtra, ExtraBoard } from "./extra";

export const dynamic = "force-dynamic";

const S = {
  en: { title: "Leaderboards", overall: "Today", yesterday: "Yesterday", all: "All-time", week: "7 days", month: "30 days", ever: "Ever", player: "Player", total: "Daily total", avg: "Average", days: "Days", empty: "No signed-in players yet.", pct: "Percentile", score: "Score", signIn: "Sign in to appear here." },
  fr: { title: "Classements", overall: "Aujourd'hui", yesterday: "Hier", all: "Historique", week: "7 jours", month: "30 jours", ever: "Depuis le début", player: "Joueur", total: "Total du jour", avg: "Moyenne", days: "Jours", empty: "Pas encore de joueurs connectés.", pct: "Centile", score: "Score", signIn: "Connecte-toi pour apparaître ici." },
};

type Search = { board?: string; game?: string; range?: string; clan?: string };

export default async function Leaderboards({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const lang = await getLang();
  const t = S[lang];
  const player = await getPlayer();
  const board = sp.board ?? "overall";
  const today = todayET();

  const tab = (key: string, label: string, href: string) => (
    <Link key={key} href={href} className={`btn small ${board === key || (key === sp.game && board === "game") ? "active" : "ghost"}`}>
      {label}
    </Link>
  );

  let body: React.ReactNode;
  if (board === "overall" || board === "yesterday") {
    const day = board === "yesterday" ? yesterdayET() : today;
    const rows = await dailyBoard(day, lang);
    body = (
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>{t.player}</th>
            {ORDERED_METAS.map((m) => (
              <th key={m.id} className="num" title={m.name[lang]}>
                <span className="gdot" data-game={m.id}>{m.name.en[0]}</span>
              </th>
            ))}
            <th className="num">{t.total}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.userId} className={r.userId === player.userId ? "me" : ""}>
              <td>{i + 1}</td>
              <td>{r.name}</td>
              {ORDERED_METAS.map((m) => (
                <td key={m.id} className="num">
                  {r.games[m.id] !== undefined ? Math.round(r.games[m.id]!) : "·"}
                </td>
              ))}
              <td className="num">
                <strong>{r.total !== null ? Math.round(r.total) : "—"}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
    if (rows.length === 0) body = <p className="muted">{t.empty}</p>;
  } else if (board === "game" && sp.game && isGameId(sp.game)) {
    const rows = await gameBoard(today, lang, sp.game);
    body = rows.length ? (
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>{t.player}</th>
            <th>{t.score}</th>
            <th className="num">{t.pct}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.userId} className={r.userId === player.userId ? "me" : ""}>
              <td>{i + 1}</td>
              <td>{r.name}</td>
              <td>{r.summary}</td>
              <td className="num">{ordinalServer(Math.round(r.pct), lang)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p className="muted">{t.empty}</p>
    );
  } else if (board === "all") {
    const range = sp.range ?? "7";
    const from = range === "ever" ? "2000-01-01" : addDays(today, -(Number(range) - 1));
    const rows = await rangeBoard(from, today, lang);
    body = (
      <>
        <div className="tabs">
          {[
            ["7", t.week],
            ["30", t.month],
            ["ever", t.ever],
          ].map(([k, label]) => (
            <Link key={k} href={`/leaderboards?board=all&range=${k}`} className={`btn small ${range === k ? "active" : "ghost"}`}>
              {label}
            </Link>
          ))}
        </div>
        {rows.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t.player}</th>
                <th className="num">{t.days}</th>
                <th className="num">{t.avg}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.userId} className={r.userId === player.userId ? "me" : ""}>
                  <td>{i + 1}</td>
                  <td>{r.name}</td>
                  <td className="num">{r.days}</td>
                  <td className="num">{Math.round(r.avg)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted">{t.empty}</p>
        )}
      </>
    );
  } else {
    body = <ExtraBoard board={board} search={sp} />;
  }

  return (
    <>
      <h1>{t.title}</h1>
      {!player.userId && (
        <p className="banner">
          <Link href="/auth?next=/leaderboards">{t.signIn}</Link>
        </p>
      )}
      <div className="tabs">
        {tab("overall", t.overall, "/leaderboards")}
        {tab("yesterday", t.yesterday, "/leaderboards?board=yesterday")}
        {ORDERED_METAS.map((m) => tab(m.id, m.name[lang], `/leaderboards?board=game&game=${m.id}`))}
        {tab("all", t.all, "/leaderboards?board=all")}
        <BoardTabsExtra board={board} />
      </div>
      <section className="card table-wrap">{body}</section>
    </>
  );
}
