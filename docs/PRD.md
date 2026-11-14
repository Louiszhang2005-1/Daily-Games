# Daily Games — PRD

14 Nov 2026 · Louis Zhang · v4 (Price Guess archived, 14 Nov)

## Overview

One website, **Daily Games** (working name), with five short daily games. Each one takes a game we already love, keeps what works and fixes what doesn't.

| # | Our game (working name) | Based on |
|---|---|---|
| 1 | Word game | Wordle |
| 2 | Country Guess | Worldle / Globle, with clues the player chooses |
| 3 | Mini Crossword | NYT Mini |
| 4 | Rare Answers ("Kirillion") | Krillion |
| 5 | Common Answers | Noillirk |

Every game's score becomes a percentile against that day's players, so one leaderboard can compare them fairly across games, friends and clans. Anyone can play without an account. Logging in adds streaks, leaderboards, clans and yesterday's missed games.

The whole site is bilingual, **French and English**.

## Decisions log (14 Nov)

| Topic | Decision |
|---|---|
| Name | "Daily Games" for now. |
| Daily reset | Midnight **Eastern Time** (America/New_York) for everyone. One shared puzzle day. |
| Scoring | **Every game is ranked as a percentile** (0–100) against that day's players. |
| Guests | Guest results **count** toward percentiles and averages. Only a browser's first result per puzzle counts. |
| Daily total | **Average of the games played.** A game you didn't play doesn't count. **No minimum** number of games for the overall board. |
| Mini Crossword | Easy and Medium each day. **Easy is capped at the 80th percentile**; Medium can reach 100. |
| Language | Whole site FR/EN. French puzzles come from **French lists and dictionaries** (not translations) and are **ranked separately** from English. |
| Answer matching | **Lists with similarity matching, no LLM at play time.** |
| Unlisted valid answers | Score **0**. If the nightly review approves them, they're added **for future days only**; today's score stays. |
| Content | **Random picks from lists + Gemini API**, generated automatically every day with automatic checks. No human approval step. |
| Failed generation | Retry up to 3 times, then use a **backup puzzle bank** and alert the owner by email. |
| Stockpile | 30 days of puzzles generated and passing checks before launch, plus the backup bank. |
| Price Guess | **Archived** — not built for now. See "Archived ideas". |
| Puzzle archive | Every published puzzle is archived; new puzzles are checked so answers don't repeat. |
| Country repeats | By tier: Common 60 days, Medium 120 days, Rare 365 days. |
| Yesterday | Logged-in players can play **yesterday's** missed games (nothing older). It counts in **yesterday's percentiles only**, not for streaks or clan tables. |
| Clans | A player can be in up to **5 clans**; a clan has up to **50 members**. |
| 1v1 | A friend's existing results today are used; they only play the games they haven't done. |
| Timers | Rare/Common Answers' 25 s timer **keeps running** if the player switches tabs. |
| Streaks | Hub streak = at least one game finished that day. |

## Goals

- A daily habit: all five games done in about 12–15 minutes.
- A social reason to come back: clan tables, 1v1 links, shareable results.
- Fair scoring: a hard day doesn't punish players, because each score is ranked against that day's results.

## Non-goals for v1

- Native mobile apps (web first, mobile-friendly).
- Ads or paid features.
- User-made puzzles.
- Live multiplayer rooms (Noillirk-style rooms of up to 40).
- Playing any archive day older than yesterday.

## Success metrics

- Day-7 return rate of players who finish at least one game.
- Average games finished per visit (target: 3 of 5).
- Share of logged-in players who join or create a clan.
- Shares per day (story cards plus 1v1 links).

## Inspiration: what we keep and what we improve

| Our game | Based on | What the original does well | What we change |
|---|---|---|---|
| Word game | Wordle | 6 tries, colored letter feedback, one word a day, emoji share grid | One daily leaderboard; clans; today's difficulty shown; French word list |
| Country Guess | Worldle, Globle | Distance, direction and closeness after each guess | Player chooses the clue category (history, geography, climate, landmarks); fair, not-too-obvious clues |
| Mini Crossword | NYT Mini | Timer that pauses when you leave; friends board | Easy and Medium; plainer clues; clans and a global board |
| Rare Answers | Krillion | 7 prompts, 25 s each; rarer valid answers score more (10–100 pts); dive animation | Bigger reveal; French prompts; ranked against today's players |
| Common Answers | Noillirk | Opposite of Krillion: most common answer wins; climb animation | Family Feud and Xbox/PlayStation prompts; strong autocorrect; better answer grouping |

