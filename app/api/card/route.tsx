import { ImageResponse } from "next/og";
import { METAS, ORDERED_METAS } from "@/games/metas";
import { isGameId, type Lang } from "@/shared/game";

// 1080x1920 story card. Spoiler-free: game, score, percentile, streak, link.
//   /api/card?game=word&score=4/6&pct=87&streak=12&day=2026-11-14&lang=en
//   /api/card?summary=word:87,country:64,...&total=71&streak=12&day=...&lang=en
//   /api/card?game=rare&rare=Orecchiette&tier=legend ... (a top Rare Answers result)

const L = {
  en: { pct: "percentile", streak: "day streak", total: "Daily total", site: "Daily Games", rare: "One in a million", deep: "Deep cut" },
  fr: { pct: "centile", streak: "jours de série", total: "Total du jour", site: "Jeux du jour", rare: "Une sur un million", deep: "Pointu" },
};

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const lang: Lang = q.get("lang") === "fr" ? "fr" : "en";
  const t = L[lang];
  const day = (q.get("day") ?? "").slice(0, 10);
  const streak = Number(q.get("streak") ?? 0) || 0;
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/^https?:\/\//, "") || t.site;
  const clip = (s: string | null, n = 40) => (s ?? "").slice(0, n);

  const summary = q.get("summary");
  const game = q.get("game") ?? "";
  const meta = isGameId(game) ? METAS[game] : null;
  const accent = meta?.color ?? "#1d1b22";

  let middle: React.ReactNode;
  if (summary) {
    const parts = new Map(
      summary.split(",").map((p) => {
        const [g, v] = p.split(":");
        return [g, Number(v)];
      }),
    );
    middle = (
      <div style={{ display: "flex", flexDirection: "column", gap: 28, width: "100%" }}>
        <div style={{ fontSize: 64, opacity: 0.7 }}>{t.total}</div>
        <div style={{ fontSize: 220, fontWeight: 800, lineHeight: 1 }}>{clip(q.get("total"), 5)}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 40 }}>
          {ORDERED_METAS.map((m) => {
            const v = parts.get(m.id);
            return (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <div style={{ width: 90, height: 90, borderRadius: 24, background: m.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>
                  {m.icon}
                </div>
                <div style={{ fontSize: 52, flex: 1 }}>{m.name[lang]}</div>
                <div style={{ fontSize: 60, fontWeight: 800 }}>{v !== undefined && !Number.isNaN(v) ? Math.round(v) : "—"}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  } else {
    const rare = q.get("rare");
    middle = (
      <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ width: 140, height: 140, borderRadius: 36, background: accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80 }}>
            {meta?.icon ?? "?"}
          </div>
          <div style={{ fontSize: 76, fontWeight: 800 }}>{meta?.name[lang] ?? t.site}</div>
        </div>
        {rare ? (
          <>
            <div style={{ fontSize: 64, marginTop: 80, opacity: 0.8 }}>{q.get("tier") === "legend" ? t.rare : t.deep}</div>
            <div style={{ fontSize: 150, fontWeight: 800, lineHeight: 1.05 }}>{clip(rare, 28)}</div>
          </>
        ) : (
          <div style={{ fontSize: 180, fontWeight: 800, marginTop: 80, lineHeight: 1 }}>{clip(q.get("score"), 16)}</div>
        )}
        {q.get("pct") && (
          <div style={{ fontSize: 72, marginTop: 30 }}>
            {Math.round(Number(q.get("pct")))} <span style={{ opacity: 0.6, marginLeft: 16 }}>{t.pct}</span>
          </div>
        )}
      </div>
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1920,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 100,
          background: "#f5f1e8",
          color: "#1d1b22",
          fontFamily: "sans-serif",
          borderTop: `40px solid ${accent}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 44, opacity: 0.7 }}>
          <span>{t.site}</span>
          <span>{day}</span>
        </div>
        {middle}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {streak > 0 && (
            <div style={{ fontSize: 64 }}>
              🔥 {streak} {t.streak}
            </div>
          )}
          <div style={{ fontSize: 48, opacity: 0.7 }}>{site}</div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920 },
  );
}
