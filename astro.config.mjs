// @ts-check
import { defineConfig } from 'astro/config';

// The portal is a fully static site for the MVP (M1): no server code,
// no database and no secrets. Everything is rebuilt from data/kingdom.json.
export default defineConfig({
  // The live public address. It makes the link-preview (Open Graph) tags use
  // absolute URLs, which social apps require. A SITE_URL environment variable
  // in Cloudflare Pages can override it (e.g. if the address ever changes).
  site: process.env.SITE_URL || 'https://zaunited-portal.pages.dev',
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
  devToolbar: { enabled: false },
});
