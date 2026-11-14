import Link from "next/link";
import { ORDERED_METAS } from "@/games/metas";
import { todayET, yesterdayET } from "@/shared/day";
import { dict, levelLabel } from "@/shared/i18n";
import { getPlayer } from "@/shared/identity";
import { getLang } from "@/shared/lang-server";
import { ordinalServer } from "@/shared/format";
import { resultsForPlayer, toFinishResult } from "@/shared/results";
import { dailyTotal } from "@/shared/scoring";
import { SummaryExtras } from "@/shared/ui/SummaryExtras";

export const dynamic = "force-dynamic";

export default async function SummaryPage({ searchParams }: { searchParams: Promise<{ day?: string }> }) {
  const lang = await getLang();
  const t = dict(lang);
  const player = await getPlayer();
  const sp = await searchParams;
  const day = sp.day === "yesterday" && player.userId ? yesterdayET() : todayET();
  const rows = (await resultsForPlayer(player, day)).filter((r) => r.language === lang);

  const items = await Promise.all(
    ORDERED_METAS.map(async (meta) => {
      const row = rows.find((r) => r.game === meta.id);
      return { meta, row, res: row ? await toFinishResult(row, true) : null };
    }),
  );
  const pcts = items.flatMap((i) => (i.res?.percentile !== null && i.res ? [i.res.percentile] : []));
  const total = dailyTotal(pcts);
  const provisional = items.some((i) => i.res?.provisional);

  return (
    <>
      <h1>{t.summary}</h1>
      <p className="muted">{day}</p>
      <section className="card col gap" style={{ marginBottom: 16 }}>
        <div className="label">{t.dailyTotal}</div>
        <div className="big">
          {total !== null ? ordinalServer(Math.round(total), lang) : "—"}
          {provisional && <span className="tag">{t.provisional}</span>}
        </div>
        <div className="muted small">
          {pcts.length} / 5 {t.gamesPlayed}
        </div>
        <SummaryExtras day={day} />
      </section>
      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>{t.score}</th>
              <th className="num">{t.percentile}</th>
            </tr>
          </thead>
          <tbody>
            {items.map(({ meta, row, res }) => (
              <tr key={meta.id}>
                <td>
                  <Link href={`/play/${meta.id}`} style={{ textDecoration: "none" }}>
                    <span style={{ color: meta.color, fontWeight: 800 }}>{meta.icon}</span> {meta.name[lang]}
                    {row?.level && <span className="tag">{levelLabel(row.level, lang)}</span>}
                  </Link>
                </td>
                <td>{res ? ((res.details.summary as Record<string, string> | undefined)?.[lang] ?? res.raw) : <span className="muted">—</span>}</td>
                <td className="num">{res?.percentile != null ? ordinalServer(Math.round(res.percentile), lang) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
