"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useLang } from "@/shared/ui/lang";

const S = {
  en: { google: "Continue with Google", email: "Email me a sign-in link", sent: "Check your inbox for the link.", placeholder: "you@example.com", or: "or" },
  fr: { google: "Continuer avec Google", email: "M'envoyer un lien de connexion", sent: "Regarde ta boîte mail pour le lien.", placeholder: "toi@exemple.com", or: "ou" },
};

export function SupabaseLogin({ url, anonKey, next }: { url: string; anonKey: string; next: string }) {
  const { lang } = useLang();
  const t = S[lang];
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const sb = createBrowserClient(url, anonKey);
  const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` : undefined;

  return (
    <div className="col gap">
      <button className="btn primary" onClick={() => sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo } })}>
        {t.google}
      </button>
      <p className="muted small center" style={{ margin: 0 }}>
        {t.or}
      </p>
      {sent ? (
        <p>{t.sent}</p>
      ) : (
        <form
          className="col gap"
          onSubmit={async (e) => {
            e.preventDefault();
            const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
            if (error) setErr(error.message);
            else setSent(true);
          }}
        >
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.placeholder} />
          <button className="btn ghost" type="submit">
            {t.email}
          </button>
        </form>
      )}
      {err && <p className="error small">{err}</p>}
    </div>
  );
}
