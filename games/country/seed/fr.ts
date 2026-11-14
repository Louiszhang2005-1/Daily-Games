import type { CountryPuzzle } from "../logic";

// 10 puzzles de test écrits en français (pas des traductions mot à mot).
// Règles : réduire à une poignée de pays, jamais un seul ; ne jamais nommer le pays,
// sa capitale ou son drapeau ; du plus vague au plus précis dans chaque catégorie.
export const SEED_FR: CountryPuzzle[] = [
  {
    answer: "JPN",
    free: "geography",
    clues: {
      history: ["Sa constitution actuelle est entrée en vigueur en 1947.", "Pendant environ deux siècles, il a fortement limité le commerce avec l'étranger."],
      geography: ["Un pays insulaire sans frontière terrestre, dans l'hémisphère Nord."],
      climate: ["Quatre saisons bien marquées, avec une saison des pluies au début de l'été."],
      landmarks: ["Un château blanc du XVIIe siècle surnommé d'après un héron."],
    },
  },
  {
    answer: "BRA",
    free: "climate",
    clues: {
      history: ["A été la colonie d'un royaume européen pendant plus de 300 ans.", "Est devenu une république en 1889 après des décennies d'empire."],
      geography: ["Partage une frontière avec 10 pays."],
      climate: ["La majeure partie de son territoire est sous les tropiques."],
      landmarks: ["Partage avec un voisin un ensemble d'environ 275 chutes d'eau."],
    },
  },
  {
    answer: "CAN",
    free: "climate",
    clues: {
      history: ["A obtenu le plein contrôle de sa constitution en 1982.", "Compte deux langues officielles au niveau fédéral."],
      geography: ["Est bordé par trois océans différents."],
      climate: ["Une grande partie de son extrême nord repose sur du pergélisol."],
      landmarks: ["Des rochers sculptés par certaines des plus fortes marées du monde."],
    },
  },
  {
    answer: "EGY",
    free: "geography",
    clues: {
      history: ["Est resté sous influence britannique jusqu'au milieu du XXe siècle.", "Est devenu une république en 1953."],
      geography: ["Son territoire s'étend sur deux continents."],
      climate: ["Environ 95 % du territoire est désertique."],
      landmarks: ["Un temple vieux de 3 000 ans déplacé bloc par bloc dans les années 1960 pour échapper à un lac."],
    },
  },
  {
    answer: "NOR",
    free: "climate",
    clues: {
      history: ["A quitté une union avec un voisin en 1905.", "A voté deux fois contre l'adhésion à l'Union européenne."],
      geography: ["En comptant chaque baie, son littoral est parmi les plus longs du monde."],
      climate: ["Certaines régions voient le soleil de minuit en été."],
      landmarks: ["Un plateau rocheux en forme de chaire, 600 m au-dessus d'un fjord."],
    },
  },
  {
    answer: "MEX",
    free: "history",
    clues: {
      history: ["A obtenu son indépendance en 1821.", "A perdu environ la moitié de son territoire lors d'une guerre au XIXe siècle."],
      geography: ["Partage une frontière avec 3 pays."],
      climate: ["Le tropique du Cancer le traverse en son milieu."],
      landmarks: ["Des gouffres naturels appelés cenotes, remplis d'eau douce."],
    },
  },
  {
    answer: "KEN",
    free: "history",
    clues: {
      history: ["A obtenu son indépendance en 1963.", "Son premier président est resté au pouvoir jusqu'à sa mort en 1978."],
      geography: ["Traversé par l'équateur, avec une côte sur l'océan Indien."],
      climate: ["Ses hauts plateaux restent doux toute l'année malgré l'équateur."],
      landmarks: ["Un lac célèbre pour ses immenses colonies de flamants roses."],
    },
  },
  {
    answer: "VNM",
    free: "geography",
    clues: {
      history: ["A fait partie d'une fédération coloniale française en Asie du Sud-Est.", "A été réunifié en 1976 après des décennies de guerre."],
      geography: ["Long et étroit, avec plus de 3 000 km de côtes."],
      climate: ["Son nord connaît un hiver frais alors que son sud reste chaud toute l'année."],
      landmarks: ["Une baie aux près de 2 000 îlots calcaires qui sortent de la mer."],
    },
  },
  {
    answer: "PER",
    free: "geography",
    clues: {
      history: ["A proclamé son indépendance de l'Espagne en 1821.", "Était le cœur d'un vaste empire andin au XVe siècle."],
      geography: ["Partage une frontière avec 5 pays et a une côte sur le Pacifique."],
      climate: ["Son désert côtier ne reçoit presque pas de pluie à cause d'un courant océanique froid."],
      landmarks: ["D'immenses lignes et figures d'animaux tracées dans le désert, visibles du ciel."],
    },
  },
  {
    answer: "NZL",
    free: "climate",
    clues: {
      history: ["Un traité signé en 1840 est considéré comme son texte fondateur.", "En 1893, il est devenu le premier territoire autonome où les femmes pouvaient voter."],
      geography: ["Aucune frontière terrestre : deux îles principales et des centaines de petites."],
      climate: ["Sa météo change vite, sans grande masse continentale proche pour la protéger de l'océan."],
      landmarks: ["Des grottes éclairées par des milliers d'insectes lumineux."],
    },
  },
];
