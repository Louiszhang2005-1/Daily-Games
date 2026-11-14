import Link from "next/link";
import { ORDERED_METAS } from "@/games/metas";
import { SERVERS } from "@/games/servers";
import { yesterdayET } from "../day";
import { dict } from "../i18n";
import { getPlayer } from "../identity";
import { getLang } from "../lang-server";
import { resultsForPlayer } from "../results";
import { getStreak } from "../streaks";
import { StreakBadge } from "./StreakBadge";
import { HubClanExtra } from "./HubClanExtra";

// Hub notes. "top": streak and clan/1v1 shortcuts. "bottom": yesterday's catch-up and the guest note.
export async function HubExtras({ part }: { part: "top" | "bottom"; doneCount?: number }) {
  const lang = await getLang();
  const t = dict(lang);
  const player = await getPlayer();

  if (part === "top") {
    const streak = player.userId ? await getStreak(player.userId) : null;
    return (
      <div className="row gap wrap spread" style={{ marginBottom: 22 }}>
        <StreakBadge server={streak} />
        {player.userId && <HubClanExtra />}
      </div>
    );
  }

  let missed: typeof ORDERED_METAS = [];
  if (player.userId) {
    const y = yesterdayET();
    const played = (await resultsForPlayer(player, y)).filter((r) => r.language === lang).map((r) => r.game);
    const avail = await Promise.all(
      ORDERED_METAS.map(async (m) => {
        const level = m.levels?.[0];
        return (await SERVERS[m.id].load(y, { lang, ...(level ? { level } : {}) })) ? m : null;
      }),
    );
    missed = avail.filter((m): m is (typeof ORDERED_METAS)[number] => Boolean(m) && !played.includes(m!.id));
  }

  return (
    <div className="hub-notes" style={{ marginTop: 26 }}>
      {missed.length > 0 && (
        <div className="banner col gap">
          <div>
            <strong>{t.catchUp}</strong>
            <div className="muted small">{t.catchUpNote}</div>
          </div>
          <div className="chip-row">
            {missed.map((m) => (
              <Link key={m.id} className="chip" data-game={m.id} href={`/play/${m.id}?day=yesterday`}>
                <span className="dot" />
                {m.name[lang]}
              </Link>
            ))}
          </div>
        </div>
      )}
      {!player.userId && (
        <p className="banner">
          {t.guestNote} <Link href="/auth">{t.signIn}</Link>
        </p>
      )}
    </div>
  );
}
