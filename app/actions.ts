"use server";

import { cookies } from "next/headers";

export async function setLang(lang: "en" | "fr") {
  (await cookies()).set("lang", lang === "fr" ? "fr" : "en", { path: "/", maxAge: 60 * 60 * 24 * 400, sameSite: "lax" });
}
