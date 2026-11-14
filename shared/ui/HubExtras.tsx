import Link from "next/link";
import { dict } from "../i18n";
import { getLang } from "../lang-server";
import { StreakBadge } from "./StreakBadge";

// Hub banners: streak, summary link, guest note.
export async function HubExtras({ doneCount }: { doneCount: number }) {
  const t = dict(await getLang());
  return (
    <div className="col gap" style={{ marginBottom: 16 }}>
      <StreakBadge />
      {doneCount > 0 && (
        <Link href="/summary" className="banner" style={{ margin: 0, textDecoration: "none" }}>
          {doneCount === 5 ? `🎉 ${t.allDone} →` : `${t.summary} (${doneCount}/5) →`}
        </Link>
      )}
      <p className="banner" style={{ margin: 0 }}>
        {t.guestNote}
      </p>
    </div>
  );
}
