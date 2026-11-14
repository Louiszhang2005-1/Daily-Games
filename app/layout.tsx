import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { getLang } from "@/shared/lang-server";
import { dict } from "@/shared/i18n";
import { LangProvider, LangSwitch } from "@/shared/ui/lang";
import { HeaderNav } from "@/shared/ui/HeaderNav";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", weight: ["500", "700", "800"] });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Daily Games",
  description: "Five short daily games, ranked against everyone who played today.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f1e8" },
    { media: "(prefers-color-scheme: dark)", color: "#16151a" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  const t = dict(lang);
  return (
    <html lang={lang} className={`${display.variable} ${body.variable}`}>
      <body>
        <LangProvider lang={lang}>
          <header className="site-header">
            <Link href="/" className="logo">
              <span className="logo-mark" aria-hidden>
                <i />
                <i />
                <i />
                <i />
                <i />
              </span>
              {t.siteName}
            </Link>
            <nav className="row gap">
              <HeaderNav />
              <LangSwitch />
            </nav>
          </header>
          <main className="container">{children}</main>
        </LangProvider>
      </body>
    </html>
  );
}
