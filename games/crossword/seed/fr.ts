import type { CrosswordFull } from "../logic";

// 3 Facile + 2 Moyen grilles de test (français). Grilles produites par le générateur
// (vocabulaire de games/crossword/data/words-fr.ts, accents retirés) ; définitions écrites à la main.
export const SEED_FR: Record<"easy" | "medium", CrosswordFull[]> = {
  easy: [
    {
      grid: ["##ble", "#pour", "moine", "aire#", "ile##"],
      clues: {
        "1a": "Céréale de la baguette", "1d": "Avaler un liquide", "2d": "Elle éclaire la nuit", "3d": "Longue période de l'histoire",
        "4a": "Le contraire de contre", "4d": "Le chat en laisse sur le canapé", "5a": "Il vit dans un monastère", "5d": "Mois du muguet",
        "6a": "Surface d'un carré, par exemple", "7a": "Terre entourée d'eau",
      },
    },
    {
      grid: ["##cle", "#chat", "creme", "rare#", "une##"],
      clues: {
        "1a": "Elle ouvre la porte", "1d": "Qui coûte beaucoup (au féminin)", "2d": "Partie coupante du couteau", "3d": "Saison des grandes vacances",
        "4a": "Il ronronne", "4d": "Courage, en langage familier", "5a": "On la fouette pour faire la chantilly", "5d": "Pas cuit",
        "6a": "Peu fréquent", "7a": "Article indéfini féminin",
      },
    },
    {
      grid: ["##cap", "#pair", "malle", "arme#", "lie##"],
      clues: {
        "1a": "Pointe de terre qui avance dans la mer", "1d": "Tranquille", "2d": "L'oiseau en a deux", "3d": "Petit champ d'herbe",
        "4a": "Divisible par deux", "4d": "On le fait sur un cheval de course", "5a": "Grand coffre de voyage", "5d": "Le contraire du bien",
        "6a": "Épée ou arc, par exemple", "7a": "Dépôt au fond d'une bouteille de vin",
      },
    },
  ],
  medium: [
    {
      grid: ["#tram", "#rage", "aider", "rein#", "trot#"],
      clues: {
        "1a": "Il roule sur des rails en pleine ville", "1d": "Séparer le verre du plastique", "2d": "On l'allume en voiture pour écouter les infos",
        "3d": "Espion, ou représentant d'un artiste", "4d": "Méditerranée ou Baltique", "5a": "Colère folle", "6a": "Donner un coup de main",
        "6d": "La Joconde en est un sommet", "7a": "Organe qui filtre le sang", "8a": "Allure du cheval, entre le pas et le galop",
      },
    },
    {
      grid: ["#clan", "#halo", "jeton", "unir#", "sens#"],
      clues: {
        "1a": "Groupe soudé, comme sur ce site", "1d": "Arbre qui donne des glands", "2d": "Langue de Jules César", "3d": "Donc, à l'oral",
        "4d": "Le contraire de oui", "5a": "Cercle lumineux autour d'un ange", "6a": "Pièce de plastique pour un caddie",
        "6d": "On le presse à partir d'une orange", "7a": "Mettre ensemble", "8a": "La vue en est un",
      },
    },
  ],
};
