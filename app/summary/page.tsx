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

  const dateLabel = new Intl.DateTimeFormat(lang === "fr" ? "fr-CA" : "en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(`${day}T12:00:00Z`));

  return (
    <>
      <h1>{t.summary}</h1>
      <p className="hub-sub" style={{ marginTop: 0 }}>
        {dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)}
      </p>

      <section className="card col gap" style={{ marginTop: 18 }}>
        <div className="total-hero">
          <span className="n">{total !== null ? ordinalServer(Math.round(total), lang) : "—"}</span>
          <span className="muted">
            {t.dailyTotal.toLowerCase()}, {pcts.length} {t.ofFive}
            {provisional && <span className="tag">{t.provisional}</span>}
          </span>
        </div>

        <div className="day-tiles">
          {items.map(({ meta, row, res }) => (
            <Link key={meta.id} href={`/play/${meta.id}`} className={`day-tile ${res ? "" : "empty"}`} data-game={meta.id}>
              <span className="nm">
                {meta.name[lang]}
                {row?.level ? ` (${levelLabel(row.level, lang).toLowerCase()})` : ""}
              </span>
              <span className="sc">{res ? ((res.details.summary as Record<string, string> | undefined)?.[lang] ?? String(res.raw)) : t.play}</span>
              <span className="n">{res?.percentile != null ? ordinalServer(Math.round(res.percentile), lang) : "—"}</span>
            </Link>
          ))}
        </div>

        <SummaryExtras day={day} />
      </section>
    </>
  );
}
