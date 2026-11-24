/**
 * Checks the BUILT site (dist/), so run it after `astro build`:
 *   npm run build && npm run test:build
 *
 * Verifies the social-sharing (link preview) metadata, the preview image,
 * and that the built page shows the same figures as data/kingdom.json.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { deriveKingdom, type KingdomData } from '../../src/lib/kingdom.ts';

const LIVE_URL = 'https://zaunited-portal.pages.dev';
const SITE = (process.env.SITE_URL || LIVE_URL).replace(/\/$/, '');
const dist = new URL('../../dist/', import.meta.url);

function read(path: string): string {
  const file = new URL(path, dist);
  assert.ok(existsSync(file), `dist/${path} is missing. Run "npm run build" before "npm run test:build".`);
  return readFileSync(file, 'utf8');
}

/** Collects <meta property|name="..." content="..."> and <link rel="..." href="..."> values. */
function headTags(html: string): Map<string, string> {
  const tags = new Map<string, string>();
  for (const m of html.matchAll(/<meta\s+(?:property|name)="([^"]+)"\s+content="([^"]*)"/g)) tags.set(m[1], m[2]);
  for (const m of html.matchAll(/<link\s+rel="([^"]+)"\s+href="([^"]*)"/g)) tags.set(`link:${m[1]}`, m[2]);
  return tags;
}

/** Reads width and height from a baseline/progressive JPEG's SOF marker. */
function jpegSize(buf: Buffer): { width: number; height: number } {
  assert.equal(buf.readUInt16BE(0), 0xffd8, 'og-image.jpg is not a JPEG');
  let i = 2;
  while (i < buf.length) {
    const marker = buf.readUInt16BE(i);
    const length = buf.readUInt16BE(i + 2);
    if (marker >= 0xffc0 && marker <= 0xffc3) return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    i += 2 + length;
  }
  throw new Error('JPEG size not found');
}

const home = headTags(read('index.html'));

test('homepage link preview uses the live address', () => {
  assert.equal(home.get('og:url'), `${SITE}/`);
  assert.equal(home.get('link:canonical'), `${SITE}/`);
  assert.equal(home.get('og:type'), 'website');
  assert.equal(home.get('og:site_name'), 'ZAUNITED');
  assert.ok(home.get('og:title')?.includes('ZAUNITED'));
  assert.ok((home.get('og:description') ?? '').length > 20);
});

test('homepage link preview shows the approved banner image', () => {
  assert.equal(home.get('og:image'), `${SITE}/og-image.jpg`);
  assert.equal(home.get('og:image:type'), 'image/jpeg');
  assert.equal(home.get('og:image:width'), '1200');
  assert.equal(home.get('og:image:height'), '630');
  assert.ok((home.get('og:image:alt') ?? '').includes('ZAUNITED banner'));
  assert.equal(home.get('twitter:card'), 'summary_large_image');
});

test('the preview image is published, 1200 × 630 and small enough for messaging apps', () => {
  const file = new URL('og-image.jpg', dist);
  assert.ok(existsSync(file), 'dist/og-image.jpg is missing');
  assert.deepEqual(jpegSize(readFileSync(file)), { width: 1200, height: 630 });
  assert.ok(statSync(file).size < 300 * 1024, 'og-image.jpg should stay under 300 KB (some apps skip larger images)');
});

test('the 404 page is not indexed and does not claim an address', () => {
  const tags = headTags(read('404.html'));
  assert.equal(tags.get('robots'), 'noindex');
  assert.equal(tags.has('og:url'), false);
  assert.equal(tags.has('link:canonical'), false);
});

test('the built homepage shows the figures recorded in data/kingdom.json', () => {
  const html = read('index.html');
  const data: KingdomData = JSON.parse(readFileSync(new URL('../../data/kingdom.json', import.meta.url), 'utf8'));
  const view = deriveKingdom(data);
  const text = (cls: string) => html.match(new RegExp(`class="${cls}"[^>]*>([^<]+)<`))?.[1].trim();
  assert.equal(text('census-number'), new Intl.NumberFormat('en-GB').format(view.combined));
  assert.equal(text('hollow-number'), String(view.storyDaysRemaining));
});
