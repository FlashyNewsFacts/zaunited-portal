# Deployment: free Cloudflare workers.dev address

> **Status: not deployed.** Nothing in this repository is connected to
> Cloudflare yet. Launching needs explicit approval from the ZAUNITED owner.

**Decision (23 Nov 2026):** the portal launches on Cloudflare's **free
`workers.dev` address**. No domain is purchased for this launch.

| Setting | Value |
| --- | --- |
| Public address | `https://kingdom.<your-subdomain>.workers.dev`. We suggest the account subdomain **`zaunited`**, giving **`https://kingdom.zaunited.workers.dev`** |
| Who can see it | Everyone; no login or registration |
| Preview links | Off |
| Repository | Stays **private** |
| Cost | £0 (Workers Free plan) |

The deployment settings live in [`wrangler.jsonc`](../wrangler.jsonc):
the Worker name is `kingdom`, it serves the built site from `dist/`, the
production `workers.dev` address is on, and preview URLs are off.

---

## Before deployment: settings to check

### GitHub (github.com in Safari)

- [ ] **Two-factor authentication** on your GitHub account
      (profile picture → Settings → Password and authentication).
- [ ] The repository stays **Private** (repository → Settings → General → Danger Zone; don't change it).
- [ ] **Dependabot alerts** on (repository → Settings → Code security → Dependabot alerts → Enable).
- [ ] **Protect `main`** (repository → Settings → Branches or Rules → add a rule for `main`):
      require a pull request, require the status check
      **"Validate data, test, type-check and build"**, and block force pushes.
      *If GitHub says this needs an upgrade:* rules on **private** repositories
      need a paid GitHub plan. Skip it, and keep the habit of changing `main`
      only through reviewed pull requests.
- Private vulnerability reporting only works on public repositories; leave it until the code is made public.

### Cloudflare

- [ ] A free Cloudflare account with **two-factor authentication** on.
- [ ] The Cloudflare GitHub app is allowed to see **only** `zaunited-portal`.
- [ ] Builds for **non-production branches are off** (only `main` deploys).
- [ ] **Preview URLs off** (already set in `wrangler.jsonc`).
- [ ] The production **workers.dev address on**, and **no Cloudflare Access/login** on it.

---

## Step-by-step on iPad (Safari)

Cloudflare occasionally renames menu items. If a label differs slightly,
look for the nearest match.

**Order:** finish the GitHub checklist → approve and merge PR #1 → then
connect Cloudflare (Steps 1–6). The first build after Step 4 **is the launch**:
the site becomes public at the workers.dev address.

### Step 1: Create and secure the Cloudflare account
1. Go to **dash.cloudflare.com** and sign up with the ZAUNITED email.
2. Choose the **Free** plan if asked. No card is needed for Workers Free.
3. Open your profile icon → **My Profile → Authentication** and turn on
   **two-factor authentication** (an authenticator app is best).

### Step 2: Choose the free workers.dev subdomain
1. In the left menu (tap ☰ on iPad), open **Compute (Workers) → Workers & Pages**.
2. Cloudflare asks you to pick your **workers.dev subdomain** (or find it
   under **Account details / Subdomain** on that page).
3. Enter **`zaunited`**. If it's taken, try `kingdomofzaun` or `zaunited-kingdom`.
   The site address will be `https://kingdom.<subdomain>.workers.dev`.

### Step 3: Connect the GitHub repository
1. **Workers & Pages → Create → Import a repository** (it may say "Connect to Git").
2. Choose **GitHub** and sign in.
3. When GitHub asks which repositories Cloudflare may access, choose
   **Only select repositories → `FlashyNewsFacts/zaunited-portal`**, then **Install & Authorise**.
4. Select `zaunited-portal`.

### Step 4: Build settings
Enter exactly:

| Field | Value |
| --- | --- |
| Project / Worker name | `kingdom` (must match `wrangler.jsonc`) |
| Production branch | `main` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | leave blank (or `/`) |
| Non-production branch builds | **Off** / unticked |

Open **Advanced settings → Build variables** and add:

| Variable | Value |
| --- | --- |
| `NODE_VERSION` | `22.23.5` |
| `SITE_URL` | `https://kingdom.zaunited.workers.dev` (use your real subdomain) |

`SITE_URL` turns on the link-preview image when the site is shared. Neither value is secret.

Tap **Save and Deploy**. The build takes about a minute.

### Step 5: Check the Worker's settings
Open the `kingdom` Worker → **Settings → Domains & Routes**:
- **workers.dev:** **Enabled** (this is the public site).
- **Preview URLs:** **Disabled**.
- Do **not** turn on Cloudflare Access ("Protect with Access") for the
  workers.dev route. That would make visitors log in.

Then **Settings → Build**: confirm only `main` builds, and that
non-production branch builds are off.

### Step 6: Check the live site
1. Open the address in Safari **and in a Private tab** (so you see it as a visitor would, with no login).
2. Check the banner, the population (**9**), The First Zaunite unlocked,
   **30 STORY DAYS REMAIN**, and tap every YouTube, TikTok and Instagram button.
3. On iPhone: **Share → Add to Home Screen** should show the ZAUNITED badge.
4. Tell Claude the final address. Claude can check the security headers
   and the link preview.

Then put the address in your TikTok, YouTube and Instagram bios.

---

## Updating the live site afterwards

Every change merged into `main` (for example a census update; see
[UPDATING-THE-KINGDOM.md](UPDATING-THE-KINGDOM.md)) rebuilds and goes live
automatically in about a minute. If a change fails the checks, the build
stops and the site keeps its last good version.

**To take the site offline quickly:** Worker → Settings → Domains & Routes →
workers.dev → **Disable**.

## Who has access to what

| Access | Who | How it stays private |
| --- | --- | --- |
| Public website | Everyone | Read-only static pages, no logins or forms |
| Source code and kingdom records | You (and invited collaborators) | Private GitHub repository + 2FA |
| Deployments and settings | You | Cloudflare account + 2FA; GitHub app limited to one repository |
| Secrets | None exist | The site needs no API keys or passwords |

## Free-tier limits (checked 23 November 2026)

| Item | Free plan | Notes |
| --- | --- | --- |
| Static asset requests | Free and unlimited | The whole portal is static, so normal visits don't use the Worker request quota |
| Worker requests | 100,000 per day | Only relevant if server features (M2+) are added; resets at midnight UTC |
| Static files per version | 20,000 | The portal uses about 25 |
| Max file size | 25 MiB | The largest file is about 0.3 MB |
| Workers Builds minutes | 3,000 per month | A build takes about a minute |
| Concurrent builds | 1 | |
| Build timeout | 20 minutes | |

**What could cost money later:** nothing for this static launch. Server
features (M2+) going past 100,000 requests a day would need the $5/month
Workers Paid plan.

### Preview URLs

Preview URLs follow the Worker's `workers.dev` setting by default (Wrangler
4.44+), so with `workers.dev` on they would also be on. `wrangler.jsonc`
therefore sets `"preview_urls": false` explicitly. If the dashboard toggle
is changed without updating the file, the next deploy resets it to the
file's value.

### Security headers

`public/_headers` sets the Content-Security-Policy (all scripts blocked),
`X-Frame-Options`, `Referrer-Policy` and long-term caching for
fingerprinted files. Confirm them after launch, e.g.
`curl -I https://kingdom.zaunited.workers.dev/`.

### Sources

- Workers limits: <https://developers.cloudflare.com/workers/platform/limits/>
- Static assets billing and limitations: <https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/>
- Workers pricing: <https://developers.cloudflare.com/workers/platform/pricing/>
- Workers Builds limits and pricing: <https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/>
- Workers Builds overview: <https://developers.cloudflare.com/workers/ci-cd/builds/>
- workers.dev routing: <https://developers.cloudflare.com/workers/configuration/routing/workers-dev/>
- Preview URLs: <https://developers.cloudflare.com/workers/versions-and-deployments/preview-urls/>

These figures were taken from search summaries of the pages above; the pages
themselves couldn't be opened from the build environment. Re-check them in
the Cloudflare dashboard before deploying.
