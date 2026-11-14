import type { Lang } from "@/shared/game";

// Prompt themes picked at random for Rare Answers and Common Answers.
// Gemini turns each theme into a prompt and an answer list in that language.

export interface Theme {
  key: string;
  hint: string; // what the prompt should ask
}

const t = (s: string): Theme[] =>
  s
    .trim()
    .split("\n")
    .map((line) => {
      const [key, hint] = line.split("|").map((x) => x.trim());
      return { key, hint };
    });

export const RARE_THEMES: Record<Lang, Theme[]> = {
  en: t(`
pasta-shapes | a pasta shape or dish
dog-breeds | a dog breed
space | something you'd find in space
breakfast | a breakfast food
instruments | a musical instrument
fruits | a fruit
board-games | a board game
vegetables | a vegetable
superheroes | a superhero
kitchen | something in a kitchen
sports | a sport
zoo-animals | an animal you'd see at a zoo
cheeses | a cheese
jobs | a job
colors | a color
birds | a bird
desserts | a dessert
car-brands | a car brand
beach | something you'd find at the beach
languages | a language
school-supplies | a school supply
capital-cities | a capital city
spices | a herb or spice
dances | a style of dance
trees | a tree
fish | a fish
flowers | a flower
cocktails | a cocktail or mixed drink
bread | a type of bread
shoes | a type of shoe
mythology | a god or creature from mythology
chess-and-cards | a card game
rivers | a river
pixar-disney | an animated movie
cereal | a breakfast cereal brand
`),
  fr: t(`
fromages | un fromage
metiers | un métier
fruits | un fruit
instruments | un instrument de musique
animaux-ferme | un animal de la ferme
plats-francais | un plat français
jeux-societe | un jeu de société
legumes | un légume
super-heros | un super-héros
cuisine-objets | un objet de la cuisine
sports | un sport
animaux-zoo | un animal du zoo
desserts | un dessert
villes-francaises | une ville française
couleurs | une couleur
oiseaux | un oiseau
marques-voitures | une marque de voiture
plage | quelque chose qu'on trouve à la plage
langues | une langue
fournitures-scolaires | une fourniture scolaire
petit-dejeuner | quelque chose qu'on mange au petit-déjeuner
capitales | une capitale
epices | une herbe ou une épice
danses | une danse
arbres | un arbre
poissons | un poisson
fleurs | une fleur
pains | une sorte de pain
chaussures | un type de chaussure
mythologie | un dieu ou une créature de la mythologie
fleuves | un fleuve ou une rivière
films-animation | un film d'animation
departements | un département français
chanteurs-francais | un chanteur ou une chanteuse francophone
`),
};

export const COMMON_THEMES: Record<Lang, Theme[]> = {
  en: t(`
beach-bring | survey: something you bring to the beach
ps2-game | a game everyone owned on PS2
wake-up-first | survey: the first thing you do when you wake up
pizza-topping | survey: a pizza topping
xbox-game | an Xbox game everyone knows
zoo-first | survey: the first animal you'd go see at a zoo
late-excuse | survey: an excuse for being late
grocery-forget | survey: something people forget to buy at the grocery store
ps-mascot | a PlayStation character everyone knows
superpower | survey: a superpower people wish they had
camping-bring | survey: something you bring camping
console | a video game console
movie-snack | survey: a snack you eat at the movies
fridge-always | survey: something that's always in the fridge
first-date | survey: a place to go on a first date
racing-game | a racing video game
rainy-day | survey: something you do on a rainy day
holiday | survey: a holiday everyone celebrates
fps-game | a first-person shooter game
phone-apps | survey: an app everyone has on their phone
school-subject | survey: a school subject
ps1-game | a game everyone played on the original PlayStation
xbox-360-game | an Xbox 360 game everyone remembers
handbag | survey: something you'd find in a handbag
wedding | survey: something you see at every wedding
morning-drink | survey: a drink people have in the morning
gym | survey: a reason people skip the gym
road-trip | survey: something you bring on a road trip
birthday-party | survey: something at every kid's birthday party
`),
  fr: t(`
plage-emporter | sondage : quelque chose qu'on emporte à la plage
jeu-ps2 | un jeu que tout le monde avait sur PS2
reveil | sondage : la première chose qu'on fait en se réveillant
garniture-pizza | sondage : une garniture de pizza
jeu-xbox | un jeu Xbox que tout le monde connaît
boulangerie | sondage : quelque chose qu'on achète à la boulangerie
excuse-retard | sondage : une excuse pour être en retard
oublier-courses | sondage : quelque chose qu'on oublie d'acheter au supermarché
perso-playstation | un personnage PlayStation que tout le monde connaît
super-pouvoir | sondage : un super-pouvoir qu'on rêverait d'avoir
camping | sondage : quelque chose qu'on emporte en camping
console | une console de jeux vidéo
cinema-snack | sondage : ce qu'on mange au cinéma
frigo-toujours | sondage : quelque chose qui est toujours dans le frigo
premier-rdv | sondage : un endroit pour un premier rendez-vous
jeu-course | un jeu vidéo de course
jour-pluie | sondage : ce qu'on fait un jour de pluie
fete | sondage : une fête que tout le monde célèbre
jeu-tir | un jeu de tir à la première personne
appli-telephone | sondage : une appli que tout le monde a sur son téléphone
matiere-ecole | sondage : une matière à l'école
jeu-ps1 | un jeu auquel tout le monde a joué sur la première PlayStation
sac-a-main | sondage : quelque chose qu'on trouve dans un sac à main
mariage | sondage : quelque chose qu'on voit à chaque mariage
boisson-matin | sondage : une boisson qu'on prend le matin
road-trip | sondage : quelque chose qu'on emporte en road trip
anniversaire-enfant | sondage : quelque chose à chaque anniversaire d'enfant
`),
};
