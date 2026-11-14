// Original pixel sprites, drawn as character grids. Each character maps to a colour;
// "." is transparent. Rendered as crisp SVG rectangles.

type Palette = Record<string, string>;

export function Pixel({ rows, palette, size = 4, flip = false, title }: { rows: string[]; palette: Palette; size?: number; flip?: boolean; title?: string }) {
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  const rects: React.ReactNode[] = [];
  rows.forEach((row, y) =>
    row.split("").forEach((ch, x) => {
      const fill = palette[ch];
      if (fill) rects.push(<rect key={`${x}-${y}`} x={flip ? w - 1 - x : x} y={y} width={1.02} height={1.02} fill={fill} />);
    }),
  );
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w * size}
      height={h * size}
      shapeRendering="crispEdges"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={{ display: "block" }}
    >
      {rects}
    </svg>
  );
}

const INK = "#1b2140";

// ---- Dive -------------------------------------------------------------------

export const SUB = {
  rows: [
    "......KK........",
    "......KK........",
    ".....KYYK.......",
    "....KYYYYK......",
    "..KKYYYYYYKKK...",
    ".KYYWWYYWWYYYK.K",
    "KYYYWBYYWBYYYYKK",
    "KYYYYYYYYYYYYYKK",
    ".KYYYYYYYYYYYK.K",
    "..KKKKKKKKKKK...",
  ],
  palette: { K: INK, Y: "#f2c94c", W: "#bfe3f5", B: "#5aa7dc" },
};

export const BOAT = {
  rows: [
    "......R.........",
    "......RR........",
    "......K.........",
    "....KKKKK.......",
    "....KWWWK.......",
    ".KKKKKKKKKKKKK..",
    "KRRRRRRRRRRRRRRK",
    ".KRRRRRRRRRRRRK.",
    "..KKKKKKKKKKKK..",
  ],
  palette: { K: INK, R: "#e5533d", W: "#bfe3f5" },
};

export const SUN = {
  rows: ["..YYYYY..", ".YYYYYYY.", "YYYYYYYYY", "YYYYYYYYY", "YYYYYYYYY", "YYYYYYYYY", "YYYYYYYYY", ".YYYYYYY.", "..YYYYY.."],
  palette: { Y: "#ffe08a" },
};

export const CLOUD = {
  rows: ["....WWWW........", "..WWWWWWWW..WW..", ".WWWWWWWWWWWWWW.", "WWWWWWWWWWWWWWWW", ".SSSSSSSSSSSSSS."],
  palette: { W: "#ffffff", S: "#dbeef8" },
};

export const FISH = {
  rows: ["..FFF...F", ".FFFFF.FF", "FEFFFFFFF", ".FFFFF.FF", "..FFF...F"],
  palette: { F: "#ffb347", E: INK },
};

export const FISH_DARK = {
  rows: FISH.rows,
  palette: { F: "#0d2a52", E: "#0d2a52" },
};

export const WHALE = {
  rows: [
    ".......GGGGGGGG.........",
    "....GGGGGGGGGGGGGG....G.",
    "..GGGGGGGGGGGGGGGGGG.GG.",
    ".GEGGGGGGGGGGGGGGGGGGGG.",
    "GGGGGGGGGGGGGGGGGGGGGGG.",
    "LLLLLLLLLLLLLLLLLGGG..GG",
    ".LLLLLLLLLLLLLLGG......G",
  ],
  palette: { G: "#1d5f99", L: "#7fb6dd", E: INK },
};

export const JELLY = {
  rows: ["..PPPP..", ".PPPPPP.", "PPWPPWPP", "PPPPPPPP", ".P.P.P.P", "P.P.P.P.", ".P.P.P.P", "P...P..."],
  palette: { P: "#e79ad6", W: "#ffffff" },
};

export const GLOWFISH = {
  rows: ["......Y.", ".....K..", "..KKKK..", ".KKKKKK.", "KWKKKKKK", "KKKKKKKK", ".KTTTKK.", "..KKKK.K"],
  palette: { K: "#0b1d3d", Y: "#ffe066", W: "#ffffff", T: "#e8eef7" },
};

export const WEED = {
  rows: [".G..", "..G.", ".G..", "G...", ".G..", "..G.", ".G..", "G..G", ".GG.", ".G..", "..G.", ".GG."],
  palette: { G: "#2f8f6b" },
};

export const BUBBLES = {
  rows: [".W..", "W.W.", ".W..", "....", "..W.", ".W.W", "..W."],
  palette: { W: "#ffffff" },
};

// ---- Climb ------------------------------------------------------------------

export const BALLOON = {
  rows: [
    "...RRRRRR...",
    ".RRWWRRWWRR.",
    "RRRWWRRWWRRR",
    "RRRWWRRWWRRR",
    "RRRWWRRWWRRR",
    ".RRWWRRWWRR.",
    "..RRWRRWRR..",
    "...RRRRRR...",
    "....K..K....",
    "....K..K....",
    "....BBBB....",
    "....BBBB....",
  ],
  palette: { R: "#e5533d", W: "#fff1e6", K: INK, B: "#c98d1f" },
};

export const TREE = {
  rows: ["...GGG...", "..GGGGG..", ".GGGGGGG.", "GGGGGGGGG", ".GGGGGGG.", "GGGGGGGGG", ".GGGGGGG.", "...TTT...", "...TTT...", "...TTT..."],
  palette: { G: "#3f8f3a", T: "#7a5230" },
};

export const HOUSE = {
  rows: ["....RR....", "...RRRR...", "..RRRRRR..", ".RRRRRRRR.", "RRRRRRRRRR", ".WWWWWWWW.", ".WBWWWWBW.", ".WWWDDWWW.", ".WWWDDWWW."],
  palette: { R: "#c0392b", W: "#f4ead5", B: "#5aa7dc", D: "#7a5230" },
};

export const BIRD = {
  rows: ["K.....K", ".K...K.", "..K.K..", "...K..."],
  palette: { K: INK },
};

export const PEAK = {
  rows: [
    "........WW........",
    ".......WWWW.......",
    "......WWSWWW......",
    ".....SSSSSSSS.....",
    "....SSSSSSSSSS....",
    "...SSSSSSSSSSSS...",
    "..SSSSSSSSSSSSSS..",
    ".SSSSSSSSSSSSSSSS.",
    "SSSSSSSSSSSSSSSSSS",
  ],
  palette: { W: "#ffffff", S: "#6b7a99" },
};

export const PLANE = {
  rows: ["......WW......", "....WWWWW....W", "WWWWWWWWWWWWWW", ".BBBBBBBBBBBW.", "....WWWWW.....", "......WW......"],
  palette: { W: "#ffffff", B: "#5aa7dc" },
};
