import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { deriveKingdom, validateKingdom, type KingdomData } from '../src/lib/kingdom.ts';

const TODAY = new Date('2026-11-23T12:00:00Z');

function load(): KingdomData {
  return JSON.parse(readFileSync(new URL('../data/kingdom.json', import.meta.url), 'utf8'));
}

function withCounts(data: KingdomData, yt: number | null, tt: number | null, ig: number | null): KingdomData {
  const set = (count: number | null) =>
    count === null
      ? { count: null, verifiedOn: null, source: null }
      : { count, verifiedOn: '2026-11-20', source: 'Platform dashboard' };
  data.population = { youtube: set(yt), tiktok: set(tt), instagram: set(ig) };
  return data;
}

function errorsFor(data: unknown): string[] {
  return validateKingdom(data, TODAY).errors;
}

test('the committed kingdom.json is valid', () => {
  assert.deepEqual(errorsFor(load()), []);
});

test('the committed data contains no invented follower counts', () => {
  const data = load();
  for (const record of Object.values(data.population)) {
    if (record.count !== null) {
      assert.ok(record.source && record.verifiedOn, 'every count must have a source and a verification date');
    }
  }
});

test('the verified census (24 Nov 2026) shows 11 follows, two unlocks and 11/25 to the next', () => {
  const data = load();
  assert.deepEqual(
    Object.fromEntries(Object.entries(data.population).map(([id, p]) => [id, [p.count, p.verifiedOn, p.source]])),
    {
      youtube: [7, '2026-11-24', 'YouTube Studio / Metricool'],
      tiktok: [3, '2026-11-24', 'TikTok profile'],
      instagram: [1, '2026-11-24', 'Instagram profile'],
    },
  );
  const view = deriveKingdom(data);
  assert.equal(view.combined, 11);
  assert.equal(view.lastVerifiedOn, '2026-11-24');
  assert.deepEqual(view.awaitingPlatforms, []);
  assert.deepEqual(
    view.milestones.map((m) => [m.population, m.state]),
    [[1, 'unlocked'], [10, 'unlocked'], [25, 'next'], [50, 'locked'], [100, 'locked']],
  );
  assert.equal(view.milestones[0].unlockedOn, '2026-11-23', 'The First Zaunite keeps its original unlock date');
  assert.equal(view.milestones[1].unlockedOn, '2026-11-24');
  assert.equal(view.latestUnlocked?.title, 'A Small Settlement');
  assert.equal(view.nextMilestone?.title, 'The Village of Zaun');
  assert.equal(view.progressPercent, 44);
  assert.equal(view.storyDaysRemaining, 30);
});

test('with nothing verified, the kingdom awaits verification and the Hollowing shows 30 days', () => {
  const data = withCounts(load(), null, null, null);
  for (const m of data.milestones) m.unlockedOn = null;
  const view = deriveKingdom(data);
  assert.equal(view.combined, 0);
  assert.equal(view.verifiedPlatforms.length, 0);
  assert.equal(view.lastVerifiedOn, null);
  assert.equal(view.storyDaysRemaining, 30);
  assert.equal(view.nextMilestone?.population, 1);
});

test('combined total adds the three platforms', () => {
  const data = withCounts(load(), 3, 4, 5);
  data.milestones[0].unlockedOn = '2026-11-20';
  data.milestones[1].unlockedOn = '2026-11-20';
  assert.deepEqual(errorsFor(data), []);
  const view = deriveKingdom(data);
  assert.equal(view.combined, 12);
  assert.equal(view.nextMilestone?.population, 25);
  assert.equal(view.progressPercent, 48);
  assert.equal(view.lastVerifiedOn, '2026-11-20');
});

test('partially verified platforms are summed and reported', () => {
  const view = deriveKingdom(withCounts(load(), 0, null, null));
  assert.deepEqual(view.verifiedPlatforms, ['youtube']);
  assert.deepEqual(view.awaitingPlatforms, ['tiktok', 'instagram']);
});

test('a reached milestone must be recorded before the build passes', () => {
  const data = withCounts(load(), 10, 0, 0);
  for (const m of data.milestones) m.unlockedOn = null;
  data.milestones[0].unlockedOn = '2026-11-20';
  const errors = errorsFor(data);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /A Small Settlement.*not recorded/);
});

