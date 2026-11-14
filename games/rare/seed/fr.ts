import { rareAnswers as A, type Prompt } from "@/shared/prompts/types";

// 3 jours de questions de test en français (listes françaises, pas des traductions).
// c = Courant 10, k = Connu 30, r = Rare 60, d = Pointu 85.
export const SEED_FR: Prompt[][] = [
  [
    {
      key: "fromages",
      text: "Nomme un fromage",
      answers: A(`
c: camembert, brie, emmental, comte, roquefort
k: chevre, raclette, reblochon, mozzarella, gruyere, cantal, parmesan, coulommiers
r: munster, beaufort, tomme, saint-nectaire/saint nectaire, morbier, mimolette, fourme d'ambert, bleu d'auvergne, maroilles, feta, boursin, abondance
d: epoisses, livarot, pont-l'eveque/pont l'eveque, mont d'or/vacherin, ossau-iraty, salers, langres, chaource, crottin de chavignol, rocamadour, sainte-maure, neufchatel, banon, tete de moine, laguiole, valencay
`),
    },
    {
      key: "metiers",
      text: "Nomme un métier",
      answers: A(`
c: medecin/docteur, professeur/prof/enseignant, pompier, policier, boulanger
k: infirmier/infirmiere, avocat, ingenieur, cuisinier, pilote, dentiste, agriculteur, caissier, comptable, coiffeur
r: plombier, electricien, architecte, veterinaire, pharmacien, mecanicien, bibliothecaire, journaliste, menuisier, serveur, facteur, boucher, charcutier
d: sommelier, actuaire, taxidermiste, cartographe, marechal-ferrant, luthier, souffleur de verre, ramoneur, gardien de phare, thanatopracteur, tonnelier, stenographe, horloger, ebeniste, apiculteur
`),
    },
    {
      key: "fruits",
      text: "Nomme un fruit",
      answers: A(`
c: pomme, banane, orange, fraise
k: raisin, mangue, ananas, pasteque, peche, poire, cerise, kiwi, citron, abricot
r: framboise, prune, papaye, grenade, noix de coco, citron vert, pamplemousse, melon, avocat, figue, nectarine, mure, myrtille, clementine, mandarine
d: durian, ramboutan, litchi, mangoustan, kaki, kumquat, jacquier, goyave, fruit de la passion, fruit du dragon/pitaya, coing, groseille, carambole, nefle, tamarin, physalis, cassis
`),
    },
    {
      key: "instruments",
      text: "Nomme un instrument de musique",
      answers: A(`
c: guitare, piano, batterie, violon
k: flute, trompette, saxophone/saxo, violoncelle, basse, clarinette, ukulele
r: harpe, trombone, harmonica, accordeon, banjo, synthetiseur/clavier, xylophone, tuba, hautbois, cor, alto, flute a bec, contrebasse
d: theremine, sitar, didgeridoo, cornemuse, basson, mandoline, glockenspiel, kalimba, vielle a roue, oud, koto, tabla, steel drum, ocarina, clavecin, ondes martenot
`),
    },
    {
      key: "animaux-ferme",
      text: "Nomme un animal de la ferme",
      answers: A(`
c: vache, cochon/porc, poule, mouton, cheval
k: chevre, canard, lapin, ane, coq, chien, chat, dinde, oie
r: taureau, veau, agneau, poussin, brebis, bouc, mulet, poney, pintade, caille, boeuf, truie
d: alpaga, lama, dindon, jars, bufflonne, chapon, paon, autruche, ver de terre, abeille, furet, faisan, emeu, yack, pigeon
`),
    },
    {
      key: "plats-francais",
      text: "Nomme un plat français",
      answers: A(`
c: croissant, crepe, quiche/quiche lorraine, ratatouille, baguette
k: boeuf bourguignon, coq au vin, croque-monsieur/croque monsieur, soupe a l'oignon, gratin dauphinois, cassoulet, raclette, fondue
r: bouillabaisse, blanquette de veau/blanquette, pot-au-feu/pot au feu, tartiflette, confit de canard, choucroute, hachis parmentier, escargots, moules frites, steak frites, foie gras, salade nicoise
d: aligot, pissaladiere, garbure, potee, piperade, quenelles, tete de veau, andouillette, kouign-amann/kouign amann, flammekueche/tarte flambee, socca, brandade, tripes a la mode de caen, poule au pot, baeckeoffe, gougeres
`),
    },
    {
      key: "jeux-societe",
      text: "Nomme un jeu de société",
      answers: A(`
c: monopoly, echecs, scrabble, uno, dames
k: cluedo, risk, trivial pursuit, jeu de l'oie, catan/colons de catane, puissance 4, bataille navale, petits chevaux, mille bornes
r: pictionary, les aventuriers du rail/aventuriers du rail, dobble, backgammon, docteur maboul, qui est-ce/qui est ce, stratego, go, othello, mastermind, jenga, taboo, time's up
d: carcassonne, pandemie/pandemic, azul, dixit, mahjong, agricola, terraforming mars, dominion, codenames/nom de code, splendor, 7 wonders, small world, loups-garous/loup-garou, skyjo, la bonne paye, abalone, mancala
`),
    },
  ],
  [
    {
      key: "legumes",
      text: "Nomme un légume",
      answers: A(`
c: carotte, pomme de terre/patate, tomate, salade/laitue, haricot vert/haricots verts
k: brocoli, courgette, aubergine, poivron, concombre, epinard/epinards, petit pois/petits pois, oignon, chou-fleur/chou fleur
r: poireau, asperge, chou, radis, betterave, navet, celeri, patate douce, champignon, ail, artichaut, potiron, citrouille, endive
d: topinambour, panais, rutabaga, fenouil, cardon, salsifis, chou-rave/chou rave, celeri-rave/celeri rave, crosne, blette/bette, romanesco, okra/gombo, scorsonere, rhubarbe, cresson, potimarron
`),
    },
    {
      key: "super-heros",
      text: "Nomme un super-héros",
      answers: A(`
c: superman, batman, spider-man/spiderman, iron man/ironman
k: wonder woman, captain america, hulk, thor, black panther, flash, wolverine, deadpool
r: aquaman, green lantern, black widow, doctor strange, ant-man/antman, captain marvel, cyclope, tornade/storm, daredevil, hawkeye/oeil de faucon, robin, supergirl
d: moon knight, miss marvel/ms marvel, blue beetle, swamp thing, martian manhunter, diablo/nightcrawler, surfeur d'argent/silver surfer, black bolt, hellboy, spawn, fantomette, captain tsubasa, le marsupilami, judex
`),
    },
    {
      key: "cuisine-objets",
      text: "Nomme un objet de la cuisine",
      answers: A(`
c: frigo/refrigerateur, four, couteau, evier, cuillere
k: micro-ondes/micro ondes, grille-pain/grille pain, fourchette, assiette, poele, casserole, bouilloire, mixeur, placard
r: lave-vaisselle/lave vaisselle, spatule, planche a decouper, fouet, passoire, louche, tablier, gant de cuisine/manique, congelateur, cafetiere, ouvre-boite/ouvre boite, pince
d: mandoline, zesteur, rouleau a patisserie, mortier, presse-ail/presse ail, essoreuse a salade, huche a pain, dessous de plat, tamis, pinceau, rape, cocotte, minuteur, chinois, econome
`),
    },
    {
      key: "sports",
      text: "Nomme un sport",
      answers: A(`
c: football/foot, basket/basketball, tennis, rugby
k: hockey, golf, volley/volleyball, natation, handball, cyclisme/velo, boxe, judo
r: badminton, ping-pong/tennis de table, lutte, ski, surf, escrime, gymnastique, skateboard/skate, snowboard, equitation, athletisme, karate
d: curling, sepak takraw, hurling, kabaddi, pelote basque, bobsleigh, biathlon, polo, water-polo/water polo, squash, petanque, korfball, pickleball, ultimate, trampoline, crosse/lacrosse
`),
    },
    {
      key: "animaux-zoo",
      text: "Nomme un animal du zoo",
      answers: A(`
c: lion, elephant, girafe, singe, tigre
k: zebre, ours, pingouin/manchot, gorille, hippopotame, kangourou, panda, flamant rose, chimpanze, ours polaire/ours blanc
r: rhinoceros, crocodile, alligator, phoque, loutre, suricate, koala, guepard, lemurien, orang-outan/orang outan, chameau, serpent, paon
d: okapi, tapir, capybara, binturong, orycterope, panda roux, axolotl, pangolin, fourmilier, fossa, gavial, dragon de komodo, paresseux, tatou, wombat
`),
    },
    {
      key: "desserts",
      text: "Nomme un dessert",
      answers: A(`
c: gateau, glace, tarte, mousse au chocolat, creme brulee
k: tiramisu, eclair, crepe, macaron, fondant au chocolat, ile flottante, tarte tatin, profiteroles
r: mille-feuille/mille feuille, paris-brest/paris brest, clafoutis, far breton, baba au rhum, fraisier, opera, charlotte, flan, riz au lait, creme caramel, madeleine, cannele
d: kouign-amann/kouign amann, saint-honore/saint honore, kougelhopf, tarte au sucre, pets de nonne, bugnes, financier, savarin, religieuse, pavlova, mont-blanc/mont blanc, croquembouche, merveilleux, galette des rois, calisson, tropezienne
`),
    },
    {
      key: "regions-villes",
      text: "Nomme une ville française",
      answers: A(`
c: paris, marseille, lyon, toulouse, nice
k: bordeaux, lille, nantes, strasbourg, montpellier, rennes, grenoble
r: reims, le havre, toulon, dijon, angers, nimes, brest, tours, limoges, clermont-ferrand/clermont ferrand, amiens, metz, perpignan, besancon, orleans, rouen, caen, avignon
d: carcassonne, colmar, annecy, biarritz, la rochelle, saint-malo/saint malo, chamonix, arles, sete, quimper, menton, honfleur, cahors, albi, perigueux, aurillac, vesoul, foix
`),
    },
  ],
  [
    {
      key: "couleurs",
      text: "Nomme une couleur",
      answers: A(`
c: rouge, bleu, vert, jaune
k: violet, orange, rose, noir, blanc, marron, gris
r: turquoise, bordeaux, beige, magenta, cyan, lavande, or/dore, argent/argente, indigo, kaki, ocre, saumon
d: vermillon, cerise, mauve, taupe, fuchsia, aigue-marine/aigue marine, corail, ecru, sienne, celadon, cobalt, pervenche, chartreuse, carmin, ebene, anthracite
`),
    },
    {
      key: "oiseaux",
      text: "Nomme un oiseau",
      answers: A(`
c: aigle, pigeon, moineau, corbeau, perroquet
k: hibou, chouette, pingouin/manchot, faucon, canard, poule, mouette, merle, rouge-gorge/rouge gorge, cygne, autruche, mesange
r: colibri, pic-vert/pic vert, pelican, toucan, paon, heron, cigogne, vautour, canari, pinson, hirondelle, rossignol
d: kiwi, casoar, albatros, bec-en-sabot, macareux, martin-pecheur/martin pecheur, huppe, oiseau-lyre/oiseau lyre, quetzal, kakapo, loriot, sterne, butor, cormoran, bergeronnette, sittelle
`),
    },
    {
      key: "marques-voitures",
      text: "Nomme une marque de voiture",
      answers: A(`
c: renault, peugeot, citroen, toyota, volkswagen/vw
k: bmw, mercedes, audi, ford, tesla, fiat, dacia, ferrari, porsche
r: nissan, honda, hyundai, kia, opel, skoda, seat, volvo, mini, lamborghini, jaguar, land rover, alfa romeo, ds, mazda, suzuki
d: bugatti, alpine, koenigsegg, pagani, lotus, lancia, rolls-royce/rolls royce, bentley, maserati, aston martin, saab, simca, panhard, matra, venturi, lada, talbot
`),
    },
    {
      key: "plage",
      text: "Nomme quelque chose qu'on trouve à la plage",
      answers: A(`
c: sable, eau, serviette, coquillage/coquillages, parasol
k: creme solaire, vagues, chateau de sable, crabe, mouette, planche de surf, ballon, seau, pelle
r: maitre-nageur/maitre nageur, glaciere, lunettes de soleil, tongs, algues, etoile de mer, cerf-volant/cerf volant, bateau, ponton, transat, chapeau, bouee
d: bois flotte, verre de mer, meduse, detecteur de metaux, dollar des sables, flaque, digue, bernard-l'hermite/bernard l'hermite, paravent, cabine, becasseau, oursin, coque, couteau
`),
    },
    {
      key: "langues",
      text: "Nomme une langue",
      answers: A(`
c: anglais, espagnol, francais, chinois/mandarin, allemand
k: italien, japonais, arabe, portugais, russe, coreen, hindi
r: neerlandais/hollandais, grec, suedois, polonais, turc, hebreu, vietnamien, cantonais, thai, swahili, latin, breton, occitan
d: basque, gallois, islandais, quechua, yoruba, amharique, esperanto, klingon, maori, hawaien, gaelique, catalan, tamoul, navajo, finnois, hongrois, corse, alsacien, wolof
`),
    },
    {
      key: "fournitures-scolaires",
      text: "Nomme une fourniture scolaire",
      answers: A(`
c: crayon, stylo, cahier, gomme, regle
k: cartable/sac a dos, ciseaux, colle, feutres, classeur, calculatrice, surligneur, trousse, taille-crayon/taille crayon
r: agrafeuse, pochette, chemise, rapporteur, compas, scotch/ruban adhesif, fiches bristol, equerre, copies doubles, agenda, crayons de couleur
d: papier millimetre, perforatrice, trombone, punaise, ardoise, buvard, plume, encrier, effaceur, blanco/correcteur, baton de colle, protege-cahier/protege cahier, porte-mine/porte mine, cahier de texte
`),
    },
    {
      key: "petit-dejeuner",
      text: "Nomme quelque chose qu'on mange au petit-déjeuner",
      answers: A(`
c: croissant, pain, cereales, tartine, oeuf/oeufs
k: brioche, pain au chocolat/chocolatine, confiture, beurre, yaourt, jus d'orange, cafe, chocolat chaud, crepe
r: pancakes, gaufre, muesli, granola, fruit, pomme, banane, nutella/pate a tartiner, miel, fromage blanc, bacon, jambon, pain perdu
d: shakshuka, congee, kedgeree, porridge, flocons d'avoine, compote, chouquette, kouign-amann/kouign amann, viennoiserie, muffin anglais, natto, bircher, tartine de rillettes, galette
`),
    },
  ],
];
