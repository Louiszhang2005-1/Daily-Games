import Link from "next/link";
import { myClanRanks } from "../clans";
import { getLang } from "../lang-server";

const S = { en: "rank in", fr: "rang dans" };

// The player's rank inside each clan, on the daily summary.
export async function SummaryClanExtra({ day, userId }: { day: string; userId: string }) {
  const lang = await getLang();
  const ranks = await myClanRanks(userId, day, lang);
  if (ranks.length === 0) return null;
  return (
    <div className="row gap wrap small">
      {ranks.map((r) => (
        <Link key={r.clan.id} href={`/clans/${r.clan.id}`} className="tag" style={{ textDecoration: "none", fontSize: "0.8rem" }}>
          #{r.rank}/{r.of} {S[lang]} {r.clan.name}
        </Link>
      ))}
    </div>
  );
}
