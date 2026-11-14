import { rareAnswers as A, type Prompt } from "@/shared/prompts/types";

// 3 days of hand-written test prompts (English). Tiers are starting guesses;
// once a prompt has 30 answers, live answer counts take over.
// c = Common 10, k = Known 30, r = Rare 60, d = Deep cut 85. "One in a million" (100) comes from live counts only.
export const SEED_EN: Prompt[][] = [
  [
    {
      key: "pasta-shapes",
      text: "Name a pasta shape or dish",
      answers: A(`
c: spaghetti, macaroni/mac and cheese/mac n cheese, lasagna/lasagne, penne
k: fettuccine/fettucine, ravioli, linguine/linguini, rigatoni, tortellini, fusilli, farfalle/bow tie/bowtie, carbonara
r: orecchiette, gnocchi, orzo, ziti, tagliatelle, cannelloni, pappardelle, conchiglie/shells, rotini, angel hair/capellini, vermicelli
d: cacio e pepe, bucatini, campanelle, gemelli, radiatori, paccheri, strozzapreti, cavatelli, trofie, ditalini, mafaldine, agnolotti, casarecce
`),
    },
    {
      key: "dog-breeds",
      text: "Name a dog breed",
      answers: A(`
c: labrador/lab/labrador retriever, golden retriever/golden, german shepherd, poodle, bulldog/english bulldog
k: beagle, chihuahua, husky/siberian husky, pug, dachshund/wiener dog/sausage dog, boxer, rottweiler, corgi, french bulldog/frenchie, shih tzu
r: dalmatian, great dane, border collie, doberman, pomeranian, yorkshire terrier/yorkie, cocker spaniel, australian shepherd, saint bernard/st bernard, greyhound, maltese, shiba inu, bernese mountain dog
d: basenji, vizsla, weimaraner, komondor, puli, xoloitzcuintli/xolo, borzoi, saluki, whippet, newfoundland, samoyed, akita, papillon, schipperke, bichon frise/bichon
`),
    },
    {
      key: "planets-space",
      text: "Name something you'd find in space",
      answers: A(`
c: star/stars, moon, sun, planet/planets
k: mars, saturn, jupiter, asteroid/asteroids, comet, black hole, galaxy, satellite, earth, venus
r: nebula, meteor/meteorite, mercury, neptune, uranus, pluto, space station/iss, astronaut, milky way, rocket
d: quasar, pulsar, supernova, dark matter, wormhole, kuiper belt, oort cloud, exoplanet, white dwarf, red giant, neutron star, space junk/space debris, voyager, hubble
`),
    },
    {
      key: "breakfast",
      text: "Name a breakfast food",
      answers: A(`
c: eggs/egg, pancakes/pancake, cereal, bacon, toast
k: waffles/waffle, oatmeal/porridge, bagel, french toast, sausage, yogurt/yoghurt, muffin, croissant, omelette/omelet
r: hash browns, grits, avocado toast, smoothie, granola, eggs benedict, crepes/crepe, breakfast burrito, fruit, english muffin
d: shakshuka, congee, kedgeree, huevos rancheros, chilaquiles, kippers, black pudding, scrapple, dutch baby, menemen, natto, tamagoyaki
`),
    },
    {
      key: "instruments",
      text: "Name a musical instrument",
      answers: A(`
c: guitar, piano, drums/drum, violin
k: flute, trumpet, saxophone/sax, cello, bass/bass guitar, clarinet, ukulele
r: harp, trombone, harmonica, accordion, banjo, keyboard, xylophone, tuba, oboe, french horn, viola, recorder
d: theremin, sitar, didgeridoo, bagpipes, bassoon, mandolin, glockenspiel, kalimba, hurdy gurdy, oud, koto, tabla, steel drum/steelpan, ocarina, harpsichord
`),
    },
    {
      key: "fruits",
      text: "Name a fruit",
      answers: A(`
c: apple, banana, orange, strawberry/strawberries
k: grape/grapes, mango, pineapple, watermelon, peach, pear, cherry/cherries, blueberry/blueberries, kiwi, lemon
r: raspberry, plum, papaya, pomegranate, coconut, lime, apricot, grapefruit, cantaloupe, avocado, fig, nectarine, blackberry
d: durian, rambutan, lychee/litchi, mangosteen, persimmon, kumquat, jackfruit, guava, passion fruit, dragon fruit/pitaya, quince, gooseberry, starfruit/carambola, feijoa, loquat, tamarind
`),
    },
    {
      key: "board-games",
      text: "Name a board game",
      answers: A(`
c: monopoly, chess, scrabble, checkers/draughts
k: clue/cluedo, risk, sorry, trivial pursuit, the game of life/life, catan/settlers of catan, candy land/candyland, connect four/connect 4, battleship
r: pictionary, ticket to ride, backgammon, operation, mouse trap, guess who, stratego, go, chutes and ladders/snakes and ladders, othello, mastermind, jenga
d: carcassonne, pandemic, azul, wingspan, mahjong, agricola, terraforming mars, dominion, codenames, splendor, twilight imperium, puerto rico, gloomhaven, mancala
`),
    },
  ],
  [
    {
      key: "vegetables",
      text: "Name a vegetable",
      answers: A(`
c: carrot/carrots, broccoli, potato/potatoes, lettuce
k: tomato, corn, onion, spinach, cucumber, peas/pea, green beans, celery, cauliflower, pepper/bell pepper
r: zucchini/courgette, asparagus, eggplant/aubergine, kale, cabbage, brussels sprouts, sweet potato, beet/beetroot, radish, mushroom, garlic
d: kohlrabi, jicama, okra, parsnip, rutabaga/swede, fennel, artichoke, leek, bok choy, chard/swiss chard, celeriac, salsify, romanesco, daikon, turnip, endive
`),
    },
    {
      key: "superheroes",
      text: "Name a superhero",
      answers: A(`
c: superman, batman, spider-man/spiderman, iron man/ironman
k: wonder woman, captain america, hulk, thor, black panther, the flash/flash, wolverine, deadpool
r: aquaman, green lantern, black widow, doctor strange, ant-man/antman, captain marvel, cyclops, storm, daredevil, hawkeye, robin, supergirl
d: moon knight, ms marvel/kamala khan, blue beetle, swamp thing, martian manhunter, nightcrawler, silver surfer, squirrel girl, black bolt, booster gold, hellboy, spawn, the tick, static shock
`),
    },
    {
      key: "kitchen",
      text: "Name something in a kitchen",
      answers: A(`
c: fridge/refrigerator, oven, stove, sink, knife
k: microwave, toaster, spoon, fork, plate, pan, pot, kettle, blender, cupboard/cabinet
r: dishwasher, spatula, cutting board, whisk, colander, ladle, apron, oven mitt, freezer, coffee maker, can opener, tongs
d: mandoline, zester, rolling pin, mortar and pestle, garlic press, salad spinner, bread box, trivet, sieve, baster, pastry brush, cheese grater/grater, dutch oven, egg timer
`),
    },
    {
      key: "sports",
      text: "Name a sport",
      answers: A(`
c: soccer/football, basketball, baseball, tennis
k: hockey/ice hockey, golf, volleyball, swimming, rugby, cricket, boxing, american football
r: badminton, table tennis/ping pong, wrestling, skiing, surfing, lacrosse, cycling, gymnastics, skateboarding, snowboarding, fencing
d: curling, sepak takraw, hurling, kabaddi, jai alai, bobsled, biathlon, polo, water polo, squash, handball, korfball, pickleball, bocce, shinty
`),
    },
    {
      key: "zoo-animals",
      text: "Name an animal you'd see at a zoo",
      answers: A(`
c: lion, elephant, giraffe, monkey, tiger
k: zebra, bear, penguin, gorilla, hippo/hippopotamus, kangaroo, panda, flamingo, chimpanzee, polar bear
r: rhino/rhinoceros, crocodile, alligator, seal, otter, meerkat, koala, cheetah, lemur, orangutan, camel, snake, peacock
d: okapi, tapir, capybara, binturong, aardvark, red panda, axolotl, pangolin, anteater, fossa, gharial, komodo dragon, sloth, armadillo, wombat
`),
    },
    {
      key: "cheeses",
      text: "Name a cheese",
      answers: A(`
c: cheddar, mozzarella, swiss, parmesan
k: brie, gouda, feta, provolone, american, blue cheese, cream cheese, monterey jack/jack
r: camembert, goat cheese/chevre, ricotta, gruyere, havarti, colby, pepper jack, muenster, mascarpone, halloumi, string cheese, cottage cheese
d: roquefort, gorgonzola, manchego, emmental, stilton, comte, raclette, reblochon, taleggio, pecorino, burrata, edam, limburger, paneer, epoisses, wensleydale, jarlsberg
`),
    },
    {
      key: "jobs",
      text: "Name a job",
      answers: A(`
c: doctor, teacher, nurse, firefighter, police officer/cop/policeman
k: lawyer, engineer, chef/cook, pilot, dentist, farmer, cashier, accountant, programmer/software engineer/developer
r: plumber, electrician, architect, veterinarian/vet, pharmacist, mechanic, librarian, journalist, carpenter, barista, waiter/waitress
d: sommelier, actuary, taxidermist, cartographer, farrier, luthier, glassblower, chimney sweep, lighthouse keeper, mortician, cooper, stenographer, zookeeper
`),
    },
  ],
  [
    {
      key: "colors",
      text: "Name a color",
      answers: A(`
c: red, blue, green, yellow
k: purple, orange, pink, black, white, brown, gray/grey
r: teal, turquoise, maroon, navy, beige, magenta, cyan, lavender, gold, silver, indigo, violet
d: chartreuse, vermilion, cerulean, ochre, puce, mauve, taupe, periwinkle, fuchsia, aquamarine, burgundy, coral, ecru, sienna, celadon, cobalt
`),
    },
    {
      key: "birds",
      text: "Name a bird",
      answers: A(`
c: eagle, robin, pigeon, crow, parrot
k: owl, penguin, hawk, duck, chicken, flamingo, sparrow, seagull/gull, cardinal, blue jay, swan, ostrich
r: hummingbird, woodpecker, pelican, falcon, toucan, peacock, raven, heron, stork, vulture, canary, finch
d: kiwi, cassowary, albatross, shoebill, puffin, kingfisher, hoopoe, lyrebird, quetzal, kakapo, roadrunner, nightingale, oriole, tern, bittern, cormorant
`),
    },
    {
      key: "desserts",
      text: "Name a dessert",
      answers: A(`
c: cake, ice cream, cookie/cookies, pie, brownie/brownies
k: cheesecake, cupcake, apple pie, pudding, donut/doughnut, chocolate cake, tiramisu
r: creme brulee, macarons/macaron, cannoli, flan, mousse, sundae, eclair, baklava, churros, panna cotta, sorbet, gelato
d: pavlova, mochi, tres leches, clafoutis, profiteroles, baked alaska, bread pudding, sticky toffee pudding, gulab jamun, kouign amann, trifle, cobbler, semifreddo, mille-feuille/mille feuille, rugelach
`),
    },
    {
      key: "car-brands",
      text: "Name a car brand",
      answers: A(`
c: toyota, ford, honda, tesla, bmw
k: chevrolet/chevy, mercedes/mercedes-benz, audi, nissan, volkswagen/vw, hyundai, jeep, kia, ferrari, porsche
r: subaru, mazda, lexus, volvo, dodge, lamborghini, jaguar, land rover, mini, fiat, cadillac, buick, gmc, ram
d: bugatti, koenigsegg, pagani, lotus, alfa romeo, skoda, seat, rolls-royce/rolls royce, bentley, maserati, aston martin, lancia, saab, peugeot, citroen, polestar, rivian, lada
`),
    },
    {
      key: "things-at-beach",
      text: "Name something you'd find at the beach",
      answers: A(`
c: sand, water, towel, shells/seashells, umbrella
k: sunscreen, waves, sandcastle, crab, seagull, surfboard, ball/beach ball, bucket
r: lifeguard, cooler, sunglasses, flip flops, seaweed, starfish, kite, boat, pier, chair/beach chair
d: driftwood, sea glass, jellyfish, metal detector, sand dollar, tide pool, boardwalk, buoy, hermit crab, windbreak, cabana, sandpiper
`),
    },
    {
      key: "languages",
      text: "Name a language",
      answers: A(`
c: english, spanish, french, chinese/mandarin
k: german, italian, japanese, arabic, portuguese, russian, korean, hindi
r: dutch, greek, swedish, polish, turkish, hebrew, vietnamese, cantonese, thai, swahili, latin, tagalog/filipino
d: basque, welsh, icelandic, quechua, yoruba, amharic, esperanto, klingon, maori, hawaiian, gaelic/irish, catalan, tamil, navajo, finnish, hungarian
`),
    },
    {
      key: "school-supplies",
      text: "Name a school supply",
      answers: A(`
c: pencil, pen, notebook, eraser, paper
k: backpack, ruler, scissors, glue, crayons, binder, calculator, highlighter, markers
r: stapler, folder, sharpener/pencil sharpener, protractor, compass, tape, index cards, lunchbox, pencil case
d: graph paper, slide rule, hole punch, paper clip, thumbtack, trapper keeper, abacus, sticky notes/post-it, whiteout/correction fluid, glue stick, planner
`),
    },
  ],
];
