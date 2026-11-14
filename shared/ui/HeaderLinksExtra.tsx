import Link from "next/link";
import { dict } from "../i18n";
import { getLang } from "../lang-server";

export async function HeaderLinksExtra() {
  const t = dict(await getLang());
  return (
    <Link className="nav-link" href="/clans">
      {t.clans}
    </Link>
  );
}
