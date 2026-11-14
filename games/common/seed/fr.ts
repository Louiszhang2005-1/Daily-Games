import { commonAnswers as A, type Prompt } from "@/shared/prompts/types";

// 3 jours de questions de test en français : sondages du quotidien et jeux Xbox / PlayStation.
// Parts de départ estimées (en %) ; après 30 réponses, on passe aux vrais chiffres.
export const SEED_FR: Prompt[][] = [
  [
    { key: "plage-emporter", text: "Quelque chose qu'on emporte à la plage", answers: A(`creme solaire/creme/ecran solaire = 30, serviette = 26, parasol = 10, lunettes de soleil/lunettes = 8, maillot/maillot de bain = 6, livre = 5, glaciere = 4, eau/bouteille d'eau = 4, chapeau/casquette = 3, ballon = 2, tongs = 2`) },
    { key: "jeu-ps2", text: "Un jeu que tout le monde avait sur PS2", answers: A(`gta san andreas/san andreas/gta = 28, gran turismo = 12, kingdom hearts = 8, ratchet et clank/ratchet and clank/ratchet = 8, jak and daxter/jak = 7, need for speed/nfs = 7, pro evolution soccer/pes = 7, fifa = 6, final fantasy/ffx = 5, crash bandicoot/crash = 4, spyro = 3, god of war = 3, singstar = 2`) },
    { key: "reveil", text: "La première chose qu'on fait en se réveillant", answers: A(`regarder son telephone/telephone/portable = 34, toilettes/aller aux toilettes/pipi = 18, cafe/faire un cafe = 14, se brosser les dents/brosser les dents = 10, douche = 8, s'etirer/etirement = 5, eteindre le reveil/reveil = 5, boire de l'eau = 3, ouvrir les volets/volets = 3`) },
    { key: "garniture-pizza", text: "Une garniture de pizza", answers: A(`fromage/mozzarella = 26, jambon = 20, champignons/champignon = 14, chorizo/pepperoni = 10, olives = 8, ananas = 6, poivron/poivrons = 5, oignons = 4, anchois = 3, chevre = 2, lardons = 2`) },
    { key: "jeu-xbox", text: "Un jeu Xbox que tout le monde connaît", answers: A(`halo = 42, call of duty/cod = 15, gears of war/gears = 11, forza/forza horizon = 10, minecraft = 8, fable = 4, fortnite = 4, red dead redemption/red dead = 3, sea of thieves = 2, banjo kazooie = 1`) },
    { key: "baguette-boulangerie", text: "Quelque chose qu'on achète à la boulangerie", answers: A(`baguette/pain = 46, croissant/croissants = 20, pain au chocolat/chocolatine = 14, tarte/tartelette = 5, eclair = 4, brioche = 4, sandwich = 3, flan = 2, chausson aux pommes = 2`) },
    { key: "excuse-retard", text: "Une excuse pour être en retard", answers: A(`bouchons/embouteillages/trafic/circulation = 34, panne de reveil/reveil/pas entendu le reveil = 24, transports/metro/bus/train/greve = 16, panne de voiture/voiture = 8, malade = 5, enfants = 4, cles/perdu mes cles = 4, meteo/neige = 3, chien = 2`) },
  ],
  [
    { key: "oublier-courses", text: "Quelque chose qu'on oublie d'acheter au supermarché", answers: A(`lait = 30, pain = 16, oeufs = 14, papier toilette/pq = 10, beurre = 8, cafe = 5, fruits = 4, sel = 3, sucre = 3, sacs poubelle = 3, fromage = 2, oignons = 2`) },
    { key: "perso-playstation", text: "Un personnage PlayStation que tout le monde connaît", answers: A(`kratos = 26, crash bandicoot/crash = 22, spyro = 10, ratchet = 9, nathan drake/drake = 8, aloy = 6, sackboy = 5, spider-man/spiderman = 5, ellie = 4, jak = 3, joel = 2`) },
    { key: "super-pouvoir", text: "Un super-pouvoir qu'on rêverait d'avoir", answers: A(`voler/vol = 32, invisibilite/etre invisible = 18, teleportation/se teleporter = 18, voyager dans le temps/remonter le temps = 10, lire dans les pensees/telepathie = 8, super force/force = 5, super vitesse/vitesse = 4, guerison = 3, immortalite = 2`) },
    { key: "camping", text: "Quelque chose qu'on emporte en camping", answers: A(`tente = 40, sac de couchage/duvet = 18, lampe de poche/lampe/frontale = 10, nourriture = 7, anti-moustique/repulsif = 6, briquet/allumettes = 5, matelas = 4, eau = 4, rechaud = 3, chamallows/marshmallows = 3`) },
    { key: "console", text: "Une console de jeux vidéo", answers: A(`playstation/ps5/ps4/ps2/ps1/ps3 = 36, nintendo switch/switch = 22, xbox/xbox 360/xbox one/xbox series = 20, wii = 7, game boy/gameboy = 5, nintendo 64/n64 = 3, ds/nintendo ds = 3, gamecube = 2, megadrive/mega drive = 2`) },
    { key: "cinema-snack", text: "Ce qu'on mange au cinéma", answers: A(`pop-corn/popcorn = 64, bonbons = 12, nachos = 8, m&m's/m&ms/mms = 5, chocolat = 4, soda/coca = 4, glace = 3`) },
    { key: "frigo-toujours", text: "Quelque chose qui est toujours dans le frigo", answers: A(`beurre = 22, lait = 18, oeufs = 14, fromage = 14, moutarde = 8, yaourts/yaourt = 8, ketchup = 5, eau = 4, restes = 3, jambon = 2, confiture = 2`) },
  ],
  [
    { key: "premier-rdv", text: "Un endroit pour un premier rendez-vous", answers: A(`restaurant/resto/diner = 36, cinema = 20, cafe/bar = 20, parc = 8, balade/promenade = 5, bowling = 4, musee = 3, plage = 2, zoo = 1`) },
    { key: "jeu-course", text: "Un jeu vidéo de course", answers: A(`mario kart = 38, need for speed/nfs = 16, gran turismo = 14, forza/forza horizon = 12, burnout = 5, crash team racing/ctr = 4, f1 = 3, trackmania = 4, rocket league = 2, v-rally = 2`) },
    { key: "jour-pluie", text: "Ce qu'on fait un jour de pluie", answers: A(`regarder un film/film/netflix/series/tele = 38, dormir/sieste = 14, lire/lire un livre = 14, jeux video/jouer = 10, rester au lit/rester a la maison = 7, jeux de societe = 6, cuisiner/patisserie = 5, sauter dans les flaques = 3, menage = 3`) },
    { key: "fete", text: "Une fête que tout le monde célèbre", answers: A(`noel = 50, nouvel an/reveillon/jour de l'an = 18, anniversaire = 8, paques = 7, halloween = 6, saint-valentin/saint valentin = 4, 14 juillet/fete nationale = 4, fete de la musique = 2, chandeleur = 1`) },
    { key: "jeu-tir", text: "Un jeu de tir à la première personne", answers: A(`call of duty/cod = 42, counter-strike/counter strike/cs go/cs2 = 14, halo = 12, battlefield = 10, valorant = 7, doom = 5, overwatch = 4, apex legends/apex = 3, goldeneye = 2, far cry = 1`) },
    { key: "appli-telephone", text: "Une appli que tout le monde a sur son téléphone", answers: A(`whatsapp = 24, instagram = 20, tiktok = 12, youtube = 12, snapchat = 10, facebook = 8, spotify = 5, google maps/maps = 4, netflix = 2, deezer = 2, waze = 1`) },
    { key: "matiere-ecole", text: "Une matière à l'école", answers: A(`maths/mathematiques = 38, francais = 22, histoire/histoire-geo/histoire geo = 14, anglais = 8, sport/eps = 6, sciences/svt = 4, physique/physique-chimie = 3, musique = 2, arts plastiques/dessin = 2, philosophie/philo = 1`) },
  ],
];
