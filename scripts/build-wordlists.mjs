// Builds the allowed-guess lists for the Word game from MIT-licensed word lists
// (github.com/words). Run: node scripts/build-wordlists.mjs
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const outDir = path.join(process.cwd(), "games", "word", "data");

function strip(w) {
  return w.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function build(pkg, file) {
  let words;
  try {
    words = require(`${pkg}/index.json`);
  } catch {
    console.log(`skip ${pkg} (not installed)`);
    return;
  }
  const five = new Set();
  for (const w of words) {
    const s = strip(w);
    if (/^[a-z]{5}$/.test(s) && w === w.toLowerCase()) five.add(s);
  }
  const list = [...five].sort();
  fs.writeFileSync(path.join(outDir, file), JSON.stringify(list));
  console.log(`${file}: ${list.length} words`);
}

fs.mkdirSync(outDir, { recursive: true });
build("an-array-of-english-words", "allowed-en.json");
build("an-array-of-french-words", "allowed-fr.json");
