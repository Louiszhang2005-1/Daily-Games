"use client";

import { createContext, useContext, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLang } from "@/app/actions";
import { dict, type Dict } from "../i18n";
import type { Lang } from "../game";

const LangContext = createContext<Lang>("en");

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useLang(): { lang: Lang; t: Dict } {
  const lang = useContext(LangContext);
  return { lang, t: dict(lang) };
}

export function LangSwitch() {
  const { lang } = useLang();
  const router = useRouter();
  const [pending, start] = useTransition();
  const next: Lang = lang === "en" ? "fr" : "en";
  return (
    <button
      className="btn ghost small"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await setLang(next);
          router.refresh();
        })
      }
      aria-label={next === "fr" ? "Passer en français" : "Switch to English"}
    >
      {next === "fr" ? "FR" : "EN"}
    </button>
  );
}
