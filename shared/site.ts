// The public address used in every shared link (results, story images, clan invites, 1v1).
// Set NEXT_PUBLIC_SITE_URL to the deployed address (e.g. https://dailygames.app);
// otherwise the address the page was opened from is used.

export function siteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (env) return env;
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3000";
}

export function absolute(path: string): string {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Share text and a link with the device share sheet when available, else copy to the clipboard. */
export async function shareOrCopy(text: string, url: string): Promise<"shared" | "copied" | "failed"> {
  try {
    if (navigator.share) {
      await navigator.share({ text, url });
      return "shared";
    }
  } catch (err) {
    if ((err as Error).name === "AbortError") return "failed";
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    return "copied";
  } catch {
    return "failed";
  }
}