**Ground rule:** we borrow mechanics only. Each game gets its own name, art, colors, wording and code. Final game names are needed before launch ("Kirillion" is too close to "Krillion" to ship). Code from MIT-licensed projects can be reused only with its license notice kept.

## Users and daily loop

Friend groups, roommates, classmates and coworkers who already share daily puzzle results in group chats. Clans make that competition official.

1. Open the hub. It shows today's 5 game cards and today's difficulty for each.
2. Play the games in any order. Each card shows a check mark and the percentile when done.
3. After each game, a results screen shows the score, the percentile and a share button.
4. After all 5, a daily summary shows the daily total, the streak and the clan rank.
5. Optional: log in to save the score, join clans, challenge a friend, or play yesterday's missed games.

### Guest vs logged in

| Feature | Guest | Logged in |
|---|---|---|
| Play today's games | Yes | Yes |
| Counts toward percentiles | Yes (first result per browser) | Yes (first result per account) |
| See own score + percentile | Yes | Yes |
| Share card | Yes | Yes |
| Streaks | Saved in the browser only | Synced across devices |
| Play yesterday's missed games | No | Yes |
| Leaderboards, clans, 1v1 | No | Yes |

A guest who logs in the same day keeps today's results.

## Game 1: Word game

6 tries to guess a hidden 5-letter word. Each letter is marked right spot, wrong spot or not in the word.

- One word per day per language, the same for everyone in that language.
- A guess must be a real word from the allowed list (English or French dictionary).
- On-screen and physical keyboard. French keyboard accepts letters without accents (é = e).
- Daily word is picked at random from a hand-made answer list (common words, no "S" plurals, no obscure words) that hasn't been used before. No Gemini needed.

**Raw score:** 7 − guesses used (fail = 0).

## Game 2: Country Guess

Find today's country by choosing which kind of clue to reveal next. The hub's main original idea.

1. The round starts with one free clue (costs nothing).
2. Each turn, guess or reveal one more clue from a category you choose.
3. The round ends on a correct guess, or as a fail when all clues are used and the final guess is wrong.

| Category | Slots | Good example | Too obvious |
|---|---|---|---|
| History | 2 | "Gained independence in 1960" | "Home of the Eiffel Tower" |
| Geography | 1 | "Borders 7 countries", "Coast on the Indian Ocean" | "Largest country in Africa" |
| Climate | 1 | "About 40% of the land is desert" | "Hottest country in the world" |
| Landmarks | 1 | A lesser-known landmark or natural site | The most famous monument |

Clue rules: narrow to a handful of countries, never exactly one; never name the country, its capital or its flag; vague to specific within a category.

| Tier | Examples | How often | Can repeat after |
|---|---|---|---|
| Common | Canada, USA, UK, Australia, France | ~40% of days | 60 days |
| Medium | Known but hard to place | ~45% | 120 days |
| Rare | Only when clues make it fair | ~15% | 365 days |
| Excluded | Microstates, near-unguessable | Never | — |

The country is picked at random by tier from the lists; **Gemini writes the clues** (in French for the French version). Facts are checked automatically against a country dataset (see Automatic checks).

Answers use the shared matcher: aliases ("UK", "Britain", "England"), typo tolerance ("Untied States" → USA), suggestions while typing, French names ("États-Unis"). Nonsense input doesn't count as a guess.

**Raw score:** 100 − 10 per extra clue revealed − 15 per wrong guess (min 0); fail = 0.

## Game 3: Mini Crossword

5×5 timed crossword with plain, fun clues.

