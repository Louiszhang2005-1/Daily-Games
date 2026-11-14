import type { CountryPuzzle } from "../logic";

// 10 hand-written test puzzles (English). Used when no generated puzzle exists for a day.
// Rules: narrow to a handful of countries, never exactly one; never name the country,
// its capital or its flag; vague -> specific within a category.
export const SEED_EN: CountryPuzzle[] = [
  {
    answer: "JPN",
    free: "geography",
    clues: {
      history: ["Its current constitution took effect in 1947.", "For about two centuries it sharply limited contact with foreign traders."],
      geography: ["An island nation with no land borders, in the Northern Hemisphere."],
      climate: ["Four distinct seasons, with a rainy season in early summer."],
      landmarks: ["A white 17th-century castle nicknamed after a heron."],
    },
  },
  {
    answer: "BRA",
    free: "climate",
    clues: {
      history: ["Was a colony of a European kingdom for over 300 years.", "Became a republic in 1889 after decades as an empire."],
      geography: ["Borders 10 countries."],
      climate: ["Most of its land lies in the tropics."],
      landmarks: ["Shares a system of about 275 waterfalls with a neighbour."],
    },
  },
  {
    answer: "CAN",
    free: "climate",
    clues: {
      history: ["Took full control of its own constitution in 1982.", "Has two official languages at the federal level."],
      geography: ["Has coastline on three different oceans."],
      climate: ["Much of its far north sits on permafrost."],
      landmarks: ["Rock formations shaped by some of the highest tides on Earth."],
    },
  },
  {
    answer: "EGY",
    free: "geography",
    clues: {
      history: ["Was under British influence until the mid-20th century.", "Became a republic in 1953."],
      geography: ["Its territory spans two continents."],
      climate: ["About 95% of the land is desert."],
      landmarks: ["A 3,000-year-old temple moved block by block in the 1960s to escape a rising lake."],
    },
  },
  {
    answer: "NOR",
    free: "climate",
    clues: {
      history: ["Left a union with a neighbour in 1905.", "Voted twice against joining the European Union."],
      geography: ["Counting every inlet, its coastline is among the longest in the world."],
      climate: ["Parts of it see the midnight sun in summer."],
      landmarks: ["A flat cliff-top 600 m above a fjord, shaped like a pulpit."],
    },
  },
  {
    answer: "MEX",
    free: "history",
    clues: {
      history: ["Gained independence in 1821.", "Lost about half its territory in a 19th-century war."],
      geography: ["Borders 3 countries."],
      climate: ["The Tropic of Cancer crosses its middle."],
      landmarks: ["Natural sinkholes called cenotes, filled with fresh water."],
    },
  },
  {
    answer: "KEN",
    free: "history",
    clues: {
      history: ["Gained independence in 1963.", "Its first president served until his death in 1978."],
      geography: ["The equator crosses it, and it has an Indian Ocean coast."],
      climate: ["Its highlands stay mild all year despite being on the equator."],
      landmarks: ["A lake famous for huge flocks of pink flamingos."],
    },
  },
  {
    answer: "VNM",
    free: "geography",
    clues: {
      history: ["Was part of a French colonial federation in Southeast Asia.", "Reunified in 1976 after decades of war."],
      geography: ["Long and thin, with more than 3,000 km of coastline."],
      climate: ["Its north has a cool winter while its south stays hot all year."],
      landmarks: ["A bay with nearly 2,000 limestone islands rising from the sea."],
    },
  },
  {
    answer: "PER",
    free: "geography",
    clues: {
      history: ["Declared independence from Spain in 1821.", "Was the heart of a vast 15th-century Andean empire."],
      geography: ["Borders 5 countries and has a Pacific coast."],
      climate: ["Its coastal desert gets almost no rain because of a cold ocean current."],
      landmarks: ["Giant lines and animal shapes drawn on a desert plain, best seen from the air."],
    },
  },
  {
    answer: "NZL",
    free: "climate",
    clues: {
      history: ["A treaty signed in 1840 is seen as its founding document.", "In 1893 it became the first self-governing country where women could vote."],
      geography: ["No land borders: two main islands and hundreds of smaller ones."],
      climate: ["Its weather changes fast, with no large land mass nearby to shield it from the ocean."],
      landmarks: ["Caves lit by thousands of glowing insects."],
    },
  },
];
