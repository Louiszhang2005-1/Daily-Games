// Run the scheduled jobs from the command line (uses .env.local).
//   npm run jobs -- stockpile        fill 30 days ahead (do this before launch)
//   npm run jobs -- day 2026-11-20   generate one day
//   npm run jobs -- backup           load the seed puzzles into the backup bank
//   npm run jobs -- review           nightly review of rejected answers
//   npm run jobs -- lock 2026-11-12  lock a day's percentiles
import { ensureStockpile, generateDay, STOCKPILE_DAYS } from "../jobs/generate";
import { seedBackupBank } from "../jobs/backup";
import { nightlyReview } from "../jobs/review";
import { lockDay } from "../shared/scoring";
import { addDays, todayET } from "../shared/day";

async function main() {
  const [cmd, arg] = process.argv.slice(2);
  switch (cmd) {
    case "stockpile": {
      const reports = await ensureStockpile(STOCKPILE_DAYS);
      for (const r of reports.filter((x) => x.result !== "exists")) console.log(r.result.padEnd(9), r.id, r.problems?.length ? `\n  ${r.problems.join("\n  ")}` : "");
      break;
    }
    case "day":
      console.log(await generateDay(arg ?? todayET()));
      break;
    case "backup":
      console.log(`added ${await seedBackupBank()} backup puzzles`);
      break;
    case "review":
      console.log(await nightlyReview());
      break;
    case "lock":
      console.log(await lockDay(arg ?? addDays(todayET(), -2)));
      break;
    default:
      console.log("usage: npm run jobs -- stockpile | day <YYYY-MM-DD> | backup | review | lock <YYYY-MM-DD>");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
