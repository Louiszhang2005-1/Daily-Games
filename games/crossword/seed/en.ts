import type { CrosswordFull } from "../logic";

// 5 Easy + 5 Medium test puzzles (English). Grids came from the builder
// (scripts/try-crossword.ts); clues are hand-written in plain, everyday wording.
export const SEED_EN: Record<"easy" | "medium", CrosswordFull[]> = {
  easy: [
    {
      grid: ["vat##", "iron#", "actor", "#hate", "##led"],
      clues: {
        "1a": "Big tub for wine or dye", "1d": "By way of", "2d": "Curved top of a doorway", "3d": "Sum of everything",
        "4a": "Press the wrinkles out of a shirt", "5d": "Short written message", "6a": "Person in a play or film",
        "7d": "Color of a stop sign", "8a": "Opposite of love", "9a": "Was in front; guided",
      },
    },
    {
      grid: ["##off", "#curl", "money", "once#", "bee##"],
      clues: {
        "1a": "Not on", "1d": "One sixteenth of a pound", "2d": "Costing nothing", "3d": "Buzzing kitchen pest",
        "4a": "Ringlet of hair", "4d": "Ice cream holder", "5a": "What's kept in a wallet", "5d": "Unruly crowd",
        "6a": "One time", "7a": "Honey maker",
      },
    },
    {
      grid: ["and##", "poet#", "tulip", "#name", "##yet"],
      clues: {
        "1a": "Plus", "1d": "Fitting; well suited", "2d": "Person, place or thing, in grammar", "3d": "Late start",
        "4a": "Writer of verses", "5d": "What a clock shows", "6a": "Spring flower linked to Holland", "7d": "Dog or cat at home",
        "8a": "What you're called", "9a": "Up to now",
      },
    },
    {
      grid: ["##pot", "#lava", "linen", "even#", "gel##"],
      clues: {
        "1a": "Pan's cooking partner", "1d": "Group of experts on a stage", "2d": "Where bread bakes", "3d": "Souvenir of a beach day",
        "4a": "Hot flow from a volcano", "4d": "Not recorded", "5a": "Fabric for summer shirts", "5d": "Body part with a knee",
        "6a": "Divisible by two", "7a": "Hair styling goo",
      },
    },
    {
      grid: ["spy##", "plot#", "audio", "#self", "##let"],
      clues: {
        "1a": "Secret agent", "1d": "Place for a massage", "2d": "Addition sign", "3d": "Sing like a Swiss mountaineer",
        "4a": "Story line", "5d": "Bathroom floor square", "6a": "Sound part of a video", "7d": "Frequently, in old poems",
        "8a": "One's own person", "9a": "Allow",
      },
    },
  ],
  medium: [
    {
      grid: ["#mare", "#away", "brave", "acre#", "then#"],
      clues: {
        "1a": "Female horse", "1d": "Month, or a parade's pace", "2d": "In the know", "3d": "Black bird in a famous Poe poem",
        "4d": "Calm center of a hurricane", "5a": "Not home", "6a": "Fearless", "6d": "Cave flier, or cricket gear",
        "7a": "Farm area unit", "8a": "Next, in a story",
      },
    },
    {
      grid: ["#brag", "#rose", "habit", "avid#", "tone#"],
      clues: {
        "1a": "Show off with words", "1d": "Cheer from the theater seats", "2d": "Batman's sidekick", "3d": "Stage whisper to the audience",
        "4d": "Understand, informally", "5a": "Got up", "6a": "Something you do without thinking", "6d": "Fedora, for one",
        "7a": "Super keen", "8a": "Pitch of a voice",
      },
    },
    {
      grid: ["ache#", "clan#", "taste", "#stew", "#here"],
      clues: {
        "1a": "Dull pain", "1d": "Part of a play", "2d": "Head-to-head fight", "3d": "Rush",
        "4d": "Key on a keyboard", "5a": "Big family group", "6a": "Sweet or salty, say", "7d": "Lamb's mother",
        "8a": "Slow-cooked dish", "9a": "At this spot",
      },
    },
    {
      grid: ["#grab", "#rule", "salad", "ever#", "term#"],
      clues: {
        "1a": "Snatch", "1d": "Very serious", "2d": "King, or a 12-inch tool", "3d": "Morning wake-up sound",
        "4d": "Flower patch in a garden", "5a": "Guideline", "6a": "Caesar, for one", "6d": "Ready, ___, go!",
        "7a": "At any time", "8a": "School semester",
      },
    },
    {
      grid: ["#slow", "#path", "party", "urge#", "beer#"],
      clues: {
        "1a": "Like a sloth", "1d": "Extra tire", "2d": "Size above medium", "3d": "River swimmer that floats on its back",
        "4d": "A toddler's favorite question", "5a": "Trail", "6a": "Birthday bash", "6d": "Irish bar",
        "7a": "Strong desire", "8a": "Pint contents, often",
      },
    },
  ],
};
