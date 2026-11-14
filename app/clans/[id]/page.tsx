import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ORDERED_METAS } from "@/games/metas";
import { getSessionUser } from "@/shared/auth";
import { clanTable, getClan, memberIds } from "@/shared/clans";
import { todayET, yesterdayET } from "@/shared/day";
import { dict } from "@/shared/i18n";
import { getLang } from "@/shared/lang-server";
import { CopyButton } from "@/shared/ui/CopyButton";
import { leaveClanAction } from "../actions";
import { CLAN_S } from "../strings";

export const dynamic = "force-dynamic";

export default async function ClanPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ day?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await getSessionUser();
  if (!user) redirect(`/auth?next=/clans/${id}`);
  const clan = await getClan(id);
  if (!clan) notFound();
  if (!(await memberIds(id)).includes(user.id)) redirect("/clans");

  const lang = await getLang();
  const t = CLAN_S[lang];
  const d = dict(lang);
  const day = sp.day === "yesterday" ? yesterdayET() : todayET();
  const table = await clanTable(clan, day, lang);
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const invite = `${site}/clans/join/${clan.invite_code}`;

  return (
    <>
      <h1>{clan.name}</h1>
      <div className="tabs">
        <Link href={`/clans/${id}`} className={`btn small ${day === todayET() ? "active" : "ghost"}`}>
          {d.today}
        </Link>
        <Link href={`/clans/${id}?day=yesterday`} className={`btn small ${day !== todayET() ? "active" : "ghost"}`}>
          {d.yesterday}
        </Link>
      </div>

      <section className="card table-wrap" style={{ marginBottom: 16 }}>
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>{t.member}</th>
              {ORDERED_METAS.map((m) => (
                <th key={m.id} className="num" title={m.name[lang]}>
                  <span style={{ color: m.color }}>{m.icon}</span>
                </th>
              ))}
              <th className="num">{t.total}</th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((r, i) => (
              <tr key={r.userId} className={r.userId === user.id ? "me" : ""}>
                <td>{r.playedToday ? i + 1 : ""}</td>
                <td>
                  {r.name}
                  {!r.playedToday && <span className="muted small"> · {t.notYet}</span>}
                </td>
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
          <tfoot>
            <tr>
              <td></td>
              <td colSpan={ORDERED_METAS.length + 1}>
                <strong>{t.average}</strong>
              </td>
              <td className="num">
                <strong>{table.average !== null ? Math.round(table.average) : "—"}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section className="card col gap">
        <div className="label">{t.invite}</div>
        <div className="row gap wrap">
          <code className="mono">{clan.invite_code}</code>
          <CopyButton text={invite} label={t.copy} done={t.copied} relative={!site ? `/clans/join/${clan.invite_code}` : undefined} />
        </div>
        <div className="row gap wrap">
          <Link className="btn ghost small" href={`/leaderboards?board=clan&clan=${clan.id}`}>
            {t.filter}
          </Link>
          <Link className="btn ghost small" href="/">
            {t.difficulty}
          </Link>
          <form action={leaveClanAction}>
            <input type="hidden" name="clanId" value={clan.id} />
            <button className="btn ghost small" type="submit">
              {t.leave}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
