# Deployment plan (NOT yet enabled)

> **Status:** the portal is **not deployed**. Nothing in this repository
> connects to Cloudflare or any other service. Deploying needs explicit
> approval from the ZAUNITED owner.

## Recommended approach: Cloudflare Workers (static assets) + Workers Builds

The MVP is a fully static site (`npm run build` → `dist/`). It has no server
code, database or secrets.

### Proposed steps (when approved)

1. Create a free Cloudflare account (owner's account, with 2-factor authentication).
2. **Workers & Pages → Create → Import a repository** and authorise the
   Cloudflare GitHub app for **only** `zaunited-portal`.
3. Build settings:
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy` (Cloudflare's default)
   - Production branch: `main`
   - Assets directory: `dist`
   - A minimal `wrangler.jsonc` (name, `assets.directory: "./dist"`,
     `preview_urls` setting) will be added in the deployment pull request.
     It is deliberately not in the repository yet.
4. Leave the `workers.dev` address and **preview URLs** disabled, or protect
   them with Cloudflare Access, until launch is approved (see below).
5. When approved, attach the custom domain (e.g. `zaunited.com`) and enable it.

`public/_headers` already contains security headers (Content-Security-Policy
with all scripts blocked, `X-Frame-Options`, `Referrer-Policy`, etc.) and
long-term caching for fingerprinted assets. Confirm Cloudflare applies them
with a quick header check after the first deployment.

## Free-tier limits (checked 23 November 2026)

| Item | Free plan | Notes |
| --- | --- | --- |
| Static asset requests | Free and unlimited | This portal is static-only, so normal visits don't use Worker request quota |
| Worker requests | 100,000 per day | Only relevant once server features (M2+) are added; resets at midnight UTC |
| Static files per version | 20,000 | The MVP uses fewer than 10 |
| Max file size | 25 MiB | |
| Workers Builds minutes | 3,000 per month | A build takes well under a minute |
| Concurrent builds | 1 | |
| Build timeout | 20 minutes | |
| Custom domain | Domain registration costs extra (about £8–12/year for a `.com`) | Not purchased |

**What could cost money later:** the $5/month Workers Paid plan, only if
server-side features (M2+) go past 100,000 requests a day; a domain
registration; any paid analytics/Metricool plan for automatic follower data.

### Preview URLs

Preview URLs follow the Worker's `workers.dev` setting by default (Wrangler
4.44+): they are on when `workers.dev` is on. Turning off `workers.dev`
**does not** turn off preview URLs. Disable them separately
(`"preview_urls": false` or **Settings → Domains & Routes**), or put them
behind Cloudflare Access, which can cover all preview URLs.

### Sources

- Workers limits: <https://developers.cloudflare.com/workers/platform/limits/>
- Static assets billing and limitations: <https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/>
- Workers pricing: <https://developers.cloudflare.com/workers/platform/pricing/>
- Workers Builds limits and pricing: <https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/>
- Workers Builds overview: <https://developers.cloudflare.com/workers/ci-cd/builds/>
- Preview URLs: <https://developers.cloudflare.com/workers/versions-and-deployments/preview-urls/>
- Cloudflare Access for Workers: <https://developers.cloudflare.com/workers/configuration/cloudflare-access/>

These figures were taken from search summaries of the pages above; the pages
themselves couldn't be opened from the build environment. Re-check them in
the Cloudflare dashboard before deploying.
