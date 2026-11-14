import { notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/shared/auth";
import { clanByCode, memberIds } from "@/shared/clans";
import { getLang } from "@/shared/lang-server";
import { joinClanAction } from "../../actions";
import { CLAN_S } from "../../strings";

export const dynamic = "force-dynamic";

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const clan = await clanByCode(code);
  if (!clan) notFound();
  const lang = await getLang();
  const t = CLAN_S[lang];
  const user = await getSessionUser();
  const count = (await memberIds(clan.id)).length;
  return (
    <section className="card col gap" style={{ maxWidth: 440, margin: "24px auto" }}>
      <h1>{clan.name}</h1>
      <p className="muted">
        {count} {t.members}
      </p>
      {user ? (
        <form action={joinClanAction} className="col gap">
          <input type="hidden" name="code" value={clan.invite_code} />
          <button className="btn primary" type="submit">
            {t.joinBtn}
          </button>
        </form>
      ) : (
        <Link className="btn primary" href={`/auth?next=${encodeURIComponent(`/clans/join/${clan.invite_code}`)}`}>
          {t.signIn}
        </Link>
      )}
    </section>
  );
}
