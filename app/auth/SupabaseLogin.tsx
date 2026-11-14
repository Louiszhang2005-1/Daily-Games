"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { useLang } from "@/shared/ui/lang";
import { finishEmailCodeSignIn } from "./actions";

// Sign in with Google, Microsoft (Outlook, Hotmail, Live) or Apple (iCloud), or get a
// link and a 6-digit code by email at any address (Gmail, Yahoo, Proton...).
// Which buttons show is set by NEXT_PUBLIC_AUTH_PROVIDERS (e.g. "google,azure,apple").

export type OAuthProvider = "google" | "azure" | "apple";

const S = {
  en: {
    google: "Continue with Google",
    azure: "Continue with Microsoft",
    apple: "Continue with Apple",
    or: "or use any email",
    emailHint: "Gmail, Outlook, Yahoo, iCloud or any other address",
    placeholder: "you@example.com",
    send: "Email me a sign-in link",
    sent: (e: string) => `We sent a link and a 6-digit code to ${e}.`,
    open: "Open the link on this device, or type the code here:",
    code: "6-digit code",
    verify: "Sign in",
    resend: "Use a different email",
    badCode: "That code didn't work. Check the latest email and try again.",
    notConnected: "Sign-in isn't connected yet on this computer. Use local testing below.",
    send2: "Continue with email",
  },
  fr: {
    google: "Continuer avec Google",
    azure: "Continuer avec Microsoft",
    apple: "Continuer avec Apple",
    or: "ou utilise n'importe quel courriel",
    emailHint: "Gmail, Outlook, Yahoo, iCloud ou toute autre adresse",
    placeholder: "toi@exemple.com",
    send: "M'envoyer un lien de connexion",
    sent: (e: string) => `On a envoyé un lien et un code à 6 chiffres à ${e}.`,
    open: "Ouvre le lien sur cet appareil, ou tape le code ici :",
    code: "Code à 6 chiffres",
    verify: "Se connecter",
    resend: "Utiliser un autre courriel",
    badCode: "Ce code n'a pas marché. Vérifie le dernier courriel et réessaie.",
    notConnected: "La connexion n'est pas encore reliée sur cet ordinateur. Utilise le test local ci-dessous.",
    send2: "Continuer avec un courriel",
  },
};

function ProviderIcon({ p }: { p: OAuthProvider }) {
  if (p === "google")
    return (
      <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden>
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
      </svg>
    );
  if (p === "azure")
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
        <path fill="#F25022" d="M1 1h10v10H1z" />
        <path fill="#7FBA00" d="M13 1h10v10H13z" />
        <path fill="#00A4EF" d="M1 13h10v10H1z" />
        <path fill="#FFB900" d="M13 13h10v10H13z" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path
        fill="currentColor"
        d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.7-1-2.7-4.1zM13.9 5c.7-.9 1.2-2 1-3.2-1 0-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.1 1.2.1 2.3-.6 3.1-1.5z"
      />
    </svg>
  );
}

export function SupabaseLogin({ url, anonKey, next, providers }: { url: string | null; anonKey: string | null; next: string; providers: OAuthProvider[] }) {
  const { lang } = useLang();
  const t = S[lang];
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  // Without Supabase keys (local development) the buttons explain instead of failing silently.
  const sb = useMemo(() => (url && anonKey ? createBrowserClient(url, anonKey) : null), [url, anonKey]);
  const redirectTo = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function oauth(provider: OAuthProvider) {
    setErr(null);
    if (!sb) return setErr(t.notConnected);
    const { error } = await sb.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirectTo(), ...(provider === "azure" ? { scopes: "email" } : {}) },
    });
    if (error) setErr(error.message);
  }

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    if (!sb) return setErr(t.notConnected);
    setBusy(true);
    setErr(null);
    const clean = email.trim().toLowerCase();
    const { error } = await sb.auth.signInWithOtp({ email: clean, options: { emailRedirectTo: redirectTo(), shouldCreateUser: true } });
    setBusy(false);
    if (error) setErr(error.message);
    else setSentTo(clean);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!sentTo || !sb) return;
    setBusy(true);
    setErr(null);
    const { error } = await sb.auth.verifyOtp({ email: sentTo, token: code.trim(), type: "email" });
    if (error) {
      setBusy(false);
      setErr(t.badCode);
      return;
    }
    await finishEmailCodeSignIn(); // create the profile and keep today's guest results
    router.replace(next.startsWith("/") ? next : "/");
    router.refresh();
  }

  return (
    <div className="col gap">
      {providers.map((p) => (
        <button key={p} className="btn oauth" onClick={() => void oauth(p)} type="button">
          <ProviderIcon p={p} />
          {t[p]}
        </button>
      ))}
      {providers.length > 0 && <div className="or-divider"><span>{t.or}</span></div>}

      {sentTo ? (
        <form className="col gap" onSubmit={verify}>
          <p style={{ margin: 0 }}>{t.sent(sentTo)}</p>
          <p className="muted small" style={{ margin: 0 }}>
            {t.open}
          </p>
          <input
            className="input code-input"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6,8}"
            maxLength={8}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder={t.code}
            aria-label={t.code}
            required
          />
          <button className="btn primary" type="submit" disabled={busy || code.length < 6}>
            {t.verify}
          </button>
          <button className="btn ghost small" type="button" onClick={() => (setSentTo(null), setCode(""))}>
            {t.resend}
          </button>
        </form>
      ) : (
        <form className="col gap" onSubmit={sendLink}>
          <input
            className="input"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.placeholder}
            aria-describedby="email-hint"
          />
          <span id="email-hint" className="muted small">
            {t.emailHint}
          </span>
          <button className="btn primary" type="submit" disabled={busy}>
            {t.send2}
          </button>
        </form>
      )}
      {err && <p className="error small">{err}</p>}
    </div>
  );
}
