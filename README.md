# ZAUNITED: Kingdom Portal 👑

**From nothing, we shall rise.**

🌐 **Live:** <https://zaunited-portal.pages.dev>

The official community portal for the Kingdom of Zaun. Join the realm, watch the
kingdom grow and help shape its future.

ZAUNITED is a fantasy-comedy story following **King Mesmer**, a fallen (and
silent) king trying to rebuild the Kingdom of Zaun before an approaching
darkness, **the Hollowing**, arrives. Every new Zaunite helps the kingdom grow,
and community milestones unlock new developments.

## What the portal shows

- **Population of Zaun:** verified YouTube, TikTok and Instagram follows, added
  together as *Zaunites: Combined Platform Follows*. Each figure shows its
  source and verification date. Someone following on several platforms is
  counted more than once, and the site says so.
- **Join the Realm:** big, easy-to-tap buttons to follow ZAUNITED on any one platform.
- **Kingdom Milestones:** 1, 10, 25, 50 and 100 Zaunites. Once unlocked, a milestone stays unlocked.
- **The Hollowing:** a *story-time* countdown (30 story days) that only moves
  when a story-day episode is officially published.
- **Watch the Chronicles:** links back to the videos.
- **Coming soon:** *Suggest an Upgrade* and *The Royal Council* (not open yet).

## Official accounts

- YouTube: <https://www.youtube.com/@zaunited1>
- TikTok: <https://www.tiktok.com/@zaunited_>
- Instagram: <https://www.instagram.com/zaunited/>

## How it works

The MVP is a fast, static website built with [Astro](https://astro.build). It
ships **no JavaScript**, has no accounts, forms, cookies or trackers, and needs
no secrets.

All kingdom records (population, milestone unlocks, story days) live in
[`data/kingdom.json`](data/kingdom.json). Every change is validated before the
site builds. 👉 **[How to update the kingdom from an iPad](docs/UPDATING-THE-KINGDOM.md)**

```
data/kingdom.json        ← the kingdom's records (edit this)
src/lib/kingdom.ts       ← validation rules and calculations
src/components/          ← page sections
src/pages/index.astro    ← the homepage
scripts/validate-kingdom.ts
tests/                   ← unit tests (Node's built-in test runner)
docs/                    ← guides (updating, deployment)
```

## Developing locally

Requires Node.js 22.23 or newer.

```sh
npm install
npm run dev        # local preview at http://localhost:4321
npm run verify     # validate data + tests + type-check + build + built-site tests (same as CI)
```

| Command | What it does |
| --- | --- |
| `npm run validate:data` | Checks `data/kingdom.json` against every rule |
| `npm test` | Runs the unit tests |
| `npm run check` | Type-checks the project |
| `npm run build` | Validates the data, then builds the site into `dist/` |
| `npm run test:build` | After a build: checks link-preview tags and the figures shown on the page |

## Roadmap

See [docs/ZAUNITED_ROADMAP.md](docs/ZAUNITED_ROADMAP.md) for the approved long-term
project direction. The current priority is the M0–M1 portal MVP; later phases
each need separate approval.

## Contributing

This repository is currently private while the portal is being built. See
[CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
and [SECURITY.md](SECURITY.md).

The portal is deliberately independent of ZAUNITED's private animation
pipeline: no production code, unpublished scripts or private assets belong here.

⚔️ Welcome, Zaunite. Your kingdom awaits.
