import Link from "next/link";
import { getSessionUser } from "../auth";
import { dict } from "../i18n";
import { getLang } from "../lang-server";
import { HeaderLinksExtra } from "./HeaderLinksExtra";

export async function HeaderNav() {
  const t = dict(await getLang());
  const user = await getSessionUser();
  return (
    <>
      <Link className="nav-link" href="/leaderboards">
        {t.leaderboards}
      </Link>
      <HeaderLinksExtra />
      {user ? (
        <Link className="nav-link" href="/account" title={user.displayName}>
          {user.displayName.slice(0, 14)}
        </Link>
      ) : (
        <Link className="btn primary small" href="/auth">
          {t.signIn}
        </Link>
      )}
    </>
  );
}
