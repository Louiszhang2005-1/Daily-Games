import type { GameId } from "../game";
import { BALLOON, BIRD, BOAT, CLOUD, FISH, HOUSE, JELLY, Pixel, SUB, SUN, TREE, WEED, WHALE } from "../prompts/sprites";
import s from "./thumbs.module.css";

// Hub previews: a small, real picture of each game's world, not an abstract icon.

type Sprite = { rows: string[]; palette: Record<string, string> };
const at = (sp: Sprite, size: number, style: React.CSSProperties, flip = false) => (
  <span className={s.sprite} style={style}>
    <Pixel rows={sp.rows} palette={sp.palette} size={size} flip={flip} />
  </span>
);

function WordThumb() {
  const rows = [
    ["C", "R", "A", "N", "E"],
    ["S", "L", "A", "T", "E"],
    ["P", "L", "A", "N", "T"],
  ];
  const marks = [
    ["a", "a", "c", "p", "a"],
    ["a", "p", "c", "a", "a"],
    ["c", "c", "c", "c", "c"],
  ];
  return (
    <div className={`${s.thumb} ${s.word}`}>
      <div className={s.wordGrid}>
        {rows.map((r, i) =>
          r.map((ch, j) => (
            <span key={`${i}${j}`} className={`${s.tile} ${s[marks[i][j]]}`}>
              {ch}
            </span>
          )),
        )}
      </div>
    </div>
  );
}

function CountryThumb({ outline }: { outline: string | null }) {
  return (
    <div className={`${s.thumb} ${s.country}`}>
      <svg viewBox="0 0 300 300" className={s.globe} aria-hidden>
        <circle cx="150" cy="150" r="140" className={s.sea} />
        <path d="M10 150h280M150 10v280M40 80h220M40 220h220" className={s.grid} />
        <ellipse cx="150" cy="150" rx="70" ry="140" className={s.grid} />
      </svg>
      {outline && (
        <svg viewBox="0 0 300 300" className={s.shape} aria-hidden>
          <path d={outline} />
        </svg>
      )}
      <span className={s.pin}>
        <b>?</b>
      </span>
    </div>
  );
}

function CrosswordThumb() {
  const g = ["#CAT#", "HOUSE", "ALIEN", "TONES", "#WEST"];
  return (
    <div className={`${s.thumb} ${s.cross}`}>
      <div className={s.crossGrid}>
        {g.join("").split("").map((ch, i) =>
          ch === "#" ? <span key={i} className={s.black} /> : <span key={i} className={`${s.cell} ${i >= 5 && i < 10 ? s.hl : ""} ${i === 7 ? s.sel : ""}`}>{i < 15 ? ch : ""}</span>,
        )}
      </div>
    </div>
  );
}

function RareThumb() {
  return (
    <div className={`${s.thumb} ${s.rare}`}>
      <span className={s.sky} />
      <span className={s.sea1} />
      <span className={s.sea2} />
      <span className={s.sea3} />
      {at(SUN, 3, { right: "10%", top: "6%" })}
      {at(CLOUD, 3, { left: "8%", top: "10%" })}
      {at(BOAT, 3, { left: "54%", top: "21%" })}
      {at(FISH, 3, { left: "72%", top: "44%" })}
      {at(SUB, 4, { left: "26%", top: "52%" })}
      {at(WHALE, 3, { left: "58%", top: "62%" })}
      {at(JELLY, 3, { left: "12%", top: "78%" })}
      {at(WEED, 3, { right: "6%", bottom: "0" })}
    </div>
  );
}

function CommonThumb() {
  return (
    <div className={`${s.thumb} ${s.common}`}>
      <span className={s.grass} />
      {at(CLOUD, 4, { left: "56%", top: "12%" })}
      {at(CLOUD, 3, { left: "10%", top: "30%" })}
      {at(BIRD, 3, { left: "40%", top: "16%" })}
      {at(BALLOON, 4, { left: "26%", top: "22%" })}
      {at(TREE, 4, { left: "6%", bottom: "14%" })}
      {at(HOUSE, 4, { left: "64%", bottom: "14%" })}
      {at(TREE, 3, { right: "6%", bottom: "14%" })}
    </div>
  );
}

export function GameThumb({ game, outline }: { game: GameId; outline?: string | null }) {
  switch (game) {
    case "word":
      return <WordThumb />;
    case "country":
      return <CountryThumb outline={outline ?? null} />;
    case "crossword":
      return <CrosswordThumb />;
    case "rare":
      return <RareThumb />;
    case "common":
      return <CommonThumb />;
  }
}
