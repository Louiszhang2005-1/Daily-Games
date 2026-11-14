import Link from "next/link";
import { dict } from "../i18n";
import { getLang } from "../lang-server";

export async function HeaderLinksExtra() {
  const t = dict(await getLang());
  return (
    <Link className="btn ghost small" href="/clans">
      {t.clans}
    </Link>
  );
}
