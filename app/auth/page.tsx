import { redirect } from "next/navigation";
import { authAvailable, authMode, getSessionUser } from "@/shared/auth";
import { getLang } from "@/shared/lang-server";
import { devSignIn } from "./actions";
import { SupabaseLogin, type OAuthProvider } from "./SupabaseLogin";

export const dynamic = "force-dynamic";

/** Social buttons to show, from NEXT_PUBLIC_AUTH_PROVIDERS (enable the same ones in Supabase). */
function enabledProviders(): OAuthProvider[] {
  // Always in this order: Google first, Microsoft last.
  const order: OAuthProvider[] = ["google", "apple", "azure"];
  const raw = (process.env.NEXT_PUBLIC_AUTH_PROVIDERS ?? "google,apple,azure").split(",").map((x) => x.trim().toLowerCase());
  return order.filter((p) => raw.includes(p));
}

const S = {
  en: {
    title: "Sign in to Daily Games",
    why: "Keep your streak on every device, join clans and climb the leaderboards.",
    newHere: "New here? Signing in creates your account.",
    dev: "Local testing (no account needed)",
    devNote: "Sign-in isn't connected to Supabase on this computer yet, so the buttons above can't finish. Use any display name to test.",
    name: "Display name",
    go: "Continue",
  },
  fr: {
    title: "Connexion à Jeux du jour",
    why: "Garde ta série sur tous tes appareils, rejoins des clans et grimpe dans les classements.",
    newHere: "Nouveau ? La connexion crée ton compte.",
    dev: "Test local (sans compte)",
    devNote: "La connexion n'est pas encore reliée à Supabase sur cet ordinateur, donc les boutons ci-dessus ne peuvent pas aboutir. Choisis un pseudo pour tester.",
    name: "Pseudo",
    go: "Continuer",
  },
};

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const lang = await getLang();
  const t = S[lang];
  const sp = await searchParams;
  const next = sp.next ?? "/";
  if (await getSessionUser()) redirect(next);
  const live = authMode() === "supabase";

  return (
    <section className="signin">
      <span className="signin-mark" aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </span>
      <h1>{t.title}</h1>
      <p className="muted">{t.why}</p>
      {sp.error && <p className="error small">{sp.error}</p>}

      <SupabaseLogin
        url={live ? process.env.NEXT_PUBLIC_SUPABASE_URL! : null}
        anonKey={live ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! : null}
        next={next}
        providers={enabledProviders()}
      />

      <p className="muted small center" style={{ margin: 0 }}>
        {t.newHere}
      </p>

      {!live && authAvailable() && (
        <details className="dev-signin" open>
          <summary>{t.dev}</summary>
          <p className="muted small">{t.devNote}</p>
          <form action={devSignIn} className="row gap">
            <input type="hidden" name="next" value={next} />
            <input className="input" name="name" required minLength={2} maxLength={32} placeholder={t.name} aria-label={t.name} />
            <button className="btn" type="submit">
              {t.go}
            </button>
          </form>
        </details>
      )}
    </section>
  );
}
