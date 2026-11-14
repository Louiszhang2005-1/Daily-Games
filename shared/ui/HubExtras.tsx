import { dict } from "../i18n";
import { getLang } from "../lang-server";

// Hub banners. Summary link, streaks and catch-up arrive with later feature branches.
export async function HubExtras(_props: { doneCount: number }) {
  const t = dict(await getLang());
  return <p className="banner">{t.guestNote}</p>;
}