- An **Easy** and a **Medium** puzzle each day per language. The player picks one before starting.
- Each level is ranked separately. **Easy percentiles are capped at 80**; Medium goes to 100. The capped percentile is what counts toward the daily total.
- The timer starts on the first keystroke, stops when the grid is correct, and pauses when the tab is hidden.
- Hints add time: 30 s per letter, 60 s per word.
- **Code builds the grid** from a word list (LLMs are bad at valid grids); **Gemini writes the clues** in plain, everyday wording.

**Raw score:** seconds + hint penalties (lower is better).

## Game 4: Rare Answers (working name "Kirillion")

Name a valid answer few people would think of. The "dopamine" game.

1. 7 prompts a day, the same for everyone in a language.
2. 25 seconds per prompt, one answer each. The timer keeps running if you switch tabs.
3. A valid answer scores by rarity tier; an invalid or missing answer scores 0.

| Tier | Points | Example: "Name a pasta dish" |
|---|---|---|
| Common | 10 | Spaghetti |
| Known | 30 | Lasagna |
| Rare | 60 | Orecchiette |
| Deep cut | 85 | Cacio e pepe |
| One in a Kirillion | 100 | An answer almost nobody gave |

Max 700 points a day.

- **Gemini drafts the prompt and the answer list** (canonical answers, aliases, starting tiers). French prompts and lists are generated in French.
- Tiers can shift toward real answer counts as players answer, and lock with the day's percentiles.
- An answer not on the list scores 0 and goes to the rejection log. If the nightly review approves it, it's added for future days only.
- Improvements: reveal animation with sound and a rolling counter; results show what most people answered next to your pick; clear rejection reasons with a report button.

**Raw score:** points.

## Game 5: Common Answers (working name)

The opposite of Rare Answers: give the answer most people would give. Same format, timer and screens as Game 5 (shared code).

1. 7 prompts a day, 25 seconds each (timer keeps running on tab switch).
2. Points = the share of players who gave the same answer (after grouping).

Themes: Family Feud-style surveys ("Something you bring to the beach"); Xbox and PlayStation games ("A game everyone owned on PS2").

- **Gemini drafts the prompt, the answer list with aliases and grouping** ("sunscreen" / "sunblock" = one answer), and starting share estimates.
- Each prompt uses the estimated shares until it has 30 answers, then switches to live counts.
- A board-style reveal shows the top answers with the share for each.

**Raw score:** shares of matched answers summed over 7 prompts.

## Answer matching (shared, no LLM at play time)

Used by Rare Answers, Common Answers and Country Guess.

1. **Normalize:** lowercase, strip accents and punctuation, drop leading articles ("the", "a", "le", "la", "les", "l'").
2. **Alias lookup:** each answer has one canonical id and a list of aliases, per prompt.
3. **Typo tolerance:** if no exact match, accept edit distance ≤ 1 for 4–7 characters, ≤ 2 for 8+.
4. **Short answers:** 3 characters or fewer must match an alias exactly.
5. **Log rejections:** every rejected answer is stored; a nightly job removes duplicates, and Gemini sorts them (real answer / typo / nonsense) for review. Approved answers are added to future lists.

## Daily content generation (automatic)

Puzzles are generated ahead of time by a scheduled job, with no human approval step.

| Game | Picked at random from lists | Generated by Gemini |
|---|---|---|
| Word game | Answer word | — |
| Country Guess | Country (by tier and repeat window) | 5 clues |
| Mini Crossword | Grid built by code from a word list | Clues |
| Rare Answers | Prompt theme | Prompt, answer list, aliases, tiers |
| Common Answers | Prompt theme | Prompt, answer list, aliases, groups, starting shares |

### Automatic checks (a puzzle goes live only if all pass)

- **All games:** valid JSON in the expected shape; nothing repeats from the archive within its repeat window; no offensive words (blocklist).
- **Country Guess:** no clue contains the country's name, capital, demonym or a known alias; facts with numbers (borders, area rank, independence year) match a country dataset; a second Gemini call, given only the clues, must not name the country from the first clue alone.
- **Mini Crossword:** every answer is in the word list; no clue contains its own answer; the grid is fully filled and symmetric.
- **Rare / Common Answers:** at least 40 valid answers per prompt (Rare) or at least 8 grouped answers (Common); no duplicate aliases across two answers; starting shares add up to ~100%.

