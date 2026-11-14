# Daily Games

Five short daily games on one site, each score ranked as a percentile against that day's players.
Bilingual (English / French). See [docs/PRD.md](docs/PRD.md) for the full product spec.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no environment variables set, the app stores data in `.data/db.json`
and uses seed puzzles, so every game is playable offline. Copy `.env.example` to `.env.local` to connect
Supabase (accounts, shared data) and Gemini (daily content generation).

## Layout

| Path | What |
|---|---|
| `app/` | Hub, `/play/<game>`, summary, auth, leaderboards, clans, API and cron routes |
| `games/<id>/` | One folder per game: `meta.ts`, `server.ts` (load + score), `client.tsx` (playable), `share.ts` |
| `shared/` | ET day helpers, store (Supabase or local JSON), answer matcher, scoring, i18n, UI kit |
| `jobs/` | Content generation, automatic checks, percentile lock, nightly review |
| `supabase/schema.sql` | Database schema |

## Game contract

Each game's `server.ts` exports `load(day, variant)`, `toPublic(full)` (strips answers) and
`score(full, payload)`, which recomputes the raw score on the server from what the player did.
`client.tsx` gets `{ puzzle, day, variant, lang, onFinish }` and calls `onFinish(payload)` once.
Every game runs on its own at `/play/<game>` with no login.

## Branches

| Branch | Contents |
|---|---|
| `main` | Hub shell, game contract, shared code, schema, FR/EN switch |
| `game/<id>` | One game, English (branched from `main`) |
| `game/<id>-fr` | French content for that game (branched from `game/<id>`) |
| `feature/scoring` → `feature/accounts-leaderboards` → `feature/clans` → `feature/sharing` | Stacked platform features |
| `feature/generation` | Gemini generation jobs, automatic checks, backup bank |
| `dev` | Everything merged, for play-testing before merging to `main` |
