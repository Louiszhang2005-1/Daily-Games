import { commonAnswers as A, type Prompt } from "@/shared/prompts/types";

// 3 days of hand-written test prompts (English): survey-style questions and
// Xbox / PlayStation games. Shares are starting estimates (percent); after 30
// answers a prompt switches to live counts. "/" groups answers that mean the same.
export const SEED_EN: Prompt[][] = [
  [
    { key: "beach-bring", text: "Something you bring to the beach", answers: A(`sunscreen/sunblock/suncream/sun screen = 30, towel/beach towel = 24, umbrella/parasol = 10, sunglasses/shades = 8, swimsuit/bathing suit/swimwear = 6, chair/beach chair = 5, book = 4, cooler = 4, water/water bottle = 3, snacks/food = 3, ball/beach ball = 2, hat = 1`) },
    { key: "ps2-game", text: "A game everyone owned on PS2", answers: A(`gta san andreas/san andreas/grand theft auto san andreas = 26, gran turismo/gran turismo 4/gran turismo 3 = 12, kingdom hearts = 9, ratchet and clank = 8, jak and daxter = 7, tony hawk/tony hawk's pro skater = 7, need for speed/need for speed underground/nfs = 7, final fantasy x/ffx/final fantasy = 6, spyro = 4, crash bandicoot/crash = 4, god of war = 4, fifa = 3, burnout = 3`) },
    { key: "wake-up-first", text: "The first thing you do when you wake up", answers: A(`check phone/look at phone/phone = 34, bathroom/pee/toilet = 20, brush teeth = 12, coffee/make coffee = 10, shower = 8, stretch = 5, turn off alarm/snooze/hit snooze = 5, drink water = 3, open curtains = 2, pray = 1`) },
    { key: "pizza-topping", text: "A pizza topping", answers: A(`pepperoni = 38, cheese/extra cheese = 14, mushrooms/mushroom = 10, sausage = 8, pineapple = 7, olives/olive = 5, peppers/green peppers/bell peppers = 5, onions/onion = 4, ham = 4, bacon = 3, chicken = 2`) },
    { key: "xbox-game", text: "An Xbox game everyone knows", answers: A(`halo/halo 3/halo 2/halo combat evolved = 42, call of duty/cod = 14, gears of war/gears = 12, forza/forza horizon = 9, minecraft = 7, fable = 4, fortnite = 4, red dead redemption/red dead = 3, sea of thieves = 2, banjo kazooie = 2, starfield = 1`) },
    { key: "zoo-first", text: "The first animal you'd go see at a zoo", answers: A(`lion/lions = 28, elephant/elephants = 18, giraffe/giraffes = 14, monkey/monkeys = 11, penguin/penguins = 8, tiger/tigers = 7, panda/pandas = 6, gorilla = 4, bear/bears = 3, zebra = 1`) },
    { key: "late-excuse", text: "An excuse for being late", answers: A(`traffic = 40, overslept/slept in/alarm didn't go off/alarm = 22, car trouble/flat tire/car broke down = 10, bus/train/missed the bus/missed the train = 9, sick/not feeling well = 5, kids/my kids = 4, couldn't find keys/lost my keys = 4, weather/snow = 3, dog = 2, forgot = 1`) },
  ],
  [
    { key: "grocery-forget", text: "Something people forget to buy at the grocery store", answers: A(`milk = 32, eggs = 14, bread = 13, toilet paper = 8, butter = 7, bananas/fruit = 5, coffee = 4, cheese = 4, onions = 3, sugar = 3, salt = 2, garbage bags/trash bags = 2`) },
    { key: "ps-mascot", text: "A PlayStation character everyone knows", answers: A(`kratos = 25, crash bandicoot/crash = 22, spyro = 10, ratchet = 9, nathan drake/drake = 8, aloy = 6, sackboy = 5, spider-man/spiderman = 5, ellie = 4, joel = 3, jak = 3`) },
    { key: "superpower", text: "A superpower people wish they had", answers: A(`flying/fly/flight = 34, invisibility/invisible = 18, teleportation/teleport = 16, time travel/control time = 9, reading minds/mind reading/telepathy = 8, super strength/strength = 5, super speed/speed = 4, healing = 3, immortality = 2, shapeshifting = 1`) },
    { key: "camping-bring", text: "Something you bring camping", answers: A(`tent = 38, sleeping bag = 18, flashlight/torch = 10, food = 7, marshmallows/smores = 5, bug spray/insect repellent = 5, matches/lighter = 5, water = 4, firewood/wood = 3, cooler = 3, pillow = 2`) },
    { key: "nintendo-ish-console", text: "A video game console", answers: A(`playstation/ps5/ps4/ps2/ps1/ps3/playstation 5 = 36, xbox/xbox 360/xbox one/xbox series x = 24, nintendo switch/switch = 20, wii = 6, game boy/gameboy = 4, nintendo 64/n64 = 3, ds/nintendo ds = 2, gamecube = 2, sega genesis/genesis/mega drive = 2, atari = 1`) },
    { key: "movie-snack", text: "A snack you eat at the movies", answers: A(`popcorn = 62, candy = 10, nachos = 8, hot dog = 4, m&ms/m and ms/mms = 4, soda/pop/coke = 4, chocolate = 3, sour patch kids = 2, twizzlers = 2, pretzel = 1`) },
    { key: "fridge-always", text: "Something that's always in the fridge", answers: A(`milk = 30, eggs = 16, butter = 10, ketchup = 9, water = 7, cheese = 7, leftovers = 6, juice/orange juice = 5, mustard = 3, mayo/mayonnaise = 3, baking soda = 2, beer = 2`) },
  ],
  [
    { key: "first-date", text: "A place to go on a first date", answers: A(`restaurant/dinner = 38, movies/movie theater/cinema = 22, coffee shop/coffee/cafe = 15, park = 7, bar = 6, bowling = 4, mini golf = 3, beach = 2, museum = 2, zoo = 1`) },
    { key: "playstation-racing", text: "A racing video game", answers: A(`mario kart = 36, need for speed/nfs = 18, gran turismo = 14, forza/forza horizon = 12, burnout = 5, crash team racing/ctr = 4, f1 = 3, cruisin usa = 2, rocket league = 2, midnight club = 2, twisted metal = 1`) },
    { key: "rainy-day", text: "Something you do on a rainy day", answers: A(`watch tv/watch movies/netflix/movies = 36, sleep/nap = 14, read/read a book = 14, play video games/video games/games = 10, stay inside/stay in bed = 7, board games = 5, bake = 4, puddle jumping/jump in puddles = 4, clean = 3, cuddle = 2`) },
    { key: "holiday", text: "A holiday everyone celebrates", answers: A(`christmas = 52, halloween = 12, new year/new year's eve/new years = 10, thanksgiving = 9, easter = 6, birthday = 4, valentine's day/valentines = 3, fourth of july/july 4th = 2, hanukkah = 1, st patrick's day = 1`) },
    { key: "fps-game", text: "A first-person shooter game", answers: A(`call of duty/cod/modern warfare = 42, halo = 18, battlefield = 10, counter-strike/counter strike/cs go/cs2 = 8, valorant = 6, doom = 5, overwatch = 4, apex legends/apex = 3, destiny = 2, goldeneye = 2`) },
    { key: "phone-apps", text: "An app everyone has on their phone", answers: A(`instagram = 22, whatsapp = 16, tiktok = 14, youtube = 12, facebook = 9, snapchat = 8, spotify = 6, maps/google maps = 5, messages = 3, netflix = 2, uber = 2, gmail/email = 1`) },
    { key: "school-subject", text: "A school subject", answers: A(`math/maths/mathematics = 38, english = 18, science = 14, history = 12, gym/pe/physical education = 6, art = 4, music = 3, geography = 2, biology = 1, chemistry = 1, french = 1`) },
  ],
];
