import type { Lang } from "../game";
import type { SceneConfig } from "./Expedition";

// Two worlds. Solid colour zones only. Facts are real and written for this game.

const Sub = () => (
  <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden>
    <rect x="30" y="8" width="6" height="12" rx="2" fill="#1b2140" />
    <rect x="26" y="6" width="14" height="5" rx="2.5" fill="#1b2140" />
    <ellipse cx="32" cy="36" rx="24" ry="14" fill="#f2c94c" stroke="#1b2140" strokeWidth="3" />
    <rect x="22" y="18" width="18" height="10" rx="4" fill="#f2c94c" stroke="#1b2140" strokeWidth="3" />
    <circle cx="24" cy="36" r="5" fill="#bfe3f5" stroke="#1b2140" strokeWidth="2.5" />
    <circle cx="38" cy="36" r="5" fill="#bfe3f5" stroke="#1b2140" strokeWidth="2.5" />
    <path d="M56 32l6-5v18l-6-5" fill="#1b2140" />
    <circle cx="10" cy="20" r="2.5" fill="none" stroke="#fff" strokeWidth="1.5" opacity=".8" />
    <circle cx="6" cy="12" r="1.8" fill="none" stroke="#fff" strokeWidth="1.5" opacity=".6" />
  </svg>
);

const Balloon = () => (
  <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden>
    <path d="M32 4c-13 0-22 9-22 21 0 10 8 17 14 22h16c6-5 14-12 14-22C54 13 45 4 32 4z" fill="#e5533d" stroke="#1b2140" strokeWidth="3" />
    <path d="M32 4c-6 4-8 12-8 21s3 16 4 22M32 4c6 4 8 12 8 21s-3 16-4 22" fill="none" stroke="#fff" strokeWidth="2.5" opacity=".9" />
    <path d="M26 47l2 7M38 47l-2 7" stroke="#1b2140" strokeWidth="2.5" />
    <rect x="25" y="53" width="14" height="9" rx="2" fill="#c98d1f" stroke="#1b2140" strokeWidth="2.5" />
  </svg>
);

export function diveScene(lang: Lang): SceneConfig {
  const fr = lang === "fr";
  return {
    mode: "dive",
    maxMeters: 10_935,
    metersPerPoint: 15.6, // a perfect 700 reaches the deepest point on Earth
    edge: { color: "#bfe3f5", label: fr ? "Surface" : "Surface" },
    mascot: <Sub />,
    zones: [
      { from: 0, to: 200, name: fr ? "Zone ensoleillée" : "Sunlit zone", color: "#3fa7d6" },
      { from: 200, to: 1000, name: fr ? "Zone crépusculaire" : "Twilight zone", color: "#2276b5" },
      { from: 1000, to: 4000, name: fr ? "Zone de minuit" : "Midnight zone", color: "#134a86" },
      { from: 4000, to: 6000, name: fr ? "Plaine abyssale" : "Abyssal plain", color: "#0c2f5e" },
      { from: 6000, to: 10_935, name: fr ? "Fosses" : "Trenches", color: "#071a38" },
    ],
    facts: fr
      ? [
          { at: 100, text: "Les récifs coralliens restent presque tous au-dessus d'ici" },
          { at: 600, text: "Il ne reste qu'un faible reflet bleu" },
          { at: 1500, text: "Les éléphants de mer plongent à peu près jusqu'ici" },
          { at: 2990, text: "Record de plongée d'un mammifère : une baleine à bec" },
          { at: 5000, text: "L'eau est à environ 2 °C" },
          { at: 8300, text: "Le poisson le plus profond jamais filmé, un poisson-limace" },
          { at: 10_935, text: "Challenger Deep, le point le plus bas de la Terre" },
        ]
      : [
          { at: 100, text: "Nearly all coral reefs live above this line" },
          { at: 600, text: "Only a faint blue glow is left" },
          { at: 1500, text: "Elephant seals dive about this deep" },
          { at: 2990, text: "Deepest dive by a mammal: a beaked whale" },
          { at: 5000, text: "The water is about 2 °C" },
          { at: 8300, text: "Deepest fish ever filmed, a snailfish" },
          { at: 10_935, text: "Challenger Deep, the lowest point on Earth" },
        ],
  };
}

export function climbScene(lang: Lang): SceneConfig {
  const fr = lang === "fr";
  return {
    mode: "climb",
    maxMeters: 10_500,
    metersPerPoint: 15, // a perfect 700 reaches cruising altitude
    edge: { color: "#5aa94f", label: fr ? "Sol" : "Ground" },
    mascot: <Balloon />,
    zones: [
      { from: 0, to: 1000, name: fr ? "Au-dessus des toits" : "Over the rooftops", color: "#9fd6f2" },
      { from: 1000, to: 3000, name: fr ? "Dans les nuages" : "In the clouds", color: "#7cc3ea" },
      { from: 3000, to: 6000, name: fr ? "Haute montagne" : "Mountain air", color: "#5aa7dc" },
      { from: 6000, to: 9000, name: fr ? "Ciel profond" : "Thin air", color: "#3a83c8" },
      { from: 9000, to: 10_500, name: fr ? "Altitude de croisière" : "Cruising altitude", color: "#2563a8" },
    ],
    facts: fr
      ? [
          { at: 330, text: "Hauteur de la tour Eiffel" },
          { at: 828, text: "Le plus haut gratte-ciel du monde" },
          { at: 2000, text: "Base habituelle des cumulus" },
          { at: 4808, text: "Sommet du mont Blanc" },
          { at: 8849, text: "Sommet de l'Everest" },
          { at: 10_000, text: "Les avions de ligne volent par ici" },
        ]
      : [
          { at: 330, text: "Height of the Eiffel Tower" },
          { at: 828, text: "The world's tallest building" },
          { at: 2000, text: "Where puffy cumulus clouds usually start" },
          { at: 4808, text: "Top of Mont Blanc" },
          { at: 8849, text: "Top of Everest" },
          { at: 10_000, text: "Airliners cruise around here" },
        ],
  };
}