If a puzzle fails, Gemini retries up to 3 times. If it still fails, a puzzle from the **backup bank** (pre-generated and checked) goes live and the owner gets an email. The job keeps at least 30 days generated ahead.

## Scoring and normalization

Each game's raw result becomes a 0–100 rank percentile (ties share a percentile) within its ranking group:

| Game | Raw score | Ranking group |
|---|---|---|
| Word game | 7 − guesses (fail = 0) | Day + language |
| Country Guess | 100 − 10/extra clue − 15/wrong guess | Day + language |
| Mini Crossword | Seconds + hint penalties (lower is better) | Day + language + level; Easy capped at 80 |
| Rare Answers | Points | Day + language |
| Common Answers | Summed shares | Day + language |

- **Who counts:** guests (first result per browser) and logged-in players (first result per account).
- **Daily total:** the average of the percentiles of the games played. Equal weights. No minimum games.
- **Today's difficulty:** each card shows Easy / Medium / Hard from the day's raw scores, plus one detail (e.g. "avg 4.4 guesses").
- **Early in the day:** until a ranking group has 30 results, show a provisional percentile based on past days.
- **Locking:** a day's percentiles stay open until **midnight ET at the end of the next day**, because logged-in players can still play it as "yesterday". Then they lock for good.

## Puzzle archive and daily reset

- At midnight ET the new day goes live and the previous day becomes "yesterday" (playable by logged-in players who missed it).
- One day later it locks and is archived for good: puzzle, results, final percentiles.
- Every new puzzle is checked against the archive before it is scheduled (repeat windows above).
- The archive powers the all-time board. Days older than yesterday can't be played.

## Accounts, clans and leaderboards

- Sign in with Google or an email magic link (Supabase Auth). New accounts get a generated display name ("CrosswordCaribou"), editable.
- **Clans:** create one and invite by link. Up to 5 clans per player, 50 members per clan. Clan page by day: one row per member, one column per game (percentile), the member's daily total; clan average at the bottom. Rows fill in through the day. Menu: View my clan, Filter leaderboard by clan, See today's difficulty, Leave clan. Yesterday's catch-up games don't change clan tables.
- **1v1:** "Challenge a friend" makes a link for today's puzzles. If the friend already played some games, those results are used; they play the rest. Both see a head-to-head card once both are done.

| Board | Scope | Ranked by |
|---|---|---|
| Daily overall | All players today | Daily total |
| Daily per game | All players today, per ranking group | That game's percentile |
| Clan daily | One clan | Daily total |
| Clan vs clan | All clans today | Clan average (min 3 members played) |
| All-time archive | Any past day or range | Daily totals and averages |

## Streaks and sharing

- Per-game streak and hub streak (at least one game a day), counted on ET days. Playing yesterday's game does not fix a broken streak.
- Guests keep streaks in the browser; logging in moves them to the account.
- Every results screen has a spoiler-free text share and a 1080×1920 image card (game, score, percentile, streak, link).
- The daily summary card shows all 5 games. A top Rare Answers result gets its own card. A 1v1 link can be attached to any share.

## Data model and tech

Next.js + Supabase. Gemini API is called only by the scheduled generation job and the nightly review job, never during play.

- `app/`: hub, game routes, daily summary, auth, leaderboards, clans.
- `games/<id>/`: one folder per game, each with `meta`, `server` (puzzle loading) and `client` (playable game) files.
- `shared/`: day helpers (ET), scoring, answer matcher, share card maker, UI kit.
- `jobs/`: content generation, automatic checks, percentile recompute, nightly review.

**Game contract:** `loadPuzzle(day, variant)`; a page that runs on its own at `/play/<game>` with no login; `onFinish(rawScore, details)`; `shareText(result)`. Variants: level (Crossword), language (all).

