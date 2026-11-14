import type { GameId } from "../game";

// One drawn mark per game, in currentColor (white on the game's colour panel).
export function GameMark({ game, title }: { game: GameId; title?: string }) {
  const common = { viewBox: "0 0 96 96", fill: "none", role: "img", "aria-label": title, "aria-hidden": title ? undefined : true } as const;
  switch (game) {
    case "word":
      // Three letter tiles; the middle one is "right spot".
      return (
        <svg {...common}>
          <rect x="4" y="30" width="26" height="30" rx="5" stroke="currentColor" strokeWidth="4" />
          <rect x="35" y="26" width="26" height="34" rx="5" fill="currentColor" />
          <rect x="66" y="30" width="26" height="30" rx="5" stroke="currentColor" strokeWidth="4" />
          <path d="M42 50l6-16 6 16M44.5 45h7" stroke="var(--gc, #4e9f5d)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="35" y="64" width="26" height="5" rx="2.5" fill="currentColor" opacity=".45" />
        </svg>
      );
    case "country":
      // Globe with a meridian, the equator and a pin.
      return (
        <svg {...common}>
          <circle cx="44" cy="50" r="32" stroke="currentColor" strokeWidth="4" />
          <ellipse cx="44" cy="50" rx="13" ry="32" stroke="currentColor" strokeWidth="3.5" />
          <path d="M12 50h64M17 34h54M17 66h54" stroke="currentColor" strokeWidth="3" opacity=".7" />
          <path d="M74 8c-8 0-14 6-14 13.5C60 31 74 44 74 44s14-13 14-22.5C88 14 82 8 74 8z" fill="currentColor" />
          <circle cx="74" cy="21" r="5" fill="var(--gc, #2d6cdf)" />
        </svg>
      );
    case "crossword":
      // A mini grid with two black squares.
      return (
        <svg {...common}>
          <rect x="10" y="10" width="76" height="76" rx="8" stroke="currentColor" strokeWidth="4" />
          <path d="M35.3 10v76M60.6 10v76M10 35.3h76M10 60.6h76" stroke="currentColor" strokeWidth="3" />
          <rect x="12" y="12" width="21.3" height="21.3" fill="currentColor" />
          <rect x="62.6" y="62.6" width="21.4" height="21.4" fill="currentColor" />
          <path d="M42 26l5-10 5 10M43.6 22.5h6.8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "rare":
      // Waves at the surface, a line diving down to a single bright find.
      return (
        <svg {...common}>
          <path d="M6 18c7-6 13-6 20 0s13 6 20 0 13-6 20 0 13 6 20 0" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity=".6" />
          <path d="M6 32c7-5 13-5 20 0s13 5 20 0 13-5 20 0 13 5 20 0" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity=".35" />
          <path d="M48 30v34" stroke="currentColor" strokeWidth="3" strokeDasharray="4 6" strokeLinecap="round" />
          <path d="M48 64l6 12 13 2-9.5 9 2.3 13-11.8-6.2L36.2 100l2.3-13-9.5-9 13-2z" transform="translate(0 -14) scale(1)" fill="currentColor" />
        </svg>
      );
    case "common":
      // Answer board: bars climbing to the top answer.
      return (
        <svg {...common}>
          <rect x="10" y="58" width="18" height="28" rx="4" fill="currentColor" opacity=".55" />
          <rect x="39" y="38" width="18" height="48" rx="4" fill="currentColor" opacity=".8" />
          <rect x="68" y="16" width="18" height="70" rx="4" fill="currentColor" />
          <path d="M14 42l20-14 14 8 26-24" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M64 12h10v10" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}
