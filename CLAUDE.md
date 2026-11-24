# CLAUDE.md: ZAUNITED Kingdom Portal

Public, mobile-first fantasy kingdom site for ZAUNITED (Astro, static output).

## Roadmap
- [`docs/ZAUNITED_ROADMAP.md`](docs/ZAUNITED_ROADMAP.md) is the approved long-term direction. It is **not** permission to start more work.
- Current priority and only authorised scope: **M0–M1 portal MVP**. Don't start M2+ portal features, community voting, episode production or StoryForge changes without separate explicit approval.

## Hard rules
- Never invent follower/subscriber figures. Counts come only from `data/kingdom.json`, via the census workflow (YouTube Data API + owner-entered TikTok/Instagram) or the owner's manual edits, each with `verifiedAt`, `source` and `method`. Never invent a verification time.
- Every population change goes through a pull request the owner merges; no auto-merge. New unlocks need all three counts within 48 hours (`CENSUS_WINDOW_HOURS`).
- Combined total = YouTube + TikTok + Instagram, labelled "Zaunites: Combined Platform Follows"; never call it unique people.
- Milestone unlocks are permanent (`unlockedOn` dates are never removed).
- The Hollowing is story time: it only advances via recorded `story.storyDays`. Prophecy = Day 0; historical Episode 1 does not count.
- Keep the portal independent of StoryForge: no private code, assets, unpublished scripts or credentials.
- No secrets in source control. Don't deploy, buy domains, connect services or change repo visibility without owner approval.
- Hosting: LIVE on free Cloudflare Pages at https://zaunited-portal.pages.dev (project `zaunited-portal`). Production branch `main` (merging publishes); preview deployments off. No domain purchase. See `docs/DEPLOYMENT.md`.
- Don't delete or change Cloudflare resources; the owner manages them.
- Coming-soon features (suggestions, Royal Council) must not appear to work until they are built and approved.

## Commands
- `npm run verify`: validate data, unit tests, type-check, build, built-site tests (same as CI)
- `npm run test:build`: after a build, checks link-preview metadata and that the page shows the recorded figures
- `npm run dev`: local dev server

## Layout
- `data/kingdom.json`: records; `src/lib/kingdom.ts`: validation + derived values (pure, shared by tests/script/page)
- `src/components/*.astro`: page sections; `src/styles/global.css`: design tokens
- `src/lib/census.ts` (pure census logic) + `scripts/census.ts` (I/O) + `.github/workflows/census.yml` (iPad form; secret `YOUTUBE_API_KEY`)
- `docs/CENSUS.md` and `docs/UPDATING-THE-KINGDOM.md`: owner's iPad guides (keep in sync with validation rules)
