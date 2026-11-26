import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { APPROVED_RANKS, validateRealm, type Realm } from '../src/lib/realm.ts';
import type { KingdomData } from '../src/lib/kingdom.ts';

const read = (file: string) => JSON.parse(readFileSync(new URL(`../data/${file}`, import.meta.url), 'utf8'));
const kingdom = (): KingdomData => read('kingdom.json');
const realm = (): Realm => read('realm.json');

test('the committed realm.json is valid', () => {
  assert.deepEqual(validateRealm(realm(), kingdom()), []);
});

test('there are three factions, one per platform, with the approved names', () => {
  const byPlatform = Object.fromEntries(realm().factions.map((f) => [f.platform, f.name]));
  assert.deepEqual(byPlatform, {
    youtube: 'The Order of the Ember',
    tiktok: 'The Stonewright Guild',
    instagram: 'The Moonveil Court',
  });
});

test('first petitions are the genuine Day 1 requests, and the Moonveil Court is invited (not empty)', () => {
  const [ember, stone, moon] = ['youtube', 'tiktok', 'instagram'].map((p) => realm().factions.find((f) => f.platform === p)!);
  assert.deepEqual(ember.petition, { author: '@AkhiFR', text: 'A dragon to defend thy king 🐉' });
  assert.deepEqual(stone.petition, {
    author: 'Apple.222',
    text: 'we need a house for me and a wall to protect from animals',
  });
  assert.equal(moon.petition, null);
  assert.equal(moon.achievement, null);
  assert.match(moon.invitation ?? '', /first eligible community petition/);
  assert.doesNotMatch(moon.invitation ?? '', /no members|empty/i);
});

test('Day 1 achievements: an unhatched egg, an unfinished house and a wall that stopped a boar', () => {
  const ember = realm().factions.find((f) => f.platform === 'youtube')!;
  const stone = realm().factions.find((f) => f.platform === 'tiktok')!;
  assert.equal(ember.achievement?.day, 1);
  assert.ok(ember.achievement?.points.some((p) => p.includes('has not hatched')));
  assert.ok(!ember.achievement?.points.some((p) => /evil/i.test(p)), 'foreshadowing only, never "evil"');
  assert.ok(stone.achievement?.points.some((p) => p.includes('not finished')));
  assert.ok(stone.achievement?.points.some((p) => p.includes('boar')));
});

test('a faction cannot claim an achievement from an unpublished story day', () => {
  const k = kingdom();
  k.story.storyDays = [];
  assert.ok(validateRealm(realm(), k).some((e) => e.includes('Story Day 1, which is not recorded')));
});

test('follower counts cannot be duplicated into realm.json', () => {
  const r = realm() as unknown as { factions: Record<string, unknown>[] };
  r.factions[0].followers = 7;
  assert.ok(validateRealm(r, kingdom()).some((e) => e.includes('come from the census')));
});

test('the Royal Hierarchy is exactly the approved six ranks, in order, with nobody promoted', () => {
  assert.deepEqual(realm().ranks, [...APPROVED_RANKS]);
  assert.deepEqual(APPROVED_RANKS, ['Wanderer', 'Settler', 'Artisan', 'Guildmaster', 'Noble', 'Royal Council']);
  const r = realm() as unknown as Record<string, unknown>;
  assert.equal('members' in r || 'promotions' in r, false);
  r.ranks = ['Wanderer', 'Settler', 'Noble'];
  assert.ok(validateRealm(r, kingdom()).some((e) => e.includes('approved hierarchy')));
});

test('proposals are open ideas only: no votes, winners or rankings', () => {
  assert.deepEqual(
    realm().proposals.map((p) => [p.title, p.status]),
    [
      ['Better Defences', 'open'],
      ['Raise an Army', 'open'],
      ['Dragon Sanctuary', 'open'],
    ],
  );
  const r = realm() as unknown as { proposals: Record<string, unknown>[] };
  r.proposals[0].votes = 42;
  r.proposals[1].status = 'won';
  const errors = validateRealm(r, kingdom());
  assert.ok(errors.some((e) => e.includes('no votes, winners or rankings')));
  assert.ok(errors.some((e) => e.includes('status must be "open"')));
});
