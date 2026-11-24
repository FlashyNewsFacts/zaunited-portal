# Deployment: Cloudflare Pages (live)

> **Status: LIVE** at **<https://zaunited-portal.pages.dev>**, launched
> 24 November 2026 on the free Cloudflare Pages plan.

| Setting | Value |
| --- | --- |
| Public address | **`https://zaunited-portal.pages.dev`** |
| Cloudflare Pages project | `zaunited-portal` |
| Who can see it | Everyone; no login or registration |
| Production branch | `main`. Every merge into `main` goes live in about 1–2 minutes |
| Preview deployments | **Off** (preview branch: None) |
| Repository | **Private** |
| Domain | None purchased; the free `pages.dev` address is used |
| Cost | £0 |

## How it works

1. A pull request is reviewed and merged into `main`.
2. Cloudflare Pages runs `npm run build`. This checks `data/kingdom.json`, then builds the static site into `dist/`.
3. Pages publishes `dist/`. If the build fails, nothing changes and the
   live site keeps its last good version.

GitHub CI runs the same checks on every pull request (data validation, unit
tests, type-check, build, then built-site tests for link previews and figures).

**Files that shape what visitors get:**
- `astro.config.mjs`: `site` is set to the live address, so link previews use full URLs.
- `public/_headers`: security headers (all scripts blocked) and long-term caching for images.
- `src/pages/404.astro` → `404.html`: shown for unknown addresses with a real 404 status.
- `public/og-image.jpg`: the link-preview image (1200 × 630 crop of the official banner).

No Cloudflare configuration file is kept in the repository.

## Cloudflare Pages settings (as configured)

| Where in the dashboard | Setting |
| --- | --- |
| Settings → Build → Build configuration | Framework preset **Astro**, build command `npm run build`, output directory `dist`, root directory blank |
| Settings → Build → Branch control | Production branch **`main`**, automatic deployments **on**; preview branch **None** |
| Settings → Variables and Secrets (optional) | `NODE_VERSION` = `22.23.5`. `SITE_URL` is **not needed**: the address is built in. If set, it must be exactly `https://zaunited-portal.pages.dev` |
| Settings → General | Project name `zaunited-portal` (this sets the address) |

**Checking that previews stay off:** Pages posts a "Cloudflare Pages" check on
pull requests when it builds previews. If pull requests show only the
"Validate data, test, type-check and build" check, previews are off.

## Everyday tasks (iPad)

- **Record a census:** the iPad form in [CENSUS.md](CENSUS.md) opens a pull
  request; merging it publishes the new figures.
- **Record a story day / manual edits:** follow
  [UPDATING-THE-KINGDOM.md](UPDATING-THE-KINGDOM.md). Merging into `main` publishes it.
- **See what's live:** dash.cloudflare.com → Workers & Pages → `zaunited-portal` → **Deployments**.
- **Undo a bad update:** Deployments → choose an earlier deployment → **⋯ → Rollback to this deployment**.
- **Take the site offline:** Settings → **Delete project**. This removes the site; the
  repository is untouched, and the site can be recreated with Pages' "Connect to Git".

## Who has access to what

| Access | Who | How it stays private |
| --- | --- | --- |
| Public website | Everyone | Read-only static pages, no logins, forms, cookies or trackers |
| Source code and kingdom records | The owner (and invited collaborators) | Private GitHub repository + 2FA |
| Deployments and settings | The owner | Cloudflare account + 2FA; the Cloudflare GitHub app sees only this repository |
| Secrets | None exist | The site needs no API keys or passwords |

Only the build output (`dist/`) is published. Source code, original artwork,
`data/kingdom.json` and documentation are never served. Checked after launch:
those addresses return the 404 page.

## One-off clean-up (owner)

An earlier attempt used Cloudflare **Workers Builds**, which failed with an
account-level "stale build token" error before publishing anything. It is
**not used**. When convenient:

- [ ] Workers & Pages → **`kingdom`** (the Worker, not the Pages project) → Settings → **Delete**.
- [ ] My Profile → API Tokens → delete unused **Workers Builds** tokens.
- [ ] **Keep** the Pages project `zaunited-portal`, and **keep** the
      "Cloudflare Workers and Pages" app on GitHub (Pages uses it).

## Free-plan limits (checked 24 November 2026)

| Item | Pages Free | This site |
| --- | --- | --- |
| Static requests and bandwidth | Unlimited | |
| Builds | 500 per month | One per merge into `main` |
| Concurrent builds | 1 | |
| Build timeout | 20 minutes | About 1 minute |
| Files per site | 20,000 | About 40 |
| Max file size | 25 MiB | Largest about 0.3 MB |

Nothing on this plan costs money for the current static site.

### Sources
- Pages limits: <https://developers.cloudflare.com/pages/platform/limits/>
- Serving Pages (404 handling): <https://developers.cloudflare.com/pages/configuration/serving-pages/>
- Workers Builds stale-token issue: <https://developers.cloudflare.com/workers/ci-cd/builds/troubleshoot/>
