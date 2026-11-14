import Link from "next/link";
import { ORDERED_METAS } from "@/games/metas";
import { SERVERS } from "@/games/servers";
import { countryOutline } from "@/games/country/shape";
import { todayET } from "@/shared/day";
import { variantKey, type Lang } from "@/shared/game";
import { dict, levelLabel } from "@/shared/i18n";
import { getPlayer } from "@/shared/identity";
import { getLang } from "@/shared/lang-server";
import { resultsForPlayer, toFinishResult } from "@/shared/results";
import { dailyTotal, difficultyFor } from "@/shared/scoring";
import { Countdown } from "@/shared/ui/Countdown";
import { GameMark } from "@/shared/ui/GameMark";
import { GameThumb } from "@/shared/ui/Thumbs";
import { HubExtras } from "@/shared/ui/HubExtras";
import { ordinalServer } from "@/shared/format";

export const dynamic = "force-dynamic";

function longDate(day: string, lang: Lang): string {
  const s = new Intl.DateTimeFormat(lang === "fr" ? "fr-CA" : "en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" }).format(
    new Date(`${day}T12:00:00Z`),
  );
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function greeting(lang: Lang): string {
  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "numeric", hourCycle: "h23" }).format(new Date()));
  if (lang === "fr") return hour < 5 || hour >= 18 ? "Bonsoir." : "Bonjour.";
  return hour < 5 ? "Good evening." : hour < 12 ? "Good morning." : hour < 18 ? "Good afternoon." : "Good evening.";
}

const H = {
  en: { today: "Today's five", day: "Your day", played: "Played", total: "daily total", open: "See your day", sample: "Sample outline" },
  fr: { today: "Les cinq du jour", day: "Ta journée", played: "Joué", total: "total du jour", open: "Voir ta journée", sample: "Contour d'exemple" },
};

export default async function Hub() {
  const lang = await getLang();
  const t = dict(lang);
  const h = H[lang];
  const player = await getPlayer();
  const today = todayET();
  const results = (await resultsForPlayer(player, today)).filter((r) => r.language === lang);

  const cards = await Promise.all(
    ORDERED_METAS.map(async (meta) => {
      const levels = meta.levels ?? [undefined];
      const available = (
        await Promise.all(levels.map((level) => SERVERS[meta.id].load(today, { lang, ...(level ? { level } : {}) })))
      ).some(Boolean);
      const mine = results.find((r) => r.game === meta.id);
      const done = mine ? await toFinishResult(mine, true) : null;
      const diffs = await Promise.all(
        levels.map(async (level) => ({ level, d: await difficultyFor(meta.id, today, variantKey({ lang, ...(level ? { level } : {}) })) })),
      );
      return { meta, available, done, diffs };
    }),
  );
  const done = cards.filter((c) => c.done);
  const total = dailyTotal(done.flatMap((c) => (c.done?.percentile != null ? [c.done.percentile] : [])));

  return (
    <>
      <section className="hello">
        <h1>{greeting(lang)}</h1>
        <p>
          {longDate(today, lang)}. {t.newSet} <Countdown />
        </p>
      </section>

      <HubExtras part="top" />

      {done.length > 0 && (
        <Link href="/summary" className="day-strip">
          <span className="day-strip-pips" aria-hidden>
            {cards.map(({ meta, done: d }) => (
              <span key={meta.id} data-game={meta.id} className={d ? "on" : ""} />
            ))}
          </span>
          <span className="day-strip-text">
            <strong>{h.day}</strong>
            <span className="muted">
              {done.length} {t.ofFive}
              {total !== null && `, ${ordinalServer(Math.round(total), lang)} ${h.total}`}
            </span>
          </span>
          <span className="day-strip-go">{h.open}</span>
        </Link>
      )}

      <h2 className="shelf-title">{h.today}</h2>
      <div className="shelf">
        {cards.map(({ meta, available, done: d, diffs }) => (
          <Link key={meta.id} href={available ? `/play/${meta.id}` : "#"} className={`gcard ${available ? "" : "soon"}`} aria-disabled={!available}>
            <GameThumb game={meta.id} outline={meta.id === "country" ? countryOutline("ITA") : undefined} />
            <div className="gmeta" data-game={meta.id}>
              <span className="appicon" aria-hidden>
                <GameMark game={meta.id} />
              </span>
              <span className="gtext">
                <strong>{meta.name[lang]}</strong>
                <span>{meta.tagline[lang]}</span>
                {available &&
                  diffs.map(({ level, d: diff }) =>
                    diff ? (
                      <span key={level ?? "x"} className={`diff diff-${diff.label}`}>
                        {level ? `${levelLabel(level, lang)}: ` : `${t.difficulty}: `}
                        <b>{levelLabel(diff.label, lang).toLowerCase()}</b>, {diff.detail}
                      </span>
                    ) : null,
                  )}
              </span>
              <span className="gstatus">
                {!available ? (
                  <span className="muted">{t.comingSoon}</span>
                ) : d ? (
                  <>
                    <span className="played">{h.played}</span>
                    {d.percentile !== null && <span className="muted">{ordinalServer(Math.round(d.percentile), lang)}</span>}
                  </>
                ) : (
                  <span className="playbtn">{t.play}</span>
                )}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <HubExtras part="bottom" />
    </>
  );
}
