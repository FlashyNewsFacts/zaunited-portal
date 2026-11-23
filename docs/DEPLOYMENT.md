# Deployment: free Cloudflare Pages (`zaunited.pages.dev`)

> **Status: not deployed.** Launching needs explicit approval from the
> ZAUNITED owner. The first successful Pages build **is** the launch.

**Decisions:**
- **23 Nov 2026:** free hosting, no purchased domain.
- **24 Nov 2026:** Cloudflare Pages instead of Workers Builds, whose build token failed at the account level.

| Setting | Value |
| --- | --- |
| Public address | **`https://zaunited.pages.dev`** (if the name is free; see Step 3) |
| Who can see it | Everyone; no login or registration |
| Production branch | `main`. Every merge into `main` goes live in about a minute |
| Preview deployments | **Off** |
| Repository | Stays **private** |
| Cost | £0 |

No configuration file is needed in the repository: Pages reads its settings
from the dashboard. The site is plain static files (`npm run build` → `dist/`).
`public/_headers` adds the security headers, and `404.html` is served for
unknown addresses.

---

## Before you start

### Remove the old Workers connection (important)
The `kingdom` Worker created earlier is still connected to this repository.
It hasn't published anything, but remove it so only Pages deploys:

1. **dash.cloudflare.com → Compute (Workers) → Workers & Pages → `kingdom`**.
2. **Settings → (scroll to the bottom) → Delete** and confirm.
   *Alternative:* **Settings → Build → Disconnect** if you'd rather keep the Worker.
3. Optional: **My Profile → API Tokens**, and delete the unused "Workers Builds" tokens.

### GitHub (github.com in Safari)
- [ ] **Two-factor authentication** on your GitHub account.
- [ ] Repository stays **Private**.
- [ ] **Dependabot alerts** on (Settings → Code security).
- [ ] Optional: **protect `main`** (Settings → Branches/Rules). On private
      repositories this needs a paid GitHub plan; if offered an upgrade, skip it.

### Cloudflare
- [ ] Two-factor authentication on (My Profile → Authentication).

---

## Step-by-step on iPad (Safari)

Cloudflare occasionally renames menu items. If a label differs slightly,
look for the nearest match. Tap ☰ (top left) to open the menu on iPad.

### Step 1: Start a Pages project
1. Go to **dash.cloudflare.com** and sign in.
2. Open **Compute (Workers) → Workers & Pages**.
3. Tap **Create** (or **Create application**), then choose the **Pages** tab.
   Don't use the Workers "Import a repository" option.
4. Tap **Connect to Git** (or **Import an existing Git repository**) → **Get started**.

### Step 2: Connect GitHub (private repository)
1. Choose **GitHub** → **Connect GitHub** (or **Add account**).
2. GitHub opens. Install the **Cloudflare Workers and Pages** app on your account.
3. Choose **Only select repositories → `FlashyNewsFacts/zaunited-portal`** →
   **Install & Authorise**. Your repository stays private; only Cloudflare can read it.
4. Back in Cloudflare, select **`zaunited-portal`** → **Begin setup**.

### Step 3: Set up builds and deployments
Enter exactly:

| Field | Value |
| --- | --- |
| Project name | **`zaunited`** (this becomes `zaunited.pages.dev`) |
| Production branch | `main` |
| Framework preset | **Astro** |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory (advanced) | leave blank |

Under **Environment variables (advanced)**, add:

| Variable name | Value |
| --- | --- |
| `NODE_VERSION` | `22.23.5` |
| `SITE_URL` | `https://zaunited.pages.dev` |

**If the name `zaunited` is taken,** Cloudflare shows a different address
(e.g. `zaunited-abc.pages.dev`) on the next screen. Then set `SITE_URL` to
that exact address (Settings → Variables and Secrets) and redeploy, or ask Claude.

Tap **Save and Deploy**. The build takes 1–2 minutes. **When it finishes, the
site is public.**

### Step 4: Turn off preview deployments
1. Open the **`zaunited`** project → **Settings → Build** (or **Builds & deployments**).
2. Find **Branch control**: keep the production branch **`main`** with
   automatic deployments **enabled**.
3. Set **Preview branch** to **None** and **Save**.

Pages also gives each production deployment its own extra address
(`<id>.zaunited.pages.dev`). These show the same public site and can be ignored.

### Step 5: Check the live site
1. Open **https://zaunited.pages.dev** in a **Private** tab (to see it as a visitor would).
2. Check:
   - the banner and the Hollowing artwork
   - **9** Combined Platform Follows
   - The First Zaunite unlocked ("Unlock recorded 23 November 2026")
   - **30 STORY DAYS REMAIN**
   - every YouTube, TikTok and Instagram button works
3. Try `https://zaunited.pages.dev/test`. You should see "Lost in the mist".
4. On iPhone: **Share → Add to Home Screen** should show the ZAUNITED badge.
5. Tell Claude it's live, so Claude can check the security headers and link preview.

Then add the address to your TikTok, YouTube and Instagram bios.

---

## After launch

- **Updates:** anything merged into `main` (e.g. a census update; see
  [UPDATING-THE-KINGDOM.md](UPDATING-THE-KINGDOM.md)) rebuilds and goes live
  automatically. If a change fails the checks, the build stops and the site
  keeps its last good version.
- **Undo a bad update:** project → **Deployments** → choose an earlier
  deployment → **⋯ → Rollback to this deployment**.
- **Take the site offline:** project → **Settings → Delete project**. This removes
  the site; the repository is untouched, and the site can be recreated with the steps above.

## Who has access to what

| Access | Who | How it stays private |
| --- | --- | --- |
| Public website | Everyone | Read-only static pages, no logins or forms |
| Source code and kingdom records | You (and invited collaborators) | Private GitHub repository + 2FA |
| Deployments and settings | You | Cloudflare account + 2FA; GitHub app limited to one repository |
| Secrets | None exist | The site needs no API keys or passwords |

Only files from the build output (`dist/`) are published. Source code, the
original artwork files, `data/kingdom.json` and documentation are never
served: unknown addresses return the 404 page.

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
- Pages and Wrangler configuration: <https://developers.cloudflare.com/pages/functions/wrangler-configuration/>
- Workers Builds stale-token issue: <https://developers.cloudflare.com/workers/ci-cd/builds/troubleshoot/>

These figures were taken from search summaries of the pages above; the pages
themselves couldn't be opened from the build environment. Re-check them in
the dashboard if anything looks different.
