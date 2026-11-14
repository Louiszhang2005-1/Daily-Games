import { ImageResponse } from "next/og";
import { METAS } from "@/games/metas";
import { isGameId, type Lang } from "@/shared/game";

// 1200x630 link-preview image for shared links (games, clan invites, 1v1 challenges).
//   /api/og?game=word&lang=en
//   /api/og?title=Sam%20challenged%20you&sub=...
// Satori needs display:flex on elements with more than one child.

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const lang: Lang = q.get("lang") === "fr" ? "fr" : "en";
  const game = q.get("game") ?? "";
  const meta = isGameId(game) ? METAS[game] : null;
  const site = lang === "fr" ? "Jeux du jour" : "Daily Games";
  const title = (q.get("title") ?? meta?.name[lang] ?? site).slice(0, 60);
  const sub = (q.get("sub") ?? meta?.tagline[lang] ?? (lang === "fr" ? "Cinq petits jeux chaque jour." : "Five short games every day.")).slice(0, 110);
  const color = meta?.color ?? "#1b2140";

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: 1200, height: 630, background: "#ffffff", color: "#1b2140" }}>
        <div style={{ display: "flex", width: 330, background: color, alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              width: 170,
              height: 170,
              borderRadius: 40,
              background: "rgba(255,255,255,0.18)",
              alignItems: "center",
              justifyContent: "center",
              color: game === "crossword" ? "#1b2140" : "#ffffff",
              fontSize: 110,
              fontWeight: 800,
            }}
          >
            {(meta?.name.en ?? "D").charAt(0)}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 70px", flex: 1, gap: 22 }}>
          <div style={{ display: "flex", fontSize: 30, color: "#6b7391" }}>{site}</div>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>{title}</div>
          <div style={{ display: "flex", fontSize: 34, color: "#4a5272", lineHeight: 1.3 }}>{sub}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
