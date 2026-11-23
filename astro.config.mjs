// @ts-check
import { defineConfig } from 'astro/config';

// The portal is a fully static site for the MVP (M1): no server code,
// no database and no secrets. Everything is rebuilt from data/kingdom.json.
export default defineConfig({
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
  devToolbar: { enabled: false },
});
