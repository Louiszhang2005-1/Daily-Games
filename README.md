# Daily Games

Five short daily games on one site. Every score becomes a percentile against that day's
players, so one leaderboard compares them fairly across games, friends and clans.
Bilingual (English / French). Full spec: [docs/PRD.md](docs/PRD.md).

| Game | Route | Based on |
|---|---|---|
| Word | `/play/word` | Wordle |
| Country Guess | `/play/country` | Worldle / Globle, with clues you choose |
| Mini Crossword (Easy / Medium) | `/play/crossword` | NYT Mini |
| Deep Dive | `/play/rare` | Krillion |
| Up & Away | `/play/common` | Noillirk |

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no environment variables, everything runs offline:

- data is stored in `.data/db.json`
- every game plays its hand-written seed puzzles (EN and FR)
- sign-in is a development-only form (pick any display name)

## Connect services

Copy `.env.example` to `.env.local` and fill in what you need.

| Variable | For |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Shared database and sign-in (Google + email magic link). Run `supabase/schema.sql` in the Supabase SQL editor, enable the Google provider, and add `<site>/auth/callback` as a redirect URL. |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Daily content generation (default model `gemini-2.5-flash`). |
| `RESEND_API_KEY`, `ALERT_EMAIL_TO`, `ALERT_EMAIL_FROM` | Email the owner when a puzzle falls back to the backup bank. |
| `CRON_SECRET` | Protects `/api/cron/*` (Vercel Cron sends it automatically). |
| `NEXT_PUBLIC_SITE_URL` | Links on share cards and clan invites. |
| `ALLOW_DEV_LOGIN=1` | Keep the dev sign-in in a production build without Supabase (testing only). |

## Daily jobs

| Job | Route (cron, UTC) | CLI |
|---|---|---|
| Lock the day before yesterday's percentiles | `/api/cron/lock` (05:15) | `npm run jobs -- lock 2026-11-12` |
| Keep 30 days of puzzles generated ahead | `/api/cron/generate?max=2` (05:30) | `npm run jobs -- stockpile` |
| Review rejected answers | `/api/cron/review` (07:00) | `npm run jobs -- review` |
| Load seed puzzles into the backup bank | — | `npm run jobs -- backup` |

Before launch, run `npm run jobs -- stockpile` once to build the 30-day stockpile.

How generation works: Word answers come from the hand-made list (no Gemini). Country Guess
picks a country by tier and repeat window, and Gemini writes the clues. The crossword grid is
built by code from a word list, and Gemini writes the clues. Rare and Common Answers pick
themes, and Gemini drafts the prompts and answer lists. Every puzzle runs automatic checks
(`jobs/generators/*`). After 3 failed retries, a backup puzzle goes live and the owner gets an
email. Gemini is never called during play.

## Layout

| Path | What |
|---|---|
| `app/` | Hub, `/play/<game>`, summary, auth, account, leaderboards, clans, 1v1 (`/challenge`, `/c/<token>`), API and cron routes |
| `games/<id>/` | One folder per game: `meta.ts`, `server.ts` (load + score), `client.tsx`, `share.ts`, seed content |
| `shared/` | ET day helpers, store (Supabase or local JSON), answer matcher, scoring, streaks, boards, clans, i18n, UI kit |
| `jobs/` | Gemini client, generators and checks, backup bank, archive, nightly review, alerts |
| `supabase/schema.sql` | Database schema (RLS on, server-only access) |

**Game contract.** `server.ts` exports `load(day, variant)`, `toPublic(full)` (strips answers) and
`score(full, payload)`, which recomputes the raw score on the server. `client.tsx` receives
`{ puzzle, day, variant, lang, onFinish }` and calls `onFinish(payload)` once. Each game runs on its
own at `/play/<game>`, with no login.

## Branches

| Branch | Contents |
|---|---|
| `main` | Hub shell, game contract, shared code, schema, FR/EN switch |
| `game/<id>` | One game in English, branched from `main` |
| `game/<id>-fr` | That game's French content, branched from `game/<id>` |
| `feature/scoring` → `feature/accounts-leaderboards` → `feature/clans` → `feature/sharing` | Stacked platform features |
| `feature/generation` | Gemini jobs, checks, backup bank (built on top of all games) |
| `dev` | Everything merged, for play-testing before merging to `main` |

## Credits

Country names, aliases and coordinates: [world-countries](https://github.com/mledoze/countries) (ODbL 1.0).
Word lists: [an-array-of-english-words](https://github.com/words/an-array-of-english-words) and
[an-array-of-french-words](https://github.com/words/an-array-of-french-words) (MIT).
Game mechanics are borrowed; the names, art, wording and code are original.
