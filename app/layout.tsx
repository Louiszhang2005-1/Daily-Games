import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Archivo } from "next/font/google";
import { getLang } from "@/shared/lang-server";
import { dict } from "@/shared/i18n";
import { LangProvider, LangSwitch } from "@/shared/ui/lang";
import { HeaderNav } from "@/shared/ui/HeaderNav";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", axes: ["wdth"] });

export const metadata: Metadata = {
  title: "Daily Games",
  description: "Five short daily games, ranked against everyone who played today.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef1f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1324" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  const t = dict(lang);
  return (
    <html lang={lang} className={archivo.variable}>
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
            <nav>
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
