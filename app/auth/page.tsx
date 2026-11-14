import { redirect } from "next/navigation";
import { authAvailable, authMode, getSessionUser } from "@/shared/auth";
import { getLang } from "@/shared/lang-server";
import { devSignIn } from "./actions";
import { SupabaseLogin } from "./SupabaseLogin";

export const dynamic = "force-dynamic";

const S = {
  en: {
    title: "Sign in",
    why: "Keep your streak on every device, join clans, climb the leaderboards and catch up on yesterday's games.",
    dev: "Development sign-in (no Supabase keys set). Pick any display name.",
    name: "Display name",
    go: "Sign in",
    off: "Sign-in isn't set up on this server yet.",
  },
  fr: {
    title: "Connexion",
    why: "Garde ta série sur tous tes appareils, rejoins des clans, grimpe dans les classements et rattrape les jeux d'hier.",
    dev: "Connexion de développement (pas de clés Supabase). Choisis un pseudo.",
    name: "Pseudo",
    go: "Se connecter",
    off: "La connexion n'est pas encore configurée sur ce serveur.",
  },
};

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const lang = await getLang();
  const t = S[lang];
  const next = (await searchParams).next ?? "/";
  if (await getSessionUser()) redirect(next);

  return (
    <section className="card col gap" style={{ maxWidth: 440, margin: "24px auto" }}>
      <h1>{t.title}</h1>
      <p className="muted">{t.why}</p>
      {authMode() === "supabase" ? (
        <SupabaseLogin url={process.env.NEXT_PUBLIC_SUPABASE_URL!} anonKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!} next={next} />
      ) : authAvailable() ? (
        <form action={devSignIn} className="col gap">
          <p className="small muted">{t.dev}</p>
          <input type="hidden" name="next" value={next} />
          <label className="col gap small">
            {t.name}
            <input className="input" name="name" required minLength={2} maxLength={32} />
          </label>
          <button className="btn primary" type="submit">
            {t.go}
          </button>
        </form>
      ) : (
        <p>{t.off}</p>
      )}
    </section>
  );
}
