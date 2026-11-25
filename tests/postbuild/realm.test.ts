/**
 * Checks the BUILT homepage (dist/index.html) for the factions, ranks,
 * proposals and story-day chronicle. Figures are compared with the data
 * files, so census updates don't need test changes.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { deriveKingdom, type KingdomData } from '../../src/lib/kingdom.ts';
import { PLATFORMS } from '../../src/lib/site.ts';
import type { Realm } from '../../src/lib/realm.ts';

const page = new URL('../../dist/index.html', import.meta.url);
assert.ok(existsSync(page), 'dist/index.html is missing. Run "npm run build" before "npm run test:build".');
const html = readFileSync(page, 'utf8').replace(/ data-astro-cid-[a-z0-9]+/g, '');
const kingdom: KingdomData = JSON.parse(readFileSync(new URL('../../data/kingdom.json', import.meta.url), 'utf8'));
const realm: Realm = JSON.parse(readFileSync(new URL('../../data/realm.json', import.meta.url), 'utf8'));
const view = deriveKingdom(kingdom);

/** The HTML of one section, by id. */
function section(id: string): string {
  const start = html.indexOf(`id="${id}"`);
  assert.ok(start > 0, `section #${id} is missing`);
  return html.slice(start, html.indexOf('</section>', start));
}
const text = (s: string) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

test('each faction card shows its platform count from the census, and links to the official profile', () => {
  const factions = section('factions');
  for (const f of realm.factions) {
    const card = factions.slice(factions.indexOf(`faction--${f.crest}`));
    const body = card.slice(0, card.indexOf('</article>'));
    const platform = PLATFORMS.find((p) => p.id === f.platform)!;
    assert.match(text(body), new RegExp(`${f.name}`));
    assert.match(body, new RegExp(`<strong>${kingdom.population[f.platform].count}</strong>`), `${f.name} count`);
    assert.ok(body.includes(`href="${platform.profileUrl}"`), `${f.name} links to ${platform.profileUrl}`);
  }
});

test('the factions section has the approved title and tagline', () => {
  const t = text(section('factions'));
  assert.match(t, /The Three Factions of Zaun/);
  assert.match(t, /Three platforms\. Three factions\. One kingdom\./);
});

test('the Royal Hierarchy lists the six ranks in order, with nobody promoted and rules marked coming soon', () => {
  const ranks = section('ranks');
  const names = [...ranks.matchAll(/<span class="rung-name">([^<]+)<\/span>/g)].map((m) => m[1]);
  assert.deepEqual(names, realm.ranks);
  assert.match(text(ranks), /No Zaunite has been promoted yet/);
  assert.match(text(ranks), /Advancement rules: coming soon/);
});

test('proposals are shown as open, with no votes, winners or percentages', () => {
  const ranks = text(section('ranks'));
  for (const p of realm.proposals) assert.match(ranks, new RegExp(p.title));
  assert.doesNotMatch(ranks, /\d+\s*(votes?|%)|winner|won\b/i);
});

test('the Hollowing shows the countdown from the recorded story days, each day exactly once', () => {
  const hollowing = section('hollowing');
  assert.match(text(hollowing), new RegExp(`The Hollowing ${view.storyDaysRemaining} Story Days? Remain`, 'i'));
  for (const d of kingdom.story.storyDays) {
    const badges = hollowing.match(new RegExp(`>Story Day ${d.day}<`, 'g')) ?? [];
    assert.equal(badges.length, 1, `Story Day ${d.day} appears once`);
  }
  assert.match(text(hollowing), new RegExp(`Story Day ${view.storyDaysPublished + 1} Not yet published`));
});
