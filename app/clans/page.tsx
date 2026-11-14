import Link from "next/link";
import { getSessionUser } from "@/shared/auth";
import { memberIds, myClans } from "@/shared/clans";
import { getLang } from "@/shared/lang-server";
import { createClanAction, joinClanAction } from "./actions";
import { CLAN_S } from "./strings";

export const dynamic = "force-dynamic";

export default async function ClansPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const lang = await getLang();
  const t = CLAN_S[lang];
  const user = await getSessionUser();
  const { error } = await searchParams;

  if (!user)
    return (
      <>
        <h1>{t.title}</h1>
        <p className="muted">{t.intro}</p>
        <Link className="btn primary" href="/auth?next=/clans">
          {t.signIn}
        </Link>
      </>
    );

  const clans = await myClans(user.id);
  const counts = await Promise.all(clans.map(async (c) => (await memberIds(c.id)).length));

  return (
    <>
      <h1>{t.title}</h1>
      <p className="muted">{t.intro}</p>
      {error && <p className="error">{t.errors[error as keyof typeof t.errors] ?? error}</p>}

      <section className="card col gap" style={{ marginBottom: 16 }}>
        <h3>{t.mine}</h3>
        {clans.length === 0 && <p className="muted">{t.none}</p>}
        {clans.map((c, i) => (
          <Link key={c.id} href={`/clans/${c.id}`} className="row spread banner" style={{ margin: 0, textDecoration: "none" }}>
            <strong>{c.name}</strong>
            <span className="muted small">
              {counts[i]} {t.members}
            </span>
          </Link>
        ))}
      </section>

      <div className="game-grid">
        <form action={createClanAction} className="card col gap">
          <h3>{t.create}</h3>
          <input className="input" name="name" placeholder={t.name} required minLength={2} maxLength={40} />
          <button className="btn primary" type="submit">
            {t.create}
          </button>
        </form>
        <form action={joinClanAction} className="card col gap">
          <h3>{t.join}</h3>
          <input className="input" name="code" placeholder={t.code} required minLength={4} maxLength={12} style={{ textTransform: "uppercase" }} />
          <button className="btn ghost" type="submit">
            {t.joinBtn}
          </button>
        </form>
      </div>
    </>
  );
}
