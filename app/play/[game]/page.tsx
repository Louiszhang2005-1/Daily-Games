import Link from "next/link";
import { notFound } from "next/navigation";
import { METAS } from "@/games/metas";
import { SERVERS } from "@/games/servers";
import { todayET, yesterdayET } from "@/shared/day";
import { isGameId, puzzleId, variantKey, type Variant } from "@/shared/game";
import { dict, levelLabel } from "@/shared/i18n";
import { getPlayer } from "@/shared/identity";
import { getLang } from "@/shared/lang-server";
import { resultsForPlayer, toFinishResult } from "@/shared/results";
import { GameHost } from "@/shared/ui/GameHost";

export const dynamic = "force-dynamic";

// Every game runs on its own here, no login needed: /play/<game>
export default async function PlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ game: string }>;
  searchParams: Promise<{ level?: string; day?: string }>;
}) {
  const { game } = await params;
  const sp = await searchParams;
  if (!isGameId(game)) notFound();
  const meta = METAS[game];
  const lang = await getLang();
  const t = dict(lang);
  const player = await getPlayer();

  const catchUp = sp.day === "yesterday" && Boolean(player.userId);
  const day = catchUp ? yesterdayET() : todayET();
  const dayQuery = catchUp ? "&day=yesterday" : "";

  const previous = (await resultsForPlayer(player, day)).find((r) => r.game === game && r.language === lang);

  const header = (
    <div className="game-title" style={{ ["--accent" as string]: meta.color }}>
      <span className="game-card" style={{ border: 0, padding: 0 }}>
        <span className="icon">{meta.icon}</span>
      </span>
      <div>
        <h1 style={{ margin: 0 }}>{meta.name[lang]}</h1>
        <div className="muted small">
          {catchUp ? t.yesterday : t.today} · {day}
          {catchUp && ` · ${t.catchUpNote}`}
        </div>
      </div>
    </div>
  );

  // Levels (crossword): pick one before starting. One level per day counts.
  let level = previous?.level ?? sp.level;
  if (meta.levels && !level) {
    return (
      <>
        {header}
        <section className="card col gap">
          <h3>{t.chooseLevel}</h3>
          <div className="row gap wrap">
            {meta.levels.map((l) => (
              <Link key={l} className="btn primary" style={{ ["--accent" as string]: meta.color }} href={`/play/${game}?level=${l}${dayQuery}`}>
                {levelLabel(l, lang)}
                {meta.maxPercentile?.[l] !== undefined && meta.maxPercentile[l] < 100 ? ` (max ${meta.maxPercentile[l]})` : ""}
              </Link>
            ))}
          </div>
        </section>
      </>
    );
  }
  if (meta.levels && level && !meta.levels.includes(level)) level = meta.levels[0];

  const v: Variant = { lang, ...(level ? { level } : {}) };
  const loaded = await SERVERS[game].load(day, v);
  if (!loaded) {
    return (
      <>
        {header}
        <p className="card">{t.notAvailable}</p>
      </>
    );
  }

  const existing = previous ? await toFinishResult(previous, true) : null;

  return (
    <>
      {header}
      <GameHost
        game={game}
        puzzle={SERVERS[game].toPublic(loaded.full, v)}
        puzzleId={puzzleId(game, day, v)}
        day={day}
        variant={variantKey(v)}
        existing={existing}
      />
    </>
  );
}
