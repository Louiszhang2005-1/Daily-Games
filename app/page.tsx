import Link from "next/link";
import { ORDERED_METAS } from "@/games/metas";
import { SERVERS } from "@/games/servers";
import { todayET } from "@/shared/day";
import { variantKey } from "@/shared/game";
import { dict, levelLabel } from "@/shared/i18n";
import { getPlayer } from "@/shared/identity";
import { getLang } from "@/shared/lang-server";
import { resultsForPlayer, toFinishResult } from "@/shared/results";
import { difficultyFor } from "@/shared/scoring";
import { Countdown } from "@/shared/ui/Countdown";
import { HubExtras } from "@/shared/ui/HubExtras";
import { ordinalServer } from "@/shared/format";

export const dynamic = "force-dynamic";

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
        levels.map(async (level) => ({
          level,
          d: await difficultyFor(meta.id, today, variantKey({ lang, ...(level ? { level } : {}) })),
        })),
      );
      return { meta, available, done, diffs };
    }),
  );
  const doneCount = cards.filter((c) => c.done).length;

  return (
    <>
      <div className="hub-head">
        <div>
          <h1>{t.today}</h1>
          <p className="muted" style={{ margin: 0 }}>
            {t.tagline}
          </p>
        </div>
        <div className="muted small">
          {t.nextPuzzle} <Countdown />
        </div>
      </div>

      <HubExtras doneCount={doneCount} />

      <div className="game-grid">
        {cards.map(({ meta, available, done, diffs }) => (
          <Link
            key={meta.id}
            href={available ? `/play/${meta.id}` : "#"}
            className={`card game-card ${done ? "done" : ""}`}
            style={{ ["--accent" as string]: meta.color }}
            aria-disabled={!available}
          >
            {done && (
              <span className="check">
                ✓{" "}
                {done.percentile !== null ? ordinalServer(Math.round(done.percentile), lang) : t.played}
              </span>
            )}
            <span className="icon" aria-hidden>
              {meta.icon}
            </span>
            <div>
              <h3 style={{ margin: 0 }}>{meta.name[lang]}</h3>
              <div className="muted small">{meta.tagline[lang]}</div>
            </div>
            <div className="row gap wrap small">
              {!available ? (
                <span className="soon">{t.comingSoon}</span>
              ) : (
                diffs.map(({ level, d }) =>
                  d ? (
                    <span key={level ?? "x"} className={`diff diff-${d.label}`}>
                      {level ? `${levelLabel(level, lang)}: ` : ""}
                      {levelLabel(d.label, lang)} · {d.detail}
                    </span>
                  ) : null,
                )
              )}
              <span className="muted">~{meta.minutes} {t.minutes}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