test('milestones stay unlocked when follower counts drop', () => {
  const data = withCounts(load(), 2, 0, 0);
  data.milestones[0].unlockedOn = '2026-11-01';
  data.milestones[1].unlockedOn = '2026-11-10';
  const { errors, warnings } = validateKingdom(data, TODAY);
  assert.deepEqual(errors, []);
  assert.equal(warnings.length, 1);
  const view = deriveKingdom(data);
  assert.equal(view.milestones[1].state, 'unlocked');
  assert.equal(view.latestUnlocked?.title, 'A Small Settlement');
  assert.equal(view.nextMilestone?.population, 25);
});

test('a milestone cannot unlock before a smaller one', () => {
  const data = withCounts(load(), null, null, null);
  data.milestones[0].unlockedOn = null;
  data.milestones[1].unlockedOn = '2026-11-10';
  assert.ok(errorsFor(data).some((e) => e.includes('smaller milestone')));
});

test('counts must be real whole numbers with a source and date', () => {
  const data = load() as unknown as { population: Record<string, unknown> };
  data.population.youtube = { count: '12', verifiedOn: '2026-11-20', source: 'YouTube Studio' };
  data.population.tiktok = { count: 5, verifiedOn: null, source: null };
  data.population.instagram = { count: -1, verifiedOn: '2099-01-01', source: 'x' };
  const errors = errorsFor(data);
  assert.ok(errors.some((e) => e.startsWith('population.youtube.count')));
  assert.ok(errors.some((e) => e.startsWith('population.tiktok.verifiedOn')));
  assert.ok(errors.some((e) => e.startsWith('population.tiktok.source')));
  assert.ok(errors.some((e) => e.startsWith('population.instagram.count')));
  assert.ok(errors.some((e) => e.includes('is in the future')));
});

test('the Hollowing only advances for recorded story days', () => {
  const data = load();
  data.story.storyDays = [
    { day: 1, title: 'Day One', publishedOn: '2026-11-21' },
    { day: 2, title: 'Day Two', publishedOn: '2026-11-22', links: { youtube: 'https://www.youtube.com/@zaunited1' } },
  ];
  assert.deepEqual(errorsFor(data), []);
  assert.equal(deriveKingdom(data).storyDaysRemaining, 28);
});

test('canon: the launch state is Day 0 with 30 story days remaining', () => {
  const data = load();
  assert.equal(data.story.hollowingTotalDays, 30);
  assert.deepEqual(data.story.storyDays, [], 'no story-day episode is recorded before launch');
  assert.equal(deriveKingdom(data).storyDaysRemaining, 30);
});

test('canon: historical episodes never advance the countdown', () => {
  const data = load();
  data.story.historicalEpisodes.push({ title: 'Another historical episode', summary: 'Kept as released.' });
  assert.deepEqual(errorsFor(data), []);
  assert.equal(deriveKingdom(data).storyDaysRemaining, 30);
});

test('canon: combined follows add all three platforms, and milestones follow that total', () => {
  const data = withCounts(load(), 20, 20, 10);
  for (const m of data.milestones.slice(0, 4)) m.unlockedOn = '2026-11-20';
  assert.deepEqual(errorsFor(data), []);
  const view = deriveKingdom(data);
  assert.equal(view.combined, 50);
  assert.equal(view.latestUnlocked?.title, 'Defences of Zaun');
  assert.equal(view.nextMilestone?.title, 'First Target: 100 Zaunites');
  assert.equal(view.progressPercent, 50);
});

test('story days must start at Day 1 and be recorded in order', () => {
  const data = load();
  data.story.storyDays = [
    { day: 0, title: 'Prophecy again', publishedOn: '2026-11-20' },
    { day: 3, title: 'Skipped ahead', publishedOn: '2026-11-19' },
  ];
  const errors = errorsFor(data);
  assert.ok(errors.some((e) => e.includes('day must be 1')));
  assert.ok(errors.some((e) => e.includes('day must be 2')));
  assert.ok(errors.some((e) => e.includes('earlier than the story day before it')));
});

test('future-dated and unsafe story-day records are rejected', () => {
  const data = load();
  data.story.storyDays = [
    { day: 1, title: 'Not out yet', publishedOn: '2026-12-25', links: { youtube: 'javascript:alert(1)' } },
  ];
  const errors = errorsFor(data);
  assert.ok(errors.some((e) => e.includes('is in the future')));
  assert.ok(errors.some((e) => e.includes('https://')));
});

test('the countdown never goes below zero', () => {
  const data = load();
  data.story.hollowingTotalDays = 1;
  data.story.storyDays = [{ day: 1, title: 'The last day', publishedOn: '2026-11-20' }];
  assert.equal(deriveKingdom(data).storyDaysRemaining, 0);
});
