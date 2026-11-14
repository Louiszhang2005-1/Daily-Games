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
import { GameMark } from "@/shared/ui/GameMark";

const LEVEL_NOTES: Record<"en" | "fr", Record<string, string>> = {
  en: { easy: "Plain, everyday clues. Ranked up to the 80th percentile.", medium: "Trickier clues and a fuller grid. Ranked up to the top." },
  fr: { easy: "Définitions simples. Classement jusqu'au 80e centile.", medium: "Définitions plus malicieuses, grille plus dense. Classement complet." },
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ game: string }> }) {
  const { game } = await params;
  if (!isGameId(game)) return {};
  const lang = await getLang();
  const meta = METAS[game];
  const image = `/api/og?game=${game}&lang=${lang}`;
  return {
    title: `${meta.name[lang]} | Daily Games`,
    description: meta.tagline[lang],
    openGraph: { title: meta.name[lang], description: meta.tagline[lang], images: [image] },
    twitter: { card: "summary_large_image", images: [image] },
  };
}

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
  const dayLabel = new Intl.DateTimeFormat(lang === "fr" ? "fr-CA" : "en-US", { month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(`${day}T12:00:00Z`));

  const previous = (await resultsForPlayer(player, day)).find((r) => r.game === game && r.language === lang);

  const header = (
    <div className="game-bar">
      <span className="mark">
        <GameMark game={game} />
      </span>
      <div>
        <h1>{meta.name[lang]}</h1>
        <div className="sub">{catchUp ? `${t.yesterday}, ${dayLabel}. ${t.catchUpNote}` : `${t.today}, ${dayLabel}`}</div>
      </div>
      <Link className="btn ghost small back" href="/">
        {t.back}
      </Link>
    </div>
  );

  // Levels (crossword): pick one before starting. One level per day counts.
  let level = previous?.level ?? sp.level;
  if (meta.levels && !level) {
    return (
      <div data-game={game}>
        {header}
        <h2>{t.chooseLevel}</h2>
        <div className="level-grid">
          {meta.levels.map((l) => (
            <Link key={l} className="level-tile" href={`/play/${game}?level=${l}${dayQuery}`}>
              <strong>{levelLabel(l, lang)}</strong>
              <span>{LEVEL_NOTES[lang][l] ?? ""}</span>
            </Link>
          ))}
        </div>
      </div>
    );
  }
  if (meta.levels && level && !meta.levels.includes(level)) level = meta.levels[0];

  const v: Variant = { lang, ...(level ? { level } : {}) };
  const loaded = await SERVERS[game].load(day, v);
  if (!loaded) {
    return (
      <div data-game={game}>
        {header}
        <p className="card">{t.notAvailable}</p>
      </div>
    );
  }

  const existing = previous ? await toFinishResult(previous, true) : null;

  return (
    <div data-game={game}>
      {header}
      <GameHost
        game={game}
        puzzle={SERVERS[game].toPublic(loaded.full, v)}
        puzzleId={puzzleId(game, day, v)}
        day={day}
        variant={variantKey(v)}
        existing={existing}
      />
    </div>
  );
}