| Table | Key columns |
|---|---|
| users | id, display_name, language, created_at |
| daily_puzzles | id, game, day (ET), variant, language, answer_key, content (JSON), source (generated / backup), status (scheduled / live / yesterday / archived) |
| results | user_id or guest_id, puzzle_id, raw_score, percentile, time_ms, finished_at, is_catch_up — unique per player per puzzle |
| answer_lists | puzzle_id, prompt_index, canonical_id, aliases, tier or share |
| rejected_answers | puzzle_id, prompt_index, normalized_text, count, review_status |
| backup_puzzles | game, language, variant, content, used_on |
| clans / clan_members | id, name, invite_code, owner_id / clan_id, user_id, joined_at |
| challenges | token, creator_id, day, opponent_id |
| streaks | user_id, game or "hub", current, best, last_day |

## Build plan

1. `main`: hub shell — 5 placeholder cards, game contract, `/play/<game>` route, ET day helper, database schema, FR/EN switch.
2. `game/word`
3. `game/country` (10 test countries, then the matcher)
4. `game/crossword` (grid builder + 5 test puzzles, timer)
5. `game/rare-answers` (3 days of test prompts and lists)
6. `game/common-answers` (reuses Rare Answers screens)
7. `feature/generation`: Gemini jobs, automatic checks, backup bank, 30-day stockpile
8. `feature/scoring`
9. `feature/accounts-leaderboards` (incl. yesterday's catch-up)
10. `feature/clans`
11. `feature/sharing`

**Done means, per game branch:** playable at `/play/<game>` with no login; plays a hard-coded and a date-loaded puzzle; hands a raw score through `onFinish`; works in English and French; playtested by 3 people on phone and desktop; merged only after that.

## Open questions

- [ ] Final names for each game.
- [ ] Per-game weights later, or always equal?
- [ ] Country tier split (40/45/15): revisit after playtests.
- [ ] "Better magnet" note for Common Answers: what does it mean?
- [ ] Gemini model and monthly budget cap for the generation jobs.

## Archived ideas

Not built for v1. Kept here so the idea isn't lost. Reopen when a legal, reliable price source is found.

### Price Guess (based on Costcodle)

Guess the price of a real store product in your own country (Costcodle, but local).

1. Pick a home country once: Canada, USA, UK, Australia or France. Saved for next time.
2. A product appears with a name, size and image.
3. 6 guesses. Each wrong guess shows higher or lower, plus "close" when within 25%.
4. A guess within 5% of the real price wins.

| Country | Currency |
|---|---|
| Canada | CAD |
| USA | USD |
| UK | GBP |
| Australia | AUD |
| France | EUR |

- Each country has its own daily product and its own percentiles. Only the home country counts; other countries are playable for fun.
- Every product shows a dated price ("price as of Nov 2026"). Products never repeat within a country.
- Gemini may write the product's short display name; **prices always come from real data**.

**Raw score:** 7 − guesses used (fail = 0).

#### Price data (why it's archived)

What we found:

- **Costcodle** (MIT license) has no live Costco connection. It runs from one static file of **3,399 US products** (name, price, image link). Prices are in USD only, and the images come from costcofdb.com (a fan-made Costco food database) dated **2022**, so the prices are about 4 years old. Images are loaded from that site, not hosted by the game.
- **Walmart** has no open data. It has an **Affiliate API** (walmart.io) for searching its US catalog, which needs you to sign up as an affiliate, and its Marketplace APIs are only for sellers. Walmart isn't in the UK, Australia or France.
- Scraping store websites breaks their terms of use, and product photos belong to the store. Costco.ca's terms exclude "use of any data mining, bots, spiders, automated tools" and "the collection, use or disclosure of any product listings, prices or descriptions", so copying prices from their site (by script or by hand) is out.

Options to decide:

1. Government open data on average retail prices (Statistics Canada, BLS, ONS, INSEE): free and legal, but generic items rather than store products.
2. An official store API where one exists (e.g. Walmart Affiliate API for the US, if approved).
3. Prices collected by players or the team from shelves and receipts.
4. Launch with fewer countries and add more after.

## Sources

- Krillion game guide (rules, tiers, timer) and krillion.io FAQ
- Noillirk, Krillion's sibling game
- Costcodle source (github.com/KermWasTaken/costcodle, MIT) — games.json product list
- Walmart developer and affiliate API docs (developer.walmart.com, walmart.io)
- Worldle FAQ
- NYT Mini Crossword help (timer, leaderboard)
