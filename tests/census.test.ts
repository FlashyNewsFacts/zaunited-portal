import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  applyCensus,
  censusTimestamp,
  parseCount,
  parseYouTubeSubscribers,
  serializeKingdom,
  type CensusInput,
} from '../src/lib/census.ts';
import { deriveKingdom, validateKingdom, type KingdomData } from '../src/lib/kingdom.ts';

const CHANNEL = 'UCotneR-TRuRxVBu4AU8-cxQ';
const fileText = () => readFileSync(new URL('../data/kingdom.json', import.meta.url), 'utf8');
const load = (): KingdomData => JSON.parse(fileText());

/** A baseline independent of the committed figures: 11 follows, first two milestones unlocked. */
function baseline(): KingdomData {
  const data = load();
  data.population = {
    youtube: { count: 7, verifiedAt: '2026-11-24', source: 'YouTube Studio', method: 'manual' },
    tiktok: { count: 3, verifiedAt: '2026-11-24', source: 'TikTok profile', method: 'manual' },
    instagram: { count: 1, verifiedAt: '2026-11-24', source: 'Instagram profile', method: 'manual' },
  };
  data.milestones.forEach((m, i) => (m.unlockedOn = i === 0 ? '2026-11-23' : i === 1 ? '2026-11-24' : null));
  return data;
}

function input(yt: number, tt: number, ig: number): CensusInput {
  return {
    youtube: { count: yt, source: 'YouTube Data API', method: 'automatic' },
    tiktok: { count: tt, source: 'TikTok profile', method: 'manual' },
    instagram: { count: ig, source: 'Instagram app', method: 'manual' },
  };
}

const AT = new Date('2026-11-25T08:15:42.789Z');

test('parseCount accepts whole numbers, with or without separators', () => {
  assert.equal(parseCount('12', 'TikTok'), 12);
  assert.equal(parseCount(' 1,234 ', 'TikTok'), 1234);
  assert.equal(parseCount('1 234', 'TikTok'), 1234);
  assert.equal(parseCount('0', 'TikTok'), 0);
});

test('parseCount rejects anything that is not a whole number', () => {
  for (const bad of ['', '   ', 'abc', '-1', '1.5', '12a', '1e3', undefined]) {
    assert.throws(() => parseCount(bad, 'Instagram'), /Instagram: .* is not a whole number/, String(bad));
  }
});

test('parseYouTubeSubscribers reads the count for our channel', () => {
  const response = { items: [{ id: CHANNEL, statistics: { subscriberCount: '7', hiddenSubscriberCount: false } }] };
  assert.equal(parseYouTubeSubscribers(response, CHANNEL), 7);
});

test('parseYouTubeSubscribers refuses missing, hidden or wrong-channel data', () => {
  assert.throws(() => parseYouTubeSubscribers({ items: [] }, CHANNEL), /no channel/);
  assert.throws(() => parseYouTubeSubscribers({}, CHANNEL), /no channel/);
  assert.throws(
    () => parseYouTubeSubscribers({ items: [{ id: 'UCother', statistics: { subscriberCount: '9' } }] }, CHANNEL),
    /different channel/,
  );
  assert.throws(
    () => parseYouTubeSubscribers({ items: [{ id: CHANNEL, statistics: { hiddenSubscriberCount: true } }] }, CHANNEL),
    /hides its subscriber count/,
  );
  assert.throws(
    () => parseYouTubeSubscribers({ items: [{ id: CHANNEL, statistics: { subscriberCount: 'lots' } }] }, CHANNEL),
    /did not return a subscriber count/,
  );
});

