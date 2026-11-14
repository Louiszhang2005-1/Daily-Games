// Tries the grid builder on each template and prints fills.
// Run: npx tsx scripts/try-crossword.ts [en|fr] [count]
import { buildGrid, TEMPLATES } from "../games/crossword/builder";
import { WORDS_EN_3, WORDS_EN_4, WORDS_EN_5 } from "../games/crossword/data/words-en";

async function main() {
  const lang = process.argv[2] ?? "en";
  const count = Number(process.argv[3] ?? 3);
  let words: string[];
  if (lang === "fr") {
    const path = "../games/crossword/data/words-fr";
    const fr = (await import(path)) as Record<string, string[]>;
    words = [...fr.WORDS_FR_3, ...fr.WORDS_FR_4, ...fr.WORDS_FR_5];
  } else words = [...WORDS_EN_3, ...WORDS_EN_4, ...WORDS_EN_5];
  const avoid = new Set<string>();
  for (const level of ["easy", "medium"] as const) {
    let made = 0;
    for (let seed = 1; seed < 400 && made < count; seed++) {
      const t0 = Date.now();
      const tpl = TEMPLATES[level][seed % TEMPLATES[level].length];
      const fill = buildGrid(tpl, words, seed, avoid);
      if (!fill) continue;
      made++;
      fill.slots.forEach((s) => avoid.add(s.answer));
      console.log(`${level} seed=${seed} (${Date.now() - t0}ms)`);
      console.log(fill.grid.join("\n"));
      console.log(fill.slots.map((s) => `${s.num}${s.dir[0]} ${s.answer}`).join(", "));
      console.log("");
    }
  }
}

main();
