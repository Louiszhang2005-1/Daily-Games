import type { Lang } from "../game";
import type { Decor, SceneConfig } from "./Expedition";
import { BALLOON, BIRD, BOAT, CLOUD, FISH, FISH_DARK, GLOWFISH, HOUSE, JELLY, PEAK, Pixel, PLANE, SUB, SUN, TREE, WEED, WHALE } from "./sprites";

// Two worlds. Solid colour zones only. Facts are real and written for this game.

const P = (sp: { rows: string[]; palette: Record<string, string> }, size = 4, flip = false) => <Pixel rows={sp.rows} palette={sp.palette} size={size} flip={flip} />;

const DIVE_DECOR: Decor[] = [
  { at: -150, x: "82%", node: P(SUN, 5) },
  { at: -175, x: "22%", node: P(CLOUD, 5), drift: "float" },
  { at: -110, x: "58%", node: P(CLOUD, 4), drift: "float" },
  { at: -16, x: "64%", node: P(BOAT, 4) },
  { at: 40, x: "74%", node: P(FISH, 4), drift: "swim" },
  { at: 55, x: "80%", node: P(FISH, 3), drift: "swim" },
  { at: 130, x: "34%", node: P(FISH, 4, true), drift: "swim" },
  { at: 470, x: "68%", node: P(WHALE, 5), drift: "swim" },
  { at: 850, x: "28%", node: P(FISH_DARK, 4), drift: "swim" },
  { at: 1400, x: "72%", node: P(JELLY, 4), drift: "float" },
  { at: 2600, x: "36%", node: P(JELLY, 3), drift: "float" },
  { at: 3600, x: "64%", node: P(GLOWFISH, 5, true), drift: "swim" },
  { at: 7200, x: "30%", node: P(GLOWFISH, 4), drift: "swim" },
  { at: 10_700, x: "18%", node: P(WEED, 5) },
  { at: 10_750, x: "24%", node: P(WEED, 4) },
  { at: 10_700, x: "78%", node: P(WEED, 5) },
];

const CLIMB_DECOR: Decor[] = [
  { at: -34, x: "10%", node: P(TREE, 5) },
  { at: -30, x: "24%", node: P(TREE, 4) },
  { at: -32, x: "76%", node: P(HOUSE, 5) },
  { at: -34, x: "90%", node: P(TREE, 5) },
  { at: 140, x: "70%", node: P(BIRD, 4), drift: "float" },
  { at: 420, x: "30%", node: P(BIRD, 3, true), drift: "float" },
  { at: 1500, x: "70%", node: P(CLOUD, 6), drift: "float" },
  { at: 2200, x: "24%", node: P(CLOUD, 5), drift: "float" },
  { at: 2900, x: "58%", node: P(CLOUD, 4), drift: "float" },
  { at: 4808, x: "74%", node: P(PEAK, 6) },
  { at: 8849, x: "30%", node: P(PEAK, 7) },
  { at: 10_000, x: "66%", node: P(PLANE, 5), drift: "float" },
];

export function diveScene(lang: Lang): SceneConfig {
  const fr = lang === "fr";
  return {
    mode: "dive",
    maxMeters: 10_935,
    metersPerPoint: 15.6, // a perfect 700 reaches the deepest point on Earth
    edge: { color: "#bfe3f5", label: fr ? "Surface" : "Surface" },
    mascot: P(SUB, 4),
    decor: DIVE_DECOR,
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
    mascot: P(BALLOON, 5),
    decor: CLIMB_DECOR,
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