test('a census records all three counts with one UTC timestamp, source and method', () => {
  const { data } = applyCensus(baseline(), input(8, 3, 1), AT);
  assert.equal(censusTimestamp(AT), '2026-11-25T08:15:42Z');
  assert.deepEqual(data.population.youtube, {
    count: 8,
    verifiedAt: '2026-11-25T08:15:42Z',
    source: 'YouTube Data API',
    method: 'automatic',
  });
  assert.equal(data.population.tiktok.verifiedAt, '2026-11-25T08:15:42Z');
  assert.equal(data.population.instagram.method, 'manual');
  assert.equal(deriveKingdom(data).censusFresh, true);
  assert.deepEqual(validateKingdom(data, AT).errors, []);
});

test('a census without a new milestone leaves every unlock unchanged', () => {
  const before = baseline();
  const { data, unlocked, title } = applyCensus(before, input(8, 3, 1), AT);
  assert.deepEqual(unlocked, []);
  assert.deepEqual(
    data.milestones.map((m) => m.unlockedOn),
    before.milestones.map((m) => m.unlockedOn),
  );
  assert.equal(title, 'Census 25 November 2026: 12 combined platform follows');
});

test('reaching a milestone unlocks it permanently, dated with the census day', () => {
  const { data, unlocked, title, summary } = applyCensus(baseline(), input(20, 4, 1), AT);
  assert.deepEqual(unlocked.map((m) => m.title), ['The Village of Zaun']);
  assert.equal(data.milestones[2].unlockedOn, '2026-11-25');
  assert.equal(data.milestones[0].unlockedOn, '2026-11-23', 'earlier unlock dates never change');
  assert.equal(data.milestones[1].unlockedOn, '2026-11-24');
  assert.match(title, /25 combined platform follows, unlocks The Village of Zaun$/);
  assert.match(summary, /Newly unlocked: The Village of Zaun/);
  assert.match(summary, /Unlock recorded 25 November 2026/);
});

test('crossing two milestones at once unlocks both', () => {
  const { unlocked } = applyCensus(baseline(), input(40, 9, 2), AT);
  assert.deepEqual(unlocked.map((m) => m.population), [25, 50]);
});

test('a census with lower counts never re-locks a milestone', () => {
  const { data, unlocked } = applyCensus(baseline(), input(5, 2, 1), AT);
  assert.deepEqual(unlocked, []);
  assert.equal(data.milestones[1].unlockedOn, '2026-11-24');
  assert.equal(deriveKingdom(data).milestones[1].state, 'unlocked');
});

test('the unlock date is the UK calendar date (British Summer Time)', () => {
  const { data } = applyCensus(baseline(), input(20, 4, 1), new Date('2027-07-01T23:30:00Z'));
  assert.equal(data.milestones[2].unlockedOn, '2027-07-02');
});

test('a census never changes the story records or the Hollowing countdown', () => {
  const before = baseline();
  const { data, summary } = applyCensus(before, input(40, 9, 2), AT);
  assert.deepEqual(data.story, before.story);
  assert.equal(deriveKingdom(data).storyDaysRemaining, deriveKingdom(before).storyDaysRemaining);
  assert.match(summary, /A census never changes story days/);
});

test('the census does not modify the data it was given', () => {
  const before = baseline();
  const snapshot = JSON.stringify(before);
  applyCensus(before, input(40, 9, 2), AT);
  assert.equal(JSON.stringify(before), snapshot);
});

test('the summary lists every platform, the combined total and what changed', () => {
  const { summary } = applyCensus(baseline(), input(8, 3, 1), AT);
  assert.match(summary, /\| YouTube \| 7 \| \*\*8\*\* ✏️ \| YouTube Data API \| automatic \|/);
  assert.match(summary, /\| TikTok \| 3 \| \*\*3\*\* \| TikTok profile \| manual \|/);
  assert.match(summary, /\| \*\*Combined platform follows\*\* \| 11 \| \*\*12\*\* \|/);
  assert.match(summary, /Next: \*\*The Village of Zaun\*\* at 12 \/ 25/);
});

test('the data file is stored in the census format, so census diffs stay small', () => {
  assert.equal(serializeKingdom(load()), fileText());
});
