import type { Lang } from "./game";

// Site-wide UI strings. Game-specific strings live in each game folder.

const en = {
  siteName: "Daily Games",
  tagline: "Five short games. One new set every midnight (Eastern).",
  play: "Play",
  played: "Played",
  comingSoon: "Coming soon",
  today: "Today",
  yesterday: "Yesterday",
  nextPuzzle: "Next puzzles in",
  minutes: "min",
  percentile: "Percentile",
  provisional: "provisional",
  score: "Score",
  share: "Share",
  copied: "Copied!",
  backToHub: "Back to games",
  alreadyPlayed: "You already played this one.",
  notAvailable: "This puzzle isn't available in this language yet.",
  difficulty: "Today",
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  dailyTotal: "Daily total",
  summary: "Daily summary",
  allDone: "All five done. See your summary",
  gamesPlayed: "games played",
  signIn: "Sign in",
  signOut: "Sign out",
  leaderboards: "Leaderboards",
  clans: "Clans",
  language: "Langue: FR",
  chooseLevel: "Choose a level",
  loading: "Loading…",
  error: "Something went wrong.",
  catchUp: "Catch up on yesterday",
  catchUpNote: "Counts toward yesterday's ranking only.",
  streak: "Streak",
  best: "Best",
  days: "days",
  day: "day",
  guestNote: "Playing as a guest. Sign in to keep streaks across devices, join clans and play yesterday's games.",
};

export type Dict = typeof en;

const fr: Dict = {
  siteName: "Jeux du jour",
  tagline: "Cinq petits jeux. Une nouvelle série chaque minuit (heure de l'Est).",
  play: "Jouer",
  played: "Joué",
  comingSoon: "Bientôt",
  today: "Aujourd'hui",
  yesterday: "Hier",
  nextPuzzle: "Prochains jeux dans",
  minutes: "min",
  percentile: "Centile",
  provisional: "provisoire",
  score: "Score",
  share: "Partager",
  copied: "Copié !",
  backToHub: "Retour aux jeux",
  alreadyPlayed: "Tu as déjà joué à celui-ci.",
  notAvailable: "Ce jeu n'est pas encore disponible dans cette langue.",
  difficulty: "Aujourd'hui",
  easy: "Facile",
  medium: "Moyen",
  hard: "Difficile",
  dailyTotal: "Total du jour",
  summary: "Résumé du jour",
  allDone: "Les cinq sont faits. Voir ton résumé",
  gamesPlayed: "jeux joués",
  signIn: "Connexion",
  signOut: "Déconnexion",
  leaderboards: "Classements",
  clans: "Clans",
  language: "Language: EN",
  chooseLevel: "Choisis un niveau",
  loading: "Chargement…",
  error: "Une erreur est survenue.",
  catchUp: "Rattraper hier",
  catchUpNote: "Compte seulement pour le classement d'hier.",
  streak: "Série",
  best: "Record",
  days: "jours",
  day: "jour",
  guestNote: "Tu joues en invité. Connecte-toi pour garder tes séries sur tous tes appareils, rejoindre des clans et jouer aux jeux d'hier.",
};

export const DICTS: Record<Lang, Dict> = { en, fr };

export function dict(lang: Lang): Dict {
  return DICTS[lang];
}

export function levelLabel(level: string, lang: Lang): string {
  const d = dict(lang);
  return level === "easy" ? d.easy : level === "medium" ? d.medium : level === "hard" ? d.hard : level;
}
