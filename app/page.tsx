import Link from "next/link";
import { ORDERED_METAS } from "@/games/metas";
import { SERVERS } from "@/games/servers";
import { todayET } from "@/shared/day";
import { variantKey, type Lang } from "@/shared/game";
import { dict, levelLabel } from "@/shared/i18n";
import { getPlayer } from "@/shared/identity";
import { getLang } from "@/shared/lang-server";
import { resultsForPlayer, toFinishResult } from "@/shared/results";
import { difficultyFor } from "@/shared/scoring";
import { Countdown } from "@/shared/ui/Countdown";
import { GameMark } from "@/shared/ui/GameMark";
import { HubExtras } from "@/shared/ui/HubExtras";
import { ordinalServer } from "@/shared/format";

export const dynamic = "force-dynamic";

function longDate(day: string, lang: Lang): string {
  const s = new Intl.DateTimeFormat(lang === "fr" ? "fr-CA" : "en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" }).format(
    new Date(`${day}T12:00:00Z`),
  );
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function Hub() {
  const lang = await getLang();
  const t = dict(lang);
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
  const doneCount = cards.filter((c) => c.done).length;

  return (
    <>
      <div className="hub-head">
        <div>
          <h1>{longDate(today, lang)}</h1>
          <p className="hub-sub">{t.tagline}</p>
        </div>
        <span className="muted small">
          {t.newSet} <Countdown />
        </span>
      </div>

      <HubExtras part="top" />

      <div className="game-grid">
        {cards.map(({ meta, available, done, diffs }) => (
          <Link
            key={meta.id}
            href={available ? `/play/${meta.id}` : "#"}
            className={`game-box ${available ? "" : "soon"}`}
            data-game={meta.id}
            aria-disabled={!available}
          >
            <div className="art">
              <GameMark game={meta.id} />
            </div>
            <div className="body">
              <h2>{meta.name[lang]}</h2>
              <span className="desc">{meta.tagline[lang]}</span>
              {available &&
                diffs.map(({ level, d }) =>
                  d ? (
                    <span key={level ?? "x"} className={`diff diff-${d.label}`}>
                      {level ? `${levelLabel(level, lang)}: ` : `${t.difficulty}: `}
                      <b>{levelLabel(d.label, lang).toLowerCase()}</b>, {d.detail}
                    </span>
                  ) : null,
                )}
              <div className="foot">
                {done ? (
                  <span className="done-chip">
                    <span className="tick">✓</span>
                    {done.percentile !== null ? `${ordinalServer(Math.round(done.percentile), lang)} ${lang === "fr" ? "centile" : "percentile"}` : t.played}
                  </span>
                ) : (
                  <span className="meta">{available ? `${t.about} ${meta.minutes} ${t.minutes}` : t.comingSoon}</span>
                )}
                {available && <span className={`play-pill ${done ? "quiet" : ""}`}>{done ? t.seeResult : t.play}</span>}
              </div>
            </div>
          </Link>
        ))}
        <Link href="/summary" className="game-box day-box">
          <div className="art">
            <span className="day-pips">
              {cards.map(({ meta, done }) => (
                <span key={meta.id} data-game={meta.id} className={done ? "on" : ""} />
              ))}
            </span>
          </div>
          <div className="body">
            <h2>{t.summary}</h2>
            <span className="desc">{doneCount === 5 ? t.allDone : `${doneCount} ${t.ofFive}`}</span>
            <div className="foot">
              <span className="meta">{t.dailyTotal}</span>
              <span className="play-pill quiet">{t.seeResult}</span>
            </div>
          </div>
        </Link>
      </div>

      <HubExtras part="bottom" />
    </>
  );
}
