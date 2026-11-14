import Link from "next/link";
import { getSessionUser } from "../auth";
import { myClans } from "../clans";
import { getLang } from "../lang-server";

const S = {
  en: { challenge: "Challenge a friend (1v1)", clans: "Your clans" },
  fr: { challenge: "Défier un ami (1 contre 1)", clans: "Tes clans" },
};

// Quick links on the hub for logged-in players.
export async function HubClanExtra() {
  const user = await getSessionUser();
  if (!user) return null;
  const lang = await getLang();
  const clans = await myClans(user.id);
  return (
    <div className="row gap wrap">
      <Link className="btn ghost small" href="/challenge">
        ⚔️ {S[lang].challenge}
      </Link>
      {clans.map((c) => (
        <Link key={c.id} className="btn ghost small" href={`/clans/${c.id}`}>
          🛡️ {c.name}
        </Link>
      ))}
    </div>
  );
}
