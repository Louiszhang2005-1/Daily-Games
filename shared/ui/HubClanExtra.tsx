import Link from "next/link";
import { getSessionUser } from "../auth";
import { myClans } from "../clans";
import { getLang } from "../lang-server";

const S = {
  en: { challenge: "Challenge a friend" },
  fr: { challenge: "Défier un ami" },
};

// Quick links on the hub for logged-in players.
export async function HubClanExtra() {
  const user = await getSessionUser();
  if (!user) return null;
  const lang = await getLang();
  const clans = await myClans(user.id);
  return (
    <div className="chip-row">
      <Link className="chip" href="/challenge">
        ⚔️ {S[lang].challenge}
      </Link>
      {clans.map((c) => (
        <Link key={c.id} className="chip" href={`/clans/${c.id}`}>
          🛡️ {c.name}
        </Link>
      ))}
    </div>
  );
}
